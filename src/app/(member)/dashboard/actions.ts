"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  workoutDayExercises,
  workoutDays,
  workoutPlans,
  workoutSessionExercises,
  workoutSessions,
} from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";

function todayIndex(): number {
  // JS getDay(): 0=Sun..6=Sat. We use 0=Mon..6=Sun.
  return (new Date().getDay() + 6) % 7;
}

export async function startSession(availableMinutes: number) {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");

  const plan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.userId, appUser.id), eq(workoutPlans.active, true)),
  });
  if (!plan) return { error: "No active plan yet." };

  const day = await db.query.workoutDays.findFirst({
    where: and(eq(workoutDays.planId, plan.id), eq(workoutDays.dayIndex, todayIndex())),
  });
  if (!day || day.isRestDay) return { error: "Today is a rest day." };

  const dayExercises = await db
    .select()
    .from(workoutDayExercises)
    .where(eq(workoutDayExercises.workoutDayId, day.id))
    .orderBy(workoutDayExercises.order);
  if (dayExercises.length === 0) return { error: "Nothing scheduled today." };

  // Greedy trim in priority order, always keeping at least one exercise.
  const trimmed: typeof dayExercises = [];
  let total = 0;
  for (const ex of dayExercises) {
    if (trimmed.length > 0 && total + ex.estMinutes > availableMinutes) break;
    trimmed.push(ex);
    total += ex.estMinutes;
  }

  const [session] = await db
    .insert(workoutSessions)
    .values({ userId: appUser.id, workoutDayId: day.id, availableMinutes })
    .returning();

  for (let i = 0; i < trimmed.length; i++) {
    const ex = trimmed[i];
    await db.insert(workoutSessionExercises).values({
      sessionId: session.id,
      exerciseId: ex.exerciseId,
      order: i,
      sets: ex.sets,
      reps: ex.reps,
      status: "pending",
    });
  }

  redirect(`/session/${session.id}`);
}

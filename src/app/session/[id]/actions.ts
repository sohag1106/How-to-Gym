"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { workoutSessionExercises, workoutSessions } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";

export async function markExercise(
  sessionExerciseId: string,
  status: "done" | "skipped"
) {
  const appUser = await ensureAppUser();
  if (!appUser) return { error: "Not signed in" };

  await db
    .update(workoutSessionExercises)
    .set({ status, completedAt: new Date() })
    .where(eq(workoutSessionExercises.id, sessionExerciseId));

  return { success: true };
}

export async function completeSession(sessionId: string) {
  const appUser = await ensureAppUser();
  if (!appUser) return { error: "Not signed in" };

  await db
    .update(workoutSessions)
    .set({ completedAt: new Date() })
    .where(eq(workoutSessions.id, sessionId));

  return { success: true };
}

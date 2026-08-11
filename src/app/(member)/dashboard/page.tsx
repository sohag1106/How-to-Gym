import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment, exercises, workoutDayExercises, workoutDays, workoutPlans } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { StartSessionCard } from "./start-session-card";
import { Moon } from "lucide-react";

function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function DashboardPage() {
  const appUser = await ensureAppUser();
  const plan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.userId, appUser!.id), eq(workoutPlans.active, true)),
  });

  const today = todayIndex();

  const day = plan
    ? await db.query.workoutDays.findFirst({
        where: and(eq(workoutDays.planId, plan.id), eq(workoutDays.dayIndex, today)),
      })
    : null;

  const dayExercises = day
    ? await db
        .select({
          id: workoutDayExercises.id,
          sets: workoutDayExercises.sets,
          reps: workoutDayExercises.reps,
          estMinutes: workoutDayExercises.estMinutes,
          exerciseName: exercises.name,
          equipmentImage: equipment.imageData,
        })
        .from(workoutDayExercises)
        .innerJoin(exercises, eq(workoutDayExercises.exerciseId, exercises.id))
        .innerJoin(equipment, eq(exercises.equipmentId, equipment.id))
        .where(eq(workoutDayExercises.workoutDayId, day.id))
        .orderBy(asc(workoutDayExercises.order))
    : [];

  const totalMinutes = dayExercises.reduce((sum, e) => sum + e.estMinutes, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{WEEKDAY_NAMES[today]}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {day?.isRestDay ? "Rest day" : day?.focusLabel ?? "Today"}
        </h1>
      </div>

      {!day || day.isRestDay ? (
        <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center text-center gap-2">
          <div className="size-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
            <Moon className="size-6" />
          </div>
          <p className="font-medium mt-2">Take it easy today</p>
          <p className="text-sm text-muted-foreground text-balance">
            Recovery is part of the plan. See you next session.
          </p>
        </div>
      ) : (
        <>
          <StartSessionCard suggestedMinutes={Math.min(60, totalMinutes || 30)} />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Today&apos;s exercises ({dayExercises.length}, ~{totalMinutes} min)
            </p>
            <div className="flex flex-col gap-2">
              {dayExercises.map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.equipmentImage}
                    alt=""
                    className="size-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ex.exerciseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.sets} sets × {ex.reps} reps
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

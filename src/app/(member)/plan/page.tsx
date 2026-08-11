import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { workoutDayExercises, workoutDays, workoutPlans } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Moon, Dumbbell } from "lucide-react";

const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function todayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

export default async function PlanPage() {
  const appUser = await ensureAppUser();
  const plan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.userId, appUser!.id), eq(workoutPlans.active, true)),
  });

  const days = plan
    ? await db
        .select()
        .from(workoutDays)
        .where(eq(workoutDays.planId, plan.id))
        .orderBy(asc(workoutDays.dayIndex))
    : [];

  const counts = await Promise.all(
    days.map((d) =>
      db
        .select({ value: count() })
        .from(workoutDayExercises)
        .where(eq(workoutDayExercises.workoutDayId, d.id))
        .then((r) => r[0].value)
    )
  );

  const today = todayIndex();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">This week</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {plan ? `Split: ${plan.splitType.replaceAll("_", " ")}` : "No active plan yet"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {days.map((day, i) => (
          <div
            key={day.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-4",
              day.dayIndex === today
                ? "border-primary bg-accent"
                : "border-border bg-card"
            )}
          >
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0",
                day.isRestDay ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              )}
            >
              {day.isRestDay ? <Moon className="size-4" /> : <Dumbbell className="size-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">{WEEKDAY_NAMES[day.dayIndex]}</p>
              <p className="font-medium truncate">{day.focusLabel}</p>
            </div>
            {!day.isRestDay && (
              <span className="text-xs text-muted-foreground shrink-0">
                {counts[i]} exercises
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { eq, asc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { workoutSessionExercises, workoutSessions } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { equipmentImageUrl } from "@/lib/image-url";
import { SessionStepper } from "./session-stepper";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");
  const { id: sessionId } = await params;

  const session = await db.query.workoutSessions.findFirst({
    where: eq(workoutSessions.id, sessionId),
    with: {
      exercises: {
        orderBy: asc(workoutSessionExercises.order),
        with: {
          exercise: {
            with: { equipment: true },
          },
        },
      },
    },
  });
  if (!session || session.userId !== appUser.id) notFound();

  const exercises = session.exercises.map((row) => ({
    id: row.id,
    sets: row.sets,
    reps: row.reps,
    status: row.status,
    restSeconds: row.exercise.defaultRestSeconds,
    instructions: row.exercise.instructions,
    exerciseName: row.exercise.name,
    equipmentName: row.exercise.equipment.name,
    equipmentImage: equipmentImageUrl(row.exercise.equipment.id),
    demoId: row.exercise.exerciseDemoId,
  }));

  return (
    <SessionStepper
      sessionId={session.id}
      availableMinutes={session.availableMinutes}
      alreadyCompleted={!!session.completedAt}
      exercises={exercises}
    />
  );
}

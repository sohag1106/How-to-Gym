"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Check, SkipForward, PartyPopper, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExerciseDemo3D } from "@/components/exercise-3d/exercise-demo";
import { markExercise, completeSession } from "./actions";

type SessionExercise = {
  id: string;
  sets: number;
  reps: number;
  status: "pending" | "done" | "skipped";
  restSeconds: number;
  instructions: string[];
  exerciseName: string;
  equipmentName: string;
  equipmentImage: string;
  patternKey: string;
};

export function SessionStepper({
  sessionId,
  availableMinutes,
  alreadyCompleted,
  exercises,
}: {
  sessionId: string;
  availableMinutes: number;
  alreadyCompleted: boolean;
  exercises: SessionExercise[];
}) {
  const router = useRouter();
  const firstPending = exercises.findIndex((e) => e.status === "pending");
  const [index, setIndex] = useState(firstPending === -1 ? exercises.length : firstPending);
  const [statuses, setStatuses] = useState(
    Object.fromEntries(exercises.map((e) => [e.id, e.status]))
  );
  const [pending, startTransition] = useTransition();
  const [finished, setFinished] = useState(alreadyCompleted || firstPending === -1);

  const current = exercises[index];
  const doneCount = Object.values(statuses).filter((s) => s === "done").length;
  const skippedCount = Object.values(statuses).filter((s) => s === "skipped").length;

  function advance(id: string, status: "done" | "skipped") {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    startTransition(async () => {
      await markExercise(id, status);
      if (index + 1 >= exercises.length) {
        await completeSession(sessionId);
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
      }
    });
  }

  if (finished) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="size-16 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
          <PartyPopper className="size-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Workout complete</h1>
        <p className="mt-2 text-muted-foreground">
          {doneCount} done{skippedCount > 0 ? `, ${skippedCount} skipped` : ""}
        </p>
        <Button
          size="lg"
          className="mt-8 h-13 rounded-2xl px-8"
          onClick={() => router.push("/dashboard")}
        >
          Back to dashboard
        </Button>
      </main>
    );
  }

  if (!current) return null;

  return (
    <main className="min-h-dvh flex flex-col px-5 py-4 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="size-9 rounded-full flex items-center justify-center hover:bg-accent shrink-0"
        >
          <X className="size-5" />
        </Link>
        <Progress value={((index) / exercises.length) * 100} className="h-1.5 flex-1" />
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {index + 1}/{exercises.length}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 ml-12">
        Today&apos;s budget: ~{availableMinutes} min
      </p>

      <div className="flex-1 flex flex-col mt-5 gap-4">
        <ExerciseDemo3D patternKey={current.patternKey} />

        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.equipmentImage}
            alt={current.equipmentName}
            className="size-14 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0">
            <h1 className="font-semibold text-lg leading-tight truncate">
              {current.exerciseName}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {current.equipmentName}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <StatPill label="Sets" value={String(current.sets)} />
          <StatPill label="Reps" value={String(current.reps)} />
          <StatPill
            label="Rest"
            value={`${current.restSeconds}s`}
            icon={<Timer className="size-3.5" />}
          />
        </div>

        {current.instructions.length > 0 && (
          <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
            {current.instructions.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand font-medium shrink-0">{i + 1}.</span>
                {line}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex gap-3 mt-6 pb-[env(safe-area-inset-bottom)]">
        <Button
          variant="outline"
          size="lg"
          disabled={pending}
          onClick={() => advance(current.id, "skipped")}
          className="flex-1 h-13 rounded-2xl"
        >
          <SkipForward className="size-4" />
          Skip
        </Button>
        <Button
          size="lg"
          disabled={pending}
          onClick={() => advance(current.id, "done")}
          className="flex-1 h-13 rounded-2xl"
        >
          <Check className="size-4" />
          Done
        </Button>
      </div>
    </main>
  );
}

function StatPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex-1 rounded-xl bg-card border border-border py-2.5 flex flex-col items-center">
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

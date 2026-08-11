"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { setExerciseRule } from "./actions";

type RuleType = "assigned" | "blocked" | "default";

const OPTIONS: { value: RuleType; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "assigned", label: "Assigned only" },
  { value: "blocked", label: "Blocked" },
];

export function ExerciseRuleRow({
  memberId,
  exercise,
  currentRule,
}: {
  memberId: string;
  exercise: { id: string; name: string; equipmentName: string };
  currentRule: RuleType;
}) {
  const [rule, setRule] = useState<RuleType>(currentRule);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {exercise.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {exercise.equipmentName}
        </p>
      </div>
      <div className="flex items-center gap-1 rounded-full bg-muted p-1 shrink-0">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            disabled={isPending}
            onClick={() => {
              setRule(opt.value);
              startTransition(async () => {
                await setExerciseRule(memberId, exercise.id, opt.value);
              });
            }}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              rule === opt.value
                ? opt.value === "blocked"
                  ? "bg-destructive text-white"
                  : "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

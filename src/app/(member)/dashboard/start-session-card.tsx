"use client";

import { useState, useTransition } from "react";
import { Clock, Minus, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startSession } from "./actions";

export function StartSessionCard({ suggestedMinutes }: { suggestedMinutes: number }) {
  const [minutes, setMinutes] = useState(suggestedMinutes);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-medium flex items-center gap-1.5">
        <Clock className="size-4 text-brand" />
        How much time do you have today?
      </p>

      <div className="flex items-center justify-center gap-6 py-6">
        <button
          onClick={() => setMinutes((m) => Math.max(10, m - 5))}
          className="size-11 rounded-full border border-border flex items-center justify-center hover:bg-accent"
        >
          <Minus className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-4xl font-semibold tabular-nums">{minutes}</p>
          <p className="text-xs text-muted-foreground mt-1">minutes</p>
        </div>
        <button
          onClick={() => setMinutes((m) => Math.min(120, m + 5))}
          className="size-11 rounded-full border border-border flex items-center justify-center hover:bg-accent"
        >
          <Plus className="size-4" />
        </button>
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <Button
        size="lg"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await startSession(minutes);
            if (res?.error) setError(res.error);
          })
        }
        className="w-full h-13 rounded-2xl text-base"
      >
        <Play className="size-4" />
        {pending ? "Starting..." : "Start workout"}
      </Button>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setAutoApprove } from "./actions";

export function AutoApproveToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">Auto-approve new members</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Sign-ups get approved instantly instead of waiting in your queue, until you hit your member limit.
        </p>
      </div>
      <Switch
        checked={enabled}
        disabled={isPending}
        onCheckedChange={(v) => {
          setEnabled(v);
          startTransition(() => setAutoApprove(v));
        }}
      />
    </div>
  );
}

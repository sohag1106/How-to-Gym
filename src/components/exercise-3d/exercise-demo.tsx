"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ExerciseCanvas = dynamic(
  () => import("./exercise-canvas").then((m) => m.ExerciseCanvas),
  { ssr: false, loading: () => <Skeleton className="absolute inset-0" /> }
);

export function ExerciseDemo3D({ patternKey }: { patternKey: string }) {
  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-b from-accent/50 to-muted">
      <ExerciseCanvas patternKey={patternKey} />
      <p className="absolute bottom-2 inset-x-0 text-center text-[11px] text-muted-foreground/70">
        Drag to look around
      </p>
    </div>
  );
}

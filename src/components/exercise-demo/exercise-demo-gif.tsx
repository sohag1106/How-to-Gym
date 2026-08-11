"use client";

import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { exerciseDemoUrls } from "@/lib/image-url";

const FRAME_MS = 900;

/** Crossfades between two photos of the movement's start/end position on a
 * timer, giving a GIF-like animated feel from just two static frames. */
export function ExerciseDemoGif({ demoId }: { demoId: string | null }) {
  const [showEnd, setShowEnd] = useState(false);

  // Remount (via `key={demoId}` at the call site) resets showEnd to its
  // initial value automatically when the exercise changes.
  useEffect(() => {
    if (!demoId) return;
    const id = setInterval(() => setShowEnd((v) => !v), FRAME_MS);
    return () => clearInterval(id);
  }, [demoId]);

  if (!demoId) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-accent/50 to-muted flex items-center justify-center"
        style={{ aspectRatio: "4 / 3" }}
      >
        <Dumbbell className="size-10 text-muted-foreground/40" />
      </div>
    );
  }

  const { start, end } = exerciseDemoUrls(demoId);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-muted" style={{ aspectRatio: "4 / 3" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={start}
        alt=""
        className="absolute inset-0 size-full object-cover transition-opacity duration-500"
        style={{ opacity: showEnd ? 0 : 1 }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={end}
        alt=""
        className="absolute inset-0 size-full object-cover transition-opacity duration-500"
        style={{ opacity: showEnd ? 1 : 0 }}
      />
    </div>
  );
}

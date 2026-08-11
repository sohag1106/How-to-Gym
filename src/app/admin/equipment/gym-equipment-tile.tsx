"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removeEquipment } from "./actions";

type Item = {
  id: string;
  name: string;
  imageData: string;
  movementPattern?: { label: string } | null;
};

export function GymEquipmentTile({ item }: { item: Item }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageData}
        alt={item.name}
        className="w-full aspect-square object-cover"
      />
      <div className="p-2.5">
        <p className="text-sm font-medium leading-tight line-clamp-2">
          {item.name}
        </p>
        {item.movementPattern && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.movementPattern.label}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => removeEquipment(item.id))}
        className="absolute top-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

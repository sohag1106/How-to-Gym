"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEquipmentTemplate } from "./actions";

type Template = {
  id: string;
  name: string;
  imageData: string;
  movementPattern?: { label: string } | null;
};

export function TemplateCard({ template }: { template: Template }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-border bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={template.imageData}
        alt={template.name}
        className="w-full aspect-square object-cover"
      />
      <div className="p-2.5">
        <p className="text-sm font-medium leading-tight line-clamp-2">
          {template.name}
        </p>
        {template.movementPattern && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {template.movementPattern.label}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() => deleteEquipmentTemplate(template.id))
        }
        className="absolute top-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

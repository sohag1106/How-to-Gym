"use client";

import { useState, useTransition } from "react";
import { Plus, Check } from "lucide-react";
import { templateImageUrl } from "@/lib/image-url";
import { addFromTemplate } from "./actions";

type Template = {
  id: string;
  name: string;
  movementPattern?: { label: string } | null;
};

export function TemplatePickTile({ template }: { template: Template }) {
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={templateImageUrl(template.id)}
        alt={template.name}
        className="w-full aspect-square object-cover opacity-90"
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
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
      <button
        type="button"
        disabled={isPending || added}
        onClick={() =>
          startTransition(async () => {
            const res = await addFromTemplate(template.id);
            if (res?.error) setError(res.error);
            else setAdded(true);
          })
        }
        className="absolute top-2 right-2 size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-70"
      >
        {added ? <Check className="size-4" /> : <Plus className="size-4" />}
      </button>
    </div>
  );
}

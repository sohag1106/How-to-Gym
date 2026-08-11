"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Option = { id: string; name?: string; label?: string };
type ActionState = { error?: string; success?: boolean } | undefined;

export function EquipmentFormDialog({
  groups,
  patterns,
  action,
  triggerLabel,
  dialogTitle,
  submitLabel,
}: {
  groups: Option[];
  patterns: Option[];
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  triggerLabel: string;
  dialogTitle: string;
  submitLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(action, undefined);
  const [muscleGroupId, setMuscleGroupId] = useState("");
  const [movementPatternId, setMovementPatternId] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) setOpen(false);
  }

  // Reset the form whenever the dialog closes (success or manual cancel).
  useEffect(() => {
    if (open) return;
    formRef.current?.reset();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting local UI state alongside a DOM form reset
    setPreview(null);
    setMuscleGroupId("");
    setMovementPatternId("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl">
            <Plus className="size-4" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col gap-4 mt-2"
        >
          <label
            htmlFor="image"
            className="relative flex flex-col items-center justify-center gap-2 h-36 rounded-xl border border-dashed border-border bg-muted text-muted-foreground cursor-pointer overflow-hidden"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <>
                <ImagePlus className="size-6" />
                <span className="text-sm">Upload a photo</span>
              </>
            )}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              required
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Cable Lat Pulldown"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Muscle group</Label>
            <input type="hidden" name="muscleGroupId" value={muscleGroupId} />
            <Select value={muscleGroupId} onValueChange={(v) => setMuscleGroupId(v ?? "")}>
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Choose muscle group">
                  {(id: string) => groups.find((g) => g.id === id)?.name ?? id}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Movement pattern</Label>
            <input
              type="hidden"
              name="movementPatternId"
              value={movementPatternId}
            />
            <Select
              value={movementPatternId}
              onValueChange={(v) => setMovementPatternId(v ?? "")}
            >
              <SelectTrigger className="w-full h-11 rounded-xl">
                <SelectValue placeholder="Closest movement pattern">
                  {(id: string) => patterns.find((p) => p.id === id)?.label ?? id}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {patterns.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={pending || !muscleGroupId || !movementPatternId}
            className="rounded-xl mt-1"
          >
            {pending ? "Saving..." : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import { Dumbbell, Plus, Trash2 } from "lucide-react";
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
import { addTemplateExercise, deleteTemplateExercise } from "./actions";

type Option = { id: string; name?: string; label?: string };
type TemplateExercise = {
  id: string;
  name: string;
  movementPattern?: { label: string } | null;
};

export function ManageExercisesDialog({
  templateId,
  templateName,
  exercises,
  groups,
  patterns,
}: {
  templateId: string;
  templateName: string;
  exercises: TemplateExercise[];
  groups: Option[];
  patterns: Option[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="absolute bottom-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand"
          >
            <Dumbbell className="size-3.5" />
          </button>
        }
      />
      <DialogContent className="rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{templateName} — possible exercises</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-2">
          {exercises.length === 0 && (
            <p className="text-sm text-muted-foreground">No exercises yet.</p>
          )}
          {exercises.map((ex) => (
            <ExerciseRow key={ex.id} exercise={ex} />
          ))}
        </div>

        <AddExerciseForm templateId={templateId} groups={groups} patterns={patterns} />
      </DialogContent>
    </Dialog>
  );
}

function ExerciseRow({ exercise }: { exercise: TemplateExercise }) {
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  if (removed) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border p-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{exercise.name}</p>
        {exercise.movementPattern && (
          <p className="text-xs text-muted-foreground truncate">
            {exercise.movementPattern.label}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setRemoved(true);
          startTransition(() => deleteTemplateExercise(exercise.id));
        }}
        className="shrink-0 size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-accent"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function AddExerciseForm({
  templateId,
  groups,
  patterns,
}: {
  templateId: string;
  groups: Option[];
  patterns: Option[];
}) {
  const [state, formAction, pending] = useActionState(addTemplateExercise, undefined);
  const [muscleGroupId, setMuscleGroupId] = useState("");
  const [movementPatternId, setMovementPatternId] = useState("");

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) {
      setMuscleGroupId("");
      setMovementPatternId("");
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
      <input type="hidden" name="templateId" value={templateId} />
      <p className="text-sm font-medium">Add another exercise</p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ex-name">Name</Label>
        <Input
          id="ex-name"
          name="name"
          placeholder="e.g. Barbell Deadlift"
          required
          className="h-11 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Muscle group</Label>
          <input type="hidden" name="muscleGroupId" value={muscleGroupId} />
          <Select value={muscleGroupId} onValueChange={(v) => setMuscleGroupId(v ?? "")}>
            <SelectTrigger className="w-full h-11 rounded-xl">
              <SelectValue placeholder="Choose" />
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
          <input type="hidden" name="movementPatternId" value={movementPatternId} />
          <Select value={movementPatternId} onValueChange={(v) => setMovementPatternId(v ?? "")}>
            <SelectTrigger className="w-full h-11 rounded-xl">
              <SelectValue placeholder="Closest match" />
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
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button
        type="submit"
        disabled={pending || !muscleGroupId || !movementPatternId}
        className="rounded-xl"
      >
        <Plus className="size-4" />
        {pending ? "Adding..." : "Add exercise"}
      </Button>
    </form>
  );
}

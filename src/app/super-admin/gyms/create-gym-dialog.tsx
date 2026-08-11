"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createGym } from "./actions";

export function CreateGymDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createGym, undefined);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state?.success) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="rounded-xl">
            <Plus className="size-4" />
            New gym
          </Button>
        }
      />
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create a gym</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4 mt-2">
          <Field label="Gym name" name="name" placeholder="Iron Peak Fitness" />
          <Field label="Owner name" name="ownerName" placeholder="Jane Doe" />
          <Field
            label="Owner email"
            name="ownerEmail"
            type="email"
            placeholder="jane@ironpeak.com"
          />
          <Field
            label="Owner phone"
            name="ownerPhone"
            type="tel"
            placeholder="01711 000000"
          />
          <Field
            label="Member limit"
            name="memberLimit"
            type="number"
            defaultValue="50"
            min={1}
          />
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" disabled={pending} className="rounded-xl mt-1">
            {pending ? "Creating..." : "Create & send invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  min?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        required
        className="h-11 rounded-xl"
      />
    </div>
  );
}

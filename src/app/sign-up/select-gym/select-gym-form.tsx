"use client";

import { useActionState, useState } from "react";
import { Building2 } from "lucide-react";
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
import { submitGymSelection } from "./actions";

type Gym = { id: string; name: string };

export function SelectGymForm({ gyms }: { gyms: Gym[] }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) =>
      submitGymSelection(formData),
    undefined
  );
  const [gymId, setGymId] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="gym">Your gym</Label>
        <input type="hidden" name="gymId" value={gymId} />
        <Select value={gymId} onValueChange={(value) => setGymId(value ?? "")}>
          <SelectTrigger id="gym" className="w-full h-12 rounded-xl">
            <Building2 className="size-4 text-muted-foreground" />
            <SelectValue placeholder="Choose your gym" />
          </SelectTrigger>
          <SelectContent>
            {gyms.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No gyms available yet.
              </div>
            )}
            {gyms.map((gym) => (
              <SelectItem key={gym.id} value={gym.id}>
                {gym.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g. 01711 000000"
          required
          className="h-12 rounded-xl"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending || !gymId}
        className="h-13 rounded-2xl text-base mt-2"
      >
        {pending ? "Submitting..." : "Continue"}
      </Button>
    </form>
  );
}

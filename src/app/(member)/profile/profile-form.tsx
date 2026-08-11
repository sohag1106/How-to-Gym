"use client";

import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DayFocusPicker, type DayFocusValue, type MuscleGroupOption } from "@/components/day-focus-picker";
import { updateProfile } from "./actions";
import type { OnboardingInput } from "@/app/onboarding/actions";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ProfileForm({
  profile,
  muscleGroups,
  initialDayFocus,
}: {
  profile: OnboardingInput;
  muscleGroups: MuscleGroupOption[];
  initialDayFocus: { dayIndex: number; muscleGroupId: string }[];
}) {
  const [experienceLevel, setExperienceLevel] = useState(profile.experienceLevel);
  const [goal, setGoal] = useState(profile.goal);
  const [daysPerWeek, setDaysPerWeek] = useState(profile.daysPerWeek);
  const [splitPreference, setSplitPreference] = useState(profile.splitPreference);
  const [offDays, setOffDays] = useState<number[]>(profile.offDays);
  const [dayFocus, setDayFocus] = useState<DayFocusValue>(
    Object.fromEntries(initialDayFocus.map((d) => [d.dayIndex, d.muscleGroupId]))
  );
  const [heightCm, setHeightCm] = useState(profile.heightCm ? String(profile.heightCm) : "");
  const [weightKg, setWeightKg] = useState(profile.weightKg ? String(profile.weightKg) : "");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const isCustom = splitPreference === "custom";

  function save() {
    setSaved(false);
    startTransition(async () => {
      await updateProfile({
        experienceLevel,
        goal,
        daysPerWeek: isCustom ? Math.max(2, Math.min(6, Object.keys(dayFocus).length)) : daysPerWeek,
        splitPreference,
        offDays: isCustom ? [] : offDays,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        dayFocus: isCustom
          ? Object.entries(dayFocus).map(([dayIndex, muscleGroupId]) => ({
              dayIndex: Number(dayIndex),
              muscleGroupId,
            }))
          : undefined,
      });
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-medium">Training preferences</h2>

      <Field label="Experience">
        <Select value={experienceLevel} onValueChange={(v) => setExperienceLevel(v as typeof experienceLevel)}>
          <SelectTrigger className="w-full h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Goal">
        <Select value={goal} onValueChange={(v) => setGoal(v as typeof goal)}>
          <SelectTrigger className="w-full h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="muscle_gain">Build muscle</SelectItem>
            <SelectItem value="fat_loss">Lose fat</SelectItem>
            <SelectItem value="general_fitness">General fitness</SelectItem>
            <SelectItem value="strength">Get stronger</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Split style">
        <Select value={splitPreference} onValueChange={(v) => setSplitPreference(v as typeof splitPreference)}>
          <SelectTrigger className="w-full h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mixed_full_body">Full Body</SelectItem>
            <SelectItem value="upper_lower">Upper / Lower</SelectItem>
            <SelectItem value="push_pull_legs">Push / Pull / Legs</SelectItem>
            <SelectItem value="bro_split">Body Part Split</SelectItem>
            <SelectItem value="custom">Choose my own days</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {isCustom ? (
        <Field label="Which day trains what?">
          <DayFocusPicker muscleGroups={muscleGroups} value={dayFocus} onChange={setDayFocus} />
        </Field>
      ) : (
        <>
          <Field label={`Days per week: ${daysPerWeek}`}>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysPerWeek(d)}
                  className={cn(
                    "size-10 rounded-full text-sm font-medium border transition-colors",
                    daysPerWeek === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Off days">
            <div className="grid grid-cols-4 gap-2">
              {WEEKDAYS.map((label, value) => {
                const selected = offDays.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() =>
                      setOffDays((prev) =>
                        selected ? prev.filter((v) => v !== value) : [...prev, value]
                      )
                    }
                    className={cn(
                      "h-11 rounded-xl border text-sm font-medium transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (cm)">
          <Input
            type="number"
            inputMode="numeric"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Weight (kg)">
          <Input
            type="number"
            inputMode="numeric"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>

      <Button onClick={save} disabled={pending} className="h-12 rounded-2xl mt-1">
        {pending ? "Saving & rebuilding plan..." : saved ? "Saved" : "Save changes"}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const REST = "rest";

export type MuscleGroupOption = { id: string; name: string };
export type DayFocusValue = Record<number, string>; // dayIndex -> muscleGroupId

export function DayFocusPicker({
  muscleGroups,
  value,
  onChange,
}: {
  muscleGroups: MuscleGroupOption[];
  value: DayFocusValue;
  onChange: (next: DayFocusValue) => void;
}) {
  const trainingDayCount = Object.keys(value).length;

  return (
    <div className="flex flex-col gap-2">
      {WEEKDAYS.map((day) => {
        const current = value[day.value] ?? REST;
        return (
          <div key={day.value} className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium w-24 shrink-0">{day.label}</span>
            <Select
              value={current}
              onValueChange={(v) => {
                const next = { ...value };
                if (!v || v === REST) delete next[day.value];
                else next[day.value] = v;
                onChange(next);
              }}
            >
              <SelectTrigger className="h-10 rounded-xl flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={REST}>Rest</SelectItem>
                {muscleGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
      {trainingDayCount === 0 && (
        <p className="text-sm text-destructive mt-1">Pick at least one training day.</p>
      )}
    </div>
  );
}

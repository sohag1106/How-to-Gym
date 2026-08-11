"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, Minus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DayFocusPicker, type DayFocusValue, type MuscleGroupOption } from "@/components/day-focus-picker";
import { submitOnboarding, type OnboardingInput } from "./actions";

type Step = "experience" | "stats" | "goal" | "split" | "days" | "offDays" | "dayFocus";

const WEEKDAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", title: "Beginner", body: "New to the gym, or getting back into it." },
  { value: "intermediate", title: "Intermediate", body: "Training consistently for 6+ months." },
  { value: "advanced", title: "Advanced", body: "Years of consistent training experience." },
] as const;

const GOAL_OPTIONS = [
  { value: "muscle_gain", title: "Build muscle", body: "Add size and shape." },
  { value: "fat_loss", title: "Lose fat", body: "Lean out, more conditioning work." },
  { value: "general_fitness", title: "General fitness", body: "Feel better, stay healthy." },
  { value: "strength", title: "Get stronger", body: "Lift heavier, fewer reps." },
] as const;

const SPLIT_OPTIONS = [
  {
    value: "mixed_full_body",
    title: "Full Body",
    body: "Train everything each session. Great for beginners — frequent, efficient.",
  },
  {
    value: "upper_lower",
    title: "Upper / Lower",
    body: "Alternate upper and lower body days. A solid next step.",
  },
  {
    value: "push_pull_legs",
    title: "Push / Pull / Legs",
    body: "Group by movement pattern. Popular for more experienced lifters.",
  },
  {
    value: "bro_split",
    title: "Body Part Split",
    body: "One muscle group a day. More volume per group, needs more days.",
  },
  {
    value: "custom",
    title: "Choose my own days",
    body: "Pick exactly which body part you train on which day of the week.",
  },
] as const;

export function OnboardingWizard({ muscleGroups }: { muscleGroups: MuscleGroupOption[] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [experienceLevel, setExperienceLevel] =
    useState<OnboardingInput["experienceLevel"]>("beginner");
  const [goal, setGoal] = useState<OnboardingInput["goal"]>("general_fitness");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [offDays, setOffDays] = useState<number[]>([5, 6]);
  const [splitPreference, setSplitPreference] =
    useState<OnboardingInput["splitPreference"]>("mixed_full_body");
  const [dayFocus, setDayFocus] = useState<DayFocusValue>({});
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isCustom = splitPreference === "custom";
  const steps = useMemo<Step[]>(
    () => [
      "experience",
      "stats",
      "goal",
      "split",
      ...(isCustom ? (["dayFocus"] as const) : (["days", "offDays"] as const)),
    ],
    [isCustom]
  );

  const step: Step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const recommendedSplit =
    experienceLevel === "beginner" ? "mixed_full_body" : undefined;

  const canGoNext = useMemo(() => {
    if (step === "offDays") return offDays.length < 7;
    if (step === "dayFocus") return Object.keys(dayFocus).length > 0;
    return true;
  }, [step, offDays, dayFocus]);

  function next() {
    if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1);
    else submit();
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await submitOnboarding({
        experienceLevel,
        goal,
        // daysPerWeek/offDays aren't used by the scheduler in custom mode
        // (the day -> muscle group map fully determines training days) but
        // the field still has to pass the same min/max validation.
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
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3">
        {stepIndex > 0 && (
          <button
            onClick={back}
            className="size-9 rounded-full flex items-center justify-center hover:bg-accent"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        <Progress value={progress} className="h-1.5 flex-1" />
      </div>

      <div className="flex-1 mt-8">
        {step === "experience" && (
          <StepShell
            title="How experienced are you?"
            subtitle="This shapes how much we ask of you each session."
          >
            {EXPERIENCE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={experienceLevel === opt.value}
                title={opt.title}
                body={opt.body}
                onClick={() => setExperienceLevel(opt.value)}
              />
            ))}
          </StepShell>
        )}

        {step === "stats" && (
          <StepShell
            title="Height & weight"
            subtitle="Optional — helps us track your progress over time. Skip if you'd rather not share."
          >
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  inputMode="numeric"
                  placeholder="175"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  inputMode="numeric"
                  placeholder="70"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </StepShell>
        )}

        {step === "goal" && (
          <StepShell title="What's your main goal?" subtitle="We'll tune sets, reps, and rest around this.">
            {GOAL_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={goal === opt.value}
                title={opt.title}
                body={opt.body}
                onClick={() => setGoal(opt.value)}
              />
            ))}
          </StepShell>
        )}

        {step === "days" && (
          <StepShell title="How many days a week?" subtitle="You can always take more rest days than planned.">
            <div className="flex items-center justify-center gap-6 py-8">
              <button
                onClick={() => setDaysPerWeek((d) => Math.max(2, d - 1))}
                className="size-12 rounded-full border border-border flex items-center justify-center hover:bg-accent"
              >
                <Minus className="size-5" />
              </button>
              <div className="text-center">
                <p className="text-5xl font-semibold tabular-nums">{daysPerWeek}</p>
                <p className="text-sm text-muted-foreground mt-1">days / week</p>
              </div>
              <button
                onClick={() => setDaysPerWeek((d) => Math.min(6, d + 1))}
                className="size-12 rounded-full border border-border flex items-center justify-center hover:bg-accent"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </StepShell>
        )}

        {step === "offDays" && (
          <StepShell title="Any fixed days off?" subtitle="Pick the days you'd never train, even if it costs a training day.">
            <div className="grid grid-cols-4 gap-2 mt-2">
              {WEEKDAYS.map((d) => {
                const selected = offDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    onClick={() =>
                      setOffDays((prev) =>
                        selected ? prev.filter((v) => v !== d.value) : [...prev, d.value]
                      )
                    }
                    className={cn(
                      "h-14 rounded-xl border text-sm font-medium transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === "split" && (
          <StepShell title="How do you want to train?" subtitle="Not sure? Full Body is a safe, effective default.">
            {SPLIT_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                selected={splitPreference === opt.value}
                title={opt.title}
                body={opt.body}
                recommended={recommendedSplit === opt.value}
                onClick={() => setSplitPreference(opt.value)}
              />
            ))}
          </StepShell>
        )}

        {step === "dayFocus" && (
          <StepShell
            title="Which day trains what?"
            subtitle="Assign a body part to each day you want to train — leave the rest as Rest."
          >
            <DayFocusPicker muscleGroups={muscleGroups} value={dayFocus} onChange={setDayFocus} />
          </StepShell>
        )}
      </div>

      {error && <p className="text-sm text-destructive mb-3">{error}</p>}

      <Button
        size="lg"
        disabled={!canGoNext || pending}
        onClick={next}
        className="h-13 rounded-2xl text-base mt-4"
      >
        {pending ? (
          "Building your plan..."
        ) : stepIndex === steps.length - 1 ? (
          <>
            <Sparkles className="size-4" />
            Build my plan
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="text-muted-foreground mt-1.5 text-balance">{subtitle}</p>
      <div className="flex flex-col gap-2.5 mt-6">{children}</div>
    </div>
  );
}

function OptionCard({
  title,
  body,
  selected,
  recommended,
  onClick,
}: {
  title: string;
  body: string;
  selected: boolean;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl border p-4 transition-colors",
        selected
          ? "border-primary bg-accent"
          : "border-border hover:bg-accent/50"
      )}
    >
      <div className="flex items-center gap-2">
        <p className="font-medium">{title}</p>
        {recommended && (
          <span className="text-[10px] uppercase tracking-wide font-semibold text-brand bg-accent rounded-full px-2 py-0.5">
            Recommended
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-0.5">{body}</p>
    </button>
  );
}

import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  equipment,
  exercises,
  memberExerciseRules,
  memberProfiles,
  movementPatterns,
  users,
  workoutDayExercises,
  workoutDays,
  workoutPlans,
  type goalEnum,
  type splitPreferenceEnum,
} from "@/db/schema";

type Goal = (typeof goalEnum.enumValues)[number];
type SplitPreference = (typeof splitPreferenceEnum.enumValues)[number];
type Category = "push" | "pull" | "legs" | "core" | "cardio";

const PATTERN_CATEGORY: Record<string, Category> = {
  chest_press: "push",
  chest_fly: "push",
  shoulder_press: "push",
  tricep_dip: "push",
  lat_pulldown: "pull",
  pull_up: "pull",
  cable_row: "pull",
  bicep_curl: "pull",
  leg_press: "legs",
  leg_curl: "legs",
  squat: "legs",
  mobility_stretch: "core",
  cardio_cycle: "cardio",
  cardio_run: "cardio",
};

/** Lower = perform earlier in the session (compound lifts before isolation/cardio). */
const COMPOUND_PRIORITY: Record<string, number> = {
  squat: 0,
  chest_press: 0,
  lat_pulldown: 0,
  pull_up: 0,
  leg_press: 1,
  cable_row: 1,
  shoulder_press: 1,
  chest_fly: 2,
  bicep_curl: 2,
  tricep_dip: 2,
  leg_curl: 2,
  mobility_stretch: 3,
  cardio_cycle: 3,
  cardio_run: 3,
};

type EligibleExercise = {
  id: string;
  name: string;
  equipmentId: string;
  muscleGroupId: string;
  patternKey: string;
  category: Category;
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
};

type DayTemplate = { label: string; categories: Category[]; count: number };

function focusTemplates(split: SplitPreference, exerciseBudget: number): DayTemplate[] {
  switch (split) {
    case "upper_lower":
      return [
        { label: "Upper Body", categories: ["push", "pull"], count: exerciseBudget },
        { label: "Lower Body", categories: ["legs", "core"], count: exerciseBudget },
      ];
    case "push_pull_legs":
      return [
        { label: "Push", categories: ["push"], count: exerciseBudget },
        { label: "Pull", categories: ["pull"], count: exerciseBudget },
        { label: "Legs & Core", categories: ["legs", "core"], count: exerciseBudget },
      ];
    case "bro_split":
      return [
        { label: "Chest", categories: ["push"], count: exerciseBudget },
        { label: "Back", categories: ["pull"], count: exerciseBudget },
        { label: "Legs", categories: ["legs"], count: exerciseBudget },
        { label: "Shoulders", categories: ["push"], count: exerciseBudget },
        { label: "Arms", categories: ["pull"], count: exerciseBudget },
      ];
    case "mixed_full_body":
    default:
      return [
        { label: "Full Body A", categories: ["push", "pull", "legs", "core"], count: exerciseBudget },
        { label: "Full Body B", categories: ["pull", "push", "legs", "core"], count: exerciseBudget },
      ];
  }
}

function exerciseBudgetFor(experienceLevel: string): number {
  if (experienceLevel === "beginner") return 4;
  if (experienceLevel === "intermediate") return 5;
  return 6;
}

function applyGoalAdjustment(
  goal: Goal,
  base: { sets: number; reps: number; restSeconds: number }
) {
  switch (goal) {
    case "strength":
      return {
        sets: base.sets + 1,
        reps: Math.max(4, base.reps - 4),
        restSeconds: base.restSeconds + 30,
      };
    case "fat_loss":
      return {
        sets: base.sets,
        reps: base.reps + 4,
        restSeconds: Math.max(20, base.restSeconds - 20),
      };
    case "muscle_gain":
    case "general_fitness":
    default:
      return base;
  }
}

function estMinutes(sets: number, reps: number, restSeconds: number): number {
  const SECONDS_PER_REP = 4;
  return Math.max(1, Math.round((sets * (reps * SECONDS_PER_REP + restSeconds)) / 60));
}

/** Deterministic pseudo-shuffle so different users/days get varied picks without true randomness. */
function seededSort<T extends { id: string }>(items: T[], seed: string): T[] {
  const scored = items.map((item) => ({
    item,
    score: hashString(seed + item.id),
  }));
  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.item);
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

export async function generateWorkoutPlan(userId: string) {
  const member = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!member || !member.gymId) throw new Error("Member has no gym");

  const profile = await db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.userId, userId),
  });
  if (!profile) throw new Error("Member has no profile");

  const gymExercises = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      equipmentId: exercises.equipmentId,
      muscleGroupId: equipment.muscleGroupId,
      patternKey: movementPatterns.key,
      defaultSets: exercises.defaultSets,
      defaultReps: exercises.defaultReps,
      defaultRestSeconds: exercises.defaultRestSeconds,
    })
    .from(exercises)
    .innerJoin(equipment, eq(exercises.equipmentId, equipment.id))
    .innerJoin(movementPatterns, eq(equipment.movementPatternId, movementPatterns.id))
    .where(eq(equipment.gymId, member.gymId));

  const rules = await db
    .select()
    .from(memberExerciseRules)
    .where(eq(memberExerciseRules.memberId, userId));
  const assignedIds = new Set(rules.filter((r) => r.type === "assigned").map((r) => r.exerciseId));
  const blockedIds = new Set(rules.filter((r) => r.type === "blocked").map((r) => r.exerciseId));
  const hasAssignedRules = assignedIds.size > 0;

  const eligible: EligibleExercise[] = gymExercises
    .filter((e) => (hasAssignedRules ? assignedIds.has(e.id) : true))
    .filter((e) => !blockedIds.has(e.id))
    .map((e) => ({
      id: e.id,
      name: e.name,
      equipmentId: e.equipmentId,
      muscleGroupId: e.muscleGroupId,
      patternKey: e.patternKey,
      category: PATTERN_CATEGORY[e.patternKey] ?? "core",
      defaultSets: e.defaultSets,
      defaultReps: e.defaultReps,
      defaultRestSeconds: e.defaultRestSeconds,
    }));

  const budget = exerciseBudgetFor(profile.experienceLevel);
  const templates = focusTemplates(profile.splitPreference, budget);

  // Which weekdays (0=Mon..6=Sun) are training days, in order.
  const offDaySet = new Set(profile.offDays);
  const candidateDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !offDaySet.has(d));
  const trainingDays = candidateDays.slice(0, Math.min(profile.daysPerWeek, candidateDays.length));
  const trainingDaySet = new Set(trainingDays);

  // Deactivate any existing active plan.
  const existingActive = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.userId, userId),
  });
  if (existingActive) {
    await db
      .update(workoutPlans)
      .set({ active: false })
      .where(eq(workoutPlans.id, existingActive.id));
  }

  const [plan] = await db
    .insert(workoutPlans)
    .values({ userId, gymId: member.gymId, splitType: profile.splitPreference, active: true })
    .returning();

  let templateIndex = 0;
  for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
    const isTrainingDay = trainingDaySet.has(dayIndex);
    const template = isTrainingDay ? templates[templateIndex % templates.length] : null;
    if (isTrainingDay) templateIndex++;

    const [day] = await db
      .insert(workoutDays)
      .values({
        planId: plan.id,
        dayIndex,
        focusLabel: template ? template.label : "Rest",
        isRestDay: !isTrainingDay,
      })
      .returning();

    if (!template) continue;

    const pool = eligible.filter((e) => template.categories.includes(e.category));
    const shuffled = seededSort(pool, `${userId}:${dayIndex}`);
    const picks: EligibleExercise[] = [];
    const seenEquipment = new Set<string>();
    for (const ex of shuffled) {
      if (picks.length >= template.count) break;
      if (seenEquipment.has(ex.equipmentId)) continue;
      picks.push(ex);
      seenEquipment.add(ex.equipmentId);
    }
    // If we couldn't fill the budget with unique equipment, allow repeats from the pool.
    if (picks.length < template.count) {
      for (const ex of shuffled) {
        if (picks.length >= template.count) break;
        if (!picks.find((p) => p.id === ex.id)) picks.push(ex);
      }
    }

    picks.sort(
      (a, b) => (COMPOUND_PRIORITY[a.patternKey] ?? 2) - (COMPOUND_PRIORITY[b.patternKey] ?? 2)
    );

    for (let order = 0; order < picks.length; order++) {
      const ex = picks[order];
      const isCardioOrMobility = ex.category === "cardio" || ex.patternKey === "mobility_stretch";
      const adjusted = applyGoalAdjustment(profile.goal, {
        sets: ex.defaultSets,
        reps: ex.defaultReps,
        restSeconds: ex.defaultRestSeconds,
      });
      const sets = isCardioOrMobility ? ex.defaultSets : adjusted.sets;
      const reps = isCardioOrMobility ? ex.defaultReps : adjusted.reps;
      const restSeconds = isCardioOrMobility ? ex.defaultRestSeconds : adjusted.restSeconds;
      const minutes = isCardioOrMobility
        ? (ex.patternKey.startsWith("cardio") ? 12 : 6) + (profile.goal === "fat_loss" ? 5 : 0)
        : estMinutes(sets, reps, restSeconds);

      await db.insert(workoutDayExercises).values({
        workoutDayId: day.id,
        exerciseId: ex.id,
        order,
        sets,
        reps,
        restSeconds,
        estMinutes: minutes,
      });
    }
  }

  return plan;
}

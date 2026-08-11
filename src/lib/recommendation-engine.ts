import "server-only";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  equipment,
  exercises,
  memberDayFocus,
  memberExerciseRules,
  memberProfiles,
  movementPatterns,
  muscleGroups,
  users,
  workoutDayExercises,
  workoutDays,
  workoutPlans,
  type goalEnum,
  type splitPreferenceEnum,
} from "@/db/schema";

const equipmentMovementPatterns = alias(movementPatterns, "equipment_movement_patterns");
const equipmentMuscleGroups = alias(muscleGroups, "equipment_muscle_groups");

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
  leg_extension: "legs",
  squat: "legs",
  deadlift: "legs",
  mobility_stretch: "core",
  cardio_cycle: "cardio",
  cardio_run: "cardio",
};

/** Lower = perform earlier in the session (compound lifts before isolation/cardio). */
const COMPOUND_PRIORITY: Record<string, number> = {
  squat: 0,
  deadlift: 0,
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
  leg_extension: 2,
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

/** A resolved day plan, unifying the category-based split styles with the
 * "custom" per-day muscle-group assignment under one shape the scheduling
 * loop can use without caring which mode produced it. */
type DayPlan = { label: string; count: number; matches: (e: EligibleExercise) => boolean };

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

  const gymExercisesRaw = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      equipmentId: exercises.equipmentId,
      exerciseMuscleGroupId: exercises.muscleGroupId,
      equipmentMuscleGroupId: equipmentMuscleGroups.id,
      exercisePatternKey: movementPatterns.key,
      equipmentPatternKey: equipmentMovementPatterns.key,
      defaultSets: exercises.defaultSets,
      defaultReps: exercises.defaultReps,
      defaultRestSeconds: exercises.defaultRestSeconds,
    })
    .from(exercises)
    .innerJoin(equipment, eq(exercises.equipmentId, equipment.id))
    .innerJoin(equipmentMovementPatterns, eq(equipment.movementPatternId, equipmentMovementPatterns.id))
    .innerJoin(equipmentMuscleGroups, eq(equipment.muscleGroupId, equipmentMuscleGroups.id))
    .leftJoin(movementPatterns, eq(exercises.movementPatternId, movementPatterns.id))
    .where(eq(equipment.gymId, member.gymId));

  // Each exercise on a piece of equipment can be a different movement (and
  // target a different muscle group) than the equipment's own default — a
  // squat rack also does bench press, rack pulls, overhead press. Prefer
  // the exercise's own pattern/muscle group and only fall back to the
  // equipment's for rows predating those columns.
  const gymExercises = gymExercisesRaw.map((e) => ({
    ...e,
    patternKey: e.exercisePatternKey ?? e.equipmentPatternKey,
    muscleGroupId: e.exerciseMuscleGroupId ?? e.equipmentMuscleGroupId,
  }));

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

  // The "custom" split replaces daysPerWeek/offDays/category-rotation
  // entirely with an explicit member-chosen day -> muscle group mapping
  // (e.g. "Monday = Legs, Wednesday = Chest") — every other split style
  // keeps the existing rotate-through-categories scheduling.
  const dayPlanByIndex = new Map<number, DayPlan>();
  if (profile.splitPreference === "custom") {
    const focusRows = await db.query.memberDayFocus.findMany({
      where: eq(memberDayFocus.userId, userId),
      with: { muscleGroup: true },
    });
    for (const row of focusRows) {
      dayPlanByIndex.set(row.dayIndex, {
        label: row.muscleGroup.name,
        count: budget,
        matches: (e) => e.muscleGroupId === row.muscleGroupId,
      });
    }
  } else {
    const templates = focusTemplates(profile.splitPreference, budget);
    const offDaySet = new Set(profile.offDays);
    const candidateDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !offDaySet.has(d));
    const trainingDays = candidateDays.slice(0, Math.min(profile.daysPerWeek, candidateDays.length));
    let templateIndex = 0;
    for (const dayIndex of trainingDays) {
      const template = templates[templateIndex % templates.length];
      templateIndex++;
      dayPlanByIndex.set(dayIndex, {
        label: template.label,
        count: template.count,
        matches: (e) => template.categories.includes(e.category),
      });
    }
  }

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

  // Every exercise insert used to be its own awaited round-trip to Neon —
  // fine at the old budget of 4-6 exercises/day, but the cardio finisher +
  // bonus exercises added below can put a day at 10-11 exercises, and 7
  // days' worth of one-row-at-a-time inserts started blowing past
  // Cloudflare Workers' subrequest limit. Collect everything and issue one
  // batched insert per table instead.
  const dayInserts: (typeof workoutDays.$inferInsert)[] = [];
  const dayMeta: { dayIndex: number; dayPlan: DayPlan | null }[] = [];
  for (let dayIndex = 0; dayIndex <= 6; dayIndex++) {
    const dayPlan = dayPlanByIndex.get(dayIndex) ?? null;
    dayInserts.push({
      planId: plan.id,
      dayIndex,
      focusLabel: dayPlan ? dayPlan.label : "Rest",
      isRestDay: !dayPlan,
    });
    dayMeta.push({ dayIndex, dayPlan });
  }
  const insertedDays = await db.insert(workoutDays).values(dayInserts).returning();

  const exerciseRows: (typeof workoutDayExercises.$inferInsert)[] = [];
  for (let i = 0; i < insertedDays.length; i++) {
    const day = insertedDays[i];
    const { dayIndex, dayPlan } = dayMeta[i];
    if (!dayPlan) continue;

    const pool = eligible.filter(dayPlan.matches);
    const shuffled = seededSort(pool, `${userId}:${dayIndex}`);
    const picks: EligibleExercise[] = [];
    const seenEquipment = new Set<string>();
    for (const ex of shuffled) {
      if (picks.length >= dayPlan.count) break;
      if (seenEquipment.has(ex.equipmentId)) continue;
      picks.push(ex);
      seenEquipment.add(ex.equipmentId);
    }
    // If we couldn't fill the budget with unique equipment, allow repeats from the pool.
    if (picks.length < dayPlan.count) {
      for (const ex of shuffled) {
        if (picks.length >= dayPlan.count) break;
        if (!picks.find((p) => p.id === ex.id)) picks.push(ex);
      }
    }

    picks.sort(
      (a, b) => (COMPOUND_PRIORITY[a.patternKey] ?? 2) - (COMPOUND_PRIORITY[b.patternKey] ?? 2)
    );

    // A short cardio finisher on every training day, if the gym has any
    // cardio equipment — the split templates above are strength-only, so
    // cardio would otherwise never get scheduled at all. (Guarded against
    // the core picks already containing a cardio exercise, which can
    // happen in "custom" mode if a member dedicates the day to Cardio.)
    const cardioPool = seededSort(
      eligible.filter((e) => e.category === "cardio" && !picks.some((p) => p.id === e.id)),
      `${userId}:${dayIndex}:cardio`
    );
    const cardioFinisher = cardioPool[0];
    if (cardioFinisher) picks.push(cardioFinisher);

    // Extra, optional exercises appended after the core plan — invisible
    // on a normal day, but there for members who tell the session "how
    // much time do you have?" prompt they have more time than usual;
    // startSession's greedy time-fit picks these up automatically since
    // they're last in `order`.
    const BONUS_COUNT = 4;
    const notPicked = (e: EligibleExercise) => !picks.some((p) => p.id === e.id);
    const bonusFromFocus = seededSort(pool.filter(notPicked), `${userId}:${dayIndex}:bonus`);
    const bonusFromRest = seededSort(eligible.filter(notPicked), `${userId}:${dayIndex}:bonus2`).filter(
      (e) => !bonusFromFocus.some((b) => b.id === e.id)
    );
    const bonusCandidates = [...bonusFromFocus, ...bonusFromRest];
    // Same equipment-diversity preference as the core picks above — favor
    // spreading across different machines before repeating one.
    const bonusPicks: EligibleExercise[] = [];
    for (const ex of bonusCandidates) {
      if (bonusPicks.length >= BONUS_COUNT) break;
      if (seenEquipment.has(ex.equipmentId)) continue;
      bonusPicks.push(ex);
      seenEquipment.add(ex.equipmentId);
    }
    if (bonusPicks.length < BONUS_COUNT) {
      for (const ex of bonusCandidates) {
        if (bonusPicks.length >= BONUS_COUNT) break;
        if (!bonusPicks.find((p) => p.id === ex.id)) bonusPicks.push(ex);
      }
    }
    bonusPicks.sort(
      (a, b) => (COMPOUND_PRIORITY[a.patternKey] ?? 2) - (COMPOUND_PRIORITY[b.patternKey] ?? 2)
    );

    const coreCount = picks.length;
    const allPicks = [...picks, ...bonusPicks];

    for (let order = 0; order < allPicks.length; order++) {
      const ex = allPicks[order];
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

      exerciseRows.push({
        workoutDayId: day.id,
        exerciseId: ex.id,
        order,
        sets,
        reps,
        restSeconds,
        estMinutes: minutes,
        isBonus: order >= coreCount,
      });
    }
  }

  if (exerciseRows.length > 0) {
    await db.insert(workoutDayExercises).values(exerciseRows);
  }

  return plan;
}

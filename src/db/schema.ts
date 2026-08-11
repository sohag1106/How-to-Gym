import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  smallint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "gym_owner",
  "member",
]);

export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "approved",
  "rejected",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const goalEnum = pgEnum("goal", [
  "muscle_gain",
  "fat_loss",
  "general_fitness",
  "strength",
]);

export const splitPreferenceEnum = pgEnum("split_preference", [
  "mixed_full_body",
  "upper_lower",
  "push_pull_legs",
  "bro_split",
]);

export const exerciseRuleTypeEnum = pgEnum("exercise_rule_type", [
  "assigned",
  "blocked",
]);

export const sessionExerciseStatusEnum = pgEnum("session_exercise_status", [
  "pending",
  "done",
  "skipped",
]);

export const difficultyEnum = pgEnum("difficulty", [
  "beginner",
  "intermediate",
  "advanced",
]);

// ---------------------------------------------------------------------------
// Tenancy & identity
// ---------------------------------------------------------------------------

export const gyms = pgTable("gyms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  ownerPhone: text("owner_phone").notNull(),
  memberLimit: integer("member_limit").notNull().default(50),
  active: boolean("active").notNull().default(true),
  createdBySuperAdminId: uuid("created_by_super_admin_id"),
  invitationId: text("invitation_id"),
  invitationUrl: text("invitation_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  role: userRoleEnum("role").notNull().default("member"),
  gymId: uuid("gym_id").references(() => gyms.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: userStatusEnum("status").notNull().default("pending"),
  approvedByUserId: uuid("approved_by_user_id"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Exercise taxonomy
// ---------------------------------------------------------------------------

export const muscleGroups = pgTable("muscle_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const movementPatterns = pgTable("movement_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  animationClipKey: text("animation_clip_key").notNull(),
});

/** A shared, reusable animated-style demo (two crossfading photos of the
 * movement's start/end position) sourced from the free-exercise-db public
 * domain dataset. Many exercises across many gyms point at the same demo. */
export const exerciseDemos = pgTable("exercise_demos", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceName: text("source_name").notNull(),
  imageStart: text("image_start").notNull(),
  imageEnd: text("image_end").notNull(),
});

export const equipmentTemplates = pgTable("equipment_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  imageData: text("image_data").notNull(),
  muscleGroupId: uuid("muscle_group_id")
    .notNull()
    .references(() => muscleGroups.id),
  movementPatternId: uuid("movement_pattern_id")
    .notNull()
    .references(() => movementPatterns.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** All the exercises a given equipment TYPE can be used for (e.g. a barbell
 * can do squats, deadlifts, bench press, rows...). Seeded/curated by the
 * super admin against the master catalog; copied into a gym's own
 * `exercises` for every matching `equipment` row it adds. */
export const templateExercises = pgTable("template_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  equipmentTemplateId: uuid("equipment_template_id")
    .notNull()
    .references(() => equipmentTemplates.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  muscleGroupId: uuid("muscle_group_id")
    .notNull()
    .references(() => muscleGroups.id),
  movementPatternId: uuid("movement_pattern_id")
    .notNull()
    .references(() => movementPatterns.id),
  exerciseDemoId: uuid("exercise_demo_id").references(() => exerciseDemos.id),
  defaultSets: smallint("default_sets").notNull().default(3),
  defaultReps: smallint("default_reps").notNull().default(10),
  defaultRestSeconds: smallint("default_rest_seconds").notNull().default(60),
  difficulty: difficultyEnum("difficulty").notNull().default("beginner"),
  instructions: text("instructions").array().notNull().default([]),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  gymId: uuid("gym_id")
    .notNull()
    .references(() => gyms.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => equipmentTemplates.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  imageData: text("image_data").notNull(),
  muscleGroupId: uuid("muscle_group_id")
    .notNull()
    .references(() => muscleGroups.id),
  movementPatternId: uuid("movement_pattern_id")
    .notNull()
    .references(() => movementPatterns.id),
  addedByUserId: uuid("added_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  equipmentId: uuid("equipment_id")
    .notNull()
    .references(() => equipment.id, { onDelete: "cascade" }),
  sourceTemplateExerciseId: uuid("source_template_exercise_id").references(
    () => templateExercises.id,
    { onDelete: "set null" }
  ),
  name: text("name").notNull(),
  movementPatternId: uuid("movement_pattern_id").references(() => movementPatterns.id),
  exerciseDemoId: uuid("exercise_demo_id").references(() => exerciseDemos.id),
  defaultSets: smallint("default_sets").notNull().default(3),
  defaultReps: smallint("default_reps").notNull().default(10),
  defaultRestSeconds: smallint("default_rest_seconds").notNull().default(60),
  difficulty: difficultyEnum("difficulty").notNull().default("beginner"),
  instructions: text("instructions").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Member profile & per-member exercise rules
// ---------------------------------------------------------------------------

export const memberProfiles = pgTable("member_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  experienceLevel: experienceLevelEnum("experience_level").notNull(),
  goal: goalEnum("goal").notNull(),
  daysPerWeek: smallint("days_per_week").notNull(),
  splitPreference: splitPreferenceEnum("split_preference").notNull(),
  offDays: integer("off_days").array().notNull().default([]),
  heightCm: smallint("height_cm"),
  weightKg: smallint("weight_kg"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const memberExerciseRules = pgTable("member_exercise_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  gymId: uuid("gym_id")
    .notNull()
    .references(() => gyms.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  type: exerciseRuleTypeEnum("type").notNull(),
  setByUserId: uuid("set_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Generated plans & daily sessions
// ---------------------------------------------------------------------------

export const workoutPlans = pgTable("workout_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  gymId: uuid("gym_id")
    .notNull()
    .references(() => gyms.id, { onDelete: "cascade" }),
  splitType: splitPreferenceEnum("split_type").notNull(),
  active: boolean("active").notNull().default(true),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const workoutDays = pgTable("workout_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id")
    .notNull()
    .references(() => workoutPlans.id, { onDelete: "cascade" }),
  dayIndex: smallint("day_index").notNull(), // 0=Mon .. 6=Sun
  focusLabel: text("focus_label").notNull(),
  isRestDay: boolean("is_rest_day").notNull().default(false),
});

export const workoutDayExercises = pgTable("workout_day_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutDayId: uuid("workout_day_id")
    .notNull()
    .references(() => workoutDays.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  order: smallint("order").notNull(),
  sets: smallint("sets").notNull(),
  reps: smallint("reps").notNull(),
  restSeconds: smallint("rest_seconds").notNull(),
  estMinutes: smallint("est_minutes").notNull(),
});

export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workoutDayId: uuid("workout_day_id")
    .notNull()
    .references(() => workoutDays.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull().defaultNow(),
  availableMinutes: smallint("available_minutes").notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const workoutSessionExercises = pgTable("workout_session_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "cascade" }),
  order: smallint("order").notNull(),
  sets: smallint("sets").notNull(),
  reps: smallint("reps").notNull(),
  status: sessionExerciseStatusEnum("status").notNull().default("pending"),
  completedAt: timestamp("completed_at"),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const gymsRelations = relations(gyms, ({ many }) => ({
  users: many(users),
  equipment: many(equipment),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  gym: one(gyms, { fields: [users.gymId], references: [gyms.id] }),
  profile: one(memberProfiles, {
    fields: [users.id],
    references: [memberProfiles.userId],
  }),
  workoutPlans: many(workoutPlans),
}));

export const equipmentTemplatesRelations = relations(
  equipmentTemplates,
  ({ one, many }) => ({
    muscleGroup: one(muscleGroups, {
      fields: [equipmentTemplates.muscleGroupId],
      references: [muscleGroups.id],
    }),
    movementPattern: one(movementPatterns, {
      fields: [equipmentTemplates.movementPatternId],
      references: [movementPatterns.id],
    }),
    exercises: many(templateExercises),
  })
);

export const templateExercisesRelations = relations(
  templateExercises,
  ({ one }) => ({
    template: one(equipmentTemplates, {
      fields: [templateExercises.equipmentTemplateId],
      references: [equipmentTemplates.id],
    }),
    muscleGroup: one(muscleGroups, {
      fields: [templateExercises.muscleGroupId],
      references: [muscleGroups.id],
    }),
    movementPattern: one(movementPatterns, {
      fields: [templateExercises.movementPatternId],
      references: [movementPatterns.id],
    }),
    demo: one(exerciseDemos, {
      fields: [templateExercises.exerciseDemoId],
      references: [exerciseDemos.id],
    }),
  })
);

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  gym: one(gyms, { fields: [equipment.gymId], references: [gyms.id] }),
  template: one(equipmentTemplates, {
    fields: [equipment.templateId],
    references: [equipmentTemplates.id],
  }),
  muscleGroup: one(muscleGroups, {
    fields: [equipment.muscleGroupId],
    references: [muscleGroups.id],
  }),
  movementPattern: one(movementPatterns, {
    fields: [equipment.movementPatternId],
    references: [movementPatterns.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  equipment: one(equipment, {
    fields: [exercises.equipmentId],
    references: [equipment.id],
  }),
  movementPattern: one(movementPatterns, {
    fields: [exercises.movementPatternId],
    references: [movementPatterns.id],
  }),
  demo: one(exerciseDemos, {
    fields: [exercises.exerciseDemoId],
    references: [exerciseDemos.id],
  }),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, { fields: [workoutPlans.userId], references: [users.id] }),
  gym: one(gyms, { fields: [workoutPlans.gymId], references: [gyms.id] }),
  days: many(workoutDays),
}));

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
  plan: one(workoutPlans, {
    fields: [workoutDays.planId],
    references: [workoutPlans.id],
  }),
  exercises: many(workoutDayExercises),
}));

export const workoutDayExercisesRelations = relations(
  workoutDayExercises,
  ({ one }) => ({
    day: one(workoutDays, {
      fields: [workoutDayExercises.workoutDayId],
      references: [workoutDays.id],
    }),
    exercise: one(exercises, {
      fields: [workoutDayExercises.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const workoutSessionsRelations = relations(
  workoutSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [workoutSessions.userId],
      references: [users.id],
    }),
    day: one(workoutDays, {
      fields: [workoutSessions.workoutDayId],
      references: [workoutDays.id],
    }),
    exercises: many(workoutSessionExercises),
  })
);

export const workoutSessionExercisesRelations = relations(
  workoutSessionExercises,
  ({ one }) => ({
    session: one(workoutSessions, {
      fields: [workoutSessionExercises.sessionId],
      references: [workoutSessions.id],
    }),
    exercise: one(exercises, {
      fields: [workoutSessionExercises.exerciseId],
      references: [exercises.id],
    }),
  })
);

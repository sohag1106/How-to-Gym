CREATE TYPE "public"."difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."exercise_rule_type" AS ENUM('assigned', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."goal" AS ENUM('muscle_gain', 'fat_loss', 'general_fitness', 'strength');--> statement-breakpoint
CREATE TYPE "public"."session_exercise_status" AS ENUM('pending', 'done', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."split_preference" AS ENUM('mixed_full_body', 'upper_lower', 'push_pull_legs', 'bro_split');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'gym_owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"template_id" uuid,
	"name" text NOT NULL,
	"image_data" text NOT NULL,
	"muscle_group_id" uuid NOT NULL,
	"movement_pattern_id" uuid NOT NULL,
	"added_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image_data" text NOT NULL,
	"muscle_group_id" uuid NOT NULL,
	"movement_pattern_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"name" text NOT NULL,
	"default_sets" smallint DEFAULT 3 NOT NULL,
	"default_reps" smallint DEFAULT 10 NOT NULL,
	"default_rest_seconds" smallint DEFAULT 60 NOT NULL,
	"difficulty" "difficulty" DEFAULT 'beginner' NOT NULL,
	"instructions" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"owner_name" text NOT NULL,
	"owner_email" text NOT NULL,
	"owner_phone" text NOT NULL,
	"member_limit" integer DEFAULT 50 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by_super_admin_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_exercise_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"type" "exercise_rule_type" NOT NULL,
	"set_by_user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	"goal" "goal" NOT NULL,
	"days_per_week" smallint NOT NULL,
	"split_preference" "split_preference" NOT NULL,
	"off_days" integer[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "movement_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"animation_clip_key" text NOT NULL,
	CONSTRAINT "movement_patterns_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "muscle_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "muscle_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"gym_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"approved_by_user_id" uuid,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "workout_day_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_day_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"order" smallint NOT NULL,
	"sets" smallint NOT NULL,
	"reps" smallint NOT NULL,
	"rest_seconds" smallint NOT NULL,
	"est_minutes" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"day_index" smallint NOT NULL,
	"focus_label" text NOT NULL,
	"is_rest_day" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gym_id" uuid NOT NULL,
	"split_type" "split_preference" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_session_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"order" smallint NOT NULL,
	"sets" smallint NOT NULL,
	"reps" smallint NOT NULL,
	"status" "session_exercise_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"workout_day_id" uuid NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"available_minutes" smallint NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_template_id_equipment_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."equipment_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_muscle_group_id_muscle_groups_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_movement_pattern_id_movement_patterns_id_fk" FOREIGN KEY ("movement_pattern_id") REFERENCES "public"."movement_patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_templates" ADD CONSTRAINT "equipment_templates_muscle_group_id_muscle_groups_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_templates" ADD CONSTRAINT "equipment_templates_movement_pattern_id_movement_patterns_id_fk" FOREIGN KEY ("movement_pattern_id") REFERENCES "public"."movement_patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_exercise_rules" ADD CONSTRAINT "member_exercise_rules_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_exercise_rules" ADD CONSTRAINT "member_exercise_rules_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_exercise_rules" ADD CONSTRAINT "member_exercise_rules_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_exercise_rules" ADD CONSTRAINT "member_exercise_rules_set_by_user_id_users_id_fk" FOREIGN KEY ("set_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_day_exercises" ADD CONSTRAINT "workout_day_exercises_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_day_exercises" ADD CONSTRAINT "workout_day_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_days" ADD CONSTRAINT "workout_days_plan_id_workout_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."workout_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_session_exercises" ADD CONSTRAINT "workout_session_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_day_id_workout_days_id_fk" FOREIGN KEY ("workout_day_id") REFERENCES "public"."workout_days"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE "template_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_template_id" uuid NOT NULL,
	"name" text NOT NULL,
	"muscle_group_id" uuid NOT NULL,
	"movement_pattern_id" uuid NOT NULL,
	"default_sets" smallint DEFAULT 3 NOT NULL,
	"default_reps" smallint DEFAULT 10 NOT NULL,
	"default_rest_seconds" smallint DEFAULT 60 NOT NULL,
	"difficulty" "difficulty" DEFAULT 'beginner' NOT NULL,
	"instructions" text[] DEFAULT '{}' NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "source_template_exercise_id" uuid;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "height_cm" smallint;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN "weight_kg" smallint;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_equipment_template_id_equipment_templates_id_fk" FOREIGN KEY ("equipment_template_id") REFERENCES "public"."equipment_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_muscle_group_id_muscle_groups_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_movement_pattern_id_movement_patterns_id_fk" FOREIGN KEY ("movement_pattern_id") REFERENCES "public"."movement_patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_source_template_exercise_id_template_exercises_id_fk" FOREIGN KEY ("source_template_exercise_id") REFERENCES "public"."template_exercises"("id") ON DELETE set null ON UPDATE no action;
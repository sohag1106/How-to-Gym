CREATE TABLE "exercise_demos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_name" text NOT NULL,
	"image_start" text NOT NULL,
	"image_end" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "exercise_demo_id" uuid;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD COLUMN "exercise_demo_id" uuid;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_exercise_demo_id_exercise_demos_id_fk" FOREIGN KEY ("exercise_demo_id") REFERENCES "public"."exercise_demos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_exercise_demo_id_exercise_demos_id_fk" FOREIGN KEY ("exercise_demo_id") REFERENCES "public"."exercise_demos"("id") ON DELETE no action ON UPDATE no action;
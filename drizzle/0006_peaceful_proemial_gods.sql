ALTER TYPE "public"."split_preference" ADD VALUE 'custom';--> statement-breakpoint
CREATE TABLE "member_day_focus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"day_index" smallint NOT NULL,
	"muscle_group_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_day_focus" ADD CONSTRAINT "member_day_focus_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_day_focus" ADD CONSTRAINT "member_day_focus_muscle_group_id_muscle_groups_id_fk" FOREIGN KEY ("muscle_group_id") REFERENCES "public"."muscle_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "member_day_focus_user_day_idx" ON "member_day_focus" USING btree ("user_id","day_index");
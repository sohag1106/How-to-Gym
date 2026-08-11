"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { memberDayFocus, memberProfiles } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { generateWorkoutPlan } from "@/lib/recommendation-engine";

const dayFocusSchema = z.array(
  z.object({
    dayIndex: z.number().int().min(0).max(6),
    muscleGroupId: z.string().uuid(),
  })
);

const schema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["muscle_gain", "fat_loss", "general_fitness", "strength"]),
  daysPerWeek: z.number().int().min(2).max(6),
  splitPreference: z.enum([
    "mixed_full_body",
    "upper_lower",
    "push_pull_legs",
    "bro_split",
    "custom",
  ]),
  offDays: z.array(z.number().int().min(0).max(6)),
  heightCm: z.number().int().min(100).max(250).nullable(),
  weightKg: z.number().int().min(30).max(300).nullable(),
  dayFocus: dayFocusSchema.optional(),
});

export type OnboardingInput = z.infer<typeof schema>;

export async function submitOnboarding(input: OnboardingInput) {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");
  if (appUser.role !== "member" || appUser.status !== "approved") {
    return { error: "Your account isn't approved yet." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { dayFocus, ...profileData } = parsed.data;

  await db
    .insert(memberProfiles)
    .values({ userId: appUser.id, ...profileData })
    .onConflictDoUpdate({
      target: memberProfiles.userId,
      set: { ...profileData, updatedAt: new Date() },
    });

  await db.delete(memberDayFocus).where(eq(memberDayFocus.userId, appUser.id));
  if (profileData.splitPreference === "custom" && dayFocus && dayFocus.length > 0) {
    await db
      .insert(memberDayFocus)
      .values(dayFocus.map((d) => ({ userId: appUser.id, dayIndex: d.dayIndex, muscleGroupId: d.muscleGroupId })));
  }

  await generateWorkoutPlan(appUser.id);

  redirect("/dashboard");
}

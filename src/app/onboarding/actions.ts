"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { memberProfiles } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { generateWorkoutPlan } from "@/lib/recommendation-engine";

const schema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["muscle_gain", "fat_loss", "general_fitness", "strength"]),
  daysPerWeek: z.number().int().min(2).max(6),
  splitPreference: z.enum(["mixed_full_body", "upper_lower", "push_pull_legs", "bro_split"]),
  offDays: z.array(z.number().int().min(0).max(6)),
  heightCm: z.number().int().min(100).max(250).nullable(),
  weightKg: z.number().int().min(30).max(300).nullable(),
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

  await db
    .insert(memberProfiles)
    .values({ userId: appUser.id, ...parsed.data })
    .onConflictDoUpdate({
      target: memberProfiles.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    });

  await generateWorkoutPlan(appUser.id);

  redirect("/dashboard");
}

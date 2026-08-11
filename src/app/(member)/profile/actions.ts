"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { memberProfiles } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { generateWorkoutPlan } from "@/lib/recommendation-engine";
import { submitOnboarding, type OnboardingInput } from "@/app/onboarding/actions";

export async function updateProfile(input: OnboardingInput) {
  const appUser = await ensureAppUser();
  if (!appUser) return { error: "Not signed in" };

  const existing = await db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.userId, appUser.id),
  });

  if (!existing) return submitOnboarding(input);

  await db
    .update(memberProfiles)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(memberProfiles.userId, appUser.id));

  await generateWorkoutPlan(appUser.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { success: true };
}

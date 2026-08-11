"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { memberDayFocus, memberProfiles } from "@/db/schema";
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

  const { dayFocus, ...profileData } = input;

  await db
    .update(memberProfiles)
    .set({ ...profileData, updatedAt: new Date() })
    .where(eq(memberProfiles.userId, appUser.id));

  await db.delete(memberDayFocus).where(eq(memberDayFocus.userId, appUser.id));
  if (profileData.splitPreference === "custom" && dayFocus && dayFocus.length > 0) {
    await db
      .insert(memberDayFocus)
      .values(dayFocus.map((d) => ({ userId: appUser.id, dayIndex: d.dayIndex, muscleGroupId: d.muscleGroupId })));
  }

  await generateWorkoutPlan(appUser.id);

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { success: true };
}

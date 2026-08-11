"use server";

import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { gyms, users } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";

const schema = z.object({
  gymId: z.string().uuid(),
  phone: z.string().min(6, "Enter a valid phone number"),
});

export async function submitGymSelection(formData: FormData) {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");

  const parsed = schema.safeParse({
    gymId: formData.get("gymId"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [gym] = await db.select().from(gyms).where(eq(gyms.id, parsed.data.gymId));
  if (!gym) return { error: "That gym couldn't be found." };

  let autoApproved = false;
  if (gym.autoApproveMembers) {
    const [{ value: approvedCount }] = await db
      .select({ value: count() })
      .from(users)
      .where(and(eq(users.gymId, gym.id), eq(users.role, "member"), eq(users.status, "approved")));
    autoApproved = approvedCount < gym.memberLimit;
  }

  await db
    .update(users)
    .set({
      gymId: parsed.data.gymId,
      phone: parsed.data.phone,
      ...(autoApproved ? { status: "approved" as const, approvedAt: new Date() } : {}),
    })
    .where(eq(users.id, appUser.id));

  redirect(autoApproved ? "/onboarding" : "/pending-approval");
}

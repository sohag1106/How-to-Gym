"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { gyms } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const createGymSchema = z.object({
  name: z.string().min(2, "Gym name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  ownerEmail: z.string().email("Enter a valid email"),
  ownerPhone: z.string().min(6, "Enter a valid phone number"),
  memberLimit: z.coerce.number().int().min(1).max(5000),
});

export async function createGym(
  _prev: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const superAdmin = await requireRole("super_admin");

  const parsed = createGymSchema.safeParse({
    name: formData.get("name"),
    ownerName: formData.get("ownerName"),
    ownerEmail: formData.get("ownerEmail"),
    ownerPhone: formData.get("ownerPhone"),
    memberLimit: formData.get("memberLimit"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [gym] = await db
    .insert(gyms)
    .values({ ...parsed.data, createdBySuperAdminId: superAdmin.id })
    .returning();

  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: parsed.data.ownerEmail,
      publicMetadata: { role: "gym_owner", gymId: gym.id },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sign-up`,
      ignoreExisting: true,
    });
  } catch (err) {
    console.error("Failed to send Clerk invitation", err);
    revalidatePath("/super-admin/gyms");
    return {
      error:
        "Gym was created, but the owner invite email failed to send. Check the Clerk dashboard.",
    };
  }

  revalidatePath("/super-admin/gyms");
  return { success: `${gym.name} created — invite sent to ${gym.ownerEmail}.` };
}

export async function toggleGymActive(gymId: string, active: boolean) {
  await requireRole("super_admin");
  await db.update(gyms).set({ active }).where(eq(gyms.id, gymId));
  revalidatePath("/super-admin/gyms");
}

const memberLimitSchema = z.object({
  gymId: z.string().uuid(),
  memberLimit: z.coerce.number().int().min(1).max(5000),
});

export async function updateMemberLimit(formData: FormData) {
  await requireRole("super_admin");
  const parsed = memberLimitSchema.safeParse({
    gymId: formData.get("gymId"),
    memberLimit: formData.get("memberLimit"),
  });
  if (!parsed.success) return;

  await db
    .update(gyms)
    .set({ memberLimit: parsed.data.memberLimit })
    .where(eq(gyms.id, parsed.data.gymId));
  revalidatePath("/super-admin/gyms");
}

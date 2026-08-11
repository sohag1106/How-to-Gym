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
    const invitation = await client.invitations.createInvitation({
      emailAddress: parsed.data.ownerEmail,
      publicMetadata: { role: "gym_owner", gymId: gym.id },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sign-up`,
      ignoreExisting: true,
    });
    await db
      .update(gyms)
      .set({ invitationId: invitation.id, invitationUrl: invitation.url })
      .where(eq(gyms.id, gym.id));
  } catch (err) {
    console.error("Failed to send Clerk invitation", err);
    revalidatePath("/super-admin/gyms");
    return {
      error:
        "Gym was created, but the owner invite email failed to send. Check the Clerk dashboard.",
    };
  }

  revalidatePath("/super-admin/gyms");
  return {
    success: `${gym.name} created — invite sent to ${gym.ownerEmail}. If it doesn't land in their inbox, copy the invite link from the gym card instead.`,
  };
}

export async function resendInvite(gymId: string) {
  await requireRole("super_admin");

  const [gym] = await db.select().from(gyms).where(eq(gyms.id, gymId));
  if (!gym) return { error: "Gym not found" };

  try {
    const client = await clerkClient();
    if (gym.invitationId) {
      await client.invitations.revokeInvitation(gym.invitationId).catch(() => {});
    }
    const invitation = await client.invitations.createInvitation({
      emailAddress: gym.ownerEmail,
      publicMetadata: { role: "gym_owner", gymId: gym.id },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sign-up`,
      ignoreExisting: true,
    });
    await db
      .update(gyms)
      .set({ invitationId: invitation.id, invitationUrl: invitation.url })
      .where(eq(gyms.id, gymId));
  } catch (err) {
    console.error("Failed to resend Clerk invitation", err);
    return { error: "Could not create a new invite. Check the Clerk dashboard." };
  }

  revalidatePath("/super-admin/gyms");
  return { success: true };
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

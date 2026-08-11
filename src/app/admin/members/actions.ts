"use server";

import { and, eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { gyms, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export async function approveMember(memberId: string) {
  const owner = await requireRole("gym_owner");

  const member = await db.query.users.findFirst({
    where: eq(users.id, memberId),
  });
  if (!member || member.gymId !== owner.gymId) return { error: "Not found" };

  const [gym] = await db.select().from(gyms).where(eq(gyms.id, owner.gymId!));
  const [{ value: approvedCount }] = await db
    .select({ value: count() })
    .from(users)
    .where(
      and(
        eq(users.gymId, owner.gymId!),
        eq(users.role, "member"),
        eq(users.status, "approved")
      )
    );

  if (approvedCount >= gym.memberLimit) {
    return {
      error: `Member limit reached (${gym.memberLimit}). Ask your admin to raise it.`,
    };
  }

  await db
    .update(users)
    .set({ status: "approved", approvedByUserId: owner.id, approvedAt: new Date() })
    .where(eq(users.id, memberId));

  revalidatePath("/admin/members");
  return { success: true };
}

export async function rejectMember(memberId: string) {
  const owner = await requireRole("gym_owner");
  const member = await db.query.users.findFirst({
    where: eq(users.id, memberId),
  });
  if (!member || member.gymId !== owner.gymId) return { error: "Not found" };

  await db
    .update(users)
    .set({ status: "rejected", approvedByUserId: owner.id, approvedAt: new Date() })
    .where(eq(users.id, memberId));

  revalidatePath("/admin/members");
  return { success: true };
}

export async function setAutoApprove(enabled: boolean) {
  const owner = await requireRole("gym_owner");
  await db.update(gyms).set({ autoApproveMembers: enabled }).where(eq(gyms.id, owner.gymId!));
  revalidatePath("/admin/members");
}

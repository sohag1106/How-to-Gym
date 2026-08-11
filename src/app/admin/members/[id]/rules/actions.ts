"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { memberExerciseRules, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export async function setExerciseRule(
  memberId: string,
  exerciseId: string,
  type: "assigned" | "blocked" | "default"
) {
  const owner = await requireRole("gym_owner");

  const member = await db.query.users.findFirst({ where: eq(users.id, memberId) });
  if (!member || member.gymId !== owner.gymId) return { error: "Not found" };

  await db
    .delete(memberExerciseRules)
    .where(
      and(
        eq(memberExerciseRules.memberId, memberId),
        eq(memberExerciseRules.exerciseId, exerciseId)
      )
    );

  if (type !== "default") {
    await db.insert(memberExerciseRules).values({
      gymId: owner.gymId!,
      memberId,
      exerciseId,
      type,
      setByUserId: owner.id,
    });
  }

  revalidatePath(`/admin/members/${memberId}/rules`);
  return { success: true };
}

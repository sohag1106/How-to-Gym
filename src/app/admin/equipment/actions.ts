"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { equipment, exercises, movementPatterns } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { defaultsForPattern } from "@/lib/exercise-defaults";
import { addTemplateToGym } from "@/lib/gym-catalog";

async function createDefaultExercise(
  equipmentId: string,
  name: string,
  movementPatternId: string
) {
  const [pattern] = await db
    .select()
    .from(movementPatterns)
    .where(eq(movementPatterns.id, movementPatternId));
  const d = defaultsForPattern(pattern?.key ?? "");

  await db.insert(exercises).values({
    equipmentId,
    name,
    movementPatternId,
    defaultSets: d.sets,
    defaultReps: d.reps,
    defaultRestSeconds: d.restSeconds,
    difficulty: "beginner",
    instructions: d.instructions,
  });
}

export async function addFromTemplate(templateId: string) {
  const owner = await requireRole("gym_owner");

  const created = await addTemplateToGym(owner.gymId!, templateId, owner.id);
  if (!created) return { error: "Already in your gym, or template not found" };

  revalidatePath("/admin/equipment");
  return { success: true };
}

export async function removeEquipment(equipmentId: string) {
  const owner = await requireRole("gym_owner");
  await db
    .delete(equipment)
    .where(and(eq(equipment.id, equipmentId), eq(equipment.gymId, owner.gymId!)));
  revalidatePath("/admin/equipment");
}

const customSchema = z.object({
  name: z.string().min(2, "Name is required"),
  muscleGroupId: z.string().uuid("Choose a muscle group"),
  movementPatternId: z.string().uuid("Choose a movement pattern"),
});

export async function createCustomEquipment(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const owner = await requireRole("gym_owner");

  const parsed = customSchema.safeParse({
    name: formData.get("name"),
    muscleGroupId: formData.get("muscleGroupId"),
    movementPatternId: formData.get("movementPatternId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo of the equipment" };
  }
  if (file.size > 3 * 1024 * 1024) {
    return { error: "Image is too large (max 3MB)" };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const imageData = `data:${file.type};base64,${buf.toString("base64")}`;

  const [created] = await db
    .insert(equipment)
    .values({
      gymId: owner.gymId!,
      templateId: null,
      name: parsed.data.name,
      imageData,
      muscleGroupId: parsed.data.muscleGroupId,
      movementPatternId: parsed.data.movementPatternId,
      addedByUserId: owner.id,
    })
    .returning();

  await createDefaultExercise(created.id, created.name, created.movementPatternId);

  revalidatePath("/admin/equipment");
  return { success: true };
}

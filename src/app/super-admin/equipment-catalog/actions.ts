"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { equipmentTemplates } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  muscleGroupId: z.string().uuid("Choose a muscle group"),
  movementPatternId: z.string().uuid("Choose a movement pattern"),
});

export async function createEquipmentTemplate(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  await requireRole("super_admin");

  const parsed = schema.safeParse({
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
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image is too large (max 3MB)" };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const imageData = `data:${file.type};base64,${buf.toString("base64")}`;

  await db.insert(equipmentTemplates).values({
    name: parsed.data.name,
    imageData,
    muscleGroupId: parsed.data.muscleGroupId,
    movementPatternId: parsed.data.movementPatternId,
  });

  revalidatePath("/super-admin/equipment-catalog");
  return { success: true };
}

export async function deleteEquipmentTemplate(id: string) {
  await requireRole("super_admin");
  await db.delete(equipmentTemplates).where(eq(equipmentTemplates.id, id));
  revalidatePath("/super-admin/equipment-catalog");
}

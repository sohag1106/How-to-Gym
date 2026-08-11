import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment, equipmentTemplates, exercises, templateExercises } from "@/db/schema";

/**
 * Adds one equipment template to a gym's inventory, along with every
 * exercise that template supports (a barbell isn't one exercise, it's a
 * dozen). No-ops if the gym already has this template.
 */
export async function addTemplateToGym(
  gymId: string,
  templateId: string,
  addedByUserId: string | null
) {
  const existing = await db.query.equipment.findFirst({
    where: and(eq(equipment.gymId, gymId), eq(equipment.templateId, templateId)),
  });
  if (existing) return null;

  const [template] = await db
    .select()
    .from(equipmentTemplates)
    .where(eq(equipmentTemplates.id, templateId));
  if (!template) return null;

  const [createdEquipment] = await db
    .insert(equipment)
    .values({
      gymId,
      templateId: template.id,
      name: template.name,
      imageData: template.imageData,
      muscleGroupId: template.muscleGroupId,
      movementPatternId: template.movementPatternId,
      addedByUserId,
    })
    .returning();

  const possibleExercises = await db
    .select()
    .from(templateExercises)
    .where(eq(templateExercises.equipmentTemplateId, template.id));

  // Fall back to a single default exercise if the template has none defined.
  const toInsert =
    possibleExercises.length > 0
      ? possibleExercises.map((ex) => ({
          equipmentId: createdEquipment.id,
          sourceTemplateExerciseId: ex.id,
          name: ex.name,
          movementPatternId: ex.movementPatternId,
          muscleGroupId: ex.muscleGroupId,
          exerciseDemoId: ex.exerciseDemoId,
          defaultSets: ex.defaultSets,
          defaultReps: ex.defaultReps,
          defaultRestSeconds: ex.defaultRestSeconds,
          difficulty: ex.difficulty,
          instructions: ex.instructions,
        }))
      : [
          {
            equipmentId: createdEquipment.id,
            sourceTemplateExerciseId: null,
            name: template.name,
            movementPatternId: template.movementPatternId,
            muscleGroupId: template.muscleGroupId,
            defaultSets: 3,
            defaultReps: 10,
            defaultRestSeconds: 60,
            difficulty: "beginner" as const,
            instructions: [] as string[],
          },
        ];

  await db.insert(exercises).values(toInsert);

  return createdEquipment;
}

/** Populates a brand-new gym with the full equipment catalog so members
 * always have a plan to train from — the owner removes what they don't
 * actually have, rather than starting from an empty gym. */
export async function populateGymFromFullCatalog(gymId: string, addedByUserId: string | null) {
  const allTemplates = await db.select().from(equipmentTemplates);
  for (const template of allTemplates) {
    await addTemplateToGym(gymId, template.id, addedByUserId);
  }
}

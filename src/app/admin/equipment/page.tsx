import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment, equipmentTemplates, muscleGroups, movementPatterns } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { EquipmentFormDialog } from "@/components/equipment/equipment-form-dialog";
import { createCustomEquipment } from "./actions";
import { GymEquipmentTile } from "./gym-equipment-tile";
import { TemplatePickTile } from "./template-pick-tile";

export default async function AdminEquipmentPage() {
  const owner = await requireRole("gym_owner");

  const [gymEquipment, templates, groups, patterns] = await Promise.all([
    db.query.equipment.findMany({
      where: eq(equipment.gymId, owner.gymId!),
      columns: { imageData: false },
      with: { movementPattern: true, exercises: true },
      orderBy: asc(equipment.name),
    }),
    db.query.equipmentTemplates.findMany({
      columns: { imageData: false },
      with: { muscleGroup: true, movementPattern: true },
      orderBy: asc(equipmentTemplates.name),
    }),
    db.select().from(muscleGroups).orderBy(asc(muscleGroups.sortOrder)),
    db.select().from(movementPatterns).orderBy(asc(movementPatterns.label)),
  ]);

  const addedTemplateIds = new Set(
    gymEquipment.map((e) => e.templateId).filter(Boolean)
  );
  const availableTemplates = templates.filter((t) => !addedTemplateIds.has(t.id));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Equipment</h1>
          <p className="text-sm text-muted-foreground mt-1">
            What&apos;s actually in your gym — this is what members&apos;
            plans are built from.
          </p>
        </div>
        <EquipmentFormDialog
          groups={groups}
          patterns={patterns}
          action={createCustomEquipment}
          triggerLabel="Add custom"
          dialogTitle="Add custom equipment"
          submitLabel="Add to my gym"
        />
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Your gym ({gymEquipment.length})
        </h2>
        {gymEquipment.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
            Nothing added yet — pick from the catalog below.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gymEquipment.map((e) => (
              <GymEquipmentTile key={e.id} item={e} />
            ))}
          </div>
        )}
      </section>

      {availableTemplates.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Add from catalog
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableTemplates.map((t) => (
              <TemplatePickTile key={t.id} template={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

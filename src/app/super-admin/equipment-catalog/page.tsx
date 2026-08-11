import { db } from "@/db";
import { equipmentTemplates, muscleGroups, movementPatterns } from "@/db/schema";
import { asc } from "drizzle-orm";
import { CreateTemplateDialog } from "./create-template-dialog";
import { TemplateCard } from "./template-card";

export default async function EquipmentCatalogPage() {
  const [templates, groups, patterns] = await Promise.all([
    db.query.equipmentTemplates.findMany({
      with: {
        muscleGroup: true,
        movementPattern: true,
        exercises: { with: { movementPattern: true } },
      },
      orderBy: asc(equipmentTemplates.name),
    }),
    db.select().from(muscleGroups).orderBy(asc(muscleGroups.sortOrder)),
    db.select().from(movementPatterns).orderBy(asc(movementPatterns.label)),
  ]);

  const byGroup = new Map<string, typeof templates>();
  for (const t of templates) {
    const key = t.muscleGroup?.name ?? "Other";
    byGroup.set(key, [...(byGroup.get(key) ?? []), t]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Equipment Catalog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            The master library gym owners pick from when building their own
            inventory.
          </p>
        </div>
        <CreateTemplateDialog groups={groups} patterns={patterns} />
      </div>

      {templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No equipment yet.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups
            .filter((g) => byGroup.has(g.name))
            .map((g) => (
              <section key={g.id}>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  {g.name}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {byGroup.get(g.name)!.map((t) => (
                    <TemplateCard key={t.id} template={t} groups={groups} patterns={patterns} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { eq, isNull } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql_ = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_, { schema });

const SCRATCH = "C:/Users/Sohag/AppData/Local/Temp/claude/c--Gym-Exercise/97236b13-bb49-4895-993e-edd59c7d8351/scratchpad/exercisedb";

type Target = { name: string; images: [string, string] };

function imageDataUrl(relPath: string): string {
  const buf = readFileSync(join(SCRATCH, "compressed", relPath));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function main() {
  const mapping: Record<string, string> = JSON.parse(
    readFileSync(join(SCRATCH, "final-mapping.json"), "utf8")
  );
  const targets: Target[] = JSON.parse(readFileSync(join(SCRATCH, "unique-targets.json"), "utf8"));

  console.log(`Seeding ${targets.length} exercise demos...`);
  const existing = await db.select().from(schema.exerciseDemos);
  const demoIdBySourceName = new Map(existing.map((d) => [d.sourceName, d.id]));

  for (const t of targets) {
    if (demoIdBySourceName.has(t.name)) continue;
    const [row] = await db
      .insert(schema.exerciseDemos)
      .values({
        sourceName: t.name,
        imageStart: imageDataUrl(t.images[0]),
        imageEnd: imageDataUrl(t.images[1]),
      })
      .returning();
    demoIdBySourceName.set(t.name, row.id);
  }
  console.log(`exerciseDemos ready: ${demoIdBySourceName.size} rows`);

  // demoId keyed by OUR exercise name (via the mapping to the dataset's sourceName)
  const demoIdByOurName = new Map<string, string>();
  for (const [ourName, sourceName] of Object.entries(mapping)) {
    const id = demoIdBySourceName.get(sourceName);
    if (id) demoIdByOurName.set(ourName, id);
  }

  console.log("Backfilling template_exercises...");
  const templateExercises = await db.select().from(schema.templateExercises);
  let teUpdated = 0;
  for (const te of templateExercises) {
    const demoId = demoIdByOurName.get(te.name);
    if (demoId && te.exerciseDemoId !== demoId) {
      await db
        .update(schema.templateExercises)
        .set({ exerciseDemoId: demoId })
        .where(eq(schema.templateExercises.id, te.id));
      teUpdated++;
    }
  }
  console.log(`template_exercises updated: ${teUpdated}/${templateExercises.length}`);

  console.log("Backfilling exercises (gym copies)...");
  const rows = await db
    .select({
      id: schema.exercises.id,
      name: schema.exercises.name,
      sourceTemplateExerciseId: schema.exercises.sourceTemplateExerciseId,
    })
    .from(schema.exercises)
    .where(isNull(schema.exercises.exerciseDemoId));

  const teById = new Map(templateExercises.map((te) => [te.id, te]));
  let exUpdated = 0;
  let exSkipped = 0;
  for (const row of rows) {
    let demoId: string | undefined;
    if (row.sourceTemplateExerciseId) {
      const te = teById.get(row.sourceTemplateExerciseId);
      demoId = te?.exerciseDemoId ?? demoIdByOurName.get(te?.name ?? "");
    }
    if (!demoId) demoId = demoIdByOurName.get(row.name);
    if (demoId) {
      await db.update(schema.exercises).set({ exerciseDemoId: demoId }).where(eq(schema.exercises.id, row.id));
      exUpdated++;
    } else {
      exSkipped++;
    }
  }
  console.log(`exercises updated: ${exUpdated}, skipped (no match): ${exSkipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const SAMPLE_DIR = join(process.cwd(), "Equipment Sample");

function imageDataUrl(filename: string): string {
  const buf = readFileSync(join(SAMPLE_DIR, filename));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const MUSCLE_GROUPS = [
  { name: "Chest", sortOrder: 1 },
  { name: "Back", sortOrder: 2 },
  { name: "Shoulders", sortOrder: 3 },
  { name: "Arms", sortOrder: 4 },
  { name: "Legs", sortOrder: 5 },
  { name: "Core", sortOrder: 6 },
  { name: "Cardio", sortOrder: 7 },
] as const;

const MOVEMENT_PATTERNS = [
  { key: "chest_press", label: "Chest Press", animationClipKey: "chest_press" },
  { key: "chest_fly", label: "Chest Fly", animationClipKey: "chest_fly" },
  { key: "shoulder_press", label: "Shoulder Press", animationClipKey: "shoulder_press" },
  { key: "lat_pulldown", label: "Lat Pulldown", animationClipKey: "lat_pulldown" },
  { key: "pull_up", label: "Pull-Up", animationClipKey: "pull_up" },
  { key: "cable_row", label: "Cable Row", animationClipKey: "cable_row" },
  { key: "bicep_curl", label: "Bicep Curl", animationClipKey: "bicep_curl" },
  { key: "tricep_dip", label: "Tricep Dip", animationClipKey: "tricep_dip" },
  { key: "leg_press", label: "Leg Press", animationClipKey: "leg_press" },
  { key: "leg_curl", label: "Leg Curl", animationClipKey: "leg_curl" },
  { key: "squat", label: "Squat", animationClipKey: "squat" },
  { key: "cardio_cycle", label: "Cycling", animationClipKey: "cardio_cycle" },
  { key: "cardio_run", label: "Running", animationClipKey: "cardio_run" },
  { key: "mobility_stretch", label: "Mobility & Stretch", animationClipKey: "mobility_stretch" },
] as const;

// filename -> [equipment name, muscle group name, movement pattern key]
const EQUIPMENT_TEMPLATES: [string, string, string, string][] = [
  ["WhatsApp Image 2026-08-11 at 2.29.17 AM.jpeg", "Pec Deck / Chest Fly Machine", "Chest", "chest_fly"],
  ["WhatsApp Image 2026-08-11 at 2.29.17 AM (1).jpeg", "Dumbbell Rack", "Arms", "bicep_curl"],
  ["WhatsApp Image 2026-08-11 at 2.29.17 AM (2).jpeg", "Exercise Bike", "Cardio", "cardio_cycle"],
  ["WhatsApp Image 2026-08-11 at 2.29.18 AM.jpeg", "Treadmill", "Cardio", "cardio_run"],
  ["WhatsApp Image 2026-08-11 at 2.29.18 AM (1).jpeg", "Preacher Curl Bench", "Arms", "bicep_curl"],
  ["WhatsApp Image 2026-08-11 at 2.29.18 AM (2).jpeg", "Smith Machine (Bench Press)", "Chest", "chest_press"],
  ["WhatsApp Image 2026-08-11 at 2.29.19 AM.jpeg", "Leg Curl Machine", "Legs", "leg_curl"],
  ["WhatsApp Image 2026-08-11 at 2.29.19 AM (1).jpeg", "Leg Press Machine", "Legs", "leg_press"],
  ["WhatsApp Image 2026-08-11 at 2.29.19 AM (2).jpeg", "Pull-Up Bar", "Back", "pull_up"],
  ["WhatsApp Image 2026-08-11 at 2.29.20 AM.jpeg", "Shoulder Press Machine", "Shoulders", "shoulder_press"],
  ["WhatsApp Image 2026-08-11 at 2.29.20 AM (1).jpeg", "Dip Station", "Arms", "tricep_dip"],
  ["WhatsApp Image 2026-08-11 at 2.29.20 AM (2).jpeg", "EZ Curl Bar", "Arms", "bicep_curl"],
  ["WhatsApp Image 2026-08-11 at 2.29.21 AM.jpeg", "Smart Workout Mirror", "Core", "mobility_stretch"],
  ["WhatsApp Image 2026-08-11 at 2.29.21 AM (1).jpeg", "Lat Pulldown Machine", "Back", "lat_pulldown"],
  ["WhatsApp Image 2026-08-11 at 2.29.21 AM (2).jpeg", "Functional Trainer (Dual Cable)", "Back", "cable_row"],
  ["WhatsApp Image 2026-08-11 at 2.29.21 AM (3).jpeg", "Adjustable Weight Bench", "Chest", "chest_press"],
  ["WhatsApp Image 2026-08-11 at 2.29.22 AM.jpeg", "Olympic Barbell", "Legs", "squat"],
  ["WhatsApp Image 2026-08-11 at 2.29.22 AM (1).jpeg", "Squat Rack (Power Rack)", "Legs", "squat"],
];

async function main() {
  console.log("Seeding muscle groups...");
  const muscleGroupRows = await db
    .insert(schema.muscleGroups)
    .values([...MUSCLE_GROUPS])
    .onConflictDoNothing({ target: schema.muscleGroups.name })
    .returning();
  const muscleGroupByName = new Map<string, string>();
  for (const row of muscleGroupRows) muscleGroupByName.set(row.name, row.id);
  // re-fetch in case some already existed (onConflictDoNothing skips returning them)
  const allMuscleGroups = await db.select().from(schema.muscleGroups);
  for (const row of allMuscleGroups) muscleGroupByName.set(row.name, row.id);

  console.log("Seeding movement patterns...");
  const patternRows = await db
    .insert(schema.movementPatterns)
    .values([...MOVEMENT_PATTERNS])
    .onConflictDoNothing({ target: schema.movementPatterns.key })
    .returning();
  const patternByKey = new Map<string, string>();
  for (const row of patternRows) patternByKey.set(row.key, row.id);
  const allPatterns = await db.select().from(schema.movementPatterns);
  for (const row of allPatterns) patternByKey.set(row.key, row.id);

  console.log("Seeding equipment templates from Equipment Sample/...");
  const existing = await db.select({ name: schema.equipmentTemplates.name }).from(schema.equipmentTemplates);
  const existingNames = new Set(existing.map((r) => r.name));

  for (const [filename, name, muscleGroupName, patternKey] of EQUIPMENT_TEMPLATES) {
    if (existingNames.has(name)) {
      console.log(`  skip (exists): ${name}`);
      continue;
    }
    const muscleGroupId = muscleGroupByName.get(muscleGroupName);
    const movementPatternId = patternByKey.get(patternKey);
    if (!muscleGroupId || !movementPatternId) {
      throw new Error(`Missing lookup for ${name}: ${muscleGroupName}/${patternKey}`);
    }
    await db.insert(schema.equipmentTemplates).values({
      name,
      imageData: imageDataUrl(filename),
      muscleGroupId,
      movementPatternId,
    });
    console.log(`  inserted: ${name}`);
  }

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

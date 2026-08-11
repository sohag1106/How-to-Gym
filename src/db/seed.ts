import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { defaultsForPattern } from "../lib/exercise-defaults";

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
  { key: "deadlift", label: "Deadlift", animationClipKey: "deadlift" },
  { key: "cardio_cycle", label: "Cycling", animationClipKey: "cardio_cycle" },
  { key: "cardio_run", label: "Running", animationClipKey: "cardio_run" },
  { key: "mobility_stretch", label: "Mobility & Stretch", animationClipKey: "mobility_stretch" },
] as const;

// filename -> [equipment name, primary muscle group, primary movement pattern]
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

// One piece of equipment usually supports many exercises, not just one.
// templateName -> [exercise name, muscle group, movement pattern][]
const TEMPLATE_EXERCISES: Record<string, [string, string, string][]> = {
  "Pec Deck / Chest Fly Machine": [
    ["Machine Chest Fly", "Chest", "chest_fly"],
    ["Reverse Fly (Rear Delts)", "Shoulders", "cable_row"],
  ],
  "Dumbbell Rack": [
    ["Dumbbell Bench Press", "Chest", "chest_press"],
    ["Dumbbell Shoulder Press", "Shoulders", "shoulder_press"],
    ["Dumbbell Row", "Back", "cable_row"],
    ["Dumbbell Bicep Curl", "Arms", "bicep_curl"],
    ["Dumbbell Romanian Deadlift", "Legs", "deadlift"],
    ["Goblet Squat", "Legs", "squat"],
    ["Dumbbell Lateral Raise", "Shoulders", "shoulder_press"],
    ["Dumbbell Tricep Extension", "Arms", "tricep_dip"],
  ],
  "Exercise Bike": [
    ["Steady-State Cycling", "Cardio", "cardio_cycle"],
    ["Cycling Intervals (HIIT)", "Cardio", "cardio_cycle"],
  ],
  Treadmill: [
    ["Steady-State Jog", "Cardio", "cardio_run"],
    ["Incline Walk", "Cardio", "cardio_run"],
    ["Sprint Intervals", "Cardio", "cardio_run"],
  ],
  "Preacher Curl Bench": [["Preacher Curl", "Arms", "bicep_curl"]],
  "Smith Machine (Bench Press)": [
    ["Smith Machine Bench Press", "Chest", "chest_press"],
    ["Smith Machine Squat", "Legs", "squat"],
    ["Smith Machine Shoulder Press", "Shoulders", "shoulder_press"],
    ["Smith Machine Bent-Over Row", "Back", "cable_row"],
  ],
  "Leg Curl Machine": [["Lying Leg Curl", "Legs", "leg_curl"]],
  "Leg Press Machine": [
    ["Leg Press", "Legs", "leg_press"],
    ["Calf Press (on Leg Press)", "Legs", "leg_press"],
  ],
  "Pull-Up Bar": [
    ["Pull-Up", "Back", "pull_up"],
    ["Chin-Up", "Arms", "pull_up"],
    ["Hanging Knee Raise", "Core", "pull_up"],
  ],
  "Shoulder Press Machine": [["Machine Shoulder Press", "Shoulders", "shoulder_press"]],
  "Dip Station": [
    ["Tricep Dip", "Arms", "tricep_dip"],
    ["Chest Dip", "Chest", "tricep_dip"],
    ["Captain's Chair Knee Raise", "Core", "tricep_dip"],
  ],
  "EZ Curl Bar": [
    ["EZ-Bar Bicep Curl", "Arms", "bicep_curl"],
    ["EZ-Bar Skull Crusher", "Arms", "tricep_dip"],
    ["EZ-Bar Upright Row", "Shoulders", "cable_row"],
  ],
  "Smart Workout Mirror": [
    ["Guided Mobility & Stretch", "Core", "mobility_stretch"],
    ["Guided Cardio Class", "Cardio", "cardio_run"],
  ],
  "Lat Pulldown Machine": [
    ["Wide-Grip Lat Pulldown", "Back", "lat_pulldown"],
    ["Close-Grip Lat Pulldown", "Back", "lat_pulldown"],
  ],
  "Functional Trainer (Dual Cable)": [
    ["Cable Row", "Back", "cable_row"],
    ["Cable Chest Fly", "Chest", "chest_fly"],
    ["Cable Tricep Pushdown", "Arms", "tricep_dip"],
    ["Cable Bicep Curl", "Arms", "bicep_curl"],
    ["Cable Lateral Raise", "Shoulders", "shoulder_press"],
    ["Cable Face Pull", "Shoulders", "cable_row"],
  ],
  "Adjustable Weight Bench": [
    ["Dumbbell Bench Press", "Chest", "chest_press"],
    ["Incline Dumbbell Press", "Chest", "chest_press"],
    ["Seated Dumbbell Shoulder Press", "Shoulders", "shoulder_press"],
    ["Bulgarian Split Squat", "Legs", "squat"],
  ],
  "Olympic Barbell": [
    ["Barbell Back Squat", "Legs", "squat"],
    ["Barbell Deadlift", "Legs", "deadlift"],
    ["Barbell Bench Press", "Chest", "chest_press"],
    ["Barbell Bent-Over Row", "Back", "cable_row"],
    ["Barbell Overhead Press", "Shoulders", "shoulder_press"],
    ["Barbell Bicep Curl", "Arms", "bicep_curl"],
  ],
  "Squat Rack (Power Rack)": [
    ["Barbell Back Squat", "Legs", "squat"],
    ["Barbell Front Squat", "Legs", "squat"],
    ["Rack Pull (Partial Deadlift)", "Legs", "deadlift"],
    ["Barbell Overhead Press", "Shoulders", "shoulder_press"],
  ],
};

async function main() {
  console.log("Seeding muscle groups...");
  await db
    .insert(schema.muscleGroups)
    .values([...MUSCLE_GROUPS])
    .onConflictDoNothing({ target: schema.muscleGroups.name });
  const allMuscleGroups = await db.select().from(schema.muscleGroups);
  const muscleGroupByName = new Map(allMuscleGroups.map((r) => [r.name, r.id]));

  console.log("Seeding movement patterns...");
  await db
    .insert(schema.movementPatterns)
    .values([...MOVEMENT_PATTERNS])
    .onConflictDoNothing({ target: schema.movementPatterns.key });
  const allPatterns = await db.select().from(schema.movementPatterns);
  const patternByKey = new Map(allPatterns.map((r) => [r.key, r.id]));

  console.log("Seeding equipment templates from Equipment Sample/...");
  const existingTemplates = await db.select().from(schema.equipmentTemplates);
  const templateByName = new Map(existingTemplates.map((r) => [r.name, r]));

  for (const [filename, name, muscleGroupName, patternKey] of EQUIPMENT_TEMPLATES) {
    if (templateByName.has(name)) {
      console.log(`  skip (exists): ${name}`);
      continue;
    }
    const muscleGroupId = muscleGroupByName.get(muscleGroupName);
    const movementPatternId = patternByKey.get(patternKey);
    if (!muscleGroupId || !movementPatternId) {
      throw new Error(`Missing lookup for ${name}: ${muscleGroupName}/${patternKey}`);
    }
    const [created] = await db
      .insert(schema.equipmentTemplates)
      .values({ name, imageData: imageDataUrl(filename), muscleGroupId, movementPatternId })
      .returning();
    templateByName.set(name, created);
    console.log(`  inserted: ${name}`);
  }

  console.log("Seeding possible exercises per equipment template...");
  for (const [templateName, exerciseList] of Object.entries(TEMPLATE_EXERCISES)) {
    const template = templateByName.get(templateName);
    if (!template) {
      console.warn(`  no template found for "${templateName}", skipping its exercises`);
      continue;
    }
    const existingExercises = await db
      .select({ name: schema.templateExercises.name })
      .from(schema.templateExercises)
      .where(eq(schema.templateExercises.equipmentTemplateId, template.id));
    const existingNames = new Set(existingExercises.map((e) => e.name));

    for (let i = 0; i < exerciseList.length; i++) {
      const [name, muscleGroupName, patternKey] = exerciseList[i];
      if (existingNames.has(name)) continue;

      const muscleGroupId = muscleGroupByName.get(muscleGroupName);
      const movementPatternId = patternByKey.get(patternKey);
      if (!muscleGroupId || !movementPatternId) {
        throw new Error(`Missing lookup for exercise "${name}": ${muscleGroupName}/${patternKey}`);
      }
      const d = defaultsForPattern(patternKey);
      await db.insert(schema.templateExercises).values({
        equipmentTemplateId: template.id,
        name,
        muscleGroupId,
        movementPatternId,
        defaultSets: d.sets,
        defaultReps: d.reps,
        defaultRestSeconds: d.restSeconds,
        difficulty: "beginner",
        instructions: d.instructions,
        sortOrder: i,
      });
    }
    console.log(`  ${templateName}: ${exerciseList.length} exercises`);
  }

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

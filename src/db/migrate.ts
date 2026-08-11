import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration complete.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});

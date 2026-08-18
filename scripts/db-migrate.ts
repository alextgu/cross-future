import { mkdir } from "node:fs/promises";
import { createDatabase } from "../db/client";
import { migrateDatabase } from "../db/migrate";

async function main() {
  await mkdir("data", { recursive: true });
  const { db, client } = createDatabase();

  try {
    await migrateDatabase(db);
    console.log("database migrations applied");
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

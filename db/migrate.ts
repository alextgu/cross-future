import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Database } from "./client";

export function migrateDatabase(db: Database) {
  return migrate(db, { migrationsFolder: path.resolve("drizzle") });
}

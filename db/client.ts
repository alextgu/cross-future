import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type Database = LibSQLDatabase<typeof schema>;

export function createDatabase(url = process.env.DATABASE_URL ?? "file:./data/cross-future.db") {
  const client = createClient({
    url: url === ":memory:" ? "file::memory:?cache=shared" : url,
  });
  const db = drizzle(client, { schema });
  return { client, db };
}

import { sql } from "drizzle-orm";
import { createDatabase } from "../db/client";
import {
  contactInquiries,
  editions,
  registrations,
  siteContent,
} from "../db/schema";

async function main() {
  const { db, client } = createDatabase();
  try {
    const count = async (
      table:
        | typeof editions
        | typeof siteContent
        | typeof registrations
        | typeof contactInquiries
    ) => {
      const [row] = await db.select({ value: sql<number>`count(*)` }).from(table);
      return Number(row.value);
    };
    console.log(
      JSON.stringify(
        {
          editions: await count(editions),
          siteContent: await count(siteContent),
          registrations: await count(registrations),
          contactInquiries: await count(contactInquiries),
        },
        null,
        2
      )
    );
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

import type { Database } from "../../db/client";
import { siteContent } from "../../db/schema";
import type { ContentRepository } from "./content-repository";

export function createSqliteContentRepository(db: Database): ContentRepository {
  return {
    async getSummitContent() {
      const [record] = await db.select().from(siteContent).limit(1);
      if (!record) {
        throw new Error(
          "No site content is available. Run `npm run db:setup` before using database content."
        );
      }
      if (!record.sourceDocument.editions.some((edition) => edition.isCurrent)) {
        throw new Error("Database content has no current edition.");
      }
      return record.sourceDocument;
    },
  };
}

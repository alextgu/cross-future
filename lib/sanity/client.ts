import "server-only";
import { createClient, type SanityClient } from "@sanity/client";

export function createSanityClient(options: { draft?: boolean } = {}): SanityClient {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  if (!projectId || !dataset) {
    throw new Error("SANITY_PROJECT_ID and SANITY_DATASET are required for Sanity content.");
  }

  const draft = options.draft === true;
  if (draft && !process.env.SANITY_API_READ_TOKEN) {
    throw new Error("SANITY_API_READ_TOKEN is required for draft previews.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    useCdn: draft ? false : process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_READ_TOKEN,
    perspective: draft ? "drafts" : "published",
    stega: false,
  });
}

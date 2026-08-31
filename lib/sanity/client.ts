import "server-only";
import { createClient, type SanityClient } from "@sanity/client";

export function createSanityClient(): SanityClient {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  if (!projectId || !dataset) {
    throw new Error("SANITY_PROJECT_ID and SANITY_DATASET are required for Sanity content.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    useCdn: process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_READ_TOKEN,
    perspective: "published",
    stega: false,
  });
}

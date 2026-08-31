import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET;

if (!projectId) {
  throw new Error("Missing SANITY_STUDIO_PROJECT_ID (or SANITY_PROJECT_ID) environment variable");
}

if (!dataset) {
  throw new Error("Missing SANITY_STUDIO_DATASET (or SANITY_DATASET) environment variable");
}

export default defineConfig({
  name: "cross-future-studio",
  title: "Cross Future Studio",
  projectId,
  dataset,
  apiVersion: "2026-08-31",
  basePath: "/",
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure })],
});

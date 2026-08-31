import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ??
  process.env.SANITY_PROJECT_ID ??
  "cross-future";

export default defineConfig({
  name: "cross-future-studio",
  title: "Cross Future Studio",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  apiVersion: "2026-08-31",
  basePath: "/",
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure })],
});

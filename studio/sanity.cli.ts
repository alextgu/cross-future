import { defineCliConfig } from "sanity/cli";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ??
  process.env.SANITY_PROJECT_ID ??
  "cross-future";

export default defineCliConfig({
  api: {
    projectId,
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
});

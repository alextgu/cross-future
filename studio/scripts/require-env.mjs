const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET;

const missing = [
  !projectId && "SANITY_STUDIO_PROJECT_ID (or SANITY_PROJECT_ID)",
  !dataset && "SANITY_STUDIO_DATASET (or SANITY_DATASET)",
].filter(Boolean);

if (missing.length > 0) {
  console.error(`Missing required Sanity environment variable(s): ${missing.join(", ")}`);
  process.exit(1);
}

import { spawnSync } from "node:child_process";
import { cp, copyFile, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });

const bundle = spawnSync(
  process.execPath,
  [
    "./node_modules/wrangler/bin/wrangler.js",
    "deploy",
    "--dry-run",
    "--outdir",
    "dist/server",
  ],
  { stdio: "inherit" }
);
if (bundle.status !== 0) {
  throw new Error("Wrangler could not bundle the OpenNext worker.");
}

await copyFile("dist/server/worker.js", "dist/server/index.js");
await rm("dist/server/worker.js");
await rm("dist/server/worker.js.map", { force: true });
await cp(".open-next/assets", "dist/client", { recursive: true });

console.log("staged Cloudflare worker for Sites");

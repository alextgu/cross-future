import { cp, copyFile, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp(".open-next", "dist/server", { recursive: true });
await copyFile("dist/server/worker.js", "dist/server/index.js");
await cp(".open-next/assets", "dist/client", { recursive: true });

console.log("staged Cloudflare worker for Sites");

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Only reason this file exists: components import through the `@/…` alias
 * that tsconfig defines, and the test runner needs the same mapping to render
 * them. No environment is set globally — each test file declares its own with
 * `// @vitest-environment jsdom`, so node-only tests stay fast.
 */
export default defineConfig({
  /* tsconfig says `jsx: preserve` because Next does the transform in the app
     build; the test runner has to be told to do it itself. */
  esbuild: { jsx: "automatic" },
  resolve: {
    /* The standalone Studio owns React 18 for its browser build while the
       Next.js app owns React 19. Component tests must use one test renderer. */
    dedupe: ["react", "react-dom"],
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});

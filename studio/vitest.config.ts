import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["schemaTypes/**/*.test.ts"],
  },
});

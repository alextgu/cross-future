import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

/* The register form went with the register route: the summit sells through
   EventGo and the chrome links straight out. Contact is the one form the site
   still owns, so it is the one that has to declare a real endpoint. */
it("active forms declare real submission endpoints", () => {
  const contact = readFileSync("components/assembly/AsmContact.tsx", "utf8");
  const form = readFileSync("components/assembly/AsmForm.tsx", "utf8");
  expect(contact).toContain('endpoint="/api/contact"');
  expect(form).toContain('"aria-required": Boolean(field.required)');
});

import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("active forms declare real submission endpoints", () => {
  const register = readFileSync("app/register/page.tsx", "utf8");
  const contact = readFileSync("components/assembly/AsmContact.tsx", "utf8");
  expect(register).toContain('endpoint="/api/registrations"');
  expect(contact).toContain('endpoint="/api/contact"');
});

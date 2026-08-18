import { expect, it } from "vitest";
import { POST as postContact } from "../app/api/contact/route";
import { POST as postRegistration } from "../app/api/registrations/route";

it("returns field errors for malformed registration JSON", async () => {
  const response = await postRegistration(
    new Request("http://localhost/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "bad" }),
    })
  );
  const body = await response.json();
  expect(response.status).toBe(400);
  expect(body.ok).toBe(false);
  expect(body.fieldErrors.email).toBeDefined();
});

it("rejects unexpected contact fields without echoing submitted data", async () => {
  const response = await postContact(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        edition: "2026-assembly",
        firstName: "A",
        lastName: "B",
        email: "a@example.com",
        inquiry: "General information",
        message: "Hello",
        unexpected: "private",
      }),
    })
  );
  const text = await response.text();
  expect(response.status).toBe(400);
  expect(text).not.toContain("private");
});

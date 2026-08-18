import { expect, it } from "vitest";
import * as schema from "../db/schema";

it("exports the complete mock-backend schema", () => {
  expect(Object.keys(schema).sort()).toEqual([
    "appearances",
    "contactInquiries",
    "documents",
    "editions",
    "interviews",
    "organizations",
    "partners",
    "people",
    "registrations",
    "sessions",
    "siteContent",
    "tracks",
  ]);
});

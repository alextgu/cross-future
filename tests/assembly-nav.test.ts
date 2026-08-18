import { describe, expect, it } from "vitest";
import {
  ASSEMBLY_BASE,
  ASSEMBLY_HOME,
  ASSEMBLY_REGISTER,
  ASSEMBLY_ROUTES,
  isCurrentRoute,
} from "../lib/assembly-nav";

describe("canonical navigation", () => {
  it("keeps every public destination at the site root", () => {
    expect(ASSEMBLY_BASE).toBe("");
    expect(ASSEMBLY_HOME).toBe("/");
    expect(ASSEMBLY_REGISTER).toBe("/register");
    expect(ASSEMBLY_ROUTES.map((route) => route.href)).toEqual([
      "/",
      "/about",
      "/speakers",
      "/agenda",
      "/media",
      "/partners",
      "/contact",
    ]);
  });

  it("matches home exactly and inner routes by prefix", () => {
    expect(isCurrentRoute("/", "/")).toBe(true);
    expect(isCurrentRoute("/", "/agenda")).toBe(false);
    expect(isCurrentRoute("/speakers", "/speakers/person")).toBe(true);
  });
});

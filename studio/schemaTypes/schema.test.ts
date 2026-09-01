import { describe, expect, it } from "vitest";
import {
  documentTypeNames,
  getSchemaType,
  singletonDocumentIds,
} from "./index";

describe("studio schema", () => {
  it("exports the approved document types", () => {
    expect(documentTypeNames).toEqual([
      "edition",
      "person",
      "organization",
      "appearance",
      "track",
      "session",
      "partner",
      "summitDocument",
      "interview",
      "pastEdition",
      "siteSettings",
      "homePage",
    ]);
  });

  it("defines the cloudflareVideo object with the approved fields", () => {
    const cloudflareVideo = getSchemaType("cloudflareVideo");
    expect(cloudflareVideo?.type).toBe("object");
    expect(cloudflareVideo?.components?.input).toBeTypeOf("function");
    expect(cloudflareVideo?.fields?.map((field) => field.name)).toEqual([
      "streamUid",
      "status",
      "posterUrl",
      "durationSeconds",
      "alt",
      "caption",
      "credit",
      "aspect",
    ]);
  });

  it("models ordinary relationships with references", () => {
    const appearance = getSchemaType("appearance");
    const person = appearance?.fields?.find((field) => field.name === "person");
    const edition = appearance?.fields?.find((field) => field.name === "edition");
    const organizations = appearance?.fields?.find(
      (field) => field.name === "organizations"
    );

    expect(person?.type).toBe("reference");
    expect(edition?.type).toBe("reference");
    expect(organizations?.type).toBe("array");
  });

  it("keeps singleton IDs fixed for editor-owned pages", () => {
    expect(singletonDocumentIds).toEqual({
      siteSettings: "siteSettings",
      homePage: "homePage",
    });
  });

  it("keeps slug, status, and stream UID validation attached", () => {
    const edition = getSchemaType("edition");
    const interview = getSchemaType("interview");
    const video = getSchemaType("cloudflareVideo");

    expect(edition?.fields?.find((field) => field.name === "slug")?.validation).toBeTypeOf("function");
    expect((edition?.fields?.find((field) => field.name === "status")?.options as { list?: unknown[] } | undefined)?.list).toBeTruthy();
    expect(interview?.fields?.find((field) => field.name === "slug")?.validation).toBeTypeOf("function");
    expect(video?.fields?.find((field) => field.name === "streamUid")?.validation).toBeTypeOf("function");
  });

  it("leaves migration keys optional for editor-created documents", () => {
    for (const typeName of documentTypeNames) {
      const migrationKey = getSchemaType(typeName)?.fields?.find(
        (field) => field.name === "migrationKey"
      );

      expect(migrationKey?.validation, typeName).toBeUndefined();
      expect(migrationKey?.hidden, typeName).toBe(true);
      expect(migrationKey?.readOnly, typeName).toBe(true);
    }
  });

  it("allows the source partner categories and optional organization and partner URLs", () => {
    const partner = getSchemaType("partner");
    const organization = getSchemaType("organization");
    const partnerOptions = partner?.fields?.find((field) => field.name === "type")?.options as { list?: { value: string }[] } | undefined;
    const partnerValues = partnerOptions?.list?.map((item) => item.value);

    expect(partnerValues).toEqual(["community", "energy", "infrastructure", "academic", "ecosystem", "industry"]);
    expect(partner?.fields?.find((field) => field.name === "url")?.validation).toBeUndefined();
    expect(organization?.fields?.find((field) => field.name === "url")?.validation).toBeUndefined();
  });
});

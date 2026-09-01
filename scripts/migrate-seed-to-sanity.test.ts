import { describe, expect, it, vi } from "vitest";
import {
  migrateSeedContent,
  normalizeSeedContent,
  parseMigrationArgs,
  type MigrationClient,
  type SeedSources,
} from "./migrate-seed-to-sanity";

const sources: SeedSources = {
  default: {
    editions: [{ slug: "2026", year: 2026, name: "Default", tagline: "Default", thesis: "Default", theme: "Default", startsAt: "2026-01-01T00:00:00Z", endsAt: "2026-01-02T00:00:00Z", timezone: "UTC", venue: { name: "Venue", city: "City", region: "Region", country: "Country" }, registrationUrl: "https://example.test/default", status: "announced", isCurrent: true, seo: { title: "Default", description: "Default" } }],
    people: [{ firstName: "Ada", lastName: "Default", slug: "ada", headshot: { sourceUrl: "/ada-default.jpg", alt: "Ada" }, links: [], verified: false, bio: "Default bio" }],
    organizations: [{ name: "Org", shortName: "Org", slug: "org", type: "community", url: "https://example.test/org", country: "CA" }],
    appearances: [], tracks: [], sessions: [], partners: [], documents: [], interviews: [],
  },
  nexus: {
    editions: [],
    people: [{ firstName: "Ada", lastName: "Nexus", slug: "ada", headshot: { sourceUrl: "/ada-nexus.jpg", alt: "Ada" }, links: [], verified: false, bio: "Nexus bio" }],
    organizations: [], appearances: [],
    tracks: [{ code: "T1", name: "Nexus track", description: "Nexus", chainStage: "network" }],
    sessions: [{ code: "S.01", title: "Opening", edition: "2026", track: "T1", startsAt: "2026-01-01T00:00:00Z", endsAt: "2026-01-01T01:00:00Z", room: null, speakers: ["ada"], status: "confirmed" }],
    partners: [], documents: [],
    interviews: [{ code: "I.01", title: "Ada interview", person: "ada", durationMin: 10, featured: false }],
  },
  assembly: {
    editions: [],
    people: [{ firstName: "Ada", lastName: "Assembly", slug: "ada", headshot: { sourceUrl: "/ada-assembly.jpg", alt: "Ada" }, links: [], verified: true, bio: "Assembly bio" }],
    organizations: [], appearances: [], tracks: [], sessions: [],
    partners: [], documents: [], interviews: [],
  },
};

function client(): any {
  const ids = new Map<string, string>();
  const calls: string[] = [];
  const writes: Record<string, unknown>[] = [];
  return {
    calls, writes,
    fetch: vi.fn(async (_query: string, params?: Record<string, string>) => ids.get(`${params?.type}:${params?.migrationKey}`) ? { _id: ids.get(`${params?.type}:${params?.migrationKey}`) } : null),
    assets: { upload: vi.fn(async (_kind: string, _source: Buffer, options?: { filename?: string }) => ({ _id: `asset-${options?.filename}` })) },
    create: vi.fn(async (document: Record<string, unknown>) => { const id = `document-${ids.size + 1}`; ids.set(`${document._type}:${document.migrationKey}`, id); calls.push(`create:${document._type}`); writes.push(document); return { _id: id }; }),
    patch: vi.fn((id: string) => ({
      set: (document: Record<string, unknown>) => ({
        commit: async () => {
          calls.push(`patch:${id}`);
          writes.push(document);
          return { _id: id };
        },
      }),
    })),
  };
}

describe("seed to Sanity migration", () => {
  it("accepts --dry-run without treating it as an --only value", () => {
    expect(parseMigrationArgs(["--dry-run"])).toEqual({ dryRun: true });
    expect(parseMigrationArgs(["--only", "person"])).toEqual({ dryRun: false, only: "person" });
  });

  it("merges seed identities with assembly's non-empty fields and derives stable slugs", () => {
    const normalized = normalizeSeedContent(sources);
    const person = normalized.documents.find((document) => document.migrationKey === "person:ada");
    const session = normalized.documents.find((document) => document.migrationKey === "session:s-01");
    const interview = normalized.documents.find((document) => document.migrationKey === "interview:ada-i-01");

    expect(person?.payload).toMatchObject({ lastName: "Assembly", bio: "Assembly bio", verified: true, slug: { current: "ada" } });
    expect(session?.payload.slug).toEqual({ _type: "slug", current: "s-01-opening" });
    expect(interview?.payload.slug).toEqual({ _type: "slug", current: "ada-i-01" });
    expect(normalized.validationErrors).toEqual([]);
  });

  it("keeps sessions whose code normalizations collide with source-derived suffixes", () => {
    const colliding = structuredClone(sources);
    colliding.default.tracks = [{ code: "T1", name: "Track", description: "Track", chainStage: "network" }];
    colliding.default.sessions = [
      { code: "S.01", title: "Opening", edition: "2026", track: "T1", startsAt: "2026-01-01T00:00:00Z", endsAt: "2026-01-01T01:00:00Z", room: null, speakers: ["ada"], status: "confirmed" },
      { code: "S 01", title: "Opening", edition: "2026", track: "T1", startsAt: "2026-01-01T01:00:00Z", endsAt: "2026-01-01T02:00:00Z", room: null, speakers: ["ada"], status: "confirmed" },
    ];

    const sessions = normalizeSeedContent(colliding).documents.filter((document) => document.type === "session");
    expect(sessions.map((document) => document.migrationKey)).toEqual(["session:s-01", "session:s-01-default-2"]);
    expect(sessions.map((document) => document.payload.slug)).toEqual([
      { _type: "slug", current: "s-01-opening" },
      { _type: "slug", current: "s-01-opening-default-2" },
    ]);
  });

  it("reports dry-run counts without reading images or mutating Sanity", async () => {
    const fake = client();
    const readImage = vi.fn();
    const result = await migrateSeedContent({ sources, client: fake, dryRun: true, readImage });

    expect(result.counts).toEqual({ edition: 1, person: 1, organization: 1, track: 1, session: 1, interview: 1 });
    expect(result.imageCount).toBe(1);
    expect(readImage).not.toHaveBeenCalled();
    expect(fake.assets.upload).not.toHaveBeenCalled();
    expect(fake.create).not.toHaveBeenCalled();
    expect(fake.patch).not.toHaveBeenCalled();
  });

  it("scopes --only validation errors to the selected document type", async () => {
    const scoped = structuredClone(sources);
    scoped.assembly.partners = [{ name: "Invalid partner", slug: "invalid-partner", type: "community", logo: { sourceUrl: "/invalid.svg", alt: "" } }];

    const result = await migrateSeedContent({ sources: scoped, dryRun: true, only: "session" });
    expect(result.validationErrors).toEqual([]);
    expect(result.counts).toEqual({ session: 1 });
  });

  it("uploads images before upserting documents and resolves references from returned IDs", async () => {
    const fake = client();
    await migrateSeedContent({ sources, client: fake, readImage: async () => Buffer.from("image") });

    expect(fake.assets.upload.mock.invocationCallOrder[0]).toBeLessThan(fake.create.mock.invocationCallOrder[0]);
    const session = fake.writes.find((document: Record<string, unknown>) => document._type === "session");
    const interview = fake.writes.find((document: Record<string, unknown>) => document._type === "interview");
    const person = fake.writes.find((document: Record<string, unknown>) => document._type === "person");
    expect(person).toMatchObject({ headshot: { image: { asset: { _ref: "asset-ada-assembly.jpg" } } } });
    expect(session).toMatchObject({ edition: { _ref: "document-1" }, track: { _ref: "document-4" }, speakers: [{ _ref: "document-2" }] });
    expect(interview).toMatchObject({ person: { _ref: "document-2" } });
    expect(JSON.stringify(fake.writes)).not.toContain('"_id"');
  });

  it("patches an existing migration key instead of creating a duplicate", async () => {
    const fake = client();
    await migrateSeedContent({ sources, client: fake, readImage: async () => Buffer.from("image") });
    const creates = fake.create.mock.calls.length;
    await migrateSeedContent({ sources, client: fake, readImage: async () => Buffer.from("image") });

    expect(fake.create).toHaveBeenCalledTimes(creates);
    expect(fake.patch).toHaveBeenCalledTimes(6);
  });

  it("looks up real dependency IDs when an --only migration omits their source documents", async () => {
    const fake = client();
    fake.fetch.mockImplementation(async (_query: string, params?: Record<string, string>) => {
      const dependencies: Record<string, string> = {
        "edition:2026": "existing-edition",
        "track:t1": "existing-track",
        "person:ada": "existing-person",
      };
      return dependencies[params?.migrationKey ?? ""]
        ? { _id: dependencies[params?.migrationKey ?? ""] }
        : null;
    });

    await migrateSeedContent({ sources, client: fake, only: "session", readImage: async () => Buffer.from("image") });
    expect(fake.create).toHaveBeenCalledWith(expect.objectContaining({
      edition: expect.objectContaining({ _ref: "existing-edition" }),
      track: expect.objectContaining({ _ref: "existing-track" }),
      speakers: [expect.objectContaining({ _ref: "existing-person" })],
    }));
  });
});

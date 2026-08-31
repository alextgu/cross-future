import { beforeEach, describe, expect, it, vi } from "vitest";
import { sanityContentFixture } from "./fixtures/sanity-content";
import {
  createSanityContentRepository,
  type SanityClientLike,
  type SanityContentDocument,
} from "../lib/repositories/sanity-content-repository";
import { summitContentSchema } from "../lib/content-schema";
import { SANITY_CONTENT_QUERY, SANITY_FETCH_OPTIONS, getSanityContentTags } from "../lib/sanity/queries";
import type { SummitContent } from "../lib/content";

const fetcher = (value: unknown): SanityClientLike => {
  const fetch = vi.fn(async <T>(_query: string, _params?: Record<string, unknown>, _options?: Record<string, unknown>) => structuredClone(value) as T);
  return { fetch: fetch as unknown as SanityClientLike["fetch"] };
};

describe("Sanity content repository", () => {
  beforeEach(() => {
    vi.stubEnv("SANITY_PROJECT_ID", "project");
    vi.stubEnv("SANITY_DATASET", "production");
  });

  it("resolves references and maps a Stream video to MediaAsset", async () => {
    const repository = createSanityContentRepository(fetcher(sanityContentFixture));
    const content = await repository.getSummitContent();

    expect(content.appearances[0].person).toBe("ada-lovelace");
    expect(content.appearances[0].organizations).toEqual(["cross-future-hub"]);
    expect(content.interviews?.[0].person).toBe("ada-lovelace");
    expect(content.interviews?.[0].video?.kind).toBe("video");
    expect(content.interviews?.[0].video?.src).toBe(
      "https://videodelivery.net/streamAda123/manifest/video.m3u8"
    );
    expect(content.interviews?.[0].video?.poster).toBe(
      "https://videodelivery.net/streamAda123/thumbnails/thumbnail.jpg"
    );
    expect(content.assembly?.heroMedia.kind).toBe("video");
    expect(content.interviews?.[0].image).toBeUndefined();
    expect(content.assembly?.heroMedia.src).toContain("/summit/video/");
  });

  it("fetches with the published, non-Stega content cache options", async () => {
    const client = fetcher(sanityContentFixture);
    await createSanityContentRepository(client).getSummitContent();

    expect(client.fetch).toHaveBeenCalledWith(
      SANITY_CONTENT_QUERY,
      {},
      SANITY_FETCH_OPTIONS
    );
    expect(getSanityContentTags(["edition-assembly"]))
      .toEqual(["sanity:content", "sanity:document:edition-assembly"]);
  });

  it("preserves the source ordering of collections", async () => {
    const fixture = structuredClone(sanityContentFixture);
    (fixture.editions as unknown as Record<string, unknown>[]).push({ ...fixture.editions[0], _id: "edition-past", slug: "2025-summit", year: 2025, isCurrent: false });
    const content = await createSanityContentRepository(fetcher(fixture)).getSummitContent();
    expect(content.editions.map(({ slug }) => slug)).toEqual(["2026-assembly", "2025-summit"]);
  });

  it("drops unknown related references without inventing records", async () => {
    const fixture = structuredClone(sanityContentFixture) as unknown as SanityContentDocument;
    fixture.appearances!.push({ ...fixture.appearances![0], _id: "appearance-unknown", person: "missing-person" });
    const content = await createSanityContentRepository(fetcher(fixture)).getSummitContent();
    expect(content.appearances).toHaveLength(1);
  });

  it("rejects invalid mapped content at the Zod boundary", async () => {
    const fixture = structuredClone(sanityContentFixture);
    (fixture.editions[0] as unknown as Record<string, unknown>).year = "not-a-year";
    await expect(createSanityContentRepository(fetcher(fixture)).getSummitContent()).rejects.toThrow(/invalid/i);
    expect(summitContentSchema.safeParse(fixture).success).toBe(false);
  });

  it("selects the Sanity repository only for the assembly variant", async () => {
    vi.resetModules();
    const sanityContent = {
      editions: [],
      organizations: [],
      people: [],
      appearances: [],
      tracks: [],
      sessions: [],
      partners: [],
      documents: [],
    } as SummitContent;
    const getContent = vi.fn(async () => sanityContent);
    const createRepository = vi.fn(() => ({ getSummitContent: getContent }));
    const createClient = vi.fn(() => ({ fetch: vi.fn() }));
    vi.doMock("@/lib/sanity/client", () => ({ createSanityClient: createClient }));
    vi.doMock("@/lib/repositories/sanity-content-repository", () => ({
      createSanityContentRepository: createRepository,
    }));
    vi.stubEnv("CONTENT_SOURCE", "sanity");

    const { getSummitContent } = await import("../lib/content");
    const result = await getSummitContent("assembly");
    expect(result).toBe(sanityContent);
    expect(createClient).toHaveBeenCalledOnce();
    expect(createRepository).toHaveBeenCalledWith(expect.anything());
    expect(getContent).toHaveBeenCalledOnce();

    const seed = await getSummitContent("default");
    expect(seed.editions.length).toBeGreaterThan(0);
    expect(getContent).toHaveBeenCalledOnce();
  });
});

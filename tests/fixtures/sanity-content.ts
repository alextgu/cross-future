import seedAssembly from "../../content/seed-assembly.json";

/** A small, already-projected Content Lake response used by repository tests. */
export const sanityContentFixture = {
  editions: [
    {
      _id: "edition-assembly",
      migrationKey: "edition:2026-assembly",
      slug: "2026-assembly",
      year: 2026,
      name: "Assembly 2026",
      tagline: "A working summit",
      thesis: "Build together.",
      theme: "Assembly",
      startsAt: "2026-10-01T09:00:00.000Z",
      endsAt: "2026-10-01T17:00:00.000Z",
      timezone: "America/Toronto",
      venue: { name: "The Hall", city: "Toronto", region: "ON", country: "Canada" },
      registrationUrl: "https://example.test/register",
      status: "registration-open",
      isCurrent: true,
      seo: { title: "Assembly 2026", description: "A working summit" },
    },
  ],
  organizations: [
    {
      _id: "organization-hub",
      migrationKey: "organization:cross-future-hub",
      name: "Cross Future Hub",
      shortName: "Hub",
      slug: "cross-future-hub",
      type: "community",
      url: "https://example.test/hub",
      country: "Canada",
    },
  ],
  people: [
    {
      _id: "person-ada",
      migrationKey: "person:ada-lovelace",
      firstName: "Ada",
      lastName: "Lovelace",
      slug: "ada-lovelace",
      headshot: {
        src: "https://cdn.example.test/ada.jpg",
        alt: "Ada Lovelace",
        focalPoint: { x: 50, y: 45 },
      },
      links: [{ type: "website", url: "https://example.test/ada" }],
      verified: true,
      bio: "A speaker.",
    },
  ],
  appearances: [
    {
      _id: "appearance-ada",
      migrationKey: "appearance:ada-2026",
      person: "ada-lovelace",
      edition: "2026-assembly",
      organizations: ["cross-future-hub", "unknown-organization"],
      roleTitle: "Researcher",
      category: "research",
      billing: 1,
      featured: true,
    },
  ],
  tracks: [],
  sessions: [],
  partners: [
    {
      _id: "partner-hub",
      migrationKey: "partner:hub",
      name: "Hub",
      slug: "hub",
      logo: { src: "https://cdn.example.test/hub.svg", alt: "Hub" },
      url: "https://example.test/hub",
      type: "community",
    },
  ],
  documents: [],
  interviews: [
    {
      _id: "interview-ada",
      migrationKey: "interview:ada",
      code: "INT-01",
      slug: "ada-lovelace",
      title: "A conversation with Ada",
      person: "ada-lovelace",
      durationMin: 12,
      featured: true,
      video: {
        streamUid: "streamAda123",
        status: "ready",
        posterUrl: "https://videodelivery.net/streamAda123/thumbnails/thumbnail.jpg",
        durationSeconds: 720,
        alt: "Ada in conversation",
        caption: "Interview",
        credit: "Cross Future",
        aspect: "16 / 9",
      },
    },
  ],
  assembly: structuredClone(seedAssembly.assembly),
} as const;

export type SanityContentFixture = typeof sanityContentFixture;

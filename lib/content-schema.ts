import { z } from "zod";

const venueSchema = z
  .object({
    name: z.string(),
    city: z.string(),
    region: z.string(),
    country: z.string(),
  })
  .strict();

const mediaAssetSchema = z
  .object({
    kind: z.enum(["image", "video"]),
    src: z.string(),
    poster: z.string().optional(),
    alt: z.string(),
    aspect: z.string().optional(),
    focalPoint: z
      .object({ x: z.number(), y: z.number() })
      .strict()
      .optional(),
    caption: z.string().optional(),
    credit: z.string().optional(),
    placeholder: z.boolean().optional(),
  })
  .strict();

const statItemSchema = z
  .object({ value: z.string(), label: z.string() })
  .strict();
const featureGlyphSchema = z.enum([
  "chip",
  "grid",
  "bolt",
  "node",
  "wave",
  "cross",
]);

const assemblyPageIntroSchema = z
  .object({
    eyebrow: z.string(),
    title: z.string(),
    lede: z.string(),
    media: mediaAssetSchema.optional(),
  })
  .strict();

export const assemblyContentSchema = z
  .object({
    heroMedia: mediaAssetSchema,
    heroKicker: z.string(),
    heroLines: z.array(z.string()).min(1),
    facts: z.array(
      z.object({ label: z.string(), lines: z.array(z.string()) }).strict()
    ),
    marquee: z.array(z.string()),
    rail: z
      .object({
        feature: z
          .object({
            title: z.string(),
            ctaLabel: z.string(),
            ctaHref: z.string(),
            media: mediaAssetSchema,
          })
          .strict(),
        ticket: z
          .object({
            title: z.string(),
            text: z.string(),
            ctaLabel: z.string(),
            ctaHref: z.string(),
            media: mediaAssetSchema,
            stub: z.array(
              z.object({ label: z.string(), value: z.string() }).strict()
            ),
          })
          .strict(),
      })
      .strict(),
    story: z.array(
      z
        .object({
          num: z.string(),
          title: z.string(),
          text: z.string(),
          glyph: featureGlyphSchema,
          media: mediaAssetSchema,
        })
        .strict()
    ),
    focusAreas: z.array(
      z
        .object({
          code: z.string(),
          title: z.string(),
          text: z.string(),
          media: mediaAssetSchema.optional(),
        })
        .strict()
    ),
    focusMedia: mediaAssetSchema.optional(),
    features: z.array(
      z
        .object({
          glyph: featureGlyphSchema,
          title: z.string(),
          text: z.string(),
        })
        .strict()
    ),
    stats: z.array(statItemSchema),
    voices: z.array(
      z
        .object({
          quote: z.string(),
          name: z.string(),
          role: z.string(),
          person: z.string().optional(),
          media: mediaAssetSchema.optional(),
        })
        .strict()
    ),
    faq: z.array(
      z.object({ question: z.string(), answer: z.string() }).strict()
    ),
    journal: z.array(
      z
        .object({
          slug: z.string(),
          /* Both optional: a briefing drawn from the summit's own material is
             not a dated, published article, and the card must not imply one. */
          date: z.string().optional(),
          title: z.string(),
          excerpt: z.string(),
          readMin: z.number().optional(),
          media: mediaAssetSchema,
        })
        .strict()
    ),
    pastEditions: z.array(
      z
        .object({
          label: z.string(),
          year: z.number(),
          city: z.string(),
          headline: z.string(),
          stats: z.array(statItemSchema),
          highlights: z.array(z.string()),
          media: mediaAssetSchema,
        })
        .strict()
    ),
    letters: z.array(
      z
        .object({
          title: z.string(),
          issuer: z.string(),
          date: z.string(),
          excerpt: z.string(),
          crest: mediaAssetSchema.optional(),
          document: mediaAssetSchema,
        })
        .strict()
    ),
    gallery: z.array(mediaAssetSchema),
    registerBenefits: z.array(z.string()),
    contact: z
      .object({
        email: z.string().email(),
        note: z.string(),
        inquiryTypes: z.array(z.string()),
        social: z.array(
          z.object({ label: z.string(), url: z.string() }).strict()
        ),
      })
      .strict(),
    footerBand: mediaAssetSchema,
    pageIntros: z.record(z.string(), assemblyPageIntroSchema),
  })
  .strict();

const editionSchema = z
  .object({
    slug: z.string(),
    year: z.number(),
    name: z.string(),
    tagline: z.string(),
    thesis: z.string(),
    theme: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    timezone: z.string(),
    venue: venueSchema,
    registrationUrl: z.string(),
    status: z.enum([
      "draft",
      "announced",
      "registration-open",
      "registration-closed",
      "archived",
    ]),
    isCurrent: z.boolean(),
    seo: z.object({ title: z.string(), description: z.string() }).strict(),
    editionNumber: z.number().optional(),
    format: z.string().optional(),
    coordinates: z
      .object({ lat: z.number(), lng: z.number() })
      .strict()
      .optional(),
    contactEmail: z.string().optional(),
    socialLinks: z
      .array(z.object({ label: z.string(), url: z.string() }).strict())
      .optional(),
    heroFigure: z
      .object({
        imageUrl: z.string(),
        alt: z.string(),
        label: z.string(),
      })
      .strict()
      .optional(),
    heroStatement: z.string().optional(),
  })
  .strict();

const organizationSchema = z
  .object({
    name: z.string(),
    shortName: z.string(),
    slug: z.string(),
    type: z.string(),
    url: z.string(),
    country: z.string(),
  })
  .strict();

const personSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    slug: z.string(),
    headshot: z
      .object({
        sourceUrl: z.string(),
        alt: z.string(),
        focalPoint: z.object({ x: z.number(), y: z.number() }).strict(),
        /* True while the file is a stand-in. The card draws the placeholder
           frame from this, so a real photograph landing in the seed is the
           only change needed to retire the marker. */
        placeholder: z.boolean().optional(),
      })
      .strict(),
    links: z.array(z.object({ type: z.string(), url: z.string() }).strict()),
    verified: z.boolean(),
    bio: z.string(),
  })
  .strict();

const appearanceSchema = z
  .object({
    person: z.string(),
    edition: z.string(),
    organizations: z.array(z.string()),
    roleTitle: z.string(),
    category: z.enum(["research", "industry", "ecosystem"]),
    billing: z.number(),
    featured: z.boolean(),
    thesis: z.string().optional(),
  })
  .strict();

const trackSchema = z
  .object({
    code: z.string(),
    name: z.string(),
    description: z.string(),
    chainStage: z.enum(["grid-interface", "network", "facility", "scale"]),
  })
  .strict();

const sessionSchema = z
  .object({
    title: z.string(),
    edition: z.string(),
    track: z.string(),
    startsAt: z.string(),
    endsAt: z.string(),
    room: z.string().nullable(),
    speakers: z.array(z.string()),
    status: z.enum(["proposed", "confirmed", "cancelled"]),
    code: z.string().optional(),
    categoryLabel: z.string().optional(),
    speakerLabel: z.string().optional(),
    description: z.string().optional(),
    outcomes: z.array(z.string()).optional(),
  })
  .strict();

const partnerSchema = z
  .object({
    name: z.string().nullable(),
    slug: z.string(),
    logo: z.object({ sourceUrl: z.string(), alt: z.string() }).strict(),
    url: z.string(),
    type: z.string(),
  })
  .strict();

const documentSchema = z
  .object({
    title: z.string(),
    type: z.string(),
    image: z.object({ sourceUrl: z.string(), alt: z.string() }).strict(),
    issuer: z.string(),
  })
  .strict();

const interviewSchema = z
  .object({
    code: z.string(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string(),
    person: z.string(),
    durationMin: z.number(),
    featured: z.boolean(),
    editionYear: z.number().int().optional(),
    topics: z.array(z.string()).optional(),
    pullQuote: z.string().optional(),
    image: z
      .object({
        sourceUrl: z.string(),
        alt: z.string(),
        placeholder: z.boolean().optional(),
      })
      .strict()
      .optional(),
    video: mediaAssetSchema.optional(),
    url: z.string().optional(),
  })
  .strict();

export const summitContentSchema = z
  .object({
    editions: z.array(editionSchema),
    organizations: z.array(organizationSchema),
    people: z.array(personSchema),
    appearances: z.array(appearanceSchema),
    tracks: z.array(trackSchema),
    sessions: z.array(sessionSchema),
    partners: z.array(partnerSchema),
    documents: z.array(documentSchema),
    manifesto: z
      .object({
        sectionLabel: z.string(),
        sublabel: z.string(),
        thesisPrefix: z.string(),
        thesisAccent: z.string(),
        thesisSuffix: z.string(),
        paragraphs: z.array(z.string()),
        pillars: z.array(
          z
            .object({ num: z.string(), title: z.string(), text: z.string() })
            .strict()
        ),
      })
      .strict()
      .optional(),
    interviews: z.array(interviewSchema).optional(),
    registerBenefits: z.array(z.string()).optional(),
    archives: z
      .array(
        z
          .object({
            edition: z.string(),
            caption: z.string(),
            image: z.object({ sourceUrl: z.string(), alt: z.string() }).strict(),
          })
          .strict()
      )
      .optional(),
    footerImage: z
      .object({ sourceUrl: z.string(), alt: z.string() })
      .strict()
      .optional(),
    assembly: assemblyContentSchema.optional(),
  })
  .strict()
  .superRefine((content, context) => {
    const firstIndexBySlug = new Map<string, number>();
    for (const [index, interview] of (content.interviews ?? []).entries()) {
      if (firstIndexBySlug.has(interview.slug)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate interview slug "${interview.slug}"`,
          path: ["interviews", index, "slug"],
        });
      } else {
        firstIndexBySlug.set(interview.slug, index);
      }
    }
  });

export type ValidatedAssemblyContent = z.infer<typeof assemblyContentSchema>;
export type ValidatedSummitContent = z.infer<typeof summitContentSchema>;

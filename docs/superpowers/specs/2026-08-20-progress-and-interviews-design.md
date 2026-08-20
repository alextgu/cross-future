# Cross Future Progress and Interview Architecture

Date: 2026-08-20  
Status: Approved direction; awaiting written-spec review

## 1. Objective

Make the CEO mockup communicate Cross Future's momentum across festivals while
giving recorded interviews a durable home that can scale independently. The
current navigation must remain structurally unchanged: the same labels, order,
anchors, Past Events link, and Register action stay in place.

This work is a presentation-quality mockup. Missing photography and incomplete
historical facts remain explicit placeholders; the implementation must not
invent dates, outcomes, interview-to-edition relationships, or other facts that
are not present in the source content.

## 2. Approved Information Architecture

The current navbar remains:

1. About
2. Speakers
3. Program
4. Supporters
5. Contact
6. Past Events
7. Register

No new primary navigation item is added and no existing item is renamed.

The homepage gains an unnumbered progress chapter after Program and before
Supporters. It is discoverable during normal scrolling and through contextual
links, but it does not alter the five-anchor table of contents.

The content surfaces have distinct responsibilities:

- `/` remains a curated overview of the current festival.
- `/past-events` becomes the progress-and-editions destination and contains
  completed festivals only.
- `/interviews` becomes the complete recorded-interview library.
- `/interviews/[slug]` becomes the permanent page for one interview.
- A past-festival presentation may surface interviews related to that edition,
  but it reads those same interview records rather than duplicating them.

## 3. Homepage Progress Chapter

The new chapter sits between the Program and Supporters sections. Its working
heading is **Built edition by edition** and its purpose is to show momentum, not
to behave like a filing cabinet.

The chapter includes:

- A concise statement about the festival's progression.
- One card for each completed festival, ordered from newest to oldest.
- Edition label, year, city, headline, supplied statistics, and supplied media.
- A short list of verified highlights when the source content provides them.
- A single link to `/past-events` for the complete story.

The current/upcoming edition does not appear as a past event. The progress
chapter may end with a clearly marked “Next chapter” reference to the current
edition, but it must never label it completed.

The chapter reuses the Assembly card vocabulary, type scale, media treatment,
and spacing. It is not added to the navbar and does not consume a new section
number, preserving the existing navigation contract.

## 4. Past Events Destination

`/past-events` is redesigned as a progress narrative while retaining its
existing route and navbar link.

The page includes:

- A progress-oriented introduction.
- Tabs or equivalent edition controls for completed years only.
- A selected-edition story with the supplied headline, city, statistics,
  imagery, and verified highlights.
- A related-interviews region only when interview records are explicitly
  associated with that year.
- Honest empty states for missing galleries, outcomes, or recordings.

The current 2026 festival is removed from the past-event tabs while it remains
upcoming. When an edition's status later becomes archived, the content adapter
can include it automatically without changing the page component.

## 5. Interview Model and Routes

Interviews are canonical media records rather than content embedded inside an
edition page. Each record gains:

- A stable, unique `slug` for its permanent URL.
- An optional `editionYear` relation.
- Optional topic labels for future filtering.
- Existing person, title, duration, image, pull quote, featured flag, and media
  URL fields.

`editionYear` remains optional because the repository does not currently prove
which historical festival produced every recording. Existing interviews with
unknown provenance remain visible in the library but do not appear under a
specific edition. The implementation must not infer an edition from the
speaker's current appearance.

`/interviews` renders a complete server-provided collection with lightweight
client filtering. Edition filters appear only for years represented by mapped
records; an “All interviews” view always remains available.

`/interviews/[slug]` renders the interview still, title, person, organization
line, duration, pull quote, related edition when known, and recording link when
available. When no recording URL exists, the page presents a polished
“recording coming” state rather than a dead play control.

Existing interview cards link to the permanent detail route. The homepage hero
CTA points to `/interviews`, and legacy `/archive` and `/media` paths redirect
to the interview library rather than Past Events.

## 6. Content and Data Flow

`getSummitContent()` remains the only content door. Page components receive
typed data and do not import seed documents or database clients.

The local seed, Zod schema, Drizzle schema, deterministic seed process, and
SQLite repository are extended together for the new interview fields and past
festival highlights. A reversible migration adds nullable interview metadata;
existing interview rows remain valid throughout the transition.

Derived views provide:

- Completed festivals for the current edition year/status.
- Interviews grouped by explicit edition year.
- Interview lookup by slug.
- Related interview cards for an edition without duplicating records.

The homepage and Past Events route consume the same completed-festival derived
view so the upcoming edition cannot accidentally reappear as historical in one
surface but not the other.

## 7. CEO Review Controls

The review controls remain available because this is a mockup, but they become
a deliberate, collapsible **Review** panel rather than a “Dev” toolbar.

The first implementation keeps the existing scheme, media tint, and section
contrast behavior and adds three bounded presentation controls:

- **Card roundness:** a slider over a tested 8–28px range.
- **Layout density:** compact, balanced, or airy section/card spacing.
- **Collection depth:** curated or full speaker/interview rails on the homepage;
  the dedicated library remains complete in either state.

These controls change CSS variables or top-level data attributes rather than
branching individual components, so new sections inherit the selected review
direction automatically. The panel must:

- Start compact and expand on request.
- Preserve choices across routes and reloads.
- Avoid covering primary content or registration actions at desktop and mobile
  widths.
- Use full labels or accessible tooltips at narrow widths.
- Make clear that the controls affect the preview only.
- Provide a one-action reset to the recommended default presentation.

## 8. Responsive and Accessibility Behavior

- Progress cards form a readable grid on desktop and a single-column sequence
  on mobile.
- Edition controls are keyboard operable and expose correct selected state.
- Interview filters enhance a server-rendered complete list, so content remains
  available without client JavaScript.
- Every interview and edition card has a heading, meaningful link label, and
  supplied alternative text.
- The Review panel does not trap focus and can be closed with an explicit
  control.
- Existing skip link, main landmark, heading hierarchy, focus styling, and
  reduced-motion behavior remain intact.

## 9. Failure and Empty States

- No completed editions: omit the homepage chapter and show a concise empty
  state on `/past-events`.
- Missing festival image: preserve the designed media slot with a clearly
  intentional placeholder.
- No related interviews: omit the related region; do not show an empty carousel.
- Unknown interview edition: keep the interview in the global library only.
- Missing interview recording URL: show the still and “recording coming” copy.
- Invalid interview slug: render the existing in-design not-found treatment.
- Invalid content or duplicate interview slug: fail validation before rendering.

## 10. Verification

Automated verification covers:

- Navbar labels, order, href behavior, and route count remain unchanged.
- The current edition is excluded from completed-festival views.
- Interview slugs are unique and resolve correctly.
- Unknown interview editions are not assigned or grouped speculatively.
- Legacy archive/media redirects point to `/interviews`.
- Seed and database repositories return equivalent new fields.
- Database migration preserves existing rows and submission data.
- New routes emit specific metadata and appropriate not-found behavior.
- Existing theme-token and content-boundary tests continue to pass.

Rendered verification covers:

- Homepage progress placement between Program and Supporters.
- Past Events narrative and year selection.
- Interview library and representative detail page.
- Review panel at desktop and mobile widths.
- No horizontal overflow, covered CTA, broken anchor, or blocking runtime error.

The final deployment build must pass before the CEO review site is published.

## 11. Delivery Boundary

This slice delivers the progress chapter, improved Past Events destination,
canonical interview library/detail routes, honest content relationships, and a
non-obstructive Review panel. It does not add a CMS, authentication, an admin
dashboard, video hosting, newsletter delivery, or invented historical content.

After validation, the exact reviewed source is published as a private review
site when the hosting provider supports private access. If only shared or
public access is available, publishing requires explicit approval for that
resolved access level.

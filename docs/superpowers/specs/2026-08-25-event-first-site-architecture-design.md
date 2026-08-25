# Cross Future Event-First Site Architecture

**Date:** 2026-08-25  
**Status:** Approved in conversation; awaiting written-spec review

## Purpose

Restructure the Cross Future mockup from a homepage with navbar scroll anchors into a small, scalable event website whose primary navigation opens real pages. The site should help a visitor understand the upcoming event, evaluate its speakers and program, review past credibility, and register.

## Design principles

- Organize the site around the upcoming event rather than around an institutional archive.
- Keep the homepage persuasive and visual; move detailed collections to permanent pages.
- Give each subject one canonical URL so content is not duplicated across competing index pages.
- Allow short pages now and expand them later without changing routes or navigation labels.
- Preserve old public URLs with redirects instead of breaking saved links.

## Information architecture

| Navbar item | Destination | Responsibility |
| --- | --- | --- |
| Cross Future logo | `/` | Brand link back to the homepage |
| Home | `/` | Explicit homepage link in addition to the logo |
| Speakers & Interviews | `/speakers` | Complete previous-speaker roster and recorded interview library |
| Program | `/program` | Event themes, session formats, agenda, and schedule as it becomes available |
| Past Events | `/past-events` | Completed editions, photos, outcomes, recognition, and highlights |
| Register | External EventGo URL | Primary conversion action; opens the ticketing destination directly |

There is no separate About page. The homepage owns the About content.

## Page responsibilities

### Home (`/`)

The homepage remains the event landing page. Its content order is:

1. Full-screen event hero and registration action.
2. Featured previous speakers with a link to the complete archive.
3. A concise About section explaining Cross Future and its audience.
4. A short Program preview linking to `/program`.
5. Credibility from past editions, institutional recognition, and partners.
6. Contact and footer navigation.

Homepage section IDs remain in the markup for compatibility and direct linking, but the primary navbar does not use them as its main navigation model.

### Speakers & Interviews (`/speakers`)

This is the permanent people and media index. It contains:

- A short page introduction.
- The complete previous-speaker roster.
- Recorded interviews in a separate, clearly titled section.
- Links from interview cards to the existing `/interviews/[slug]` detail pages.

The page may add filters or edition groupings later without changing its URL.

### Program (`/program`)

The page launches with the content currently available:

- Program themes and focus areas.
- Session formats.
- Confirmed agenda items and a clear pending state where details are unpublished.
- Registration action.

The route stays stable when a detailed schedule is published later.

### Past Events (`/past-events`)

The existing archive remains canonical. Each edition can expand with outcomes, photography, recordings, and recognition without adding more top-level navbar items.

## Navbar behavior

- Desktop and mobile navigation render from one canonical route table.
- Every content label in the primary navbar uses framework routing, not a homepage hash link.
- The logo and the explicit Home label both link to `/`.
- The current internal page receives `aria-current="page"`.
- Register remains visually prominent and external, with safe external-link behavior.
- Mobile navigation contains the same items in the same order and closes after navigation.
- The navbar does not need homepage intersection-observer state once all primary items are routes.

## Canonical routes and redirects

- `/` remains canonical for Home and About.
- `/speakers` is canonical for the combined speaker and interview index.
- `/program` becomes canonical for program and agenda content.
- `/past-events` remains canonical for completed editions.
- `/interviews/[slug]` remains canonical for individual recorded conversations.
- `/about` redirects to `/#about`.
- `/agenda` redirects to `/program`.
- `/interviews` redirects to `/speakers#interviews` after the combined index exposes a stable `interviews` anchor.
- Legacy `/assembly/*` subject routes redirect to their corresponding canonical route or homepage section.

Redirects must not intercept a canonical page, as the former `/speakers` redirect did before the combined archive was introduced.

## Component and data strategy

- Reuse the existing content adapters; pages do not duplicate speaker, interview, agenda, edition, or partner data.
- Reuse `AsmFacultyGrid`, `AsmInterviews`, `AsmAgenda`, and the existing page-shell and heading components.
- Keep route definitions and navbar labels in `lib/assembly-nav.ts` as the single source of truth.
- Remove homepage-only active-section tracking from the navbar after it no longer consumes section anchors.
- Do not create placeholder CMS records or speculative page types for short pages.

## Responsive and accessibility requirements

- All navbar destinations must remain keyboard reachable and expose a visible focus state.
- The mobile drawer must mirror desktop destinations and preserve Escape-to-close behavior.
- Page landmarks require one descriptive `h1`, followed by correctly ordered section headings.
- Collection controls retain accessible names and touch/trackpad scrolling.
- External registration behavior must be distinguishable and safe.

## Verification

Automated coverage should prove:

- The canonical navbar order and hrefs on desktop and mobile.
- Active-page behavior for each internal route.
- The homepage retains About content and links to the detailed pages.
- `/speakers` includes both speaker and interview sections.
- `/program` renders available program content and its pending state.
- Redirects preserve legacy URLs without intercepting canonical routes.

Final validation requires the full test suite, TypeScript check, production build, and successful local responses from `/`, `/speakers`, `/program`, and `/past-events`.

## Out of scope

- CMS migration or schema redesign.
- Ticket purchasing inside the Cross Future site.
- New speaker or interview data.
- New authentication, user accounts, or attendee dashboards.
- A visual redesign of sections unrelated to the route restructuring.

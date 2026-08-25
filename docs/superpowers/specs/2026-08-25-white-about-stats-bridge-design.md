# Cross Future White About and Stats Bridge

**Date:** 2026-08-25  
**Status:** Approved

## Purpose

Create a stronger transition from the dark video hero into the event story. A
blue statistics bridge will sit across the dark-to-white seam, and a rebuilt
About section will begin the white portion of the homepage with concise copy
and event photography. The references establish the broad editorial rhythm,
but the result must use Cross Future's own blue technical visual language.

## Homepage sequence

The top of the homepage will read in this order:

1. Dark full-screen video hero.
2. Blue statistics bridge overlapping the dark hero and white content canvas.
3. White About Cross Future section.
4. White Previous Speakers section with three interview previews and the
   archive action.

The About section is the visual start of the white site body. It must not sit
inside the current dark rounded container.

## Statistics bridge

Create a dedicated presentation component directly after the hero. It contains
four deliberately temporary placeholder metrics:

- `XX` — Events
- `XX` — Speakers
- `YY` — Interviews
- `YY` — Partners

The values must remain obvious placeholders and must not be derived from site
data yet. The bar uses a deep electric-blue surface, thin brighter-blue dividers,
large white values, and compact uppercase labels. Its position overlaps the
dark-to-white boundary so it visually belongs to both regions without becoming
a floating rounded card.

Desktop displays one row of four equal metrics. Mobile displays a two-by-two
grid with internal dividers and no horizontal overflow.

## About section

Refactor the existing `AsmAboutIntro` rather than introducing competing About
components. The section uses a white or near-white background and contains:

- A small technical eyebrow identifying the subject as Cross Future.
- A large blue headline: `Where AI ideas become shared momentum.`
- One concise paragraph explaining that Cross Future connects professors,
  researchers, and industry builders through recurring AI events.
- An asymmetric collage of exactly three existing Cross Future event images.
- Restrained technical details such as thin grid rules, small coordinate-style
  labels, and electric-blue accents.

The collage should feel editorial: one dominant image and two supporting
images. It must reuse existing repository photography, add no generated or
external images, and provide useful alternative text. Images should have clean
edges or very small corner radii rather than the current oversized rounded
container treatment.

The current Professors, Researchers, and Industry builders mini-cards are
removed from this About composition. Their ideas are absorbed into the concise
paragraph so the section prioritizes imagery over explanatory blocks.

## Visual direction

- Dark hero above, white site body below.
- Cross Future blue rather than the reference site's purple.
- Strong typographic scale with less body copy.
- Subtle grid and line details to communicate technology without decorative
  circuit-board clichés.
- Clean rectangular image composition and restrained rounding.
- No copied reference wording, metrics, colors, or exact arrangement.

## Component strategy

- Add `AsmStatsBridge` under `components/assembly/` with a small stat-item
  interface and accessible list markup.
- Render it in the homepage after the hero and before the About section.
- Refactor `AsmAboutIntro` to own the approved headline, concise copy, and
  three-image collage.
- Keep the existing `#about` section anchor and homepage route structure.
- Extend `app/assembly/future-forum.css` with narrowly scoped stats and About
  styles; do not add dependencies or another global theme.

## Responsive and accessibility requirements

- The stats remain readable at 320px without clipped labels.
- About copy precedes the collage in source order.
- The collage becomes a single-column or compact two-row composition on small
  screens without changing reading order.
- The About region has one descriptive `h2` beneath the homepage `h1`.
- Statistics use a list, not heading levels, and placeholder values remain
  understandable with their labels.
- All three images have meaningful alt text; decorative technical marks remain
  hidden from assistive technology.

## Verification

Automated coverage will prove:

- The homepage order is hero, statistics bridge, About, then speakers.
- The four placeholder values and labels render exactly as approved.
- About renders the approved headline, concise copy, and exactly three images.
- The removed audience mini-cards do not return.
- Existing speaker/interview ordering and links remain intact.

Final validation requires the focused homepage and About tests, the full test
suite, TypeScript check, whitespace check, and a successful localhost response.

## Out of scope

- Replacing placeholder metrics with verified statistics.
- New photography or image generation.
- Redesigning the hero, speaker cards, interview cards, Program, Past Events,
  recognition, partners, or footer.
- Changing routes, navigation labels, CMS schemas, or ticketing behavior.

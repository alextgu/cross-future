/**
 * Generates every placeholder asset under public/assembly/.
 *
 * These exist so the layout can be judged with its media slots filled and so
 * dropping in real photography is a file swap, never a layout change: each
 * placeholder is written at the exact aspect ratio the seed declares for that
 * slot, and every file carries a PLACEHOLDER marker in its title so a stray
 * one is easy to find later.
 *
 * Deliberately neutral: flat greyscale geometry, no stock-photo pastiche.
 * Run: node scripts/build-assembly-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import seed from "../content/seed-assembly.json" with { type: "json" };

const here = dirname(fileURLToPath(import.meta.url));
const pub = resolve(here, "..", "public");

/* Deterministic pseudo-randomness keyed on the filename, so regenerating
   produces identical files and git stays quiet. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seedStr) {
  let state = hash(seedStr) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

const GREYS = ["#d9d9d6", "#c6c6c2", "#adadaa", "#8f8f8c", "#6f6f6c", "#4a4a46"];

function write(relPath, svg) {
  const full = resolve(pub, relPath.replace(/^\//, ""));
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, svg);
}

function parseAspect(aspect = "16 / 9") {
  const [w, h] = aspect.split("/").map((n) => Number(n.trim()));
  return { w: w || 16, h: h || 9 };
}

/** Abstract composition: bands, discs and a diagonal, seeded by the path. */
function scene(path, aspect, label) {
  const { w, h } = parseAspect(aspect);
  const W = 1200;
  const H = Math.round((W * h) / w);
  const r = rng(path);
  const pick = () => GREYS[Math.floor(r() * GREYS.length)];

  const bands = Array.from({ length: 3 }, (_, i) => {
    const y = Math.round(r() * H);
    const bh = Math.round(H * (0.1 + r() * 0.3));
    return `<rect x="0" y="${y}" width="${W}" height="${bh}" fill="${pick()}" opacity="0.55"/>`;
  }).join("");

  const discs = Array.from({ length: 2 }, () => {
    const cx = Math.round(r() * W);
    const cy = Math.round(r() * H);
    const rad = Math.round(Math.min(W, H) * (0.18 + r() * 0.3));
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${pick()}" opacity="0.5"/>`;
  }).join("");

  const dx = Math.round(r() * W);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">
<title>PLACEHOLDER — ${esc(label)}</title>
<rect width="${W}" height="${H}" fill="#e6e6e3"/>
${bands}
${discs}
<path d="M${dx} 0 L${dx + H} ${H} L${dx + H - 120} ${H} L${dx - 120} 0 Z" fill="#3a3a35" opacity="0.16"/>
<g font-family="IBM Plex Mono, ui-monospace, monospace" font-size="20" fill="#3a3a35" opacity="0.62">
<text x="28" y="42">PLACEHOLDER</text>
<text x="28" y="${H - 26}">${W}×${H} · ${esc(aspect)}</text>
</g>
<rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="#3a3a35" stroke-opacity="0.3" stroke-dasharray="10 8"/>
</svg>
`;
}

function esc(s) {
  return String(s).replace(/[<>&"]/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Portrait: abstract figure, not a face. */
function portraitSvg(name, path) {
  const W = 600;
  const H = 800;
  const r = rng(path);
  const bg = GREYS[Math.floor(r() * 3)];
  const fg = GREYS[3 + Math.floor(r() * 3)];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Placeholder portrait of ${esc(name)}">
<title>PLACEHOLDER — portrait of ${esc(name)}</title>
<rect width="${W}" height="${H}" fill="${bg}"/>
<circle cx="300" cy="300" r="132" fill="${fg}"/>
<path d="M300 470c-116 0-210 82-210 184v146h420V654c0-102-94-184-210-184z" fill="${fg}"/>
<g font-family="Barlow Semi Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="128" fill="#f4f4f3" opacity="0.9">
<text x="300" y="345" text-anchor="middle">${esc(initials)}</text>
</g>
<g font-family="IBM Plex Mono, ui-monospace, monospace" font-size="20" fill="#3a3a35" opacity="0.6">
<text x="24" y="36">PLACEHOLDER</text>
</g>
</svg>
`;
}

/** Interview still: a scene with a play badge and a timecode. */
function interviewSvg(name, path, duration) {
  const base = scene(path, "16 / 10", `Interview still — ${name}`);
  const badge = `<circle cx="600" cy="375" r="62" fill="#161614" opacity="0.72"/>
<path d="M582 344 l58 31 -58 31 z" fill="#f4f4f3"/>
<g font-family="IBM Plex Mono, ui-monospace, monospace" font-size="22" fill="#f4f4f3">
<rect x="28" y="640" width="${String(duration).length * 14 + 74}" height="36" rx="18" fill="#161614" opacity="0.72"/>
<text x="46" y="665">${duration} MIN</text>
</g>`;
  return base.replace("</svg>", `${badge}\n</svg>`);
}

/** Partner logo: a wordmark placeholder, which is more useful than a shape. */
function logoSvg(name, path) {
  const W = 420;
  const H = 140;
  const words = name.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > 22) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  const shown = lines.slice(0, 3);
  const size = shown.length > 2 ? 26 : shown.length > 1 ? 32 : 40;
  const startY = H / 2 - ((shown.length - 1) * size * 1.12) / 2 + size * 0.34;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(name)} logo placeholder">
<title>PLACEHOLDER — ${esc(name)} logo</title>
<rect width="${W}" height="${H}" fill="none"/>
<g font-family="Barlow Semi Condensed, Arial Narrow, sans-serif" font-weight="700" font-size="${size}" fill="#4a4a46" text-anchor="middle">
${shown
  .map(
    (l, i) =>
      `<text x="${W / 2}" y="${Math.round(startY + i * size * 1.12)}">${esc(
        l.toUpperCase()
      )}</text>`
  )
  .join("\n")}
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#4a4a46" stroke-opacity="0.22" stroke-dasharray="6 6"/>
</svg>
`;
}

/** A letter: a page of ruled text with a header block. */
function letterSvg(title, issuer, path) {
  const W = 850;
  const H = 1100;
  const r = rng(path);
  const rules = Array.from({ length: 26 }, (_, i) => {
    const y = 330 + i * 26;
    const w = Math.round(430 + r() * 240);
    return `<rect x="110" y="${y}" width="${w}" height="7" rx="3.5" fill="#c6c6c2"/>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(title)} from ${esc(issuer)}">
<title>PLACEHOLDER — ${esc(title)}</title>
<rect width="${W}" height="${H}" fill="#ffffff"/>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="#dcdcd8"/>
<circle cx="425" cy="140" r="52" fill="#d9d9d6"/>
<g font-family="Barlow Semi Condensed, Arial Narrow, sans-serif" font-weight="700" fill="#3a3a35" text-anchor="middle">
<text x="425" y="238" font-size="34">${esc(issuer.toUpperCase())}</text>
<text x="425" y="278" font-size="22" fill="#74746f">${esc(title.toUpperCase())}</text>
</g>
${rules}
<rect x="110" y="1030" width="200" height="7" rx="3.5" fill="#adadaa"/>
<g font-family="IBM Plex Mono, ui-monospace, monospace" font-size="18" fill="#9b9b97">
<text x="110" y="${H - 28}">PLACEHOLDER DOCUMENT</text>
</g>
</svg>
`;
}

/** Crest: a simple shield. */
function crestSvg(label, path) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="${esc(label)}">
<title>PLACEHOLDER — ${esc(label)}</title>
<path d="M60 8l44 14v40c0 28-18 44-44 50-26-6-44-22-44-50V22z" fill="#c6c6c2"/>
<path d="M60 24l30 10v30c0 19-12 30-30 34-18-4-30-15-30-34V34z" fill="#8f8f8c"/>
<circle cx="60" cy="62" r="12" fill="#f4f4f3"/>
</svg>
`;
}

/* ------------------------------------------------------------------ run */

let count = 0;
const seen = new Set();

const emit = (path, svg) => {
  if (seen.has(path)) return;
  seen.add(path);
  write(path, svg);
  count += 1;
};

/* Portraits */
for (const person of seed.people) {
  emit(
    person.headshot.sourceUrl,
    portraitSvg(`${person.firstName} ${person.lastName}`, person.headshot.sourceUrl)
  );
}

/* Interview stills */
const nameBySlug = new Map(
  seed.people.map((p) => [p.slug, `${p.firstName} ${p.lastName}`])
);
for (const interview of seed.interviews) {
  if (!interview.image) continue;
  emit(
    interview.image.sourceUrl,
    interviewSvg(
      nameBySlug.get(interview.person) ?? interview.person,
      interview.image.sourceUrl,
      interview.durationMin
    )
  );
}

/* Partner logos */
for (const partner of seed.partners) {
  emit(partner.logo.sourceUrl, logoSvg(partner.name ?? partner.slug, partner.logo.sourceUrl));
}

/* Documents and crests */
for (const letter of seed.assembly.letters) {
  emit(
    letter.document.src,
    letterSvg(letter.title, letter.issuer, letter.document.src)
  );
  if (letter.crest) emit(letter.crest.src, crestSvg(letter.crest.alt, letter.crest.src));
}
for (const doc of seed.documents) {
  emit(doc.image.sourceUrl, letterSvg(doc.title, doc.issuer, doc.image.sourceUrl));
}

/* Every MediaAsset reachable from the assembly block */
function walk(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach(walk);
    return;
  }
  if (typeof node.src === "string" && typeof node.alt === "string") {
    const target = node.kind === "video" ? node.poster : node.src;
    if (target && target.endsWith(".svg")) {
      emit(target, scene(target, node.aspect ?? "16 / 9", node.alt));
    }
  }
  Object.values(node).forEach(walk);
}
walk(seed.assembly);

console.log(`wrote ${count} placeholder assets under public/assembly/`);

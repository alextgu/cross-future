/**
 * Generates content/seed-assembly.json.
 *
 * The seed is a build artefact of this script so the roster stays consistent
 * (slugs, org joins, appearance billing) without hand-editing 2,000 lines of
 * JSON. Edit this file, run `node scripts/build-seed-assembly.mjs`, commit
 * both.
 *
 * Sourcing rules honoured here:
 *  - Every person, organization, partner and letter below appears on
 *    cross-future.com. Nothing is invented.
 *  - `verified: false` on every person: we have no canonical personal URL for
 *    them, so the site renders their name as plain text (see pickLink).
 *  - Sessions are `proposed`, not `confirmed` — the live site says the agenda
 *    is coming soon, and the repo's designed empty state depends on it.
 *  - Media is placeholder-marked so real assets can be audited in.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "content", "seed-assembly.json");

/* ------------------------------------------------------------------ media */

const img = (src, alt, aspect, extra = {}) => ({
  kind: "image",
  src,
  alt,
  aspect,
  placeholder: true,
  ...extra,
});

const vid = (src, poster, alt, aspect, extra = {}) => ({
  kind: "video",
  src,
  poster,
  alt,
  aspect,
  placeholder: true,
  ...extra,
});

const portrait = (slug, name) =>
  `/summit/portraits/${slug}.svg` && {
    sourceUrl: `/summit/portraits/${slug}.svg`,
    alt: `Portrait of ${name}`,
    focalPoint: { x: 50, y: 35 },
  };

/* ---------------------------------------------------------- organizations */

const ORGS = [
  ["cross-future-hub", "Cross Future Hub", "Cross Future Hub", "non-profit", "https://cross-future.com", "Canada"],
  ["university-of-toronto", "University of Toronto", "U of T", "university", "https://www.utoronto.ca", "Canada"],
  ["york-university", "York University", "York", "university", "https://www.yorku.ca", "Canada"],
  ["mcgill-university", "McGill University", "McGill", "university", "https://www.mcgill.ca", "Canada"],
  ["universite-de-montreal", "Université de Montréal", "UdeM", "university", "https://www.umontreal.ca", "Canada"],
  ["university-of-waterloo", "University of Waterloo", "Waterloo", "university", "https://uwaterloo.ca", "Canada"],
  ["university-of-guelph", "University of Guelph", "Guelph", "university", "https://www.uoguelph.ca", "Canada"],
  ["toronto-metropolitan-university", "Toronto Metropolitan University", "TMU", "university", "https://www.torontomu.ca", "Canada"],
  ["concordia-university", "Concordia University", "Concordia", "university", "https://www.concordia.ca", "Canada"],
  ["memorial-university", "Memorial University of Newfoundland", "Memorial", "university", "https://www.mun.ca", "Canada"],
  ["mila", "Mila — Quebec AI Institute", "Mila", "institute", "https://mila.quebec", "Canada"],
  ["university-of-washington", "University of Washington", "UW", "university", "https://www.washington.edu", "United States"],
  ["ohio-state-university", "The Ohio State University", "Ohio State", "university", "https://www.osu.edu", "United States"],
  ["columbia-university", "Columbia University", "Columbia", "university", "https://www.columbia.edu", "United States"],
  ["northwestern-university", "Northwestern University", "Northwestern", "university", "https://www.northwestern.edu", "United States"],
  ["new-york-university", "New York University", "NYU", "university", "https://www.nyu.edu", "United States"],
  ["allen-institute-for-ai", "Allen Institute for AI", "AI2", "institute", "https://allenai.org", "United States"],
  ["google-deepmind", "Google DeepMind", "Google DeepMind", "industry", "https://deepmind.google", "United States"],
  ["google-cloud", "Google Cloud", "Google Cloud", "industry", "https://cloud.google.com", "United States"],
  ["amd", "Advanced Micro Devices", "AMD", "industry", "https://www.amd.com", "United States"],
  ["meta", "Meta", "Meta", "industry", "https://about.meta.com", "United States"],
  ["mercor", "Mercor", "Mercor", "industry", "https://mercor.com", "United States"],
  ["waabi", "Waabi", "Waabi", "industry", "https://waabi.ai", "Canada"],
  ["kirchhoff-automotive", "KIRCHHOFF Automotive", "KIRCHHOFF", "industry", "https://www.kirchhoff-automotive.com", "Germany"],
  ["ey", "EY", "EY", "industry", "https://www.ey.com", "United Kingdom"],
  ["elephant-ai", "Elephant AI", "Elephant AI", "industry", "", "Canada"],
  ["deeptech-strategy", "DeepTech Strategy", "DeepTech Strategy", "industry", "", "Canada"],
  ["ella-accelerator", "ELLA Accelerator", "ELLA", "ecosystem", "", "Canada"],
].map(([slug, name, shortName, type, url, country]) => ({
  name,
  shortName,
  slug,
  type,
  url,
  country,
}));

/* ----------------------------------------------------------------- people */

/** [slug, First, Last, [orgSlugs], roleTitle, category, bio] */
const ROSTER = [
  ["reza-moridi", "Reza", "Moridi", ["university-of-toronto"], "Senior Fellow, Massey College", "research",
    "Physicist and former Ontario Minister of Research, Innovation and Science; Senior Fellow at Massey College, University of Toronto."],
  ["chris-smith", "Chris", "Smith", ["amd"], "Corporate Vice President, Platform Software & Firmware", "industry",
    "Leads platform software and firmware engineering at AMD, spanning the silicon-to-systems stack that AI data centres are built on."],
  ["james-elder", "James", "Elder", ["york-university"], "Professor", "research",
    "Professor at York University working on computational vision and the perceptual systems that underpin machine understanding of scenes."],
  ["ken-perlin", "Ken", "Perlin", ["new-york-university"], "Professor", "research",
    "Professor at New York University; his work on procedural texture and interactive graphics shaped how synthetic worlds are made."],
  ["nouha-dziri", "Nouha", "Dziri", ["allen-institute-for-ai"], "Research Scientist", "research",
    "Research scientist at the Allen Institute for AI working on the reasoning limits, factuality and safety of large language models."],
  ["wenhu-chen", "WenHu", "Chen", ["university-of-waterloo", "google-deepmind"], "Assistant Professor", "research",
    "Assistant professor at the University of Waterloo and researcher at Google DeepMind, working on multimodal reasoning and retrieval."],
  ["natasha-jaques", "Natasha", "Jaques", ["university-of-washington", "google-deepmind"], "Assistant Professor", "research",
    "Assistant professor at the University of Washington and senior research scientist at Google DeepMind, working on social reinforcement learning."],
  ["yu-su", "Yu", "Su", ["ohio-state-university"], "Associate Professor", "research",
    "Associate professor at Ohio State University working on language agents and the grounding of models in real environments."],
  ["mark-coates", "Mark", "Coates", ["mcgill-university", "mila"], "Professor", "research",
    "Professor at McGill University and member of Mila, working on graph machine learning and statistical signal processing."],
  ["bang-liu", "Bang", "Liu", ["universite-de-montreal", "mila"], "Professor", "research",
    "Professor at Université de Montréal and member of Mila, working on natural language understanding and knowledge-intensive systems."],
  ["yunzhu-li", "Yunzhu", "Li", ["columbia-university"], "Assistant Professor", "research",
    "Assistant professor at Columbia University working on robot learning and learned physical models of the world."],
  ["manling-li", "Manling", "Li", ["northwestern-university"], "Assistant Professor", "research",
    "Assistant professor at Northwestern University working on multimodal information extraction and embodied agents."],
  ["simon-yang", "Simon", "Yang", ["university-of-guelph"], "Professor, Fellow of the Canadian Academy of Engineering", "research",
    "Professor at the University of Guelph and Fellow of the Canadian Academy of Engineering, working on intelligent systems and robotics."],
  ["shyam-gollakota", "Shyam", "Gollakota", ["university-of-washington"], "Professor", "research",
    "Professor at the University of Washington working on wireless sensing, mobile systems and on-device intelligence."],
  ["abdolreza-abhari", "Abdolreza", "Abhari", ["toronto-metropolitan-university"], "Professor", "research",
    "Professor at Toronto Metropolitan University working on distributed systems, data centre modelling and network performance."],
  ["steven-wang", "Steven", "Wang", ["york-university"], "Full Professor", "research",
    "Full professor at York University working on mathematics and computation."],
  ["divya-sharma", "Divya", "Sharma", ["york-university"], "Assistant Professor", "research",
    "Assistant professor at York University working on statistical learning and applied data science."],
  ["yang-wang", "Yang", "Wang", ["concordia-university"], "Associate Professor", "research",
    "Associate professor at Concordia University working on computer vision and machine learning."],
  ["qiang-sun", "Qiang", "Sun", ["university-of-toronto"], "Professor", "research",
    "Professor at the University of Toronto working on statistics and high-dimensional inference."],
  ["rasoul-yousef", "Rasoul", "Yousef", ["university-of-toronto"], "Associate Professor", "research",
    "Associate professor at the University of Toronto."],
  ["peizhong-peter-wang", "Peizhong Peter", "Wang", ["memorial-university", "university-of-toronto"], "Professor, Epidemiology", "research",
    "Professor of epidemiology at Memorial University and the University of Toronto, working on population health data."],
  ["ze-yang", "Ze", "Yang", ["university-of-toronto", "waabi"], "Researcher", "research",
    "Researcher at the University of Toronto and Waabi, working on perception and simulation for autonomous driving."],
  ["wangsu-yuchen", "Wangsu", "Yuchen", ["mila"], "Researcher", "research",
    "Researcher at Mila."],
  ["sercan-arik", "Sercan", "Arik", ["google-cloud"], "Research Lead, Cloud AI Research", "industry",
    "Research lead at Google Cloud AI Research, working on tabular learning, time series and trustworthy model deployment."],
  ["mahmoud-assran", "Mahmoud", "Assran", ["meta"], "Research Scientist", "industry",
    "Research scientist at Meta working on self-supervised visual representation learning."],
  ["shaun-vanweelden", "Shaun", "VanWeelden", ["mercor"], "Managing Director", "industry",
    "Managing director at Mercor; previously at OpenAI and Scale AI, working on the human data supply chain behind frontier models."],
  ["cindy-zhong", "Cindy", "Zhong", ["google-cloud"], "Engineering Leader, Canada Startups", "industry",
    "Engineering leader for Canada Startups at Google Cloud, working with founders scaling AI infrastructure."],
  ["cheng-zeng", "Cheng", "Zeng", ["kirchhoff-automotive"], "Research and Development Manager, P.Eng", "industry",
    "R&D manager at KIRCHHOFF Automotive, working on manufacturing engineering and industrial automation."],
  ["mehak-khanna", "Mehak", "Khanna", ["ey"], "Manager, Technology Assurance", "industry",
    "Manager in Technology Assurance at EY, working on technology risk and controls for regulated systems."],
  ["maria-parysz", "Maria", "Parysz", ["elephant-ai"], "Founder and Chief AI Educator Officer", "ecosystem",
    "Founder and Chief AI Educator Officer at Elephant AI, working on AI literacy and adoption programmes."],
  ["marc-lijour", "Marc", "Lijour", ["deeptech-strategy"], "Executive", "ecosystem",
    "Executive at DeepTech Strategy, working on deep-technology commercialization and skills policy."],
  ["nicole-troster", "Nicole", "Troster", ["york-university", "ella-accelerator"], "Founder and Manager, ELLA Accelerator", "ecosystem",
    "Founder and manager of the ELLA Accelerator at York University, supporting women-led ventures."],
];

/** Interview guests whose affiliation is not published; no appearance row. */
const GUESTS = [
  ["miryam-lazarte", "Miryam", "Lazarte"],
  ["joseph-turcotte", "Joseph", "Turcotte"],
  ["pui-sai-lau", "Pui Sai", "Lau"],
];

const people = [
  ...ROSTER.map(([slug, firstName, lastName, , , , bio]) => ({
    firstName,
    lastName,
    slug,
    headshot: portrait(slug, `${firstName} ${lastName}`),
    links: [],
    verified: false,
    bio,
  })),
  ...GUESTS.map(([slug, firstName, lastName]) => ({
    firstName,
    lastName,
    slug,
    headshot: portrait(slug, `${firstName} ${lastName}`),
    links: [],
    verified: false,
    bio: "Interview guest. Affiliation and biography pending confirmation.",
  })),
];

const EDITION = "2026-assembly";

const appearances = ROSTER.map(([slug, , , orgs, roleTitle, category], i) => ({
  person: slug,
  edition: EDITION,
  organizations: orgs,
  roleTitle,
  category,
  billing: (i + 1) * 10,
  featured: i < 6,
}));

/* ----------------------------------------------------------------- tracks */

const tracks = [
  {
    code: "T1",
    name: "Power Challenges for AI Data Centers",
    description:
      "Ultra-high-density loads, grid capacity and power quality demands.",
    chainStage: "grid-interface",
  },
  {
    code: "T2",
    name: "Grid & Microgrid Resilience",
    description:
      "Real-time monitoring, fault diagnostics and adaptive control.",
    chainStage: "network",
  },
  {
    code: "T3",
    name: "Data Center Power Architecture",
    description:
      "Distribution topologies, backup power and energy storage.",
    chainStage: "facility",
  },
  {
    code: "T4",
    name: "Next-Generation AI Factory Infrastructure",
    description: "Digital twins and scalable deployment for AI factories.",
    chainStage: "scale",
  },
];

/* ---------------------------------------------------------------- sessions
 * Structural shape of the day only — no invented talk titles. All rows are
 * `proposed`, so the designed "not yet published" state renders. Flip one to
 * `confirmed` and the real schedule takes over with no code change.
 */

const day = (h, m) =>
  `2026-10-08T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00-04:00`;

const sessions = [
  ["S.01", "Registration & coffee", "ARRIVAL", "T1", [8, 30], [9, 15], "Foyer"],
  ["S.02", "Opening remarks", "OPENING", "T1", [9, 15], [9, 30], "Main stage"],
  ["S.03", "Morning keynote", "KEYNOTE", "T1", [9, 30], [10, 30], "Main stage"],
  ["S.04", "Panel — grid capacity and interconnection", "PANEL", "T1", [10, 45], [12, 0], "Main stage"],
  ["S.05", "Lunch & networking", "BREAK", "T2", [12, 0], [13, 15], "Foyer"],
  ["S.06", "Breakouts — resilience, architecture, dispatch", "BREAKOUT", "T2", [13, 15], [14, 45], "Rooms A–C"],
  ["S.07", "Afternoon keynote", "KEYNOTE", "T3", [15, 0], [16, 0], "Main stage"],
  ["S.08", "Roundtable — the AI factory in 2030", "ROUNDTABLE", "T4", [16, 0], [17, 0], "Main stage"],
  ["S.09", "Closing remarks & reception", "CLOSING", "T4", [17, 0], [17, 30], "Foyer"],
].map(([code, title, categoryLabel, track, from, to, room]) => ({
  code,
  title,
  edition: EDITION,
  track,
  startsAt: day(from[0], from[1]),
  endsAt: day(to[0], to[1]),
  room,
  speakers: [],
  status: "proposed",
  categoryLabel,
  speakerLabel: "To be announced",
  description: "",
  outcomes: [],
}));

/* --------------------------------------------------------------- partners */

const PARTNERS = [
  ["u-of-t-scarborough", "University of Toronto Scarborough — Computer & Mathematical Sciences", "academic", "https://www.utsc.utoronto.ca"],
  ["eventgo", "EVENTGO", "ecosystem", "https://evtgo.com"],
  ["amd-partner", "AMD", "industry", "https://www.amd.com"],
  ["federation-of-security-professionals", "Federation of Security Professionals", "community", ""],
  ["toronto-habla-espanol", "Toronto habla español", "community", ""],
  ["cniw", "Centre for New Immigrant Well-being", "community", ""],
  ["global-startups", "Global Startups", "ecosystem", ""],
  ["green-ring", "Green Ring Stock Insights", "ecosystem", ""],
  ["the-erindale-academy", "The Erindale Academy", "academic", ""],
  ["women-techmakers", "Women Techmakers", "community", ""],
  ["techconnex", "TechConnex", "ecosystem", ""],
  ["connected-minds", "Connected Minds", "academic", ""],
  ["id8-ventures", "ID8 Ventures", "ecosystem", ""],
];

const partners = PARTNERS.map(([slug, name, type, url]) => ({
  name,
  slug,
  logo: {
    sourceUrl: `/summit/partners/${slug}.svg`,
    alt: `${name} logo`,
  },
  url,
  type,
}));

/* -------------------------------------------------------------- documents */

const documents = [
  {
    title: "Congratulatory letter — Province of Ontario",
    type: "letter",
    image: {
      sourceUrl: "/summit/documents/ontario-letter.svg",
      alt: "Congratulatory letter from the Province of Ontario",
    },
    issuer: "Government of Ontario",
  },
  {
    title: "Message from the Mayor — City of Toronto",
    type: "letter",
    image: {
      sourceUrl: "/summit/documents/toronto-mayor-letter.svg",
      alt: "Message from the Mayor of the City of Toronto",
    },
    issuer: "Office of the Mayor, City of Toronto",
  },
];

/* ----------------------------------------------------------- the assembly */

const assembly = {
  heroKicker: "Convene / Engineer / Sustain",
  heroLines: ["Cross Future", "AI Summit", "10 / 2026"],
  heroMedia: vid(
    "/summit/video/hero-loop.mp4",
    "/summit/media/hero-poster.svg",
    "Montréal skyline at dusk, the venue exterior in motion",
    "16 / 9"
  ),

  facts: [
    { label: "When?", lines: ["Thursday 8 October 2026", "08:30 – 17:30 EDT"] },
    { label: "Where?", lines: ["Montréal, Québec", "Hotel Monville · 1041 Rue de Bleury"] },
    { label: "For who?", lines: ["Power, grid and AI", "infrastructure engineers"] },
  ],

  marquee: [
    "AI DATA CENTER RESILIENCE",
    "GRID CAPACITY",
    "POWER QUALITY",
    "ENERGY STORAGE",
    "DISPATCH AT SCALE",
    "LOW-CARBON TRANSITION",
  ],

  rail: {
    feature: {
      title: "Agenda at a glance",
      ctaLabel: "View agenda",
      ctaHref: "/#agenda",
      media: img(
        "/summit/media/rail-agenda.svg",
        "Delegates in conversation between sessions",
        "4 / 3"
      ),
    },
    ticket: {
      title: "Ready to be part of it?",
      text: "One day, one room, the people actually building the power layer under AI. Registration is handled by our events partner.",
      ctaLabel: "Register",
      ctaHref: "https://www.eventgo.ai/event/1000909471805",
      media: img(
        "/summit/media/rail-ticket.svg",
        "A full auditorium during the closing keynote",
        "16 / 10"
      ),
      stub: [
        { label: "Edition", value: "03" },
        { label: "Date", value: "08.10.26" },
        { label: "City", value: "YUL" },
      ],
    },
  },

  story: [
    {
      num: "01",
      title: "Our purpose and goals",
      glyph: "cross",
      text: "Cross Future Hub is a non-profit guiding tech enthusiasts through the trends that matter. The summit exists to put the people who plan grids in the same room as the people who train models — before the two disciplines have to negotiate under pressure.",
      media: img(
        "/summit/media/story-01.svg",
        "A plenary session in progress, delegates seated in the round",
        "4 / 3"
      ),
    },
    {
      num: "02",
      title: "Discovery and inspiration",
      glyph: "node",
      text: "Keynotes, panels and working breakouts across one full day. Every track lands on a node of the same electrical chain, from the interconnection queue to the rack, so the day reads as one argument rather than a parade of talks.",
      media: img(
        "/summit/media/story-02.svg",
        "A speaker mid-demonstration under stage lighting",
        "4 / 3"
      ),
    },
    {
      num: "03",
      title: "Our path to success",
      glyph: "wave",
      text: "Three editions in, the summit has grown from a Toronto gathering into a cross-border convening of academia, industry and the ecosystem organizations that hold them together. Edition 03 moves to Montréal.",
      media: img(
        "/summit/media/story-03.svg",
        "Delegates networking in the venue foyer",
        "4 / 3"
      ),
    },
  ],

  focusAreas: tracks.map((t, i) => ({
    code: t.code,
    title: t.name,
    text: t.description,
    media: img(
      `/summit/media/focus-0${i + 1}.svg`,
      `${t.name} — illustrative figure`,
      "3 / 2"
    ),
  })),

  focusMedia: img(
    "/summit/media/focus-hero.svg",
    "A data hall corridor, cabinets receding into the distance",
    "1 / 1"
  ),

  features: [
    {
      glyph: "grid",
      title: "Working breakouts",
      text: "Small rooms, one track each, chaired so the discussion produces a position rather than a Q&A.",
    },
    {
      glyph: "bolt",
      title: "Main stage keynotes",
      text: "Two keynotes bracket the day — one framing the problem, one on where the infrastructure has to be by 2030.",
    },
    {
      glyph: "chip",
      title: "Recorded interviews",
      text: "Every edition we film the faculty. The archive is public and grows through the year, not just on the day.",
    },
  ],

  stats: [
    { value: "03", label: "Edition" },
    { value: "01", label: "Day, single track spine" },
    { value: "02", label: "Cities across three editions" },
  ],

  voices: [
    {
      quote:
        "Strengthening the energy resilience of AI data centers has become a critical priority — essential to the secure operation of digital infrastructure, grid stability, and the low-carbon transition.",
      name: "Cross Future Hub",
      role: "Workshop abstract, Edition 03",
    },
    {
      quote:
        "This summit offers a platform for academics, industry leaders, startups, and investment communities to gather to discuss innovations in artificial intelligence while fostering multicultural engagement and inclusivity.",
      name: "Office of the Mayor",
      role: "City of Toronto",
    },
    {
      quote:
        "The integration of ultra-high-density computing loads introduces systemic challenges across grid capacity, power quality, supply reliability, backup power, energy storage and dispatch.",
      name: "Cross Future Hub",
      role: "Key areas of focus",
    },
  ],

  faq: [
    {
      question: "Who should attend?",
      answer:
        "Engineers and researchers working on power systems, grid planning, data-centre design and large-scale AI infrastructure, plus the policy and investment people who fund them. The room is deliberately mixed.",
    },
    {
      question: "Is the agenda published?",
      answer:
        "Not yet. The shape of the day is fixed — registration, two keynotes, a panel, working breakouts and a closing roundtable — and named sessions are published to registrants first as they are confirmed.",
    },
    {
      question: "What does registration cost?",
      answer:
        "Registration is handled by our events partner and the current rates are shown there. Write to us if cost is a barrier; the summit is run by a non-profit and we hold places for students and community organizations.",
    },
    {
      question: "Will sessions be recorded?",
      answer:
        "Faculty interviews are filmed at every edition and published in the media archive. Whether individual sessions are recorded is decided per session with the speaker.",
    },
    {
      question: "What language is the summit in?",
      answer:
        "English, in Montréal. Ask us in advance if you need materials in French and we will do what we can.",
    },
    {
      question: "Is the venue accessible?",
      answer:
        "The venue is step-free. Tell us what you need when you register — dietary, mobility, captioning, quiet space — and we will confirm arrangements before the day.",
    },
    {
      question: "Can my organization partner or sponsor?",
      answer:
        "Yes. Partners range from universities and industry to community organizations. Write to info@cross-future.com and we will send the current partnership outline.",
    },
    {
      question: "How do I get there?",
      answer:
        "Hotel Monville is at 1041 Rue de Bleury in downtown Montréal, a short walk from Place-des-Arts métro and about 25 minutes from YUL.",
    },
  ],

  journal: [
    {
      slug: "power-is-the-constraint",
      date: "2026-05-12",
      title: "Power is the constraint, not compute",
      excerpt:
        "As demand for large AI models and high-performance computing accelerates, AI data centers are reshaping the landscape of power infrastructure. The bottleneck has moved.",
      readMin: 6,
      media: img(
        "/summit/media/journal-01.svg",
        "Transmission infrastructure at dusk",
        "3 / 2"
      ),
    },
    {
      slug: "interconnection-queue",
      date: "2026-05-28",
      title: "The interconnection queue is the new supply chain",
      excerpt:
        "Ultra-high-density loads do not just need more megawatts. They need grid capacity, power quality and supply reliability arriving together, on a schedule nobody controls alone.",
      readMin: 8,
      media: img(
        "/summit/media/journal-02.svg",
        "A substation control room",
        "3 / 2"
      ),
    },
    {
      slug: "what-resilience-means",
      date: "2026-06-15",
      title: "What resilience means for an AI factory",
      excerpt:
        "Backup power, energy storage and dispatch stop being separate procurement lines once the facility is treated as a controllable load on a decarbonizing grid.",
      readMin: 5,
      media: img(
        "/summit/media/journal-03.svg",
        "Battery energy storage containers on site",
        "3 / 2"
      ),
    },
  ],

  pastEditions: [
    {
      label: "ED.01",
      year: 2024,
      city: "Toronto",
      headline: "The first convening — AI and technology across academia and industry.",
      stats: [
        { value: "01", label: "Day" },
        { value: "TO", label: "City" },
      ],
      media: img(
        "/summit/media/past-2024.svg",
        "Edition 01 plenary, Toronto",
        "16 / 10"
      ),
    },
    {
      label: "ED.02",
      year: 2025,
      city: "Toronto",
      headline: "AI and Technology Summit, recognized by the Province of Ontario and the City of Toronto.",
      stats: [
        { value: "02", label: "Letters of support" },
        { value: "TO", label: "City" },
      ],
      media: img(
        "/summit/media/past-2025.svg",
        "Edition 02 audience during the closing keynote",
        "16 / 10"
      ),
    },
    {
      label: "ED.03",
      year: 2026,
      city: "Montréal",
      headline: "AI data center power and energy resilience. Four tracks on one electrical chain.",
      stats: [
        { value: "04", label: "Tracks" },
        { value: "YUL", label: "City" },
      ],
      media: img(
        "/summit/media/past-2026.svg",
        "Montréal venue exterior",
        "16 / 10"
      ),
    },
  ],

  letters: [
    {
      title: "Congratulatory letter",
      issuer: "Government of Ontario",
      date: "2025-01-16",
      excerpt:
        "Welcome to the AI and Technology Summit, hosted by the Canada Universal Media Association and Cross Future Hub.",
      crest: img("/summit/documents/crest-ontario.svg", "Coat of arms of Ontario", "1 / 1"),
      document: img(
        "/summit/documents/ontario-letter.svg",
        "Congratulatory letter from the Province of Ontario",
        "17 / 22"
      ),
    },
    {
      title: "Message from the Mayor",
      issuer: "City of Toronto",
      date: "2025-01-16",
      excerpt:
        "It is my pleasure to welcome everyone attending the Cross Future AI and Technology Summit, Shaping Future of AI, Innovating for Tomorrow, hosted by Cross Future Hub.",
      crest: img("/summit/documents/crest-toronto.svg", "Crest of the City of Toronto", "1 / 1"),
      document: img(
        "/summit/documents/toronto-mayor-letter.svg",
        "Message from the Mayor of the City of Toronto",
        "17 / 22"
      ),
    },
  ],

  gallery: [
    img("/summit/media/gallery-01.svg", "Delegates arriving at registration", "4 / 3"),
    img("/summit/media/gallery-02.svg", "A keynote in progress", "16 / 10"),
    img("/summit/media/gallery-03.svg", "Breakout room discussion", "1 / 1"),
    img("/summit/media/gallery-04.svg", "Interview filming on the mezzanine", "3 / 4"),
    img("/summit/media/gallery-05.svg", "The partner wall in the foyer", "16 / 10"),
    img("/summit/media/gallery-06.svg", "Closing reception", "4 / 3"),
    img("/summit/media/gallery-07.svg", "Whiteboard from the dispatch breakout", "3 / 2"),
    img("/summit/media/gallery-08.svg", "Montréal at night from the venue", "16 / 9"),
  ],

  registerBenefits: [
    "The agenda, in full, before it is public",
    "Access to all four tracks and both keynotes",
    "Lunch, coffee and the closing reception",
    "The recorded interview archive as it publishes",
  ],

  contact: {
    email: "info@cross-future.com",
    note: "If you have any questions please contact us.",
    inquiryTypes: [
      "General information",
      "Registration and tickets",
      "Speaking and programme",
      "Partnership and sponsorship",
      "Media and press",
      "Accessibility",
    ],
    social: [
      { label: "LinkedIn", url: "https://www.linkedin.com" },
      { label: "Website", url: "https://cross-future.com" },
    ],
  },

  footerBand: img(
    "/summit/media/footer-band.svg",
    "Wide view of the summit floor at capacity",
    "32 / 9"
  ),

  pageIntros: {
    about: {
      eyebrow: "About",
      title: "Behind the summit",
      lede: "Cross Future Hub is a non-profit guiding tech enthusiasts through key trends. The summit is its one day a year where the argument gets made in person.",
      media: img("/summit/media/intro-about.svg", "The venue main hall before doors open", "21 / 9"),
    },
    speakers: {
      eyebrow: "Faculty",
      title: "Meet the faculty",
      lede: "Researchers, industry engineers and the ecosystem organizations that connect them — the full Edition 03 roster.",
      media: img("/summit/media/intro-speakers.svg", "Faculty on stage during a panel", "21 / 9"),
    },
    agenda: {
      eyebrow: "Agenda",
      title: "Shape of the day",
      lede: "One day, 08:30 to 17:30. The structure is fixed; named sessions publish to registrants first.",
      media: img("/summit/media/intro-agenda.svg", "The main stage set for the opening", "21 / 9"),
    },
    media: {
      eyebrow: "Media",
      title: "Voices and archive",
      lede: "Recorded interviews with the faculty, and the photographic record of every edition so far.",
      media: img("/summit/media/intro-media.svg", "An interview being filmed", "21 / 9"),
    },
    partners: {
      eyebrow: "Partners",
      title: "Partners in innovation",
      lede: "Universities, industry and community organizations. The summit is a non-profit event and runs on their support.",
      media: img("/summit/media/intro-partners.svg", "The partner wall in the foyer", "21 / 9"),
    },
    register: {
      eyebrow: "Register",
      title: "Ready to be part of it?",
      lede: "Registration is handled by our events partner. Tell us what you need and we will confirm before the day.",
      media: img("/summit/media/intro-register.svg", "Delegates at the registration desk", "21 / 9"),
    },
    contact: {
      eyebrow: "Contact",
      title: "Connect with us",
      lede: "Questions about the programme, partnership, press or access — this reaches the organizing team directly.",
      media: img("/summit/media/intro-contact.svg", "The organizing team at the front desk", "21 / 9"),
    },
  },
};

/* --------------------------------------------------------------- editions */

const editions = [
  {
    slug: EDITION,
    year: 2026,
    name: "Cross Future AI Summit 2026",
    tagline: "Shaping the future of AI, innovating for tomorrow.",
    thesis:
      "Strengthening the energy resilience of AI data centers is essential to the secure operation of digital infrastructure, grid stability, and the low-carbon transition.",
    theme: "AI data center power and energy resilience",
    startsAt: "2026-10-08T08:30:00-04:00",
    endsAt: "2026-10-08T17:30:00-04:00",
    timezone: "America/Montreal",
    venue: {
      name: "Hotel Monville",
      city: "Montréal",
      region: "QC",
      country: "Canada",
    },
    registrationUrl: "https://evtgo.com",
    status: "registration-open",
    isCurrent: true,
    editionNumber: 3,
    format: "In-person",
    coordinates: { lat: 45.5065, lng: -73.5646 },
    contactEmail: "info@cross-future.com",
    socialLinks: [
      { label: "LinkedIn", url: "https://www.linkedin.com" },
      { label: "Website", url: "https://cross-future.com" },
    ],
    heroStatement:
      "A one-day summit convening leaders from academia and industry on the technical pathways, application scenarios and collaboration opportunities shaping AI data-center resilience.",
    seo: {
      title: "Cross Future AI Summit 2026 — Montréal, 8 October",
      description:
        "One day in Montréal on AI data center power and energy resilience. Grid capacity, power quality, backup power, energy storage and dispatch — academia and industry in one room. Hosted by Cross Future Hub.",
    },
  },
];

/* ------------------------------------------------------------- interviews */

const INTERVIEWS = [
  ["shaun-vanweelden", "The human data supply chain behind frontier models", 14, true,
    "The bottleneck stopped being algorithms a while ago."],
  ["shyam-gollakota", "Sensing, wireless systems and intelligence at the edge", 11, true, ""],
  ["yu-su", "Language agents that actually touch the world", 12, true,
    "An agent that cannot act is a very expensive autocomplete."],
  ["wenhu-chen", "Multimodal reasoning and what retrieval still cannot fix", 13, false, ""],
  ["nouha-dziri", "Where reasoning breaks, and why benchmarks miss it", 15, true,
    "The failure modes are structural, not statistical."],
  ["natasha-jaques", "Social reinforcement learning between people and models", 12, false, ""],
  ["james-elder", "What machine vision still gets wrong about scenes", 10, false, ""],
  ["sercan-arik", "Trustworthy deployment when the data is tabular and messy", 11, false, ""],
  ["chris-smith", "Silicon to systems: the stack under an AI data centre", 16, true,
    "Every watt you save at the rack is a watt you do not have to interconnect."],
  ["ken-perlin", "Synthetic worlds, forty years in", 13, false, ""],
  ["miryam-lazarte", "Building the ecosystem around the technology", 9, false, ""],
  ["maria-parysz", "AI literacy as infrastructure", 10, false, ""],
  ["nicole-troster", "Accelerating women-led ventures in deep tech", 9, false, ""],
  ["joseph-turcotte", "Policy, platforms and public interest", 11, false, ""],
  ["pui-sai-lau", "Community access to advanced technology", 8, false, ""],
  ["yang-wang", "Vision models and the compute they assume", 10, false, ""],
  ["rasoul-yousef", "Systems thinking for resilient infrastructure", 12, false, ""],
  ["manling-li", "Embodied agents and grounded language", 11, false, ""],
];

const interviews = INTERVIEWS.map(([person, title, durationMin, featured, pullQuote], i) => ({
  code: `IV.${String(i + 1).padStart(2, "0")}`,
  title,
  person,
  durationMin,
  featured,
  ...(pullQuote ? { pullQuote } : {}),
  image: {
    sourceUrl: `/summit/interviews/${person}.svg`,
    alt: `Still from the recorded interview with ${person
      .split("-")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ")}`,
  },
}));

/* ------------------------------------------------------------------ write */

const seed = {
  editions,
  organizations: ORGS,
  people,
  appearances,
  tracks,
  sessions,
  partners,
  documents,
  interviews,
  assembly,
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(seed, null, 2) + "\n");
console.log(
  `wrote ${out}\n  people ${people.length} · appearances ${appearances.length} · orgs ${ORGS.length} · partners ${partners.length} · interviews ${interviews.length} · sessions ${sessions.length}`
);

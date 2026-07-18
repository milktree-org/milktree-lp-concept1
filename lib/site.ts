import type { PortfolioItem } from "@/components/ui/portfolio-card";

/**
 * Cal.com — intro call for qualified leads. Override with NEXT_PUBLIC_CAL_URL
 * once the dedicated intro-call event exists; falls back to the legacy event.
 */
export const CAL_URL =
  process.env.NEXT_PUBLIC_CAL_URL ??
  "https://cal.com/milktree-agency/free-brand-digital-presence-audit-30-minutes";

export const CONTACT_EMAIL = "hello@milktreeagency.com";

/** Founding-rate urgency — decrement manually as Design Lead spots fill. */
export const foundingSpotsRemaining = Number(
  process.env.NEXT_PUBLIC_FOUNDING_SPOTS ?? "7",
);

export const site = {
  name: "Milktree",
  tagline: "Your creative department. On demand.",
  description:
    "Milktree becomes your embedded brand and design team. Unlimited requests, senior work back in 48 hours, one flat monthly fee.",
  trustLine: "200+ brands built · 6 years as an agency · No contracts · Pause anytime",
};

/* ------------------------------- Instagram (social proof) ---------------- */
export const instagram = {
  handle: "milktreeagency",
  url: "https://www.instagram.com/milktreeagency/",
  followers: 23000,
};

/* ------------------------------- Social profiles -------------------------- */
// Ordered by relevance: Instagram (main channel), Behance (design proof),
// LinkedIn (B2B buyers), Facebook.
export const socials = [
  { label: "Instagram", href: instagram.url },
  { label: "Behance", href: "https://www.behance.net/milktree/" },
  { label: "LinkedIn", href: "https://uk.linkedin.com/company/milktreeagency" },
  { label: "Facebook", href: "https://www.facebook.com/milktreeagency/" },
] as const;

/* ----------------------------- Navigation ---------------------------- */
export type NavChild = { label: string; href: string; desc?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

// Homepage-only build: nav points at on-page section anchors (smooth-scrolled
// via Lenis). Swap these for real routes when the other pages land.
export const nav: NavItem[] = [
  {
    label: "What's included",
    href: "#services",
    children: [
      { label: "Brand identity & guidelines", href: "#services", desc: "Logo, system, rules" },
      { label: "AI design", href: "#services", desc: "On-trend, production-ready" },
      { label: "Social & templates", href: "#services", desc: "Always-on creative" },
      { label: "Ads & email design", href: "#services", desc: "Paid and owned channels" },
      { label: "Decks & sales collateral", href: "#services", desc: "Pitches that close" },
      { label: "Packaging, print & OOH", href: "#services", desc: "Off-screen, on-brand" },
    ],
  },
  { label: "Our work", href: "#work" },
  {
    label: "Why Milktree",
    href: "#why",
    children: [
      { label: "How it works", href: "#how", desc: "Subscribe, request, receive" },
      { label: "The approach", href: "#way", desc: "Embedded, senior, fast" },
      { label: "Results", href: "#work", desc: "200+ brands and counting" },
    ],
  },
  { label: "Plans", href: "#plans" },
  { label: "FAQ", href: "#faq" },
];

/* ------------------------------- Problem (§3.3) --------------------------- */
export const problems = [
  {
    label: "Freelancers",
    title: "Ghost when you need them.",
    body: "Talented, but stretched across five other clients. Inconsistent, hard to brief, and gone the moment your deadline actually matters.",
  },
  {
    label: "Hiring",
    title: "£50k+ for one skill set.",
    body: "Months to recruit, then salary, software and management overhead. All for one person who can't cover brand, web, social and ads alone.",
  },
  {
    label: "Agencies",
    title: "Four-figure quotes, then gone.",
    body: "A proposal for every small thing, layers of account managers, and radio silence once the project wraps. Great for one job, painful as a partner.",
  },
];

/* ---------------------------- What's included (§3.6) ---------------------- */
export const included = [
  { id: "brand", title: "Brand identity & guidelines", body: "Logos, systems and rules that hold up everywhere." },
  { id: "ai", title: "AI design", body: "AI-native creative — systems, assets and workflows your team can actually ship." },
  { id: "social", title: "Social & templates", body: "Always-on creative that keeps your feed sharp." },
  { id: "ads", title: "Ads & email design", body: "Static and motion ads, plus campaigns and flows that convert." },
  { id: "decks", title: "Decks & sales collateral", body: "Pitch decks and sales material that close." },
  { id: "web", title: "Landing page & web design", body: "Design, not build. Pages engineered to convert." },
  { id: "print", title: "Packaging & print", body: "Physical brand moments, done properly." },
  { id: "ooh", title: "Presentations & OOH", body: "From boardroom screens to billboards." },
];

export const includedFootnote =
  "One request = one deliverable with one revision round included.";

/* ------------------------------ How it works (§3.5) ----------------------- */
export const steps = [
  {
    n: "01",
    title: "Subscribe",
    body: "Pick your plan and get dashboard access the same day. No onboarding calls required, no paperwork.",
  },
  {
    n: "02",
    title: "Request",
    body: "Drop guided briefs into your queue. Add as many as you like; we work through them in priority order.",
  },
  {
    n: "03",
    title: "Receive",
    body: "Senior work back in around 48 hours, creative-directed so nothing ships off-brand.",
  },
  {
    n: "04",
    title: "Approve or revise",
    body: "One click to approve, or send it back. One revision round is included on every request.",
  },
];

export const stepsFootnote = "No proposals. No quotes. The process is the product.";

/* ------------------------------ Comparison (§3.8) ------------------------- */
export const comparison = {
  columns: ["Freelancer", "In-house hire", "£500–950 subscriptions", "Milktree"],
  rows: [
    {
      label: "Cost",
      values: [
        "Variable day rates",
        "£50k+/yr + overheads",
        "Cheap, but shallow",
        "One flat monthly fee",
      ],
    },
    {
      label: "Coverage",
      values: [
        "One specialism",
        "One skill set",
        "One generalist working a queue. Production, not brand",
        "Senior team across every discipline",
      ],
    },
    {
      label: "Consistency",
      values: [
        "Drifts over time",
        "Strong, until they leave",
        "No creative direction",
        "On-brand, every time",
      ],
    },
    {
      label: "Speed",
      values: [
        "Depends on their week",
        "Limited capacity",
        "Days per ticket",
        "~48h turnaround",
      ],
    },
    {
      label: "Risk",
      values: [
        "Can vanish mid-project",
        "Hiring & notice periods",
        "Easy in, little accountability",
        "Pause or cancel anytime",
      ],
    },
  ],
};

/* ------------------------------- Plans (§3.7) ------------------------------ */
export type Plan = {
  name: string;
  kicker: string;
  price: string;
  cadence: string;
  summary: string;
  anchor: string;
  features: string[];
  featured: boolean;
  note?: string;
  /** Founding-rate urgency banner (Design Lead only). */
  banner?: string;
  cta: string;
};

export const plans: Plan[] = [
  {
    name: "Essentials",
    kicker: "Ongoing design support",
    price: "£1,999",
    cadence: "/mo",
    summary: "Your design queue, handled. One request at a time.",
    anchor:
      "Unlimited requests, worked one at a time by vetted designers from our bench of 50+, quality-checked by a creative director before it ships. Pause whenever things go quiet and unused time banks.",
    features: [
      "Unlimited requests, one at a time",
      "~48h average turnaround",
      "Vetted designers, quality-checked by a creative director",
      "One revision round per request",
      "Pause anytime, unused time banks",
      "Cancel any month",
    ],
    featured: false,
    cta: "Get started",
  },
  {
    name: "Design Lead",
    kicker: "The flagship",
    price: "£3,999",
    cadence: "/mo",
    summary:
      "Two requests at a time, with your own dedicated design lead, reachable on Slack.",
    anchor:
      "A design lead costs £65k+ a year in the UK before National Insurance, holiday cover and recruitment, and buys one skill set. Design Lead is £48k a year, senior across every discipline, cancel any month.",
    features: [
      "Unlimited requests, two at a time",
      "Your own dedicated senior designer — the same person, every time",
      "Direct Slack access to your design lead",
      "Creative direction on every piece",
      "Full brand builds, typically 4–6 weeks",
      "~48h average turnaround",
      "Pause or cancel anytime",
    ],
    featured: true,
    note: "Most teams choose Design Lead",
    banner: `First 10 Design Lead clients lock £3,500/mo for life. ${foundingSpotsRemaining} spots left.`,
    cta: "Get started",
  },
];

export const planAnchor =
  "Both plans replace the cost and risk of hiring. No recruitment, no management overhead, no notice periods. Need more firepower?";

export const planVatNote = "All prices exclude VAT.";

/* -------------------------------- Stats ----------------------------------- */
export const stats = [
  {
    value: 200,
    suffix: "+",
    label: "Brands built",
    sub: "Identity, campaigns, packaging and web — end to end.",
  },
  {
    value: 15,
    suffix: "+",
    label: "Industries",
    sub: "Construction to fintech. The process holds everywhere.",
  },
  {
    value: 6,
    suffix: "",
    label: "Years as an agency",
    sub: "Six years of agency craft, now delivered on subscription.",
  },
  {
    value: 50,
    suffix: "+",
    label: "Experienced designers",
    sub: "A vetted bench, quality-checked by a creative director.",
  },
];

/* ------------------------- Case studies (§3.9) ---------------------------- */
// Scope lines describe what was delivered. Swap `result` in for a real,
// verified number per client when available — never ship placeholder stats.
export type CaseStudy = {
  title: string;
  category: string;
  poster: string;
  scope: string;
  /** Optional verified outcome, e.g. "2.4× more qualified enquiries". */
  result?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    title: "EazyPhone",
    category: "Brand Identity",
    poster: "/work/portfolio/eazyphone-identity.webp",
    scope: "Full identity, guidelines and collateral, rolled out across retail and out-of-home.",
  },
  {
    title: "Mint Mortgages",
    category: "Brand & Campaign",
    poster: "/work/portfolio/mint-simplifying.webp",
    scope: "Brand identity and an always-on campaign system, from broker kits to billboards.",
  },
  {
    title: "Alltrad Roofing",
    category: "Brand Identity",
    poster: "/work/portfolio/alltrad-ooh.webp",
    scope: "Identity, brand system and out-of-home built to win commercial contracts.",
  },
];

/* ----------------------------- Testimonials (§3.9) ------------------------ */
// [slot] — swap for named, attributed client quotes.
export const testimonials = [
  {
    quote:
      "Milktree became our design team overnight. Senior work, on-brand, and faster than anyone we'd hired before.",
    name: "Founder",
    role: "Series A SaaS",
  },
  {
    quote:
      "We cancelled three freelancer contracts and replaced a hire we hadn't even made yet. It just works.",
    name: "Head of Marketing",
    role: "DTC brand",
  },
  {
    quote:
      "The consistency is the thing. Every deck, ad and page now looks like it came from the same place, because it did.",
    name: "CEO",
    role: "Fintech",
  },
];

/* ------------------------------- Portfolio -------------------------------- */
// Real Milktree work — still posters only (video lives solely in the hero).
export const portfolio: PortfolioItem[] = [
  { title: "Hampshire Food Hub", category: "Brand Campaign", poster: "/work/portfolio/hampshire-tuckin.webp" },
  { title: "EJW Concrete", category: "Campaign", poster: "/work/portfolio/ejw-cinema.webp" },
  { title: "Baya Vodka Soda", category: "Brand Identity", poster: "/work/portfolio/baya-posters.webp" },
  { title: "SaleSprout", category: "Signage", poster: "/work/portfolio/salesprout-signage.webp" },
  { title: "Alchemy Brews", category: "Brand Identity", poster: "/work/portfolio/alchemy-crest.webp" },
  { title: "Ooh Pho", category: "Brand & Campaign", poster: "/work/portfolio/oohpho-menus.webp" },
  { title: "Powerforce", category: "Print", poster: "/work/portfolio/powerforce-stationery.webp" },
  { title: "Scoop Creamery", category: "Social & Content", poster: "/work/portfolio/scoop-social.webp" },
  { title: "Zillwoods", category: "Brand Identity", poster: "/work/portfolio/zillwoods-cards.webp" },
  { title: "Grin Oralcare", category: "Packaging", poster: "/work/portfolio/grin-products.webp" },
  { title: "Figurati", category: "Print", poster: "/work/portfolio/figurati-invite.webp" },
  { title: "Lussobrunch", category: "Out-of-Home", poster: "/work/portfolio/lusso-billboard.webp" },
];

/* -------------------------------- FAQ (§3.10) ------------------------------ */
export const faqs = [
  {
    q: "What is a design subscription?",
    a: "A design subscription replaces project quotes and retainers with one flat monthly fee. You subscribe, add unlimited design requests to your queue, and senior work comes back in around 48 hours — an in-house creative department without the headcount, the recruitment or the notice periods.",
  },
  {
    q: "How does “unlimited requests” work?",
    a: "Add as many requests to your queue as you like. There's no cap on volume. The constraint is concurrency: we work one request at a time on Essentials, two at a time on Design Lead, and move to the next the moment one is approved.",
  },
  {
    q: "What counts as one request?",
    a: "One deliverable: a deck, a landing page design, an ad set, a social template pack, a packaging concept. One revision round is included on every request. If a job is bigger than one deliverable, we split it into clear requests with you before starting.",
  },
  {
    q: "How fast will I get work back?",
    a: "Most requests come back in around 48 hours. Larger pieces like full brand builds and multi-page sites are scoped into stages, so you see real progress every couple of days rather than waiting weeks for a reveal.",
  },
  {
    q: "How do pause and cancel work?",
    a: "Billing is monthly with no contracts. Pause whenever things go quiet; unused time banks and picks up where you left off. Cancel any month with a click, and everything we've made is yours to keep.",
  },
  {
    q: "How is Milktree different from cheaper £500–950 design subscriptions?",
    a: "Those services put one generalist on a ticket queue — production, not brand. Milktree is a senior team with creative direction on every piece, covering brand identity, campaigns, packaging, web and everything between. It's an unlimited design service run like a creative department, not a help desk.",
  },
  {
    q: "Is Milktree a UK design agency?",
    a: "Yes. Milktree is a UK-based design agency working on subscription — six years as an agency, 200+ brands built, for scaling companies in the UK and beyond. Prices are in GBP, and there are no contracts: pause or cancel any month.",
  },
  {
    q: "Who's actually doing the design?",
    a: "No juniors, no outsourcing marketplaces, on either plan. On Essentials, every request is worked by a vetted designer from our bench of 50+ experienced designers and checked by a creative director before it ships. On Design Lead, one senior designer is assigned to you as your permanent design lead — the same person, every time — plus creative direction on everything, so nothing ships off-brand.",
  },
  {
    q: "What's the Slack channel on Design Lead for?",
    a: "A dedicated channel with your design lead and creative director — drop notes, ask quick questions, share references, and get real-time updates between deliverables. It's not a ticket queue; it's how you'd talk to an in-house team.",
  },
  {
    q: "What's out of scope?",
    a: "Development and code builds (we design landing pages and websites; your developers or our partners build them), video shoots, 3D, and complex motion production. If you're unsure, ask and we'll tell you straight.",
  },
  {
    q: "Do prices include VAT?",
    a: "No, all prices exclude VAT. UK VAT is added at the prevailing rate on your invoice where applicable.",
  },
];

/* --------------------------- Hero showreel -------------------------------- */
// Curated case-study stills for the hero backdrop — a Ken Burns crossfade
// loop replacing the single hero-bg.mp4 master. Picked for cinematic OOH/
// environmental weight (billboards, storefronts, print in real light) over
// flat product or social crops, so the reel reads as premium proof, not a
// mood board. Order is the play order.
export type HeroShowreelItem = { src: string; title: string };

export const heroShowreel: HeroShowreelItem[] = [
  { src: "/work/portfolio/ejw-builttolast.webp", title: "EJW Concrete — Out-of-Home" },
  { src: "/work/portfolio/alltrad-ooh.webp", title: "Alltrad Roofing — Out-of-Home" },
  { src: "/work/portfolio/mailmans.webp", title: "Mailmans — Signage" },
  { src: "/work/portfolio/melt-pizza.webp", title: "Melt Pizza Co — Brand Campaign" },
  { src: "/work/portfolio/figurati-invite.webp", title: "Figurati — VIP Collateral" },
  { src: "/work/portfolio/zillwoods-cards.webp", title: "Zillwoods — Brand Identity" },
  { src: "/work/portfolio/eazyphone-identity.webp", title: "EazyPhone — Brand Identity" },
  { src: "/work/portfolio/lusso-billboard.webp", title: "Lussobrunch — Out-of-Home" },
  { src: "/work/strip/samuelharper-billboard.webp", title: "Samuel Harper — Out-of-Home" },
  { src: "/work/strip/zillwoods-storefront.webp", title: "Zillwoods — Storefront Signage" },
  { src: "/work/strip/eazyphone-posters.webp", title: "EazyPhone — Poster Campaign" },
  { src: "/work/strip/salesprout-rooftop.webp", title: "SaleSprout — Rooftop Out-of-Home" },
];

/* ----------------------- Work showcase strip (full-bleed) ----------------- */
export type WorkShowcaseItem = {
  src: string;
  title: string;
  sub: string;
};

export const workShowcase: WorkShowcaseItem[] = [
  { src: "/work/strip/eazyphone-billboard.webp", title: "EazyPhone", sub: "Out-of-Home" },
  { src: "/work/strip/baya-cans.webp", title: "Baya Vodka Soda", sub: "Packaging" },
  { src: "/work/strip/alltrad-flags.webp", title: "Alltrad Roofing", sub: "Signage" },
  { src: "/work/strip/samuelharper-billboard.webp", title: "Samuel Harper", sub: "Out-of-Home" },
  { src: "/work/strip/zillwoods-storefront.webp", title: "Zillwoods", sub: "Signage" },
  { src: "/work/strip/mint-keys-moment.webp", title: "Mint Mortgages", sub: "Brand Campaign" },
  { src: "/work/strip/oohpho-packaging.webp", title: "Ooh Pho", sub: "Packaging" },
  { src: "/work/strip/ejw-flags.webp", title: "EJW Concrete", sub: "Brand Collateral" },
  { src: "/work/strip/hampshire-splurge.webp", title: "Hampshire Food Hub", sub: "Out-of-Home" },
  { src: "/work/strip/scoop-icecream.webp", title: "Scoop Creamery", sub: "Brand Identity" },
  { src: "/work/strip/powerforce-poster.webp", title: "Powerforce", sub: "Print" },
  { src: "/work/strip/figurati-menus.webp", title: "Figurati", sub: "Menu Design" },
  { src: "/work/strip/eazyphone-posters.webp", title: "EazyPhone", sub: "Poster Campaign" },
  { src: "/work/strip/alchemy-bottle.webp", title: "Alchemy Brews", sub: "Packaging" },
  { src: "/work/strip/salesprout-rooftop.webp", title: "SaleSprout", sub: "Out-of-Home" },
  { src: "/work/strip/grin-storefront.webp", title: "Grin Oralcare", sub: "Campaign" },
  { src: "/work/strip/saints-stairs.webp", title: "Saints Foundation", sub: "Event Branding" },
  { src: "/work/strip/medlocums-billboard.webp", title: "Medlocums", sub: "Out-of-Home" },
];

export const heroBadges = [
  "200+ brands built",
  "6 years as an agency",
  "50+ experienced designers",
] as const;

/* --------------------------- Logo marquee labels -------------------------- */
// Placeholder wordmarks; swap for monochrome SVGs in /public/logos.
export const logoWordmarks = [
  "NORTHWIND",
  "LUMEN",
  "CADENCE",
  "VANTAGE",
  "HALCYON",
  "MERIDIAN",
  "ATLAS",
  "AURORA",
];

/* ------------------------------ Who it's for ------------------------------ */
// Editorial audience rows. `keyword` is the single word (or hyphenated
// phrase) inside `title` that turns yellow on row hover — it must appear
// verbatim exactly once in `title`.
export const audiences = [
  {
    label: "For agencies",
    title: "Your overflow team, white-label.",
    keyword: "white-label",
    body: "Take on more work without hiring. Senior design capacity under your banner — your clients never know we exist.",
  },
  {
    label: "For marketing teams",
    title: "The ideas are yours. The firepower is ours.",
    keyword: "firepower",
    body: "Ship campaigns, decks and landing pages without waiting on a stretched design resource.",
  },
  {
    label: "For established brands",
    title: "For businesses that know design is leverage.",
    keyword: "leverage",
    body: "Senior-level craft on everything you put out — not just the big projects.",
  },
] as const;

export const notAFit =
  "Not the right fit if you need a one-off logo, or design isn't a priority yet.";

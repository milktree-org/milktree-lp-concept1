import type { PortfolioItem } from "@/components/ui/portfolio-card";

/** Cal.com — free brand audit (the single primary CTA across the site). */
export const CAL_URL =
  "https://cal.com/milktree-agency/free-brand-digital-presence-audit-30-minutes";

export const site = {
  name: "Milktree",
  tagline: "Your creative department. On demand.",
  trustLine: "200+ brands built · 5 years · No contracts · Pause anytime",
};

/* ------------------------------- Instagram (social proof) ---------------- */
export const instagram = {
  handle: "milktreeagency",
  url: "https://www.instagram.com/milktreeagency/",
  followers: 23000,
};

/* ----------------------------- Navigation (§6) ---------------------------- */
export type NavChild = { label: string; href: string; desc?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

// Homepage-only build: nav points at on-page section anchors (smooth-scrolled
// via Lenis). Swap these for real routes when the other pages land.
export const nav: NavItem[] = [
  {
    label: "What we do",
    href: "#services",
    children: [
      { label: "Brand Identity", href: "#services", desc: "Logo, system, guidelines" },
      { label: "Social & Content", href: "#services", desc: "Always-on creative" },
      { label: "Decks & Sales", href: "#services", desc: "Pitch and sales collateral" },
      { label: "Ads & Marketing", href: "#services", desc: "Performance creative" },
      { label: "Web & Landing Pages", href: "#services", desc: "Sites that convert" },
      { label: "Creative Direction", href: "#services", desc: "The senior eye" },
    ],
  },
  { label: "Our work", href: "#work" },
  {
    label: "Why Milktree",
    href: "#why",
    children: [
      { label: "How it works", href: "#how", desc: "Plan, request, receive" },
      { label: "The approach", href: "#way", desc: "Embedded, senior, fast" },
      { label: "Results", href: "#stats", desc: "200+ brands and counting" },
    ],
  },
  {
    label: "Insights",
    href: "#insights",
    children: [
      { label: "Journal", href: "#insights", desc: "Notes on brand & design" },
      { label: "Resources", href: "#insights", desc: "Guides and playbooks" },
    ],
  },
  { label: "Plans", href: "#plans" },
];

/* ------------------------------- Problem (§7.3) --------------------------- */
export const problems = [
  {
    label: "Freelancers",
    title: "Freelancers flake.",
    body: "Talented, but stretched across five other clients. Inconsistent, hard to brief, and gone the moment you need them most.",
  },
  {
    label: "Hiring",
    title: "Hiring is slow and risky.",
    body: "Months to recruit, £50k+ a year, plus management and software. One person can't cover brand, web, social and ads.",
  },
  {
    label: "Agencies",
    title: "Agencies are heavy.",
    body: "Long contracts, layers of account managers, and a quote for every small thing. Great for one project, painful as a partner.",
  },
];

/* ------------------------------ What we do (§7.5) ------------------------- */
export const services = [
  { id: "brand", title: "Brand Identity", body: "Logos, systems and guidelines that hold up everywhere." },
  { id: "social", title: "Social & Content", body: "Always-on creative that keeps your feed sharp." },
  { id: "decks", title: "Decks & Sales", body: "Pitch decks and sales collateral that close." },
  { id: "ads", title: "Ads & Marketing", body: "Performance creative built to be tested and scaled." },
  { id: "web", title: "Web & Landing Pages", body: "Fast, on-brand sites and pages that convert." },
  { id: "direction", title: "Creative Direction", body: "The senior eye that keeps everything coherent." },
];

/* ------------------------------ How it works (§7.6) ----------------------- */
export const steps = [
  {
    n: "01",
    title: "Choose your plan",
    body: "Pick the tier that matches your pace. Start in days, not months — no recruitment, no notice periods.",
  },
  {
    n: "02",
    title: "Send your requests",
    body: "Drop briefs into your managed queue. Add as many as you like; we work through them in priority order.",
  },
  {
    n: "03",
    title: "Get senior work back in days",
    body: "Senior, on-brand design delivered fast. Revise freely until it's right. Everything lives in one place.",
  },
];

/* ------------------------------ Comparison (§7.8) ------------------------- */
export const comparison = {
  columns: ["Freelancer", "In-house hire", "Milktree"],
  rows: [
    { label: "Cost", values: ["Variable, per project", "£50k+/yr + overheads", "Flat monthly fee"] },
    { label: "Reliability", values: ["Splits attention", "One person, one bandwidth", "A senior team, always on"] },
    { label: "Consistency", values: ["Drifts over time", "Strong, until they leave", "On-brand, every time"] },
    { label: "Speed", values: ["Depends on their week", "Limited capacity", "Senior work in days"] },
    { label: "Risk", values: ["Can vanish mid-project", "Hiring & notice periods", "Cancel or pause anytime"] },
  ],
};

/* ------------------------------- Plans (§7.11, §10) ----------------------- */
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
  cta: string;
};

// Two clear paths: build the brand once, then keep it growing on subscription.
// Sequential (foundation → ongoing), so they never compete on price.
export const plans: Plan[] = [
  {
    name: "Brand Build",
    kicker: "Start here · one-off project",
    price: "from £4,000",
    cadence: "one-off",
    summary: "A complete brand, built from strategy to rollout.",
    anchor: "Everything you need to launch as the obvious choice in your market.",
    features: [
      "Positioning & messaging framework",
      "Full visual identity system",
      "Brand guidelines document",
      "Launch creative direction",
      "Two rounds of revisions",
      "60-day post-launch support",
    ],
    featured: false,
    cta: "Book a free brand audit",
  },
  {
    name: "Creative Partner",
    kicker: "Then keep growing · monthly",
    price: "from £2,000",
    cadence: "/mo",
    summary: "Your embedded brand & design team, on subscription.",
    anchor: "From £24k a year — less than a single mid-level hire, with no recruitment or notice period.",
    features: [
      "Dedicated senior design",
      "Creative direction included",
      "Brand, social, ads, decks & web",
      "Priority 24–48h turnarounds",
      "Direct Slack access",
      "Scales from a queue to a full team",
      "Pause or cancel anytime",
    ],
    featured: true,
    note: "Most partnerships",
    cta: "Book a free brand audit",
  },
];

export const planJourney =
  "Most clients start with a Brand Build, then keep it sharp with an ongoing Creative Partner subscription.";

export const planAnchor =
  "Both replace the cost and risk of hiring — no recruitment, no management overhead, no notice periods. Senior work, when you need it, that you can pause or cancel anytime.";

/* -------------------------------- Stats (§7.10) --------------------------- */
export const stats = [
  { value: 200, suffix: "+", label: "Brands built" },
  { value: 15, suffix: "+", label: "Industries" },
  { value: 5, suffix: "", label: "Years" },
  { value: 98, suffix: "%", label: "Client retention" },
];

/* ----------------------------- Testimonials (§7.9) ------------------------ */
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
      "The consistency is the thing. Every deck, ad and page now looks like it came from the same place — because it did.",
    name: "CEO",
    role: "Fintech",
  },
];

/* ------------------------------- Portfolio (§9) --------------------------- */
// Real Milktree work — still posters only (video lives solely in the hero).
export const portfolio: PortfolioItem[] = [
  { title: "Hampshire Food Hub", category: "Out-of-Home", poster: "/work/portfolio/hampshire-billboard.webp" },
  { title: "Alltrad Roofing", category: "Out-of-Home", poster: "/work/portfolio/alltrad-billboard.webp" },
  { title: "EazyPhone", category: "Brand Identity", poster: "/work/portfolio/eazyphone-cards.webp" },
  { title: "Mint Mortgages", category: "Campaign", poster: "/work/portfolio/mint-keys.webp" },
  { title: "FlexiBuy", category: "Campaign Creative", poster: "/work/portfolio/flexibuy.webp" },
  { title: "SaleSprout", category: "Brand & Campaign", poster: "/work/portfolio/salesprout-billboard.webp" },
  { title: "Powerforce", category: "Print", poster: "/work/portfolio/powerforce-card.webp" },
  { title: "Hampshire Food Hub", category: "Brand Campaign", poster: "/work/portfolio/hampshire-lifestyle.webp" },
  { title: "EazyPhone", category: "Out-of-Home", poster: "/work/portfolio/eazyphone-busstop.webp" },
  { title: "Alltrad Roofing", category: "Brand Identity", poster: "/work/portfolio/alltrad-card.webp" },
  { title: "Mint Mortgages", category: "Brand Identity", poster: "/work/portfolio/mint-broker.webp" },
  { title: "Melt Pizza", category: "Packaging", poster: "/work/portfolio/melt-pizza.webp" },
];

/* ----------------------------- Insights teaser (§7.12) -------------------- */
export const insights = [
  {
    title: "Why a flat fee beats a day rate for design",
    category: "Operating model",
    readTime: "5 min read",
    href: "/insights",
  },
  {
    title: "The real cost of your first design hire",
    category: "Hiring",
    readTime: "6 min read",
    href: "/insights",
  },
  {
    title: "Building a brand system that survives scale",
    category: "Brand",
    readTime: "7 min read",
    href: "/insights",
  },
];

/* --------------------------- Hero showcase carousel ----------------------- */
export type HeroShowcaseItem = {
  src: string;
  title: string;
  sub: string;
};

export const heroShowcase: HeroShowcaseItem[] = [
  { src: "/work/hero/hampshire-billboard.webp", title: "Hampshire Food Hub", sub: "Out-of-Home" },
  { src: "/work/hero/eazyphone-cards.webp", title: "EazyPhone", sub: "Brand Identity" },
  { src: "/work/hero/alltrad-billboard.webp", title: "Alltrad Roofing", sub: "Out-of-Home" },
  { src: "/work/hero/mint-keys.webp", title: "Mint Mortgages", sub: "Campaign" },
  { src: "/work/hero/flexibuy.webp", title: "FlexiBuy", sub: "Campaign Creative" },
  { src: "/work/hero/eazyphone-busstop.webp", title: "EazyPhone", sub: "Out-of-Home" },
  { src: "/work/hero/salesprout-billboard.webp", title: "SaleSprout", sub: "Campaign" },
  { src: "/work/hero/hampshire-lifestyle.webp", title: "Hampshire Food Hub", sub: "Brand Campaign" },
  { src: "/work/hero/alltrad-card.webp", title: "Alltrad Roofing", sub: "Brand Identity" },
  { src: "/work/hero/powerforce-card.webp", title: "Powerforce", sub: "Print" },
  { src: "/work/hero/mint-broker.webp", title: "Mint Mortgages", sub: "Brand Identity" },
  { src: "/work/hero/eazyphone-lanyards.webp", title: "EazyPhone", sub: "Brand Collateral" },
  { src: "/work/hero/powerforce-turbine.webp", title: "Powerforce", sub: "Brand Campaign" },
  { src: "/work/hero/mint-billboard.webp", title: "Mint Mortgages", sub: "Out-of-Home" },
  { src: "/work/hero/ejw-builttolast.webp", title: "EJW", sub: "Brand Campaign" },
  { src: "/work/hero/eazyphone-billboard.webp", title: "EazyPhone", sub: "Out-of-Home" },
  { src: "/work/hero/mailmans.webp", title: "Mailmans", sub: "Signage" },
  { src: "/work/hero/alltrad-swatches.webp", title: "Alltrad Roofing", sub: "Brand System" },
  { src: "/work/hero/melt-pizza.webp", title: "Melt Pizza", sub: "Packaging" },
];

export const heroBadges = [
  "200+ brands built",
  "5 years",
  "No contracts · Pause anytime",
] as const;

/* --------------------------- Logo marquee labels (§7.2) ------------------- */
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

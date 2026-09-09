import type { PortfolioItem } from "@/components/ui/portfolio-card";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  type CurrencyCode,
} from "@/lib/currency";
import { proofLine } from "@/lib/offer";

/**
 * Site-wide copy and data (MILKTREE-STUDIO.md). The offer ladder itself
 * (products, prices, product-page copy) lives in lib/offer.ts; this file
 * holds everything else the chrome and the homepage read.
 */

/**
 * Cal.com — intro call. Override with NEXT_PUBLIC_CAL_URL if the event slug
 * ever changes.
 */
export const CAL_URL =
  process.env.NEXT_PUBLIC_CAL_URL ??
  "https://cal.com/milktree-agency/intro-call";

export const CONTACT_EMAIL = "hello@milktreeagency.com";

/* ------------------------------- Contact page ----------------------------- */
// [slot] — swap `name` and `addressLines` for the real contact details.
export const contact = {
  name: "Milktree",
  role: "Brand & design studio",
  email: CONTACT_EMAIL,
  addressLines: ["Milktree Studio", "United Kingdom"],
  responseNote: "We reply to every message within one working day.",
};

export const site = {
  name: "Milktree",
  tagline: "Brands you can see on the high street.",
  description:
    "Milktree is a UK design studio that builds brands for real businesses and takes them all the way to signage, packaging and print. Fix one thing in two weeks, rebuild the lot in six, or keep us on retainer. Fixed prices, no proposals.",
  trustLine: "200+ brands built · 7 years · Fixed prices · No contracts",
  proofLine,
  /** Friction-reducer shown directly under primary CTAs. */
  ctaNote: "Takes about two minutes. No commitment.",
  /** Caption framing the client logo marquee as proof of the 200+ claim. */
  marqueeCaption: "Some of the 200+ brands we’ve built",
};

/* ------------------------------- Instagram (social proof) ---------------- */
export const instagram = {
  handle: "milktreeagency",
  url: "https://www.instagram.com/milktreeagency/",
  followers: 25166,
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

/**
 * Header navigation (spec §5). Phase 1 links only to pages that exist;
 * Services, Who it's for and About join in phase 2.
 */
export function getNav(currency: CurrencyCode = DEFAULT_CURRENCY): NavItem[] {
  const m = CURRENCIES[currency];
  return [
    { label: "Work", href: "/work" },
    {
      label: "Pricing",
      href: "/pricing",
      children: [
        { label: "Brand Reset Sprint", href: "/sprint", desc: `${m.sprint} · one thing fixed in two weeks` },
        { label: "Brand Build", href: "/brand-build", desc: `from ${m.build} · the whole brand, rebuilt` },
        { label: "Subscription", href: "/subscription", desc: `from ${m.essentialsMonthly}/mo · ongoing design, on tap` },
        { label: "Compare all", href: "/pricing", desc: "Every product side by side" },
      ],
    },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/contact" },
  ];
}

export const nav: NavItem[] = getNav();

/* ------------------------------- Symptoms (home §6.1.3) ------------------- */
/**
 * The four lines that produced every lead in the 2026 ad account, in the
 * buyer's own words. Each card points at the product that fixes it.
 */
export const symptoms = [
  {
    label: "The homepage",
    title: "It can't explain what you do in one sentence.",
    body: "People land, squint, and leave. The business has moved on; the page hasn't.",
    href: "/sprint",
    cta: "Fix the homepage",
  },
  {
    label: "The deck",
    title: "The deck doesn't match the website.",
    body: "Different logo, different colours, different story. It reads like two companies.",
    href: "/sprint",
    cta: "Fix the deck",
  },
  {
    label: "The brand",
    title: "It looks like ten different people made it.",
    body: "Because they did. A freelancer here, a template there, six years of drift.",
    href: "/brand-build",
    cta: "Rebuild the brand",
  },
  {
    label: "The backlog",
    title: "Design is always the thing that's late.",
    body: "The menu, the ads, the signage for the new site. Everything waits on a designer who isn't there.",
    href: "/subscription",
    cta: "Get design on tap",
  },
] as const;

/* ------------------------------ Comparison (home §6.1.5) ------------------ */
export function getComparison(currency: CurrencyCode = DEFAULT_CURRENCY) {
  const money = CURRENCIES[currency];
  return {
    columns: ["Freelancer", "In-house hire", "Subscription-only studio", "Milktree"],
    rows: [
      {
        label: "Full brand builds",
        values: [
          "One person, one style",
          "Rarely their specialism",
          "Not what they do",
          "200 built, fixed price",
        ],
      },
      {
        label: "Print, signage, outdoor",
        values: [
          "Depends who you find",
          "Usually outsourced",
          "Digital assets only",
          "Standard. It's on the high street",
        ],
      },
      {
        label: "Creative direction",
        values: [
          "None",
          "They are the direction",
          "A ticket queue",
          "A creative director on every piece",
        ],
      },
      {
        label: "Cost",
        values: [
          "Variable day rates",
          `${money.hireCost}/yr + overheads`,
          `${money.cheapSubs}/mo`,
          "Fixed prices. No quotes",
        ],
      },
      {
        label: "Commitment",
        values: [
          "Can vanish mid-project",
          "Notice periods",
          "Rolling",
          "Pause or cancel any month",
        ],
      },
    ],
  };
}

export const comparison = getComparison();

/* -------------------------------- Stats ----------------------------------- */
export const stats = [
  {
    value: 200,
    suffix: "+",
    label: "Brands built",
    sub: "Identity, campaigns, packaging and web, end to end.",
  },
  {
    value: 15,
    suffix: "+",
    label: "Industries",
    sub: "Hospitality to trades to finance. The process holds everywhere.",
  },
  {
    value: 7,
    suffix: "",
    label: "Years",
    sub: "Seven years of studio craft, three ways to buy it.",
  },
  {
    value: 50,
    suffix: "+",
    label: "Designers in the network",
    sub: "A core team of senior designers and a vetted network worldwide, every piece checked by a creative director.",
  },
];

/* ----------------------------- Testimonials ------------------------------- */
export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  /** Client company name — attribution is what makes the quote credible. */
  company?: string;
  /** Headshot path, e.g. "/testimonials/jane.webp" (rendered at 40px). */
  avatar?: string;
  /** One verified outcome, e.g. "Replaced a £50k hire" — never invent this. */
  result?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "We've used Milktree for years now. Every time we need something done properly, they're the first call.",
    name: "Chris",
    role: "Founder",
    company: "Mortgage Hut",
    avatar: "/testimonials/chris.webp",
  },
  {
    quote:
      "They feel like a genuine extension of our team. Full of great ideas, and nothing is ever too much trouble.",
    name: "Linda",
    role: "Operations Director",
    company: "Leadtap",
    avatar: "/testimonials/linda.webp",
  },
  {
    quote:
      "By far the best creative agency I've worked with. They bring our vision to life and deliver, every single time.",
    name: "Sabrine",
    role: "Marketing Manager",
    company: "Fibo",
    avatar: "/testimonials/sabrine.webp",
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

/* -------------------------------- FAQ (home) ------------------------------ */
/** Studio-level questions. Product mechanics live with each product in lib/offer.ts. */
export function getFaqs(currency: CurrencyCode = DEFAULT_CURRENCY) {
  const money = CURRENCIES[currency];
  return [
    {
      q: "What does Milktree actually do?",
      a: "We build brands for real businesses and take them all the way to the things people see: the website, the deck, the signage, the packaging, the ads. Seven years, 200+ brands, across hospitality, property and finance, automotive, retail, health and the trades.",
    },
    {
      q: "What are the three ways to work with you?",
      a: `A Brand Reset Sprint (${money.sprint}, two weeks, one thing fixed), a Brand Build (from ${money.build}, four to six weeks, the whole brand), or a subscription (from ${money.essentialsMonthly} a month, ongoing design on tap). Most clients start with a sprint or a build and keep us on afterwards.`,
    },
    {
      q: "Is the price really the price?",
      a: `Yes. Every product has a fixed price on the page${money.taxSuffix ? ", plus VAT" : ""}. No proposals, no quotes, no hourly billing. If you want something outside the scope, we tell you what it costs before we do it.`,
    },
    {
      q: "Who's doing the design?",
      a: "A core team of senior designers and a network of 50+ vetted designers around the world, matched to each brief by discipline and sector. A creative director checks every piece before it reaches you. On Design Lead and on every Brand Build, you get a named senior designer.",
    },
    {
      q: "How long does it take?",
      a: "A sprint is two weeks. A Brand Build is four to six weeks, Build Plus six to eight. On subscription, standard requests come back in around 48 hours.",
    },
    {
      q: "Do you build websites?",
      a: "We design them, to the pixel, for desktop and mobile. Your developer or one of our partners builds them. If you don't have a developer, tell us and we'll introduce you.",
    },
    {
      q: "Where are you based?",
      a: `The UK. Most of our clients are UK businesses, and we work with companies further afield too. ${money.faqPricesLine}.`,
    },
    {
      q: "Do prices include VAT?",
      a: money.taxSuffix
        ? "No, all prices exclude VAT. UK VAT is added at the prevailing rate on your invoice where applicable."
        : "Prices exclude any applicable taxes.",
    },
  ];
}

export const faqs = getFaqs();

/* ----------------------- Work showcase strip (full-bleed) ----------------- */
export type WorkShowcaseItem = {
  src: string;
  title: string;
  sub: string;
};

export const workShowcase: WorkShowcaseItem[] = [
  { src: "/work/strip/rentlyst-laptop.webp", title: "Rentlyst", sub: "Web Design" },
  { src: "/work/strip/mint-billboard.webp", title: "Mint Mortgages", sub: "Out-of-Home" },
  { src: "/work/strip/melt-menu.webp", title: "Melt Pizza", sub: "Menu Design" },
  { src: "/work/strip/ejw-flags.webp", title: "EJW Concrete", sub: "Brand Collateral" },
  { src: "/work/strip/powerforce-cards.webp", title: "Powerforce", sub: "Print" },
  { src: "/work/strip/zillwoods-flag.webp", title: "Zillwoods", sub: "Signage" },
  { src: "/work/strip/dearbaby-subway.webp", title: "dearbabyAI", sub: "Out-of-Home" },
  { src: "/work/strip/eazyphone-lanyards.webp", title: "EazyPhone", sub: "Brand Collateral" },
  { src: "/work/strip/latimers-menu.webp", title: "Latimers", sub: "Menu Design" },
  { src: "/work/strip/mailmans-bar.webp", title: "Mailmans", sub: "Signage" },
  { src: "/work/strip/wjwm-banner.webp", title: "WJWM", sub: "Out-of-Home" },
  { src: "/work/strip/alltrad-cards.webp", title: "Alltrad Roofing", sub: "Brand Identity" },
  { src: "/work/strip/melt-box.webp", title: "Melt Pizza", sub: "Packaging" },
  { src: "/work/strip/flexibuy-truck.webp", title: "FlexiBuy", sub: "Brand Campaign" },
  { src: "/work/strip/alo-social.webp", title: "Alo Restaurant", sub: "Social Content" },
  { src: "/work/strip/mint-sign.webp", title: "Mint Mortgages", sub: "Signage" },
  { src: "/work/strip/orange-rooms-menu.webp", title: "Orange Rooms", sub: "Menu Design" },
  { src: "/work/strip/ymp-web.webp", title: "Your Mortgage Partner", sub: "Web Design" },
];

/* ------------------------------ Who it's for ------------------------------ */
// Editorial audience rows. `keyword` is the single word (or hyphenated
// phrase) inside `title` that turns yellow on row hover — it must appear
// verbatim exactly once in `title`. Phase 2 gives each a /for/[audience] page.
export const audiences = [
  {
    label: "Hospitality",
    title: "Menus, signage and a brand people photograph.",
    keyword: "photograph",
    body: "Restaurants, bars, cafés and food brands. Melt, Latimers, Orange Rooms, Alo.",
  },
  {
    label: "Property and finance",
    title: "Trust you can see from the street.",
    keyword: "Trust",
    body: "Brokers, agents, advisers. Mint Mortgages, Your Mortgage Partner, Rentlyst.",
  },
  {
    label: "Trades and construction",
    title: "A brand that wins the bigger contracts.",
    keyword: "bigger",
    body: "Roofers, builders, installers. Alltrad, EJW Concrete, Powerforce.",
  },
  {
    label: "Retail and consumer",
    title: "Packaging and campaigns that sell on sight.",
    keyword: "sight",
    body: "Shops, products, drinks. EazyPhone, Baya, Grin, Zillwoods.",
  },
  {
    label: "Automotive",
    title: "From the forecourt to the motorway.",
    keyword: "motorway",
    body: "Dealers, leasing, fleet. FlexiBuy, Mailmans.",
  },
  {
    label: "Health and aesthetics",
    title: "Clinical trust, considered design.",
    keyword: "trust",
    body: "Clinics, practices, wellbeing brands.",
  },
] as const;

export const notAFit =
  "If you need a one-off logo for a hundred quid, we're not the right fit. If your business has outgrown its brand, we are.";

/** Small badges used by the case-study pages and the work index. */
export const heroBadges = [
  "200+ brands built",
  "7 years",
  "50+ designers in the network",
] as const;

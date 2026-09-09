/**
 * The offer ladder — single source of truth for every product Milktree sells
 * (MILKTREE-STUDIO.md §2). Pages, the pricing table, the start form, the
 * emails and schema.org all read from here. No price is hard-coded anywhere
 * else.
 *
 * Pure data: safe to import from server routes, client components and
 * server-only email templates alike. Currency-aware via lib/currency.ts.
 */
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  type CurrencyCode,
} from "@/lib/currency";

export type ProductId =
  | "sprint"
  | "build"
  | "build-plus"
  | "essentials"
  | "design-lead";

/** The three doors on /start. Build Plus and Design Lead are tiers, not doors. */
export type StartProduct = "sprint" | "build" | "subscription";

export type Faq = { q: string; a: string };

export type Product = {
  id: ProductId;
  startProduct: StartProduct;
  kind: "one-off" | "subscription";
  name: string;
  /** Short framing line above the name, e.g. "Fix one thing". */
  kicker: string;
  /** The product page. */
  href: string;
  price: string;
  amount: number;
  /** "one-off" or "/mo". */
  cadence: "one-off" | "/mo";
  duration: string;
  summary: string;
  features: string[];
  /** Highlighted card on comparison surfaces. */
  featured?: boolean;
  /** Small badge above the card, e.g. "Most builds start here". */
  note?: string;
  cta: string;
};

/* ------------------------------------------------------------------------ */
/*  The five products                                                        */
/* ------------------------------------------------------------------------ */

export function getProducts(currency: CurrencyCode = DEFAULT_CURRENCY): Product[] {
  const m = CURRENCIES[currency];
  return [
    {
      id: "sprint",
      startProduct: "sprint",
      kind: "one-off",
      name: "Brand Reset Sprint",
      kicker: "Fix one thing",
      href: "/sprint",
      price: m.sprint,
      amount: m.amounts.sprint,
      cadence: "one-off",
      duration: "2 weeks",
      summary: "One thing fixed properly in two weeks. Your homepage, your deck, or your identity tightened up.",
      features: [
        "Choose one: homepage, pitch deck or identity tighten-up",
        "Two weeks, start to finish",
        "One revision round",
        "Creative director on it",
        "Files ready to use or hand to your developer",
        "Fee credited in full if you step up within 30 days",
      ],
      cta: "Book a sprint",
    },
    {
      id: "build",
      startProduct: "build",
      kind: "one-off",
      name: "Brand Build",
      kicker: "Rebuild the lot",
      href: "/brand-build",
      price: m.build,
      amount: m.amounts.build,
      cadence: "one-off",
      duration: "4 to 6 weeks",
      summary: "A complete identity from strategy to guidelines, built to hold up everywhere your business shows up.",
      features: [
        "Positioning workshop",
        "Logo system, colour and type",
        "Five core applications",
        "Brand guidelines",
        "Two revision rounds",
        "Named senior designer, creative director on every piece",
      ],
      featured: true,
      note: "Most clients start here",
      cta: "Start a brand build",
    },
    {
      id: "build-plus",
      startProduct: "build",
      kind: "one-off",
      name: "Brand Build Plus",
      kicker: "Rebuild and launch",
      href: "/brand-build",
      price: m.buildPlus,
      amount: m.amounts.buildPlus,
      cadence: "one-off",
      duration: "6 to 8 weeks",
      summary: "Everything in Brand Build, plus the campaign toolkit to launch it: ads, social, print and outdoor.",
      features: [
        "Everything in Brand Build",
        "Campaign ad set",
        "Social template pack",
        "Print and outdoor: signage, packaging or OOH as relevant",
        "Launch assets",
        "Two revision rounds",
      ],
      cta: "Start a brand build",
    },
    {
      id: "essentials",
      startProduct: "subscription",
      kind: "subscription",
      name: "Essentials",
      kicker: "Keep it alive",
      href: "/subscription",
      price: m.essentialsMonthly,
      amount: m.amounts.essentials,
      cadence: "/mo",
      duration: "Rolling monthly",
      summary: "Your ongoing design queue, handled. One request at a time, back in around 48 hours.",
      features: [
        "Unlimited requests, one at a time",
        "Around 48 hours on standard requests",
        "Worked by the core team or a vetted designer from our network",
        "Every piece checked by a creative director",
        "One revision round per request",
        "Pause or cancel any month",
      ],
      cta: "Start a subscription",
    },
    {
      id: "design-lead",
      startProduct: "subscription",
      kind: "subscription",
      name: "Design Lead",
      kicker: "Your own designer",
      href: "/subscription",
      price: m.designLeadMonthly,
      amount: m.amounts.designLead,
      cadence: "/mo",
      duration: "Rolling monthly",
      summary: "A named senior designer, the same person every time, direct on your Slack. Two requests at a time.",
      features: [
        "Unlimited requests, two at a time",
        "A named senior designer, the same person every time",
        "Direct Slack access to your designer",
        "Creative direction on everything",
        "Around 48 hours on standard requests",
        "Pause or cancel any month",
      ],
      cta: "Start a subscription",
    },
  ];
}

export function getProduct(id: ProductId, currency: CurrencyCode = DEFAULT_CURRENCY): Product {
  const product = getProducts(currency).find((p) => p.id === id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}

/** Products shown on a given product page. */
export function getProductsForStart(
  start: StartProduct,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): Product[] {
  return getProducts(currency).filter((p) => p.startProduct === start);
}

export const START_PRODUCTS: readonly StartProduct[] = ["sprint", "build", "subscription"];

export function isStartProduct(value: unknown): value is StartProduct {
  return typeof value === "string" && (START_PRODUCTS as readonly string[]).includes(value);
}

/* ------------------------------------------------------------------------ */
/*  Shared rules                                                             */
/* ------------------------------------------------------------------------ */

export const creditRule =
  "Book a Brand Build or start a subscription within 30 days of your sprint and the sprint fee comes off in full.";

export const paymentTerms = {
  sprint: "Paid in full to book. No deposit, no invoice chase.",
  build: "50% to start, 50% on delivery of the final files.",
  subscription: "Billed monthly in advance. Pause or cancel any month.",
} as const;

/** Standard proof line. Never claim the subscription itself is seven years old. */
export const proofLine = "200+ brands built · 7 years · 15+ industries · 50+ designers in the network";

/* ------------------------------------------------------------------------ */
/*  The ladder — home "three ways" section and the pricing overview           */
/* ------------------------------------------------------------------------ */

export type LadderRung = {
  id: StartProduct;
  step: string;
  name: string;
  priceLine: string;
  duration: string;
  summary: string;
  href: string;
  cta: string;
};

export function getLadder(currency: CurrencyCode = DEFAULT_CURRENCY): LadderRung[] {
  const m = CURRENCIES[currency];
  return [
    {
      id: "sprint",
      step: "01",
      name: "Brand Reset Sprint",
      priceLine: `${m.sprint} one-off`,
      duration: "2 weeks",
      summary: "The one thing that's been bothering you, fixed properly. Homepage, deck or identity.",
      href: "/sprint",
      cta: "See the sprint",
    },
    {
      id: "build",
      step: "02",
      name: "Brand Build",
      priceLine: `from ${m.build}`,
      duration: "4 to 6 weeks",
      summary: "The whole brand, rebuilt from strategy to guidelines. What 200 businesses have bought from us.",
      href: "/brand-build",
      cta: "See the build",
    },
    {
      id: "subscription",
      step: "03",
      name: "Subscription",
      priceLine: `from ${m.essentialsMonthly}/mo`,
      duration: "Rolling monthly",
      summary: "Keep it alive. Unlimited design requests, back in around 48 hours, pause any month.",
      href: "/subscription",
      cta: "See the plans",
    },
  ];
}

/* ------------------------------------------------------------------------ */
/*  Sprint page                                                              */
/* ------------------------------------------------------------------------ */

export type SprintOption = {
  id: "homepage" | "deck" | "identity";
  name: string;
  problem: string;
  deliver: string[];
};

export const sprintOptions: SprintOption[] = [
  {
    id: "homepage",
    name: "Homepage",
    problem: "The page can't explain what you do in one sentence.",
    deliver: [
      "New homepage design, desktop and mobile",
      "Headline and section structure that says what you do",
      "Design files ready for your developer",
    ],
  },
  {
    id: "deck",
    name: "Pitch deck",
    problem: "The deck doesn't match the website, or the business.",
    deliver: [
      "Up to 15 slides, restructured and designed",
      "Master template so the next deck holds",
      "Editable in PowerPoint, Keynote or Google Slides",
    ],
  },
  {
    id: "identity",
    name: "Identity tighten-up",
    problem: "It looks like ten different people made it.",
    deliver: [
      "Logo lock-ups, colour and type brought back into line",
      "Three key applications: for example business card, social template, email signature",
      "One-page guideline sheet",
    ],
  },
];

export const sprintTimeline = [
  { day: "Day 1", title: "Brief", body: "A 30-minute call and a short questionnaire. We agree exactly what's being fixed." },
  { day: "Day 3", title: "Direction", body: "Two routes, roughly drawn. You pick one." },
  { day: "Day 7", title: "First look", body: "The chosen route, designed. Your one revision round starts here." },
  { day: "Day 10", title: "Final", body: "Revised, finished, files delivered. Two weeks, done." },
];

export function getSprintFaqs(currency: CurrencyCode = DEFAULT_CURRENCY): Faq[] {
  const m = CURRENCIES[currency];
  return [
    {
      q: "What if I need more than one thing fixed?",
      a: "Book two sprints, or step up to a Brand Build. If your homepage, deck and identity all need work, that's a brand problem and the build is the honest answer. The sprint fee comes off it.",
    },
    {
      q: "What if I don't like the first look?",
      a: "One revision round is included, and you choose the direction on day three before anything is designed in full, so the first look is rarely a surprise. If it still isn't right, we talk before day ten. We've built 200 brands; we'll get there.",
    },
    {
      q: "Do I own the files?",
      a: "Yes. Everything is yours on delivery, in editable formats. No licensing, no lock-in.",
    },
    {
      q: "Who's doing the work?",
      a: "A designer from our core team or our network, matched to the job, with the creative director on it throughout. It's checked before it reaches you.",
    },
    {
      q: "How do I pay?",
      a: `${m.sprint} ${m.taxSuffix ? `plus VAT, ` : ""}paid in full to book. ${creditRule}`,
    },
    {
      q: "Can you build the homepage too?",
      a: "We design it. Your developer or one of our partners builds it. If you don't have one, say so on the call and we'll introduce you.",
    },
  ];
}

/* ------------------------------------------------------------------------ */
/*  Brand Build page                                                         */
/* ------------------------------------------------------------------------ */

export const buildProcess = [
  { n: "01", week: "Week 1", title: "Workshop", body: "Half a day with the people who run the business. Who you're for, what you stand for, what the brand has to do." },
  { n: "02", week: "Week 1", title: "Positioning", body: "Your brand on one page: audience, promise, personality, the one line that explains you. Signed off before any design starts." },
  { n: "03", week: "Week 2", title: "Direction", body: "Two visual routes, roughly drawn. You pick one. This is where the big decision happens, cheaply." },
  { n: "04", week: "Weeks 3 to 4", title: "Identity", body: "The chosen route designed in full: logo system, colour, type, imagery, the rules that hold it together." },
  { n: "05", week: "Week 5", title: "Applications", body: "The identity applied to the five things your business actually uses. Signage, vehicles, menus, packaging, decks, whatever they are for you." },
  { n: "06", week: "Week 6", title: "Guidelines and handover", body: "The guidelines, every file, and a walkthrough with whoever will use them. Then the offer to keep us on." },
];

export const buildPlusAdds = [
  { title: "Campaign ad set", body: "Static and simple motion ads across the formats you actually run." },
  { title: "Social template pack", body: "A system for posts, stories and covers your team can use without us." },
  { title: "Print and outdoor", body: "Signage, packaging or out-of-home, designed for the real world your business lives in." },
  { title: "Launch assets", body: "Everything you need to announce the new brand: email, social, the press image, the internal deck." },
];

export function getBuildFaqs(currency: CurrencyCode = DEFAULT_CURRENCY): Faq[] {
  const m = CURRENCIES[currency];
  return [
    {
      q: "Is the price really fixed?",
      a: `Yes. Brand Build is ${m.build} and Brand Build Plus is ${m.buildPlus}${m.taxSuffix ? ", plus VAT" : ""}. Two revision rounds are included at each stage. If you want something outside the scope, we'll tell you what it costs before we do it, never after.`,
    },
    {
      q: "What's the difference between Build and Build Plus?",
      a: "Build gives you the identity and the guidelines. Plus adds the toolkit to launch it: ads, social templates, print or outdoor, and launch assets. If you're rebranding a business people can see on the street, Plus is usually the right one.",
    },
    {
      q: "How much of my time does it take?",
      a: "The workshop is half a day. After that, roughly an hour a week for reviews and decisions. We run everything else.",
    },
    {
      q: "What if we're not ready for a full rebuild?",
      a: "Start with a Brand Reset Sprint. Two weeks, one thing fixed, and the fee comes off a build if you step up within 30 days.",
    },
    {
      q: "Who's my designer?",
      a: "A named senior designer leads your build from workshop to handover, with the creative director on every piece. You'll know who they are before you sign.",
    },
    {
      q: "How do I pay?",
      a: paymentTerms.build,
    },
    {
      q: "What happens after?",
      a: "Most clients keep us on. The subscription starts with someone who already knows your brand, so there's no onboarding and no drift.",
    },
  ];
}

/* ------------------------------------------------------------------------ */
/*  Subscription page                                                        */
/* ------------------------------------------------------------------------ */

export const subscriptionMonth = [
  "A menu redesign",
  "A set of ads for the next campaign",
  "A social template pack",
  "A sales deck",
  "A landing page design",
  "Packaging for a new line",
  "Signage for the second site",
  "An email design",
];

export const queueRules = [
  { title: "Add anything, any time", body: "There's no cap on how many requests sit in your queue. Add them as they come up." },
  { title: "One or two active at once", body: "Essentials works one request at a time. Design Lead works two. When one is approved, the next starts." },
  { title: "Around 48 hours back", body: "Standard requests come back in about two working days. Bigger pieces are split into stages so you see progress every couple of days." },
  { title: "One revision round each", body: "Every request includes one round. Send it back with notes, get it back finished." },
  { title: "Pause when it goes quiet", body: "Pause any month. Unused days bank. Cancel any month. Everything we've made stays yours." },
];

export function getSubscriptionAnchor(currency: CurrencyCode = DEFAULT_CURRENCY): string {
  const m = CURRENCIES[currency];
  return `A design lead costs ${m.hireAnchor} ${m.hireOverheads}, and buys one skill set. Design Lead is ${m.designLeadAnnual} a year, senior across every discipline, cancel any month.`;
}

export function getSubscriptionFaqs(currency: CurrencyCode = DEFAULT_CURRENCY): Faq[] {
  const m = CURRENCIES[currency];
  return [
    {
      q: "Who's actually doing the design?",
      a: "On Essentials, each request is worked by our core team or a vetted designer from our network, matched to the job, and checked by a creative director before it ships. On Design Lead, one senior designer is yours: the same person every time, direct on Slack, with creative direction on everything.",
    },
    {
      q: "What counts as one request?",
      a: "One deliverable: a deck, a landing page design, an ad set, a social template pack, a packaging concept, a menu. If a job is bigger than one deliverable, we split it into clear requests with you before starting.",
    },
    {
      q: "Does the subscription include a full rebrand?",
      a: "No. A full brand build is its own product, with a workshop, a named designer and a fixed price. The subscription is for the ongoing work once the brand exists. If you need both, start with the build and the subscription picks up where it ends.",
    },
    {
      q: "What's the Slack channel on Design Lead for?",
      a: "A shared channel with your designer and the creative director. Quick questions, references, real-time updates between deliverables. It's how you'd talk to someone on your own team.",
    },
    {
      q: "How do pause and cancel work?",
      a: "Billing is monthly in advance with no contract. Pause whenever things go quiet; unused days bank and pick up where you left off. Cancel any month, and everything we've made is yours to keep.",
    },
    {
      q: `How is this different from a ${m.cheapSubs} design subscription?`,
      a: "Those services put one generalist on a ticket queue. Milktree is a studio that has built 200 brands, with a creative director checking every piece, and the range to take work off the screen and onto signage, packaging and print. It's the same team that does the builds.",
    },
    {
      q: "What's out of scope?",
      a: "Development and code builds (we design pages, your developers or our partners build them), video shoots, 3D, and complex motion production. Full brand builds are a separate product. If you're unsure, ask and we'll tell you straight.",
    },
    {
      q: "Do prices include VAT?",
      a: m.taxSuffix
        ? "No, all prices exclude VAT. UK VAT is added at the prevailing rate on your invoice where applicable."
        : "Prices exclude any applicable taxes.",
    },
  ];
}

/* ------------------------------------------------------------------------ */
/*  Pricing page                                                             */
/* ------------------------------------------------------------------------ */

export type MatrixRow = {
  label: string;
  /** One cell per product, in getProducts() order. */
  values: (string | boolean)[];
};

export function getPricingMatrix(currency: CurrencyCode = DEFAULT_CURRENCY): MatrixRow[] {
  const m = CURRENCIES[currency];
  return [
    { label: "Price", values: [`${m.sprint} one-off`, `${m.build} fixed`, `${m.buildPlus} fixed`, `${m.essentialsMonthly}/mo`, `${m.designLeadMonthly}/mo`] },
    { label: "Timeframe", values: ["2 weeks", "4 to 6 weeks", "6 to 8 weeks", "Rolling", "Rolling"] },
    { label: "What you get", values: ["One thing fixed", "Full identity and guidelines", "Identity plus launch toolkit", "Ongoing design queue", "Ongoing queue with your own designer"] },
    { label: "Positioning workshop", values: [false, true, true, false, false] },
    { label: "Named senior designer", values: [false, true, true, false, true] },
    { label: "Creative director on every piece", values: [true, true, true, true, true] },
    { label: "Print and outdoor", values: ["If it's the one thing", "Within the five applications", true, "As requests", "As requests"] },
    { label: "Revision rounds", values: ["One", "Two per stage", "Two per stage", "One per request", "One per request"] },
    { label: "Direct Slack access", values: [false, "During the build", "During the build", false, true] },
    { label: "Requests active at once", values: ["n/a", "n/a", "n/a", "One", "Two"] },
    { label: "Pause or cancel", values: ["n/a", "n/a", "n/a", "Any month", "Any month"] },
  ];
}

export function getPricingFaqs(currency: CurrencyCode = DEFAULT_CURRENCY): Faq[] {
  const m = CURRENCIES[currency];
  return [
    {
      q: "Which one should I start with?",
      a: "If one specific thing is bothering you, the sprint. If the whole brand has fallen behind the business, the build. If the brand is right and you just need design done every month, the subscription. When in doubt, start with the sprint: the fee comes off whatever you do next.",
    },
    {
      q: "How does the sprint credit work?",
      a: creditRule,
    },
    {
      q: "Are there any other costs?",
      a: `No proposals, no quotes, no hourly billing. The prices on this page are the prices${m.taxSuffix ? ", plus VAT" : ""}. Third-party costs like printing, stock imagery or fonts are passed through at cost and agreed with you first.`,
    },
    {
      q: "How do I pay?",
      a: `Sprint: ${paymentTerms.sprint} Brand Build: ${paymentTerms.build} Subscription: ${paymentTerms.subscription}`,
    },
    {
      q: "Can I move between them?",
      a: "That's the idea. Most clients go sprint, then build, then subscription, or build then subscription. You can also pause a subscription to do a build and come back.",
    },
    {
      q: "What if I need more than Design Lead?",
      a: "Talk to us. For businesses with several brands or a high volume of campaign work we put together a custom arrangement, but it's still a fixed monthly figure, never hourly.",
    },
  ];
}

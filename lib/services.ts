/**
 * Service pages (MILKTREE-STUDIO.md §6.3). One entry per discipline the
 * studio sells. Each page shows what the service includes, the work that
 * proves it, and which product it's bought through. Pure data.
 */
import type { Faq, ProductId } from "@/lib/offer";
import type { DisciplineSlug } from "@/lib/taxonomy";

export type Service = {
  slug: DisciplineSlug;
  name: string;
  /** Short line for cards and nav. */
  tagline: string;
  /** H1 in the buyer's language, split into mask lines. */
  lines: string[];
  intro: string;
  includes: { title: string; body: string }[];
  /** Which products deliver this, in order of fit. */
  boughtThrough: { product: ProductId; how: string }[];
  faqs: Faq[];
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "brand-identity",
    name: "Brand identity",
    tagline: "The name, the mark, the system, the rules.",
    lines: ["A brand people", "recognise before", "they read the name."],
    intro:
      "Logo, colour, type and the rules that hold them together, built to work on a shopfront as well as a screen. This is what 200 businesses have bought from us, and it's the product we're best known for.",
    includes: [
      { title: "Positioning on a page", body: "Who you're for, what you stand for, the one line that explains you. Agreed before anything is drawn." },
      { title: "Logo system", body: "Primary mark, secondary lock-ups, icon, the versions that work at every size from a favicon to a fascia." },
      { title: "Colour and type", body: "A palette and a type system chosen for print and screen, with the accessibility maths done." },
      { title: "Imagery and tone", body: "How photography, illustration and copy should feel, so everything made later matches." },
      { title: "Guidelines", body: "A document your team, your printer and your web developer can all use without calling us." },
      { title: "Core applications", body: "The five things your business actually uses, designed: signage, vehicles, menus, cards, decks, whatever they are for you." },
    ],
    boughtThrough: [
      { product: "build", how: "The full identity, workshop to guidelines, in four to six weeks." },
      { product: "build-plus", how: "The identity plus the toolkit to launch it: ads, social, print and outdoor." },
      { product: "sprint", how: "An identity tighten-up: existing marks, colour and type brought back into line in two weeks." },
    ],
    faqs: [
      { q: "Do you do naming?", a: "Yes, as part of a Brand Build when the business needs it. We agree it in the workshop and it's covered by the fixed price." },
      { q: "We have a logo we like. Can you keep it?", a: "Often, yes. A Brand Reset Sprint tightens what you have; a Brand Build can keep a mark and rebuild the system around it. We'll tell you honestly which it needs." },
      { q: "What do we get at the end?", a: "Every file in every format, the guidelines, and a walkthrough with whoever will use them. It's all yours." },
    ],
    seoTitle: "Brand identity design — logo, colour, type and guidelines",
    seoDescription:
      "Brand identity from a UK studio that's built 200+ brands: positioning, logo system, colour, type, guidelines and the applications your business actually uses. Fixed price from £3,499.",
  },
  {
    slug: "campaigns",
    name: "Campaigns and social",
    tagline: "Ads, launches and a feed that looks like one brand.",
    lines: ["A campaign that", "looks like you", "on every channel."],
    intro:
      "Ad sets, launch creative and social systems that carry the brand instead of diluting it. Static and simple motion, sized for every placement, built so your team can keep it going.",
    includes: [
      { title: "Campaign concept", body: "One idea that works across the ad, the poster, the post and the shop window." },
      { title: "Ad sets", body: "Static and simple motion ads across the formats you run: Meta, Google, LinkedIn, out-of-home." },
      { title: "Social template packs", body: "Post, story and cover systems in Canva or Figma so the next month doesn't need us." },
      { title: "Launch creative", body: "Everything a launch needs: the announcement, the email, the press image, the internal deck." },
      { title: "Always-on content", body: "Monthly creative on subscription, briefed in a queue, back in around 48 hours." },
    ],
    boughtThrough: [
      { product: "essentials", how: "Month to month: ad variations, social packs, seasonal creative in your queue." },
      { product: "build-plus", how: "The launch toolkit that ships with a new identity." },
      { product: "design-lead", how: "A named designer who runs your campaigns with you on Slack." },
    ],
    faqs: [
      { q: "Do you run the ads?", a: "No. We design them. You or your media partner run them. We're happy to work directly with whoever does." },
      { q: "Motion?", a: "Simple motion, yes: animated statics, kinetic type, short loops. Full video production is out of scope." },
      { q: "How fast can we get variations?", a: "On subscription, standard requests come back in around 48 hours. A set of ad variations is one request." },
    ],
    seoTitle: "Campaign and social media design — ads, launches, templates",
    seoDescription:
      "Campaign creative, ad sets, launch assets and social template packs from a UK design studio. On subscription from £1,499 a month or as the launch toolkit with a Brand Build Plus.",
  },
  {
    slug: "web",
    name: "Web and product",
    tagline: "Pages that explain you in one sentence.",
    lines: ["A homepage that", "says what you do", "before they scroll."],
    intro:
      "Website and landing page design, to the pixel, for desktop and mobile. We design it; your developer or one of our partners builds it. If the homepage can't explain the business, this is where it gets fixed.",
    includes: [
      { title: "Homepage and key pages", body: "Structure, headline, sections, mobile. The page that has to do the most work, designed to do it." },
      { title: "Landing pages", body: "Single-purpose pages for campaigns and ads, built to convert, not to tour." },
      { title: "Design systems", body: "Components, spacing and type rules so the site stays consistent as it grows." },
      { title: "App and product UI", body: "Interfaces that carry the brand into the product, as we did for Remigo." },
      { title: "Developer handover", body: "Figma files, assets and a spec. We stay on the thread until it's live." },
    ],
    boughtThrough: [
      { product: "sprint", how: "The homepage sprint: your homepage redesigned in two weeks." },
      { product: "essentials", how: "Landing pages and new sections as requests in your queue." },
      { product: "build", how: "Web design as one of the core applications in a Brand Build." },
    ],
    faqs: [
      { q: "Do you build the site?", a: "We design it. Your developer or one of our partners builds it. If you don't have a developer, say so on the call and we'll introduce you." },
      { q: "Which platforms?", a: "Any. The design is platform-neutral; we've handed over to WordPress, Webflow, Shopify and custom builds." },
      { q: "Can you just fix the homepage?", a: "Yes. That's exactly what the Brand Reset Sprint is for. Two weeks, £799, files ready for your developer." },
    ],
    seoTitle: "Website and landing page design — homepage, landing pages, product UI",
    seoDescription:
      "Website, landing page and product UI design from a UK brand studio. Fix the homepage in a two-week sprint for £799, or design the whole site as part of a Brand Build.",
  },
  {
    slug: "print",
    name: "Print, packaging and outdoor",
    tagline: "Signage, packaging, menus, vehicles, billboards.",
    lines: ["The brand you", "can see from", "the street."],
    intro:
      "The part most design subscriptions can't do. Signage, packaging, menus, vehicle livery, exhibition and out-of-home, designed for the real world and handed to the printer ready to go. It's why the positioning line is what it is.",
    includes: [
      { title: "Signage and shopfronts", body: "Fascias, window vinyl, wayfinding, A-boards. Designed with the sign-maker's spec in hand." },
      { title: "Packaging", body: "Boxes, labels, sleeves, bags. Dielines, print-ready artwork, the unboxing considered." },
      { title: "Menus and print collateral", body: "Menus, brochures, business cards, stationery. The things customers hold." },
      { title: "Vehicles", body: "Van and fleet livery that turns every journey into an ad." },
      { title: "Out-of-home", body: "Billboards, bus stops, posters. The big, simple version of the brand." },
      { title: "Print management", body: "We'll brief and check the printer, or introduce ours. Third-party costs passed through at cost." },
    ],
    boughtThrough: [
      { product: "build-plus", how: "Print and outdoor are built into the Plus toolkit." },
      { product: "essentials", how: "Signage for the second site, a new menu, packaging for a new line: requests in your queue." },
      { product: "build", how: "Within the five core applications of a Brand Build." },
    ],
    faqs: [
      { q: "Do you handle the printing?", a: "We prepare print-ready artwork and can brief and check the printer, or introduce ours. Printing itself is a third-party cost, passed through at cost and agreed first." },
      { q: "Can you work with our sign company?", a: "Yes. Send us their spec and we design to it." },
      { q: "Is packaging a project or a request?", a: "A new packaging range is usually a Brand Build Plus deliverable. A single label or a variant is a subscription request." },
    ],
    seoTitle: "Signage, packaging and print design — brands you can see on the high street",
    seoDescription:
      "Signage, packaging, menus, vehicle livery and out-of-home from a UK design studio. Print-ready, designed to the printer's spec, part of a Brand Build Plus or on subscription.",
  },
  {
    slug: "decks",
    name: "Decks and collateral",
    tagline: "The pitch that matches the website.",
    lines: ["A deck that", "matches the", "business."],
    intro:
      "Pitch decks, sales collateral, proposals and the master templates behind them. Structured so the story lands, designed so it looks like the same company as the website, built so the next one holds.",
    includes: [
      { title: "Pitch and sales decks", body: "Up to 15 slides restructured and designed. The story first, then the slides." },
      { title: "Master templates", body: "PowerPoint, Keynote or Google Slides templates your team can use without breaking the brand." },
      { title: "Proposals and one-pagers", body: "The documents that go out after the meeting, designed to be read." },
      { title: "Investor and board decks", body: "Numbers presented clearly. Design that gets out of the way of the argument." },
      { title: "Sales collateral", body: "Brochures, case study sheets, spec sheets, broker kits." },
    ],
    boughtThrough: [
      { product: "sprint", how: "The deck sprint: your deck rebuilt in two weeks with a master template." },
      { product: "essentials", how: "New decks and collateral as requests in your queue." },
      { product: "build", how: "A deck template as one of the core applications." },
    ],
    faqs: [
      { q: "Do you write the deck?", a: "We structure it with you and tighten the copy. If it needs writing from scratch, tell us and we'll scope that honestly." },
      { q: "Which formats?", a: "PowerPoint, Keynote, Google Slides, Figma or Canva. Whatever your team actually uses." },
      { q: "How long does a deck take?", a: "A deck sprint is two weeks. On subscription, a deck is one request, usually back in two to four working days depending on length." },
    ],
    seoTitle: "Pitch deck and sales collateral design — decks that match the brand",
    seoDescription:
      "Pitch decks, sales collateral and master templates from a UK design studio. Rebuild your deck in a two-week sprint for £799, or keep decks flowing on subscription.",
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

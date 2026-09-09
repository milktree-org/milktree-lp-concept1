/**
 * "Who it's for" pages (MILKTREE-STUDIO.md §6.8). One template, one entry per
 * sector. An audience is only published when at least two case studies carry
 * its sector, so every page has real proof on it (docs/PRD.md 2.3).
 */
import type { ProductId } from "@/lib/offer";
import { SECTORS, type SectorSlug } from "@/lib/taxonomy";
import { workBySector, type WorkProject } from "@/lib/work";

export type Audience = {
  slug: SectorSlug;
  label: string;
  /** H1 in the sector's language, split into mask lines. */
  lines: string[];
  intro: string;
  /** The three symptoms, in this sector's words. */
  symptoms: { title: string; body: string }[];
  /** Where to start, and why. */
  start: { product: ProductId; why: string };
  /** Named clients for the eyebrow, in sector order. */
  clients: string;
  seoTitle: string;
  seoDescription: string;
};

export const audiences: Audience[] = [
  {
    slug: "hospitality",
    label: "Hospitality and food",
    lines: ["Menus, signage", "and a brand people", "photograph."],
    intro:
      "Restaurants, bars, cafés, food and drink brands. The brand is the thing on the wall, the menu in their hands and the box the pizza comes in. We've built it for Melt, AO, Latimers and Orange Rooms.",
    symptoms: [
      { title: "The menu doesn't match the room.", body: "A great fit-out, then a menu that looks like it came from a template. Customers notice, even if they can't say why." },
      { title: "The second site looks like a different place.", body: "Signage, uniforms and print drifted between openings. Consistency is what makes a group feel like a brand." },
      { title: "Nobody photographs it.", body: "In hospitality, the brand is marketing. If the interior, the packaging and the plate don't earn a photo, you're paying for reach you could have had free." },
    ],
    start: { product: "build-plus", why: "A hospitality brand lives in print and on the street. Plus includes the menus, signage and packaging from day one." },
    clients: "Melt · AO · Latimers · Orange Rooms",
    seoTitle: "Brand design for restaurants, bars and food brands",
    seoDescription:
      "Brand identity, menus, signage and packaging for restaurants, bars, cafés and food brands, from the UK studio behind Melt, AO and Latimers. Fixed prices from £799.",
  },
  {
    slug: "property-finance",
    label: "Property and finance",
    lines: ["Trust you can", "see from", "the street."],
    intro:
      "Mortgage brokers, estate agents, advisers and fintech. Trust is the product, and design is how it's signalled before anyone reads a word. Mint Mortgages and Remigo were built this way.",
    symptoms: [
      { title: "It looks like every other broker.", body: "Navy, a house icon, a stock photo of a family. When everyone signals safety the same way, nobody stands out." },
      { title: "The website says less than the office does.", body: "A good local reputation and a site that can't explain the service in one sentence. Referrals arrive, look, and hesitate." },
      { title: "Compliance ate the brand.", body: "Disclaimers and rules are real. They're also not an excuse for a deck that reads like two companies." },
    ],
    start: { product: "build", why: "A finance brand needs the positioning done properly before the identity. The workshop is where trust gets defined." },
    clients: "Mint Mortgages · Remigo",
    seoTitle: "Brand design for mortgage brokers, estate agents and fintech",
    seoDescription:
      "Brand identity, web and campaign design for brokers, agents, advisers and fintech, from the UK studio behind Mint Mortgages and Remigo. Fixed prices, no proposals.",
  },
  {
    slug: "trades",
    label: "Trades and construction",
    lines: ["A brand that", "wins the bigger", "contracts."],
    intro:
      "Roofers, builders, installers, renewables. The van, the site board and the proposal are the brand. Alltrad, EJW Concrete and Powerforce came to us to look like the size of contract they wanted.",
    symptoms: [
      { title: "The work is better than the brand.", body: "Twenty years of good jobs, and a logo made in an afternoon. Commercial buyers judge the brand before they see the work." },
      { title: "The van says one thing, the website another.", body: "Different logos on different years of vehicles. It reads as a business that isn't managed." },
      { title: "The proposal loses to a worse contractor.", body: "Because theirs looked like a company and yours looked like a quote. Tender documents are a design problem." },
    ],
    start: { product: "build-plus", why: "Trades brands are seen outdoors: vans, site boards, hi-vis. Plus puts them in the toolkit." },
    clients: "Alltrad · EJW Concrete · Powerforce",
    seoTitle: "Brand design for trades and construction businesses",
    seoDescription:
      "Brand identity, vehicle livery, site signage and web design for roofers, builders, installers and renewables firms, from the UK studio behind Alltrad, EJW and Powerforce.",
  },
  {
    slug: "retail",
    label: "Retail and consumer",
    lines: ["Packaging and", "campaigns that", "sell on sight."],
    intro:
      "Shops, products, drinks, consumer brands. Packaging, point of sale and campaigns that work at arm's length. EazyPhone went from identity to bus stops with us.",
    symptoms: [
      { title: "The packaging doesn't earn the shelf.", body: "The product is good; the box isn't doing the selling." },
      { title: "The campaign looks nothing like the store.", body: "Ads, windows and social made by different people in different years." },
      { title: "Growth outran the brand.", body: "One shop became five and the identity never caught up." },
    ],
    start: { product: "build-plus", why: "Retail is campaigns, packaging and print. Plus is the version built for it." },
    clients: "EazyPhone",
    seoTitle: "Brand design for retail and consumer brands",
    seoDescription:
      "Brand identity, packaging, point of sale and campaign design for shops and consumer brands, from the UK studio behind EazyPhone.",
  },
  {
    slug: "automotive",
    label: "Automotive",
    lines: ["From the", "forecourt to", "the motorway."],
    intro:
      "Dealers, leasing, fleet, aftermarket. The brand is on the vehicle, the forecourt sign and the finance deck. FlexiBuy Vans and Mailmans are Milktree brands.",
    symptoms: [
      { title: "The forecourt and the website disagree.", body: "One was done in 2016, the other last year." },
      { title: "The fleet livery doesn't match anything.", body: "Every vehicle an ad, none of them the same ad." },
      { title: "The finance deck looks like a spreadsheet.", body: "The biggest decisions get the least design." },
    ],
    start: { product: "build-plus", why: "Vehicles and forecourts are outdoor media. Plus includes them." },
    clients: "FlexiBuy Vans · Mailmans",
    seoTitle: "Brand design for automotive businesses",
    seoDescription:
      "Brand identity, vehicle livery, forecourt signage and campaign design for dealers, leasing and fleet businesses, from a UK studio.",
  },
  {
    slug: "health",
    label: "Health and aesthetics",
    lines: ["Clinical trust,", "considered", "design."],
    intro:
      "Clinics, practices, aesthetics, wellbeing. Patients decide whether to trust you from the website and the front desk. Design has to feel calm, precise and expensive without saying so.",
    symptoms: [
      { title: "It looks like a spa or a hospital. Neither is right.", body: "Aesthetics brands fall into one of two clichés. The good ones don't." },
      { title: "The before-and-afters carry the whole brand.", body: "Results matter. They shouldn't be the only thing that looks considered." },
      { title: "Every leaflet is a different brand.", body: "Treatment menus, aftercare sheets, price lists: each one a fresh start." },
    ],
    start: { product: "build", why: "Health brands need positioning first: who you're for and how you're different from the clinic down the road." },
    clients: "Clinics and practices",
    seoTitle: "Brand design for clinics, practices and aesthetics brands",
    seoDescription:
      "Brand identity, print and web design for clinics, practices and aesthetics businesses, from a UK design studio. Fixed prices, no proposals.",
  },
];

export type PublishedAudience = Audience & { work: WorkProject[] };

/** Only audiences with at least two case studies get a page (PRD 2.3). */
export function getPublishedAudiences(): PublishedAudience[] {
  return audiences
    .map((a) => ({ ...a, work: workBySector(a.slug) }))
    .filter((a) => a.work.length >= 2);
}

export function getAudience(slug: string): PublishedAudience | undefined {
  return getPublishedAudiences().find((a) => a.slug === slug);
}

export function isPublishedAudience(slug: SectorSlug): boolean {
  return getPublishedAudiences().some((a) => a.slug === slug);
}

export { SECTORS };

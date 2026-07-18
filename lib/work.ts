/**
 * Case-study data for the proof grid (§3.9) and the /work/[slug] pages.
 * All imagery is real Milktree work living in /public/work.
 *
 * `gallery` is a list of rows: one image = full-width moment, two images =
 * a split pair (used for the portrait strip crops). Every image carries its
 * own descriptive alt text for accessibility and image SEO.
 */
export type GalleryImage = {
  src: string;
  alt: string;
};

export type WorkProject = {
  slug: string;
  title: string;
  category: string;
  /** Card image for the 9-up proof grid. */
  poster: string;
  /** Full-bleed opening image on the case page. */
  hero: string;
  /** Display headline on the case page — one confident sentence. */
  headline: string;
  intro: string;
  /** Meta description — ≤155 chars, keyword-aware, no template suffix. */
  seoDescription: string;
  /** Case-study narrative — rendered as Challenge / Approach / Outcome. */
  challenge: string;
  approach: string;
  outcome: string;
  services: string[];
  gallery: GalleryImage[][];
};

export const workProjects: WorkProject[] = [
  {
    slug: "eazyphone",
    title: "EazyPhone",
    category: "Brand Identity",
    poster: "/work/portfolio/eazyphone-identity.webp",
    hero: "/work/portfolio/eazyphone-identity.webp",
    headline:
      "Refurbished tech, rebuilt trust. An identity that makes second-hand feel first-rate.",
    intro:
      "EazyPhone sells refurbished phones in a market full of grey-market resellers and broken promises. The brand had to do the heavy lifting: clean, confident and consistent everywhere a customer meets it — from the bus stop to the box in their hands.",
    seoDescription:
      "Brand identity for EazyPhone: a full identity system, guidelines and out-of-home rollout that makes refurbished tech feel first-rate. A Milktree case study.",
    challenge:
      "Refurbished tech carries baggage. Buyers assume scratched screens, dead batteries and warranties that evaporate the moment something goes wrong. EazyPhone's product was genuinely better than the market's reputation, but its brand looked like everyone else's — and in a category built on doubt, looking generic reads as untrustworthy.",
    approach:
      "We built the identity around one idea: make second-hand feel first-rate. A clean, confident mark, a tight palette and typography with the polish of a flagship launch, not a clearance bin. Then we systemised it — guidelines covering every touchpoint, from billboards and bus stops to lanyards, business cards and the unboxing itself — so the brand holds its nerve wherever a customer meets it.",
    outcome:
      "EazyPhone now walks into the market looking like the category leader rather than another reseller. One consistent system runs from out-of-home to the box in the customer's hands, and every new piece of collateral starts from the guidelines instead of a blank page.",
    services: ["Brand identity", "Guidelines", "Retail & out-of-home", "Print collateral"],
    gallery: [
      [
        {
          src: "/work/portfolio/eazyphone-billboard.webp",
          alt: "EazyPhone billboard advertising refurbished phones with the new brand identity",
        },
      ],
      [
        {
          src: "/work/portfolio/eazyphone-cards.webp",
          alt: "EazyPhone business cards and stationery in the new visual identity",
        },
      ],
      [
        {
          src: "/work/strip/eazyphone-posters.webp",
          alt: "EazyPhone poster campaign displayed in a city environment",
        },
        {
          src: "/work/strip/eazyphone-billboard.webp",
          alt: "EazyPhone out-of-home billboard creative at street level",
        },
      ],
      [
        {
          src: "/work/portfolio/eazyphone-busstop.webp",
          alt: "EazyPhone bus stop advertising panel with brand campaign creative",
        },
      ],
      [
        {
          src: "/work/portfolio/eazyphone-lanyards.webp",
          alt: "EazyPhone branded lanyards and staff collateral",
        },
      ],
    ],
  },
  {
    slug: "saints-foundation",
    title: "Saints Foundation",
    category: "Event Branding",
    poster: "/work/portfolio/saints-raffle-card.webp",
    hero: "/work/portfolio/saints-stage.webp",
    headline:
      "A night worth dressing up for. Event branding for Southampton FC's annual charity dinner.",
    intro:
      "Saints Foundation is Southampton FC's official charity, and its annual charity dinner is the fundraising centrepiece of the year. We designed the entire event world — from the main-stage backdrop at St Mary's to the programme in every guest's hands — one system carrying the night from the stairwell to the silent auction.",
    seoDescription:
      "Event branding for the Saints Foundation Charity Dinner at Southampton FC: stage design, programmes, auction collateral and venue graphics. By Milktree.",
    challenge:
      "A charity dinner has one night to justify a year of asking. Every touchpoint — the invitation, the stairs on the way in, the programme at the place setting, the auction card that opens wallets — has to feel like one considered occasion, not a stack of separate print jobs. And it all had to sit respectfully alongside Southampton FC's crest and a wall of event partners without turning into a logo soup.",
    approach:
      "We built a sharp event identity around the club's black and red: a signature radiating-lines motif, condensed display type and a strict layout system with a clean partner band. Then we rolled it across everything the night needed — main-stage and screen graphics, spiral-bound programmes, live and silent auction collateral, welcome cards, raffle packs, stair graphics and the media wall — so a guest met the same brand from the car park to the last lot of the auction.",
    outcome:
      "The dinner looked like a flagship club event rather than a function room with banners. Guests moved through one continuous brand from arrival to auction, partners got the considered placement they'd paid for, and the Foundation got an event system it can evolve for every year that follows.",
    services: ["Event branding", "Print & programmes", "Stage & screen graphics", "Venue graphics"],
    gallery: [
      [
        {
          src: "/work/portfolio/saints-programme-cover.webp",
          alt: "Saints Foundation Charity Dinner 2024 event programme cover with radiating-lines motif",
        },
      ],
      [
        {
          src: "/work/portfolio/saints-welcome-card.webp",
          alt: "Saints Foundation welcome card clipped to the charity dinner live auction programme",
        },
        {
          src: "/work/portfolio/saints-raffle-card.webp",
          alt: "Saints Foundation table raffle and mystery box entry card in the event identity",
        },
      ],
      [
        {
          src: "/work/portfolio/saints-media-wall.webp",
          alt: "Saints Foundation Charity Dinner media wall with repeating partner logos",
        },
      ],
      [
        {
          src: "/work/portfolio/saints-stair-graphics.webp",
          alt: "Branded stair graphics welcoming guests to the Saints Foundation Charity Dinner",
        },
      ],
      [
        {
          src: "/work/portfolio/saints-auction-flyers.webp",
          alt: "Saints Foundation live auction flyers listing prize lots for the charity dinner",
        },
        {
          src: "/work/portfolio/saints-dinner-room.webp",
          alt: "The Saints Foundation Charity Dinner room at St Mary's dressed in the event branding",
        },
      ],
      [
        {
          src: "/work/portfolio/saints-programme-spread.webp",
          alt: "Saints Foundation spiral-bound programme spread with silent auction QR code and welcome message",
        },
      ],
      [
        {
          src: "/work/portfolio/saints-programmes-fan.webp",
          alt: "Fanned stack of Saints Foundation Charity Dinner event programmes",
        },
      ],
    ],
  },
  {
    slug: "mint-mortgages",
    title: "Mint Mortgages",
    category: "Brand & Campaign",
    poster: "/work/portfolio/mint-simplifying.webp",
    hero: "/work/portfolio/mint-simplifying.webp",
    headline:
      "Mortgages, minus the migraine. A brand that makes buying a home feel simple.",
    intro:
      "Mortgage brokers all sound the same. Mint's brand and always-on campaign system cut through with plain language and a fresh visual world — one system flexible enough to run from broker kits to city billboards without losing its voice.",
    seoDescription:
      "Brand and campaign system for Mint Mortgages: plain-spoken creative that runs from broker kits to city billboards. A Milktree case study.",
    challenge:
      "Every mortgage broker promises the same things in the same voice: rates, jargon and stock-photo families on doorsteps. Mint needed to sound like a human in a category that sounds like a call centre — and it needed a system that could keep that voice consistent across an always-on campaign, not just one launch moment.",
    approach:
      "We stripped the language back to how people actually talk about buying a home, then built a fresh visual world around it — a distinctive palette, confident type and photography with warmth instead of gloss. The system was engineered for flexibility from day one: the same voice and toolkit runs from broker welcome kits and rate cards up to city billboards without drifting off-brand.",
    outcome:
      "Mint now owns a voice its competitors can't borrow. The always-on system means every new campaign starts from an established world rather than a rebrief, and the brand reads as clearly on a broker's desk as it does across a street.",
    services: ["Brand identity", "Campaign system", "Out-of-home", "Broker collateral"],
    gallery: [
      [
        {
          src: "/work/portfolio/mint-billboard.webp",
          alt: "Mint Mortgages city billboard with plain-spoken campaign headline",
        },
      ],
      [
        {
          src: "/work/strip/mint-keys-moment.webp",
          alt: "Mint Mortgages campaign photography of new homeowners holding keys",
        },
        {
          src: "/work/portfolio/mint-keys.webp",
          alt: "Mint Mortgages brand creative featuring house keys",
        },
      ],
      [
        {
          src: "/work/portfolio/mint-broker.webp",
          alt: "Mint Mortgages broker kit and printed collateral",
        },
      ],
    ],
  },
  {
    slug: "zillwoods",
    title: "Zillwoods",
    category: "Brand Identity",
    poster: "/work/portfolio/zillwoods-cards.webp",
    hero: "/work/portfolio/zillwoods-cards.webp",
    headline:
      "Craft in every corner. An identity as considered as the joinery it stands for.",
    intro:
      "Zillwoods makes bespoke joinery for people who notice the details. The identity matches that standard — a quietly confident mark, tactile print and storefront signage that earns a second look.",
    seoDescription:
      "Brand identity for Zillwoods bespoke joinery: a quietly confident mark, tactile print and storefront signage. A Milktree case study.",
    challenge:
      "Zillwoods' clients commission joinery precisely because they notice details most people miss. The old brand didn't survive that level of scrutiny — and for a craft business, a brand that's less considered than the work quietly tells customers the standard is negotiable.",
    approach:
      "We designed to the same tolerance as the workshop. A quietly confident mark with nothing superfluous, a type system with genuine craft in its spacing and weight, and materials chosen to be touched — tactile print stock, considered finishing, storefront signage that rewards the second look its customers instinctively give. Restraint was the strategy: the identity frames the joinery instead of competing with it.",
    outcome:
      "The brand now passes the same inspection the joinery does. Customers meet the standard of the workshop before they've stepped inside it, from the business card to the storefront.",
    services: ["Brand identity", "Print", "Storefront signage"],
    gallery: [
      [
        {
          src: "/work/strip/zillwoods-storefront.webp",
          alt: "Zillwoods bespoke joinery storefront with the new brand signage",
        },
      ],
    ],
  },
  {
    slug: "powerforce",
    title: "Powerforce",
    category: "Brand & Print",
    poster: "/work/portfolio/powerforce-stationery.webp",
    hero: "/work/portfolio/powerforce-stationery.webp",
    headline:
      "Industrial power, sharpened. An identity for the workforce behind the turbines.",
    intro:
      "Powerforce supplies skilled labour to the renewables sector — serious work that deserved better than clip-art hard hats. A stripped-back industrial identity, applied with precision across stationery, print and site collateral.",
    seoDescription:
      "Brand identity for Powerforce: a stripped-back industrial system for a renewables workforce supplier, from stationery to site collateral. By Milktree.",
    challenge:
      "Labour supply to the renewables sector is a serious, safety-critical business, but the category's branding runs on clip-art hard hats and gradient swooshes. Powerforce was pitching to major energy contractors while looking like a job board — the brand was actively working against the calibre of the workforce behind it.",
    approach:
      "We stripped everything back to industrial fundamentals: a hard-edged mark, utilitarian type and a restrained palette that borrows its confidence from engineering rather than marketing. Then we applied it with precision across the touchpoints that matter in this sector — stationery, tender print, posters and site collateral — where consistency itself signals operational discipline.",
    outcome:
      "Powerforce now looks like the standard of workforce it supplies. The identity holds its own alongside the major contractors it pitches to, and every printed piece reinforces the same message: serious people, serious work.",
    services: ["Brand identity", "Print", "Stationery"],
    gallery: [
      [
        {
          src: "/work/portfolio/powerforce-turbine.webp",
          alt: "Powerforce brand creative featuring a wind turbine",
        },
      ],
      [
        {
          src: "/work/strip/powerforce-poster.webp",
          alt: "Powerforce industrial brand poster",
        },
        {
          src: "/work/portfolio/powerforce-card.webp",
          alt: "Powerforce business card in the stripped-back industrial identity",
        },
      ],
    ],
  },
  {
    slug: "ejw-concrete",
    title: "EJW Concrete",
    category: "Campaign",
    poster: "/work/portfolio/ejw-cinema.webp",
    hero: "/work/portfolio/ejw-cinema.webp",
    headline:
      "Built to last, branded to match. Campaign creative poured with confidence.",
    intro:
      "EJW pours the foundations other trades build on. The campaign leaned into that permanence — heavyweight type, honest photography and a line that does what concrete does: hold.",
    seoDescription:
      "Campaign creative for EJW Concrete: heavyweight type, honest photography and out-of-home built around permanence. A Milktree case study.",
    challenge:
      "Concrete is the least glamorous trade on any site and the one everything else depends on. EJW's work was literally foundational, but its marketing was invisible — and in a sector where reputation travels by word of mouth, the company had no creative asset making the case for it at scale.",
    approach:
      "We leaned into what concrete actually means: permanence. Heavyweight typography that feels poured rather than printed, honest photography of real work in real light, and a campaign line built to hold — 'built to last' as both promise and proof. The creative rolled out across cinema-scale out-of-home, site flags and brand collateral, all carrying the same unshakeable weight.",
    outcome:
      "EJW now has a campaign presence with the same permanence as its product. The creative works as hard on a flag beside the pour as it does on a large-format display, and the brand finally matches the reputation the work built.",
    services: ["Campaign creative", "Out-of-home", "Brand collateral"],
    gallery: [
      [
        {
          src: "/work/portfolio/ejw-builttolast.webp",
          alt: "EJW Concrete 'built to last' campaign creative at cinematic scale",
        },
      ],
      [
        {
          src: "/work/strip/ejw-flags.webp",
          alt: "EJW Concrete branded flags on a construction site",
        },
      ],
    ],
  },
  {
    slug: "baya-vodka-soda",
    title: "Baya Vodka Soda",
    category: "Brand & Packaging",
    poster: "/work/portfolio/baya-posters.webp",
    hero: "/work/portfolio/baya-posters.webp",
    headline:
      "Crisp brand, crisper cans. Identity and packaging for a better vodka soda.",
    intro:
      "Baya had a better recipe and a crowded shelf to win. The brand went bold and simple — a punchy identity carried onto cans and posters that read from across the room, not just across the bar.",
    seoDescription:
      "Brand identity and packaging for Baya Vodka Soda: bold cans and posters built to win a crowded shelf. A Milktree case study.",
    challenge:
      "Ready-to-drink is one of the most crowded shelves in retail, and every can is fighting for a glance that lasts under a second. Baya had the better recipe, but recipes don't win fridges — the brand had to do it, at arm's length, in bad lighting, against a wall of competitors shouting in pastel.",
    approach:
      "We went bold and simple where the category goes busy. A punchy identity with one big idea per surface, colour that owns its shelf position, and typography sized to read from across the room rather than across the bar. The same system carries from can to poster to point of sale, so every appearance compounds recognition instead of restarting it.",
    outcome:
      "Baya now gets picked up before it gets read. The cans hold their own on a crowded shelf, the posters work at a glance, and the brand gives a better recipe the first impression it deserved.",
    services: ["Brand identity", "Packaging", "Poster campaign"],
    gallery: [
      [
        {
          src: "/work/strip/baya-cans.webp",
          alt: "Baya Vodka Soda cans in the bold new packaging design",
        },
      ],
    ],
  },
  {
    slug: "salesprout",
    title: "SaleSprout",
    category: "Brand & Signage",
    poster: "/work/portfolio/salesprout-signage.webp",
    hero: "/work/portfolio/salesprout-signage.webp",
    headline:
      "Growth you can see from the street. Signage and out-of-home for a sales team on the up.",
    intro:
      "SaleSprout builds outbound sales engines for B2B companies. Its own brand had to look like the growth it sells — a fresh, energetic system rolled out across office signage, rooftop displays and city billboards.",
    seoDescription:
      "Brand and signage for SaleSprout: a fresh, energetic system across office signage, rooftop displays and city billboards. A Milktree case study.",
    challenge:
      "SaleSprout sells growth — outbound engines that fill B2B pipelines — but its own brand didn't look like it was growing. For a company whose product is confidence, an anonymous visual identity was a credibility gap every prospect could see before the first call.",
    approach:
      "We built a system with the energy of a sales floor on a good month: a fresh palette, an optimistic mark and typography that moves. Then we put it where growth gets noticed — office signage, rooftop displays and city billboards — turning SaleSprout's own premises and skyline presence into the case study it pitches with.",
    outcome:
      "SaleSprout's brand now makes the argument before the sales team does. The identity reads as a company on the up from street level, and the signage system scales with each new office rather than being redesigned for it.",
    services: ["Brand identity", "Signage", "Out-of-home"],
    gallery: [
      [
        {
          src: "/work/portfolio/salesprout-billboard.webp",
          alt: "SaleSprout city billboard in the new energetic brand system",
        },
      ],
      [
        {
          src: "/work/strip/salesprout-rooftop.webp",
          alt: "SaleSprout rooftop signage display above the city skyline",
        },
      ],
    ],
  },
  {
    slug: "alltrad-roofing",
    title: "Alltrad Roofing",
    category: "Brand Identity",
    poster: "/work/portfolio/alltrad-ooh.webp",
    hero: "/work/portfolio/alltrad-ooh.webp",
    headline:
      "A mark built to endure. An identity that holds from a business card to a scaffold banner.",
    intro:
      "Alltrad wins commercial roofing contracts against firms twice its size. It needed a brand system with the same structural confidence as the work — a bold mark, a tight palette, and collateral that looks at home on site and in the boardroom.",
    seoDescription:
      "Brand identity for Alltrad Roofing: a bold mark, tight brand system and signage built to win commercial contracts. A Milktree case study.",
    challenge:
      "Alltrad was beating firms twice its size on the work, then losing ground on first impressions. Commercial roofing tenders are decided in boardrooms long before anyone visits a site, and a brand that looked like a local trade outfit was undercutting the company's real capability.",
    approach:
      "We designed a mark with the same structural confidence as the roofing itself — heavy, geometric and legible at any distance. A disciplined palette and type system carries it from business cards and tender documents up to scaffold banners, site flags and vehicle livery, so the brand reads identically whether a client meets it on site or across a boardroom table.",
    outcome:
      "Alltrad now presents at the scale it competes at. The same system that flies on a scaffold banner sits comfortably on a contract cover page, and the brand no longer needs explaining before the work can speak.",
    services: ["Brand identity", "Brand system", "Signage", "Out-of-home"],
    gallery: [
      [
        {
          src: "/work/portfolio/alltrad-billboard.webp",
          alt: "Alltrad Roofing billboard with the new brand identity",
        },
      ],
      [
        {
          src: "/work/strip/alltrad-flags.webp",
          alt: "Alltrad Roofing branded site flags flying on location",
        },
        {
          src: "/work/portfolio/alltrad-card.webp",
          alt: "Alltrad Roofing business card in the new brand system",
        },
      ],
      [
        {
          src: "/work/portfolio/alltrad-swatches.webp",
          alt: "Alltrad Roofing brand colour palette and material swatches",
        },
      ],
    ],
  },
];

export function getWorkProject(slug: string): WorkProject | undefined {
  return workProjects.find((p) => p.slug === slug);
}

export function getNextWorkProject(slug: string): WorkProject {
  const i = workProjects.findIndex((p) => p.slug === slug);
  return workProjects[(i + 1) % workProjects.length];
}

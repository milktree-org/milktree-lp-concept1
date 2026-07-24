/**
 * Brand Score document — curated content library. Pure data, safe for client
 * and server. Every document merges this sector-specific writing with the
 * lead's live data (score, answers, benchmark competitors), so each PDF reads
 * bespoke without any AI dependency.
 *
 * Voice: confident, premium, plain-spoken. Short lines. No hype, no
 * exclamation marks, no fabricated statistics.
 */

import type { QuizCategory, SectorValue } from "@/lib/quiz";

/* --------------------------------- Types ---------------------------------- */

export type LeaderMove = {
  title: string;
  detail: string;
};

export type SectorPlaybook = {
  /** Short display name used in headings ("construction", "software"). */
  noun: string;
  /** How buying actually works in this market. Sets up why brand matters. */
  marketIntro: string;
  /** What the brands winning this sector consistently do. */
  leaderMoves: LeaderMove[];
  /** Channel-by-channel: what good looks like for this sector. */
  channelPlays: { website: string; social: string; search: string };
  /** The gap most firms in this sector miss. The "aha" line. */
  positioningInsight: string;
};

export type CategoryInsight = {
  /** Why this category moves revenue, not just aesthetics. */
  why: string;
  /** What the leaders do differently. */
  leaders: string;
  /** The fastest meaningful improvement. */
  quickWin: string;
};

export type RoadmapPhase = {
  label: string;
  window: string;
  focus: string;
  items: string[];
};

/* --------------------------- Sector playbooks ----------------------------- */

export const SECTOR_PLAYBOOKS: Record<SectorValue, SectorPlaybook> = {
  construction: {
    noun: "construction and trades",
    marketIntro:
      "Construction is bought on trust before it is bought on price. Clients are committing serious money to people they have usually never met, so every signal of professionalism gets weighed: the van, the quote document, the website, the reviews. In a market where most firms look interchangeable, the ones that look organised win the tender conversations before they start.",
    leaderMoves: [
      {
        title: "They look as good as their work",
        detail:
          "Leading firms photograph every finished project properly and build their brand around real results, not stock imagery. The portfolio does the selling.",
      },
      {
        title: "Their paperwork is branded end to end",
        detail:
          "Quotes, invoices, site boards and vehicle livery all match. A client who sees the same identity five times starts to assume scale and reliability.",
      },
      {
        title: "They own their reviews",
        detail:
          "Market leaders actively harvest Google reviews after every job and respond to all of them. Review count is the first credibility filter for local search.",
      },
      {
        title: "They publish their process",
        detail:
          "Leaders explain how a project runs, step by step, in plain language. It removes the fear of the unknown that loses most residential and commercial bids.",
      },
      {
        title: "They niche visibly",
        detail:
          "The strongest brands lead with a specialism, whether heritage restoration, design and build, or commercial fit-out, rather than claiming to do everything.",
      },
    ],
    channelPlays: {
      website:
        "A project gallery with real photography, clear service pages and visible accreditations. The strongest sites make the first quote conversation feel already halfway done.",
      social:
        "Before and after content, site progress and team culture. Construction is one of the most visual trades there is, and the leaders treat every project as content.",
      search:
        "Local search decides this sector. A complete Google Business Profile, service plus area pages and steady reviews put firms on the map pack where the calls come from.",
    },
    positioningInsight:
      "Most construction brands compete on capability. The leaders compete on certainty: they look like the firm that turns up, communicates and finishes. That perception is built almost entirely by brand and it commands a premium.",
  },

  "professional-services": {
    noun: "professional services",
    marketIntro:
      "In professional services the product is invisible until after the sale, so buyers judge everything they can see: the website, the proposal, the LinkedIn presence, the deck sent before the first meeting. Referrals still open doors, but the firm's brand decides whether the referral converts and at what fee level.",
    leaderMoves: [
      {
        title: "They productise their expertise",
        detail:
          "Leading firms package what they do into named services with clear outcomes and clear pricing signals, rather than selling undifferentiated hours.",
      },
      {
        title: "Their thought leadership is designed",
        detail:
          "Insights, reports and newsletters carry consistent, confident design. The content earns attention and the presentation earns the fee.",
      },
      {
        title: "Partner brands and firm brand match",
        detail:
          "Leaders make sure the firm looks as sharp as its best-known people. Decks, bios and LinkedIn banners are templated so nothing goes out looking homemade.",
      },
      {
        title: "They make proof visible",
        detail:
          "Case studies with named clients and specific numbers, not logo walls alone. Buyers of expertise want evidence, and leaders design it to be skimmed.",
      },
      {
        title: "They stay visibly current",
        detail:
          "A brand refresh every few years signals a firm that is growing. Dated visual identity quietly suggests dated thinking, which is fatal in advisory work.",
      },
    ],
    channelPlays: {
      website:
        "Clarity over cleverness: who you serve, the problems you solve and proof. The best sites read like the first ten minutes of a great discovery call.",
      social:
        "LinkedIn is the channel. Leaders run consistent, branded content from both the firm page and key partners, and the design quality signals the fee bracket.",
      search:
        "Winning firms own their specialism plus location terms and publish genuinely useful answers to the questions clients ask before engaging anyone.",
    },
    positioningInsight:
      "Fees follow perception. Two firms with identical expertise can sit a full price tier apart purely on how credibly they present. In this sector, brand is not marketing overhead, it is pricing power.",
  },

  ecommerce: {
    noun: "e-commerce and retail",
    marketIntro:
      "E-commerce is the most brand-exposed sector there is. Shoppers compare you against the best store they have ever used, not just your direct rivals, and they decide in seconds. Paid traffic costs keep rising, so the winners are the brands that convert more of every click and get customers back a second and third time.",
    leaderMoves: [
      {
        title: "Their brand survives the feed",
        detail:
          "Leading stores have identities strong enough to be recognised in a thumb-speed scroll: distinctive colour, type and art direction across every ad and post.",
      },
      {
        title: "Product photography is the brand",
        detail:
          "Leaders invest in consistent, elevated product and lifestyle imagery. It is the single biggest conversion lever on site and in ads.",
      },
      {
        title: "They design the full journey",
        detail:
          "Packaging, unboxing, inserts and post-purchase email all carry the brand. Repeat rate is where e-commerce margin lives, and the leaders design for it.",
      },
      {
        title: "Creative volume without drift",
        detail:
          "Winning stores ship a constant stream of ad creative from a tight system of templates, so testing stays fast and everything still looks like them.",
      },
      {
        title: "They tell one story everywhere",
        detail:
          "Site, ads, email and marketplace listings say the same thing in the same voice. Mixed messages measurably leak conversion.",
      },
    ],
    channelPlays: {
      website:
        "Fast, visual, ruthlessly clear product pages with strong photography and social proof at the point of decision. Every extra second of confusion is abandoned revenue.",
      social:
        "Leaders behave like media brands: entertaining, consistent, distinctly art-directed. Organic builds the taste, paid amplifies whatever proves it converts.",
      search:
        "Category and product terms plus strong shopping feed presence. Brand searches are the health metric: leaders grow the number of people searching for them by name.",
    },
    positioningInsight:
      "In e-commerce, a distinctive brand is a cost advantage. It raises conversion, drives direct and repeat traffic, and lowers the ad spend needed for every sale. Generic stores rent their customers; branded stores own them.",
  },

  "food-drink": {
    noun: "food and drink",
    marketIntro:
      "Food and drink is bought with the eyes first, whether on a shelf, a delivery app or an Instagram feed. Taste keeps customers, but brand is what gets the first order, the listing conversation and the price point. This sector rewards personality more than almost any other.",
    leaderMoves: [
      {
        title: "Packaging works as hard as advertising",
        detail:
          "Leading brands treat pack design as their primary media channel. Distinctive packaging earns shelf standout, social shares and buyer meetings on its own.",
      },
      {
        title: "They have a voice, not just a logo",
        detail:
          "The category leaders sound like someone: witty, honest, obsessive, wherever they sit. Tone of voice does heavy lifting on pack, in captions and on menus.",
      },
      {
        title: "Appetite appeal is non-negotiable",
        detail:
          "Winning brands invest in proper food and drink photography. Nothing undoes a premium position faster than product shots that look homemade.",
      },
      {
        title: "They build rituals and moments",
        detail:
          "Leaders attach their product to occasions and repeatable moments, which turns single purchases into habits and gives content a reason to exist.",
      },
      {
        title: "Consistency from pack to post",
        detail:
          "The same colours, type and personality run from packaging to social to point of sale, so every touchpoint compounds recognition.",
      },
    ],
    channelPlays: {
      website:
        "Personality-first design with strong photography, a clear stockist or order path, and a story page buyers can lift straight into a listing pitch.",
      social:
        "Instagram and TikTok decide discovery. Leaders post appetite-appeal content with a recognisable style, and their best performing content becomes their ads.",
      search:
        "Category terms, local discovery for venues and a Google Business Profile kept current. For products, strong presence on the retail and delivery platforms where the sector actually converts.",
    },
    positioningInsight:
      "In food and drink the product gets you tried and the brand gets you chosen. Buyers and consumers both pay more for a brand with personality, and personality is a design decision, not a budget line.",
  },

  "health-beauty": {
    noun: "health and beauty",
    marketIntro:
      "Health and beauty customers are buying a promise about themselves, so trust and aspiration carry the sale. The market is crowded and visually literate; customers can spot a template brand instantly. Premium positioning here is built almost entirely through design, photography and consistency.",
    leaderMoves: [
      {
        title: "They look clinical or they look luxury",
        detail:
          "Leaders pick a clear aesthetic lane, evidence-led or indulgence-led, and commit completely. Brands stuck between the two read as neither trustworthy nor desirable.",
      },
      {
        title: "Before and after proof, beautifully presented",
        detail:
          "Results content is the sector's strongest asset and the leaders design it carefully: consistent framing, real clients, claims kept honest.",
      },
      {
        title: "Founders and practitioners are visible",
        detail:
          "Faces build trust in a sector full of anonymous products. Leading brands design their people into the identity rather than hiding behind it.",
      },
      {
        title: "Every surface feels considered",
        detail:
          "Treatment menus, booking confirmations, aftercare cards and packaging all match. The brand experience is part of the treatment.",
      },
      {
        title: "They refresh before they date",
        detail:
          "Beauty aesthetics move fast. Leaders evolve their look every couple of years so they always read as current, which in this sector means credible.",
      },
    ],
    channelPlays: {
      website:
        "Aspirational imagery, effortless booking or purchase, and proof close to every call to action. The site has to feel like the result the customer wants.",
      social:
        "Instagram is the shop window. Leaders run a designed grid, results content and personal presence, with a visual standard that matches their price point.",
      search:
        "Treatment and product terms plus local intent for clinics and salons. Reviews and a complete Google profile decide who gets the high-intent bookings.",
    },
    positioningInsight:
      "Customers in this sector cannot evaluate your actual expertise before buying, so they evaluate your presentation instead. The brand that looks the most professional is assumed to be the most skilled. Perception is the product.",
  },

  "fitness-wellness": {
    noun: "fitness and wellness",
    marketIntro:
      "Fitness and wellness brands sell transformation and belonging. People join the version of themselves they want to become, and they stay for the community. The leaders understand they are lifestyle brands first and facilities or programmes second.",
    leaderMoves: [
      {
        title: "They brand the identity, not the equipment",
        detail:
          "Leading operators sell what members become. Photography, language and design centre on people and progress rather than machines and studios.",
      },
      {
        title: "Community is designed, not accidental",
        detail:
          "Merch people actually wear, member spotlights, event branding. The leaders give their community badges of belonging and it becomes their acquisition engine.",
      },
      {
        title: "Coaches are content",
        detail:
          "The strongest brands build their trainers and practitioners into recognisable faces with consistent, branded content formats.",
      },
      {
        title: "Proof over promises",
        detail:
          "Real member results presented in a repeatable, designed format beat generic motivation content everywhere it matters.",
      },
      {
        title: "The physical space matches the feed",
        detail:
          "Signage, interiors and class materials carry the same identity as the Instagram grid, so the first visit confirms the promise instead of breaking it.",
      },
    ],
    channelPlays: {
      website:
        "Clear membership or programme paths, real photography of real members, and a trial offer that is impossible to miss.",
      social:
        "Instagram and TikTok drive discovery through workout content, member stories and coach personalities, all in a recognisable visual system.",
      search:
        "Local intent rules: gym, studio and class terms plus area. Google reviews and a complete profile with current photos win the comparison moment.",
    },
    positioningInsight:
      "People screenshot the brand they want to join. If your visual identity does not look like a lifestyle worth belonging to, price becomes your only lever, and the boutique operator down the road wins on identity.",
  },

  property: {
    noun: "property and real estate",
    marketIntro:
      "Property transactions are the biggest financial decisions most clients ever make, and they choose partners accordingly. This sector runs on perceived establishment: the brand that looks most credible and most successful attracts the best instructions and the strongest covenants.",
    leaderMoves: [
      {
        title: "They look like the properties they want to sell",
        detail:
          "Leading agencies and developers match their brand to their target stock. Premium instructions go to firms whose marketing looks premium.",
      },
      {
        title: "Photography and CGI set the standard",
        detail:
          "Leaders never let a listing, brochure or hoarding out with weak imagery. In property, the marketing quality is read as a proxy for the sale price you will achieve.",
      },
      {
        title: "Development brands are built per scheme",
        detail:
          "The strongest developers create a designed identity for every scheme, from hoardings to brochures to site signage, and it measurably moves off-plan sales.",
      },
      {
        title: "They dominate their patch visibly",
        detail:
          "Boards, sponsorships, local content. Market leaders engineer the feeling that they are everywhere in their area, and instructions follow familiarity.",
      },
      {
        title: "Data presented beautifully",
        detail:
          "Market reports and valuations in designed documents position the firm as the authority, and they get shared where new business comes from.",
      },
    ],
    channelPlays: {
      website:
        "Effortless search, magazine-grade imagery and valuation or viewing calls to action everywhere it matters. The site is the shop window for the next instruction, not just the current stock.",
      social:
        "Property content is inherently visual. Leaders run polished listing content, local market updates and behind the scenes, all consistently branded.",
      search:
        "Area plus intent terms decide the pipeline: valuations, agents, developments. Reviews and local content compound into map pack dominance.",
    },
    positioningInsight:
      "Sellers pick the agent they believe will get the best price, and they judge that by the quality of the agent's own brand. In property, your marketing is the product demo.",
  },

  finance: {
    noun: "finance and fintech",
    marketIntro:
      "Money is the last thing people trust to a brand that looks unstable. Finance customers, whether consumers or businesses, are filtering for competence, security and modernity all at once. The winners look effortlessly credible and make complex things feel simple.",
    leaderMoves: [
      {
        title: "Radical clarity",
        detail:
          "Leading finance brands explain products a teenager could understand, and design that clarity into every page, deck and document. Confusion reads as risk.",
      },
      {
        title: "Design as a proxy for engineering",
        detail:
          "In fintech, customers assume the product is built like the brand looks. Leaders invest in polish because it signals the quality of the code they cannot see.",
      },
      {
        title: "Trust markers everywhere",
        detail:
          "Regulation, security, real customer numbers and named clients presented consistently. Leaders never make the user hunt for reasons to relax.",
      },
      {
        title: "A distinct voice in a grey sector",
        detail:
          "The breakout brands sound human in a category that defaults to jargon. Tone of voice is one of the cheapest differentiators in finance and the leaders exploit it.",
      },
      {
        title: "Consistency across every surface",
        detail:
          "App, website, statements, emails and pitch decks all match. In finance, a single off-brand touchpoint erodes trust disproportionately.",
      },
    ],
    channelPlays: {
      website:
        "Instant clarity on what the product does and who it is for, proof above the fold and a frictionless path to start. Credibility is the conversion rate.",
      social:
        "LinkedIn for B2B authority, educational content for consumers. Leaders publish designed insights that make audiences feel smarter, not sold to.",
      search:
        "High-intent product and comparison terms, plus genuinely helpful content answering the questions people ask before trusting anyone with money.",
    },
    positioningInsight:
      "In finance the brand is the risk assessment. Customers cannot audit your balance sheet or your codebase, so they audit your presentation. Looking established is not vanity, it is the licence to be considered.",
  },

  software: {
    noun: "software and SaaS",
    marketIntro:
      "Software buyers shortlist with their eyes. Before a single demo, prospects have judged the website, the product screenshots and the design quality, and used that to guess how good the product is. Categories are crowded, features converge, and brand becomes the tiebreak.",
    leaderMoves: [
      {
        title: "The website sells the product's quality",
        detail:
          "Leading SaaS brands treat the marketing site as proof of craft. If the site feels fast, clear and considered, buyers assume the product is too.",
      },
      {
        title: "A category point of view",
        detail:
          "Winners stand for a way of working, not a feature list. Their brand narrative frames the problem so their product is the obvious answer.",
      },
      {
        title: "Product imagery treated as brand",
        detail:
          "Screenshots, demos and diagrams are art-directed and consistent. The interface is the hero and it always looks its best.",
      },
      {
        title: "Design consistency at content volume",
        detail:
          "Docs, blog, decks, ads and social all ship from one visual system, so a high content cadence builds recognition instead of diluting it.",
      },
      {
        title: "They look funded even when they are not",
        detail:
          "Polish signals momentum. Leaders know enterprise buyers and investors both read design quality as a proxy for company trajectory.",
      },
    ],
    channelPlays: {
      website:
        "Clear positioning in the first viewport, product proof fast, and a design standard that matches the tier of customer you want. The site is the demo before the demo.",
      social:
        "LinkedIn thought leadership and product-led content in a recognisable visual system. Founders with designed personal presence outperform company pages alone.",
      search:
        "Category, alternative and integration terms plus documentation that ranks. Brand searches growing month on month is the leader's scoreboard.",
    },
    positioningInsight:
      "In SaaS, design is due diligence. Buyers use your brand to estimate your product quality, your funding and your longevity in the three seconds before they decide to scroll or leave. The leaders win that moment on purpose.",
  },

  manufacturing: {
    noun: "manufacturing and industrial",
    marketIntro:
      "Industrial buyers are professionals making career-risk decisions, and they favour suppliers who look like safe hands at scale. This sector is full of capable firms with brands stuck a generation behind their machinery, which makes modern presentation an outsized advantage.",
    leaderMoves: [
      {
        title: "They photograph the operation properly",
        detail:
          "Real facilities, real people, real process. Leading manufacturers replace stock imagery with plant photography that proves capability at a glance.",
      },
      {
        title: "Capability made skimmable",
        detail:
          "Leaders translate technical capacity into designed one-pagers, spec sheets and case studies a buying committee can circulate internally.",
      },
      {
        title: "The brand matches the engineering",
        detail:
          "Precision companies with sloppy identities send a mixed message. Winners align their visual standard with their tolerances.",
      },
      {
        title: "They show up where engineers look",
        detail:
          "Consistent presence at trade shows, in directories and on LinkedIn, all carrying the same identity, so familiarity is built before the RFQ.",
      },
      {
        title: "Certifications presented with pride",
        detail:
          "Standards, accreditations and quality systems are designed into the story rather than buried in a footer, because procurement checks them first.",
      },
    ],
    channelPlays: {
      website:
        "Clear capability pages, facility proof, certifications and fast routes to enquiry. The site must survive being forwarded to a procurement committee.",
      social:
        "LinkedIn is where specifiers live. Leaders post project stories, capability content and hiring culture with consistent design.",
      search:
        "Process, material and capability terms plus location. Long-tail technical searches convert at high intent and most competitors ignore them.",
    },
    positioningInsight:
      "In industrial markets almost nobody looks contemporary, so the firm that does instantly reads as the most invested, most stable partner. A modern brand here is not decoration, it is differentiation almost by default.",
  },

  hospitality: {
    noun: "hospitality and events",
    marketIntro:
      "Hospitality is bought as an anticipated memory. Guests book the experience they can already imagine, which means your brand, photography and reviews are doing the selling long before anyone walks in. The gap between full and empty is very often presentation.",
    leaderMoves: [
      {
        title: "They sell the feeling, not the facility",
        detail:
          "Leading venues brand the atmosphere: the night out, the celebration, the escape. Rooms and menus are evidence, the feeling is the product.",
      },
      {
        title: "Photography worth the booking",
        detail:
          "Leaders reshoot regularly and never let a dark phone photo represent them. Imagery quality translates directly into booking value.",
      },
      {
        title: "The brand extends to every printed thing",
        detail:
          "Menus, signage, table talkers and event collateral match the identity. Guests notice coherence and read it as quality.",
      },
      {
        title: "They engineer shareable moments",
        detail:
          "Winners design moments guests want to photograph, then their guests fill the feed for them.",
      },
      {
        title: "Reviews are managed like revenue",
        detail:
          "Leading operators ask, respond and fix. Rating platforms are the second homepage and they treat them accordingly.",
      },
    ],
    channelPlays: {
      website:
        "Atmosphere-first imagery, effortless booking or enquiry, menus and packages one tap away. Remove every step between desire and reservation.",
      social:
        "Instagram sells hospitality. Leaders run a designed grid, guest content and event promotion with consistent personality.",
      search:
        "Local discovery decides: venue type plus area, occasion terms, and a Google profile with current photos and strong reviews.",
    },
    positioningInsight:
      "Guests choose the place that looks like it has already thought of everything. A coherent brand signals a coherent experience, and in hospitality that assumption is worth real margin on every booking.",
  },

  education: {
    noun: "education and training",
    marketIntro:
      "Education customers are investing in a future version of themselves or their children, often comparing providers for weeks before committing. Trust, outcomes and belonging drive the decision, and the provider that communicates all three most clearly usually wins.",
    leaderMoves: [
      {
        title: "Outcomes made concrete",
        detail:
          "Leading providers design their results into the brand: destinations, progression, achievements, presented specifically and honestly.",
      },
      {
        title: "Students and alumni are the story",
        detail:
          "Real faces and real journeys, consistently formatted, beat abstract promises about excellence in every enrolment funnel.",
      },
      {
        title: "The brand feels like the community",
        detail:
          "Winners give learners something to belong to: a visual identity, a tone and moments of pride that families and professionals want to share.",
      },
      {
        title: "Materials match the fees",
        detail:
          "Prospectuses, course pages and open day collateral are designed to the standard the fees imply. Homemade materials undermine premium pricing instantly.",
      },
      {
        title: "They reassure the payer and excite the learner",
        detail:
          "Leading brands speak to both audiences deliberately, with proof for the decision maker and aspiration for the participant.",
      },
    ],
    channelPlays: {
      website:
        "Clear pathways per course or stage, outcomes and social proof up front, and enquiry or open-day actions everywhere the interest peaks.",
      social:
        "Community life, student stories and results content in a consistent system. Parents research on Facebook and Instagram, professionals on LinkedIn.",
      search:
        "Course plus location terms and comparison queries. Genuinely useful guidance content builds authority months before the enrolment decision.",
    },
    positioningInsight:
      "Every education decision involves a leap of faith, and families take that leap with the provider that looks most in control of its own story. Brand coherence reads as institutional competence.",
  },

  logistics: {
    noun: "logistics and transport",
    marketIntro:
      "Logistics is bought on reliability, and reliability is invisible until something goes wrong. Buyers therefore judge what they can see: the fleet, the drivers, the tracking experience, the tender documents. In a sector that competes aggressively on price, brand is how the leaders escape the race to the bottom.",
    leaderMoves: [
      {
        title: "The fleet is a moving billboard",
        detail:
          "Leaders keep livery modern and immaculate. Thousands of daily impressions compound into the familiarity that shortlists are made from.",
      },
      {
        title: "They productise reliability",
        detail:
          "Named service levels, clear SLAs and designed tender documents turn an intangible promise into something a buyer can approve.",
      },
      {
        title: "Technology made visible",
        detail:
          "Tracking portals, notifications and reporting carry the brand and prove modernity. Winners show their systems instead of just claiming them.",
      },
      {
        title: "People up front",
        detail:
          "Drivers, warehouse teams and account managers presented properly. Buyers trust operators who are visibly proud of their people.",
      },
      {
        title: "Consistency across depots and documents",
        detail:
          "One identity across sites, vehicles, uniforms and paperwork signals an operation under control, which is exactly what the client is buying.",
      },
    ],
    channelPlays: {
      website:
        "Service clarity, coverage, accreditations and proof of scale, with fast enquiry routes. The site must convince an operations director in one visit.",
      social:
        "LinkedIn for contract-level credibility: wins, capabilities, people and fleet content in a consistent style.",
      search:
        "Service plus corridor or region terms and sector-specific logistics queries. Most competitors have thin content here, which makes ranking achievable.",
    },
    positioningInsight:
      "When every bid claims 99 percent on-time delivery, buyers pick the operator that looks most like it means it. Brand is the tiebreak in every logistics tender, and it is the cheapest one to win.",
  },

  other: {
    noun: "your market",
    marketIntro:
      "Whatever the sector, the same mechanics apply: buyers form a judgement about your competence from your presentation before they experience your product or service. The brands that win look consistent, current and confident everywhere a customer meets them, and they turn that perception into pricing power.",
    leaderMoves: [
      {
        title: "Consistency everywhere",
        detail:
          "Market leaders look identical across their website, social, documents and physical presence. Recognition compounds and trust follows.",
      },
      {
        title: "Proof designed to be believed",
        detail:
          "Results, reviews and case studies presented in a clear, repeatable format. Leaders make their evidence effortless to consume.",
      },
      {
        title: "A voice customers can recognise",
        detail:
          "The strongest brands sound like someone specific. Personality separates them in markets where products converge.",
      },
      {
        title: "They stay visibly current",
        detail:
          "Leaders refresh their look before it dates. A current brand signals a business that is growing, whatever the industry.",
      },
      {
        title: "Every touchpoint is deliberate",
        detail:
          "From proposals to packaging to email signatures, winners treat each surface as brand real estate rather than an afterthought.",
      },
    ],
    channelPlays: {
      website:
        "Immediate clarity on what you do and for whom, proof close to every call to action, and design quality that matches the price you want to charge.",
      social:
        "Consistent, branded content on the one or two channels your customers actually use, executed to a standard that builds authority.",
      search:
        "Own the terms your buyers actually type, keep your Google profile complete and current, and publish content that answers real pre-purchase questions.",
    },
    positioningInsight:
      "Most businesses compete on what they do. The leaders in every market compete on how confidently they show it. That gap is almost always a brand gap, and it is closable.",
  },
};

/* --------------------------- Category insights ---------------------------- */

export const CATEGORY_INSIGHTS: Record<QuizCategory, CategoryInsight> = {
  consistency: {
    why: "Every inconsistent touchpoint makes a customer re-decide whether they trust you. Consistency is how small brands look established and how established brands stay top of mind. It is the compounding asset in branding: the same identity, seen repeatedly, does the work of a much bigger marketing budget.",
    leaders:
      "Market leaders run everything from one documented system: logo rules, colour, type, templates and tone. Anyone on the team can produce something on-brand in minutes, so volume never causes drift.",
    quickWin:
      "Create a one-page brand sheet and audit your last 20 public outputs against it. Fix the three worst offenders this week.",
  },
  freshness: {
    why: "Customers read a dated brand as a dated business. It happens gradually, then suddenly: fonts, colours and layouts quietly age until one day your pitch sits next to a competitor's and loses on appearance alone. Freshness signals momentum, and momentum attracts customers, talent and partners.",
    leaders:
      "Leaders evolve deliberately every two to three years: not a reinvention, a sharpening. They benchmark against the best in their category, not their local rivals, so they never get lapped visually.",
    quickWin:
      "Put your homepage and your top competitor's side by side. List three things that make yours feel older, and refresh those first.",
  },
  resource: {
    why: "Design capacity decides how fast ideas become assets. When everything queues behind one freelancer or gets DIY-ed at midnight, campaigns slip, quality wobbles and the brand fragments. The bottleneck is rarely ideas; it is the firepower to ship them properly.",
    leaders:
      "Winning teams have design on tap: dedicated people or an embedded partner producing consistently, quickly and to one standard. Marketing plans get executed the week they are made.",
    quickWin:
      "Route every customer-facing asset through a designer for one month, and keep DIY tools for internal documents only. Measure the difference in response.",
  },
  social: {
    why: "Social is where your market checks whether you are alive and worth taking seriously. An inactive or inconsistent feed quietly disqualifies you before a conversation starts, especially with younger buyers who check social before they check your website.",
    leaders:
      "Leaders run a repeatable system: a handful of branded formats, a sustainable cadence and a recognisable look. They optimise for being remembered by the right audience, not for going viral.",
    quickWin:
      "Build four reusable post templates (tip, proof, offer, behind the scenes) and commit to two posts a week for six weeks.",
  },
  website: {
    why: "Your website is where every channel sends people to be convinced, and it converts or leaks accordingly. Visitors decide within seconds whether you look credible, and unclear messaging costs more sales than ugly design ever will.",
    leaders:
      "Leading sites say what the company does, for whom, in the first viewport, then stack proof next to a single clear call to action. Fast, focused and designed to the standard of the fees behind it.",
    quickWin:
      "Rewrite your homepage headline to pass the ten-word test: what you do, for whom. Then remove every competing button above the fold.",
  },
  search: {
    why: "Page 1 of Google is where high-intent customers make their shortlist. If competitors own the results for what you sell, they collect demand you generated through every other channel. Search visibility is quietly one of the highest-leverage brand assets there is.",
    leaders:
      "Leaders own their service plus location terms with genuinely useful pages, keep a complete and active Google Business Profile, and harvest reviews on a system rather than by luck.",
    quickWin:
      "Search your main service plus your area in an incognito window. Whoever owns that page is your real competitor set; note what they have that you do not.",
  },
};

/* ------------------------------ 90-day roadmap ---------------------------- */

export const ROADMAP: RoadmapPhase[] = [
  {
    label: "Phase 1",
    window: "Days 1 to 14",
    focus: "Stop the leaks",
    items: [
      "Fix the three most visible inconsistencies across your website, social profiles and documents.",
      "Create or update your one-page brand sheet so everything produced from today matches.",
      "Complete your Google Business Profile: services, photos, hours, and a review request sent to your last ten happy customers.",
      "Rewrite your homepage headline and strip competing calls to action.",
    ],
  },
  {
    label: "Phase 2",
    window: "Days 15 to 45",
    focus: "Build the system",
    items: [
      "Build a small set of branded templates for your highest-volume assets: posts, proposals, decks.",
      "Reshoot or upgrade the imagery doing the most damage, starting with your website hero and top products or projects.",
      "Publish one genuinely useful page per core service, targeting what your buyers actually search.",
      "Start a sustainable social cadence with your new templates: two posts a week, every week.",
    ],
  },
  {
    label: "Phase 3",
    window: "Days 46 to 90",
    focus: "Compound",
    items: [
      "Refresh your most-seen sales assets (proposal, deck, brochure) to the new standard.",
      "Turn your best proof into designed case studies and place them where decisions happen.",
      "Review the numbers: search positions, profile actions, engagement, enquiry quality. Double down where movement shows.",
      "Decide the operating model that keeps this compounding: in-house, freelance or an embedded design partner.",
    ],
  },
];

/* ------------------------------- Score bands ------------------------------ */

export type ScoreBand = {
  label: string;
  headline: string;
  summary: string;
};

export function scoreBand(score: number): ScoreBand {
  if (score >= 75) {
    return {
      label: "Strong",
      headline: "Your brand is working for you.",
      summary:
        "You are ahead of most of your market. The opportunity now is consistency at volume: protecting the standard as you scale, and pressing the advantage where competitors are weakest.",
    };
  }
  if (score >= 55) {
    return {
      label: "Solid, with leaks",
      headline: "Good foundations, real money being left behind.",
      summary:
        "The core is credible, but the gaps identified in this report are quietly costing enquiries and pricing power. Closing your two weakest areas would move you into the top tier of your market.",
    };
  }
  if (score >= 35) {
    return {
      label: "Underpowered",
      headline: "Your business is better than your brand says it is.",
      summary:
        "Customers are judging you on presentation that undersells the actual work. That gap is expensive, and it is also the fastest kind to close, because the substance is already there.",
    };
  }
  return {
    label: "Urgent",
    headline: "Your brand is actively costing you business.",
    summary:
      "At this level, presentation is disqualifying you before conversations begin. The upside: from here, focused work produces visible commercial results within weeks, not years.",
    };
}

export function categoryVerdict(score: number): string {
  if (score >= 8) return "Leading";
  if (score >= 6) return "Competitive";
  if (score >= 4) return "Lagging";
  return "Critical";
}

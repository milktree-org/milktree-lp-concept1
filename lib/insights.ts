/**
 * Insights (MILKTREE-STUDIO.md §4, docs/PRD.md 3.1). Typed data, no CMS.
 * One article per product at launch. Body is a list of sections so the
 * template can render headings, paragraphs and pull lines consistently.
 */
import type { ProductId } from "@/lib/offer";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "pull"; text: string }
  | { type: "list"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  /** One line under the title and on the card. */
  standfirst: string;
  /** ISO date. */
  date: string;
  readMinutes: number;
  /** Which product this article sells, for the closing CTA. */
  product: ProductId;
  /** Case studies to show at the end. */
  workSlugs: string[];
  body: ArticleBlock[];
  seoDescription: string;
};

export const articles: Article[] = [
  {
    slug: "your-homepage-cant-explain-you",
    title: "Your homepage can't explain what you do. Here's the two-week fix.",
    standfirst:
      "Most business homepages fail one test: can a stranger say what you do after five seconds? The fix is usually smaller than a rebrand.",
    date: "2026-09-09",
    readMinutes: 5,
    product: "sprint",
    workSlugs: ["remigo", "alltrad-roofing", "powerforce"],
    seoDescription:
      "Why most business homepages fail the five-second test, what actually fixes it, and how a two-week Brand Reset Sprint handles the homepage for £799.",
    body: [
      { type: "p", text: "Open your homepage. Count to five. Now ask someone who has never heard of your business what you do. If they hesitate, or describe something you don't sell, that's the problem. It isn't a design problem in the way people usually mean. The colours might be fine. The logo might be fine. The page is failing at its only real job, which is to say what you do and for whom before the visitor scrolls." },
      { type: "h2", text: "Why it happens" },
      { type: "p", text: "Homepages drift. The business changes, a new service gets added, a freelancer rewrites the top section, the founder adds a paragraph about values. Three years later the page is a record of every decision rather than a statement of the current one. The people who built the business can't see it, because they already know what it does." },
      { type: "p", text: "The ads we run tell the same story. Across every campaign we tested this year, the hook that pulled the most leads was a single line: your homepage can't explain what you do in one sentence. People recognise it instantly." },
      { type: "h2", text: "What actually fixes it" },
      { type: "list", items: [
        "One sentence at the top that names the customer and the outcome. Not the method, not the values, not the history.",
        "A structure that answers the next three questions in order: what do you do, who is it for, why you.",
        "Proof before features. Real work, real clients, real numbers where they exist.",
        "One action. A homepage with six buttons has none.",
        "Mobile first, because that's where most of your visitors are reading it.",
      ] },
      { type: "pull", text: "The fix is usually a page, not a brand." },
      { type: "h2", text: "When it's a brand problem instead" },
      { type: "p", text: "Sometimes the homepage can't be fixed on its own because the brand underneath it doesn't say anything yet. If the logo, the colours and the tone all belong to a business you used to be, a new homepage will look like a new coat of paint on the wrong house. The honest advice then is a Brand Build, and we'll say so on the call." },
      { type: "h2", text: "How the sprint runs" },
      { type: "p", text: "Day one is a 30-minute call and a short questionnaire, where we agree exactly what is being fixed. Day three you see two rough directions and pick one. Day seven is the first full look, and your one revision round starts. Day ten it's finished, with design files ready for your developer. Two weeks, £799, and the fee comes off a Brand Build or your first subscription month if you step up within 30 days." },
    ],
  },
  {
    slug: "what-a-rebrand-actually-costs",
    title: "What a rebrand actually costs, and why we put the number on the page.",
    standfirst:
      "Studios hide prices because every project is different. That's true and it's also why nobody replies to their emails.",
    date: "2026-09-09",
    readMinutes: 6,
    product: "build",
    workSlugs: ["eazyphone", "mint-mortgages", "latimers"],
    seoDescription:
      "What a brand identity project actually involves, what it costs at a UK studio, and why Milktree publishes a fixed price for a Brand Build.",
    body: [
      { type: "p", text: "Ask three UK studios what a rebrand costs and you'll get three requests for a call. It's not evasion, exactly. Every business is different, the scope is different, and a studio that quotes blind will either overcharge or lose money. But from the buyer's side it looks like the same thing every time: a price you have to earn by sitting through a pitch." },
      { type: "p", text: "We ran our business that way for seven years and 200 brands. This year we stopped. Every product now has a fixed price on the page, and this article is the reasoning." },
      { type: "h2", text: "What's actually in a brand build" },
      { type: "list", items: [
        "A workshop. Half a day with the people who run the business. Who you're for, what you stand for, what the brand has to do.",
        "Positioning on a page. Your audience, promise, personality and the one line that explains you. Signed off before any design starts.",
        "Direction. Two visual routes, roughly drawn. You choose one. This is where the expensive decision happens, cheaply.",
        "Identity. The chosen route designed in full: logo system, colour, type, imagery, the rules.",
        "Applications. The identity on the five things your business actually uses. Signage, vehicles, menus, packaging, decks.",
        "Guidelines and handover. Every file, the document your team and your printer can use, and a walkthrough.",
      ] },
      { type: "h2", text: "What that costs" },
      { type: "p", text: "For an owner-led business, a proper identity from a UK studio tends to land between three and six thousand pounds, with startup-focused studios charging more for the same steps under the word sprint. We've priced Brand Build at £3,499 fixed and Brand Build Plus, which adds the campaign toolkit to launch it, at £5,999. Two revision rounds at each stage. If you want something outside the scope, we tell you what it costs before we do it, not after." },
      { type: "pull", text: "The price on the page is the price." },
      { type: "h2", text: "Why fixed, and why public" },
      { type: "p", text: "Three reasons. First, the buyer we serve is a founder, not a procurement team. They want to know if it's affordable before they spend an hour on a call. Second, a fixed price forces a fixed process, and a fixed process is how quality stays consistent across 200 brands. Third, the alternative wasn't working. We sent proposals to people who asked for them and never heard back. A price on the page turned out to be the shortest route to a conversation." },
      { type: "h2", text: "When a build is the wrong answer" },
      { type: "p", text: "If the brand is broadly right and one thing is wrong, a Brand Reset Sprint fixes that one thing in two weeks for £799. If the brand is right and you just need design done every month, the subscription. The build is for when the business has outgrown the brand entirely, and that's a feeling most owners recognise the moment they read it." },
    ],
  },
  {
    slug: "design-subscription-what-it-is-and-isnt",
    title: "A design subscription is not a rebrand. Here's what it's actually for.",
    standfirst:
      "Unlimited requests sounds like unlimited everything. It isn't, and the businesses that get the most from it understand the difference.",
    date: "2026-09-09",
    readMinutes: 5,
    product: "essentials",
    workSlugs: ["mint-mortgages", "orange-rooms", "saints-foundation"],
    seoDescription:
      "What a design subscription is good for, what it isn't, and how Milktree's Essentials and Design Lead plans work alongside a Brand Build.",
    body: [
      { type: "p", text: "A design subscription is a queue. You add requests, we work through them one or two at a time, each one comes back in around 48 hours, and you pay a flat monthly fee. That's the whole model. It's a very good model for one specific problem: the steady stream of design a business generates once it has a brand. A new menu. A set of ads. The signage for the second site. A deck for Thursday." },
      { type: "h2", text: "What it isn't" },
      { type: "p", text: "It isn't a rebrand. A full brand build needs a workshop, a strategy, two directions, and a named designer holding the whole thing in their head for six weeks. Splitting that into 48-hour tickets produces a brand that looks like it was made in tickets. We used to say brand builds could happen on the subscription. We stopped, because it was true in theory and bad in practice. Builds are a product with their own price." },
      { type: "pull", text: "The subscription is for keeping a brand alive, not for creating one." },
      { type: "h2", text: "Who's doing the work" },
      { type: "p", text: "This is the question people should ask and rarely do. Most subscriptions put one generalist on a ticket queue. On Essentials, each request is worked by our core team or a vetted designer from our network, matched to the job, and checked by a creative director before it reaches you. On Design Lead, one senior designer is yours: the same person every time, on your Slack, with creative direction on everything. That second one is the closest thing to hiring a design lead without the salary, the notice period or the single skill set." },
      { type: "h2", text: "What a month looks like" },
      { type: "list", items: [
        "A menu redesign for the new season.",
        "Six ad variations for the next campaign.",
        "A social template pack the marketing person can use without us.",
        "The sales deck, brought into line with the website.",
        "A landing page for the offer.",
        "Signage for the second site.",
      ] },
      { type: "h2", text: "Where it fits" },
      { type: "p", text: "Most of our subscribers come to us after a build. That's the natural order: the brand gets made properly, then it needs looking after. You can start on subscription without a build if the brand is already right, and we'll tell you honestly on the first call if it isn't. Essentials is £1,499 a month, Design Lead £2,499, no contract, pause or cancel any month." },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export const sortedArticles = [...articles].sort((a, b) => b.date.localeCompare(a.date));

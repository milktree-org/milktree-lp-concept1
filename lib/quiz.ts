/**
 * Brand Ranking Quiz (§5) — shared definitions. Pure data, safe for client
 * and server. Scoring and benchmark logic live in lib/server/.
 */

export const SECTORS = [
  { value: "construction", label: "Construction & trades" },
  { value: "professional-services", label: "Professional services" },
  { value: "ecommerce", label: "E-commerce & retail" },
  { value: "food-drink", label: "Food & drink" },
  { value: "health-beauty", label: "Health & beauty" },
  { value: "fitness-wellness", label: "Fitness & wellness" },
  { value: "property", label: "Property & real estate" },
  { value: "finance", label: "Finance & fintech" },
  { value: "software", label: "Software & SaaS" },
  { value: "manufacturing", label: "Manufacturing & industrial" },
  { value: "hospitality", label: "Hospitality & events" },
  { value: "education", label: "Education & training" },
  { value: "logistics", label: "Logistics & transport" },
  { value: "other", label: "Something else" },
] as const;

export type SectorValue = (typeof SECTORS)[number]["value"];

export type QuizCategory =
  | "consistency"
  | "freshness"
  | "resource"
  | "social"
  | "website"
  | "search";

export const CATEGORY_LABELS: Record<QuizCategory, string> = {
  consistency: "Brand consistency",
  freshness: "Brand freshness",
  resource: "Design resource",
  social: "Social presence",
  website: "Website",
  search: "Search visibility",
};

export type QuizQuestion = {
  id: QuizCategory;
  question: string;
  options: { value: string; label: string; score: number }[];
};

/** Six icon questions, each answer mapping to a 0–10 category score. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "consistency",
    question: "How consistent is your brand across channels?",
    options: [
      { value: "very", label: "Everything matches, everywhere", score: 9 },
      { value: "mostly", label: "Mostly, the odd thing drifts", score: 6 },
      { value: "patchy", label: "Patchy, depends who made it", score: 3 },
      { value: "none", label: "Honestly, all over the place", score: 1 },
    ],
  },
  {
    id: "freshness",
    question: "When was your brand last properly refreshed?",
    options: [
      { value: "recent", label: "Within the last year", score: 9 },
      { value: "1-3", label: "1–3 years ago", score: 6 },
      { value: "3-5", label: "3–5 years ago", score: 3 },
      { value: "never", label: "Never, it's the original", score: 1 },
    ],
  },
  {
    id: "resource",
    question: "Who does your design today?",
    options: [
      { value: "in-house", label: "In-house designer(s)", score: 8 },
      { value: "freelance", label: "Freelancers / an agency", score: 6 },
      { value: "diy", label: "We DIY it (Canva & co)", score: 3 },
      { value: "no-one", label: "No one, really", score: 1 },
    ],
  },
  {
    id: "social",
    question: "How active are you on social media?",
    options: [
      { value: "daily", label: "Posting most days", score: 9 },
      { value: "weekly", label: "Weekly-ish", score: 6 },
      { value: "monthly", label: "Once a month, maybe", score: 3 },
      { value: "rarely", label: "Rarely or never", score: 1 },
    ],
  },
  {
    id: "website",
    question: "How would you rate your website?",
    options: [
      { value: "proud", label: "Proud of it", score: 9 },
      { value: "okay", label: "It's okay, does the job", score: 6 },
      { value: "dated", label: "Dated, needs work", score: 3 },
      { value: "none", label: "We barely have one", score: 1 },
    ],
  },
  {
    id: "search",
    question: "Do you show up on page 1 of Google for your main service?",
    options: [
      { value: "yes", label: "Yes, near the top", score: 9 },
      { value: "sometimes", label: "Sometimes, for some terms", score: 6 },
      { value: "no", label: "No, competitors do", score: 2 },
      { value: "unknown", label: "No idea, never checked", score: 3 },
    ],
  },
];

export type QuizAnswers = Partial<Record<QuizCategory, string>>;

/* ---------------------------- Results payload ----------------------------- */

export type BrandExtract = {
  domain: string;
  name?: string;
  colors?: string[];
  fonts?: string[];
  headline?: string;
  description?: string;
};

export type CompetitorResult = {
  domain: string;
  name?: string;
  bestPosition: number;
  bestTerm: string;
  brand?: BrandExtract | null;
};

export type BenchmarkResult = {
  tier: "full" | "serp-only" | "none";
  terms: string[];
  competitors: CompetitorResult[];
  userBestPosition: number | null;
  userBestTerm: string | null;
  userBrand?: BrandExtract | null;
  benchmarkScore: number | null;
  note?: string;
};

export type QuizResults = {
  sessionId: string;
  score: number;
  selfScore: number;
  categoryScores: Record<QuizCategory, number>;
  weakest: QuizCategory[];
  actions: string[];
  benchmark: BenchmarkResult | null;
};

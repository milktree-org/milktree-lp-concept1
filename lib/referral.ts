/**
 * Referral programme (docs/PRD.md 3.4, MILKTREE-STUDIO.md §7). The standing
 * offer, the copy and the form vocabulary. Pure data.
 */

export const referralOffer = {
  headline: "Introduce a business. Get a sprint on us.",
  /** The offer in one sentence, used on the page and in the confirmation. */
  line:
    "Introduce a business that becomes a Brand Build and you get a free Brand Reset Sprint (£799) or a month's credit on your subscription. Your choice.",
  terms: [
    "The introduction has to be new to us: a business we haven't already spoken to.",
    "The reward is paid when their Brand Build is confirmed and the deposit is in.",
    "Choose a free sprint for your own business, or £799 off your next subscription month.",
    "No limit. Introduce five businesses that build, get five rewards.",
    "Partners (accountants, developers, printers, photographers) are welcome. Same terms.",
  ],
  /** How partners share without a form: the ?ref= param lands in attribution. */
  shareHint: "Or just send them to milktreeagency.com/start?ref=your-name and we'll know it came from you.",
};

export const RELATIONSHIP_OPTIONS = [
  { value: "client", label: "I'm a Milktree client" },
  { value: "past-client", label: "Milktree built our brand before" },
  { value: "partner", label: "I work with them (accountant, developer, printer…)" },
  { value: "friend", label: "I know the owner" },
] as const;

export type RelationshipValue = (typeof RELATIONSHIP_OPTIONS)[number]["value"];

import { getStripe } from "@/lib/server/stripe";
import { rateLimit, requestIp } from "@/lib/server/supabase";
import { parseAttribution } from "@/lib/server/ghl";
import { getProduct, sprintOptions } from "@/lib/offer";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/checkout/sprint — create a Stripe Checkout Session for the
 * Brand Reset Sprint (PRD 3.3). Price comes from lib/offer via the GBP
 * table so it can never drift from the page. Returns { url }.
 *
 * Body: { sprint?: "homepage" | "deck" | "identity", attribution?: {...} }
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json({ error: "Checkout is not available yet. Book a sprint call instead." }, { status: 503 });
  }

  const allowed = await rateLimit(`checkout:${requestIp(request)}`, 10, 600);
  if (!allowed) return Response.json({ error: "Too many requests" }, { status: 429 });

  let body: { sprint?: unknown; attribution?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }

  const sprint = getProduct("sprint", "GBP");
  const kind = sprintOptions.find((o) => o.id === body.sprint)?.id;
  const attribution = parseAttribution(body.attribution) ?? {};

  // Stripe metadata values are capped at 500 chars, 50 keys.
  const metadata: Record<string, string> = { product: "sprint", source: "stripe-checkout" };
  if (kind) metadata.sprint = kind;
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "gclid", "ref", "visitor_id", "landing_url"]) {
    const v = attribution[key] ?? attribution[`first_${key}`];
    if (typeof v === "string" && v) metadata[key] = v.slice(0, 500);
  }

  const taxRate = process.env.STRIPE_VAT_TAX_RATE_ID;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: sprint.amount * 100,
            product_data: {
              name: sprint.name,
              description: `${sprint.duration}. ${sprint.summary}`,
              images: [`${SITE_URL}/opengraph-image`],
            },
          },
          ...(taxRate ? { tax_rates: [taxRate] } : {}),
        },
      ],
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: "company",
          label: { type: "custom", custom: "Business name" },
          type: "text",
        },
        {
          key: "sprint",
          label: { type: "custom", custom: "Which sprint?" },
          type: "dropdown",
          dropdown: {
            options: sprintOptions.map((o) => ({ label: o.name, value: o.id })),
            ...(kind ? { default_value: kind } : {}),
          },
        },
      ],
      allow_promotion_codes: true,
      metadata,
      success_url: `${SITE_URL}/sprint/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/sprint?checkout=cancelled`,
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] session create failed:", e);
    return Response.json({ error: "Couldn't start checkout. Please try again or book a call." }, { status: 500 });
  }
}

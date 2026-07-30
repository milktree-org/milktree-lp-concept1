import { NextResponse, type NextRequest } from "next/server";
import {
  CURRENCY_COOKIE,
  currencyForCountry,
  isCurrencyCode,
} from "@/lib/currency";

const COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax",
} as const;

/**
 * Resolves the visitor's display currency once, from Vercel's geo header,
 * and persists it in a cookie the client reads. Pages stay static — only
 * the cookie varies per visitor. `?currency=usd` overrides for testing.
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const override = request.nextUrl.searchParams
    .get("currency")
    ?.toUpperCase();
  if (override && isCurrencyCode(override)) {
    response.cookies.set(CURRENCY_COOKIE, override, COOKIE_OPTIONS);
    return response;
  }

  const existing = request.cookies.get(CURRENCY_COOKIE)?.value;
  if (!existing || !isCurrencyCode(existing)) {
    const country = request.headers.get("x-vercel-ip-country");
    response.cookies.set(
      CURRENCY_COOKIE,
      currencyForCountry(country),
      COOKIE_OPTIONS,
    );
  }

  return response;
}

export const config = {
  // Documents only — skip API routes, Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};

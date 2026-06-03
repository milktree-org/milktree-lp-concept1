/**
 * AuditThankYouPage — post-submit success page for the /audit landing page.
 *
 * Critical difference vs the main /thank-you page:
 *   - NO main-site navbar or footer (paid-traffic visitors should not be
 *     able to wander into / / /work / /pricing — that defeats the purpose
 *     of a single-funnel LP).
 *   - LP-styled minimal chrome: logo + thank-you content + Cal.com CTA only.
 *   - Fires the same Lead + Schedule pixel + CAPI events as the main
 *     /thank-you page so attribution stays consistent for the Andromeda
 *     campaign optimisation.
 *
 * Reachable at:
 *   - milktreeagency.com/audit/thank-you  (when ad lands on /audit on root)
 *   - audit.milktreeagency.com/thank-you   (when ad lands on subdomain root)
 */
import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { trackLead, trackSchedule } from '../utils/meta-tracking';
import { getCalcomTrackingMetadata } from '../utils/lead-tracking';
import './audit/styles/audit-lp.css';
import { Logo, Icon } from './audit/components/AuditPrimitives';

// Cal.com slot — same event the rest of the funnel uses.
const CAL_LINK = 'milktree-agency/free-brand-digital-presence-audit-30-minutes';
const CAL_NAMESPACE = 'audit-ty';

interface PrefillState {
  name?: string;
  email?: string;
  company?: string;
  website?: string;
  service?: string;
}

export const AuditThankYouPage: React.FC = () => {
  const location = useLocation();
  const prefill = (location.state || {}) as PrefillState;
  const isBooked = new URLSearchParams(location.search).get('booked') === '1';

  const calContainerRef = useRef<HTMLDivElement | null>(null);
  const calInitialised = useRef(false);
  const bookedRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Lock the page bg to black while this page is mounted (matches LP).
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = '#000';
    document.body.style.backgroundColor = '#000';

    // Skip duplicate conversion firing when arriving with ?booked=1 — the
    // QualifyModal already fired Lead + Schedule + GA4 conversion when the
    // user confirmed their slot. Double-firing here would inflate counts.
    if (!isBooked) {
      // GA4 — thank-you page view = the LEAD conversion (form was submitted).
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          event_category: 'Lead',
          event_label: 'Audit LP Thank You',
          value: 1,
          currency: 'GBP',
          send_to: 'G-9GHX9JVN9S',
        });
      }

      // Meta Lead event (Pixel + CAPI) — primary conversion (form submitted).
      // NOTE: Schedule now fires on confirmed booking below, not here, so the
      // Schedule count reflects ACTUAL calls booked rather than page views.
      trackLead({ eventSource: 'Audit LP Thank You' });
    }

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, [isBooked]);

  // ── Inline Cal.com embed — replaces the old "Book my free call" button ──
  // Defer-loaded per CLAUDE.md Rule 3 (embed.js ~400KB). Since the embed is
  // the primary content here, the in-view check fires init immediately.
  useEffect(() => {
    const section = calContainerRef.current;
    if (!section) return;

    const init = () => {
      if (calInitialised.current) return;
      calInitialised.current = true;

      // Cal.com embed bootstrap — same battle-tested IIFE as AuditClosing.tsx.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (function (C: any, A: string, L: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = (a: any, ar: any) => a.q.push(ar);
        const d = C.document;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        C.Cal = C.Cal || function (...args: any[]) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cal: any = C.Cal;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement('script')).src = A;
            cal.loaded = true;
          }
          if (args[0] === L) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const api: any = function (...inner: any[]) { p(api, inner); };
            const namespace = args[1];
            api.q = api.q || [];
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], args);
              p(cal, ['initNamespace', namespace]);
            } else {
              p(cal, args);
            }
            return;
          }
          p(cal, args);
        };
      })(window, 'https://app.cal.com/embed/embed.js', 'init');

      const trackingMetadata = getCalcomTrackingMetadata();
      const notesParts = [
        prefill.company ? `Company: ${prefill.company}` : '',
        prefill.website ? `Website: ${prefill.website}` : '',
        prefill.service ? `Service: ${prefill.service}` : '',
      ].filter(Boolean);

      // Prefill via query params on the calLink — the version-stable method
      // that reliably carries name/email/notes into the Cal booking form.
      const prefillParams = new URLSearchParams();
      if (prefill.name) prefillParams.set('name', prefill.name);
      if (prefill.email) prefillParams.set('email', prefill.email);
      if (notesParts.length) prefillParams.set('notes', notesParts.join(' · '));
      const calLinkWithPrefill = prefillParams.toString()
        ? `${CAL_LINK}?${prefillParams.toString()}`
        : CAL_LINK;

      const Cal = window.Cal;
      Cal('init', CAL_NAMESPACE, { origin: 'https://cal.com' });
      Cal.ns[CAL_NAMESPACE]('inline', {
        elementOrSelector: '#cal-audit-ty-inline',
        config: {
          layout: 'month_view',
          theme: 'dark',
          metadata: { source: 'Audit LP Thank You Inline', ...trackingMetadata },
        },
        calLink: calLinkWithPrefill,
      });
      Cal.ns[CAL_NAMESPACE]('ui', {
        hideEventTypeDetails: false,
        layout: 'month_view',
        cssVarsPerTheme: { dark: { 'cal-brand': '#FFDC04' } },
      });

      // The real high-intent signal: a CONFIRMED booking.
      Cal.ns[CAL_NAMESPACE]('on', {
        action: 'bookingSuccessful',
        callback: () => {
          if (bookedRef.current) return;
          bookedRef.current = true;

          const nameParts = (prefill.name || '').trim().split(/\s+/);
          const userData = prefill.email
            ? {
                email: prefill.email,
                firstName: nameParts[0] || undefined,
                lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined,
              }
            : undefined;

          trackSchedule({ eventSource: 'Audit LP Thank You Inline', userData });
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'conversion', {
              event_category: 'Schedule',
              event_label: 'Audit LP Cal.com Booking',
              value: 1,
              currency: 'GBP',
              send_to: 'G-9GHX9JVN9S',
            });
          }
        },
      });
    };

    if (section.getBoundingClientRect().top < window.innerHeight + 300) {
      init();
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      init();
    }, { rootMargin: '200px' });
    io.observe(section);
    return () => io.disconnect();
  }, [prefill.name, prefill.email, prefill.company, prefill.website, prefill.service]);

  return (
    <div className="audit-lp">
      <Helmet>
        <title>You're in · Free Brand Audit | Milktree</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>

      {/* Minimal nav: logo only, no links anywhere. Logo upsized to match the
          LP navbar (size 22). */}
      <div style={{ position: 'fixed', top: 18, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', pointerEvents: 'none', padding: '0 16px' }}>
        <div style={{
          pointerEvents: 'auto',
          background: 'rgba(6,6,6,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 9999,
          padding: '13px 24px',
          display: 'flex', alignItems: 'center',
        }}>
          <Logo size={22} />
        </div>
      </div>

      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 64px', position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
          {/* Success icon */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'rgba(99,204,121,0.12)',
            border: '1px solid rgba(99,204,121,0.4)',
            color: '#63CC79',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px',
          }}>
            {Icon.check(40)}
          </div>

          {/* Heading — branches on whether the user already booked via the QualifyModal. */}
          <h1 style={{ fontSize: 'clamp(36px, 5.4vw, 64px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#fff', margin: 0, textWrap: 'balance' }}>
            {isBooked ? (
              <>You're <span style={{ color: '#FFDC04' }}>booked.</span> Your audit starts with the call.</>
            ) : (
              <>You're in. Here's what <span style={{ color: '#FFDC04' }}>happens next.</span></>
            )}
          </h1>

          <p className="fg-2" style={{ fontSize: 'clamp(16px, 1.4vw, 19px)', lineHeight: 1.55, marginTop: 20, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            {isBooked ? (
              <>Check your inbox for the calendar invite and add it so you don't miss it. We'll dig into your brand on the call, then send your personalised audit within 48 hours of it.</>
            ) : (
              <>Last step: <span style={{ color: '#fff', fontWeight: 600 }}>pick a 30-minute slot below</span>. Your audit doesn't start until we've had the call — so grab a time now while it's in front of you.</>
            )}
          </p>

          {/* Inline Cal.com embed — only when arriving WITHOUT a confirmed booking
              (legacy fallback path). When ?booked=1, the user already chose a time
              inside the QualifyModal, so showing another calendar is confusing. */}
          {!isBooked && (
            <>
              <div style={{ marginTop: 36, maxWidth: 880, marginLeft: 'auto', marginRight: 'auto' }}>
                <div
                  ref={calContainerRef}
                  id="cal-audit-ty-inline"
                  style={{
                    width: '100%',
                    minHeight: 720,
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    overflow: 'hidden',
                  }}
                />
              </div>

              {/* Fallback note */}
              <p className="fg-3" style={{ fontSize: 13, marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Calendar not loading?{' '}
                <a href={`https://cal.com/${CAL_LINK}`} target="_blank" rel="noopener noreferrer" style={{ color: '#FFDC04', textDecoration: 'underline' }}>
                  Open it in a new tab
                </a>
                {' '}— or check your inbox, the booking link is there too.
              </p>
            </>
          )}
        </div>
      </main>

      {/* Subtle footer — no nav, just a copyright line so the page doesn't look unfinished */}
      <footer style={{ position: 'relative', zIndex: 3, padding: '32px clamp(20px, 4vw, 48px)', textAlign: 'center' }}>
        <div className="fg-3" style={{ fontSize: 12 }}>© 2026 Milktree Agency · hello@milktreeagency.com</div>
      </footer>
    </div>
  );
};

export default AuditThankYouPage;

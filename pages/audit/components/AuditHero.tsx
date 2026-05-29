/**
 * AuditHero — paid-traffic LP hero with the proven message-match.
 *
 * AUDIT FIXES applied (per /audits/META-CREATIVE-FUNNEL-AUDIT-APR-2026.md §4.3):
 *   - Hero rewritten from "Brands that earn attention. Systems that scale it."
 *     to "Nobody knows what you do. We fix that." (matches the proven
 *     `your_brand_looks_v2` ad winner: 4.31% CTR, £0.33 CPC).
 *   - Deliverable standardised everywhere → "Free Brand Audit · 48 hours".
 *   - Hero CTAs simplified: primary "Get my free audit", secondary "View case studies".
 *   - BookingCard: real Formspree wiring + Meta Pixel + CAPI on submit,
 *     navigates to /thank-you (consistent with the existing milktreeagency.com flow).
 */
import React, { useEffect, useState } from 'react';
import { Button, Eyebrow, Icon } from './AuditPrimitives';
import { QualifyModal, useQualifyModal } from '../../../components/QualifyModal';

const CLIENT_LOGOS = Array.from({ length: 13 }, (_, i) => `/audit-assets/client-logos/logo-${i + 1}.png`);

const HERO_STATS = [
  { n: '200+',   l: 'brands built' },
  { n: '250%',   l: 'avg. enquiry lift' },
  { n: '10+',    l: 'industries served' },
  { n: '48 hr',  l: 'audit turnaround' }, // AUDIT FIX: was "4–6 wk launch window" — now reinforces the deliverable
];

export const AuditHero: React.FC = () => {
  const modal = useQualifyModal();
  return (
    <section id="top" className="section" style={{ paddingTop: 160, paddingBottom: 64, position: 'relative', overflow: 'hidden' }}>
      <BackgroundOrbits />

      <div className="container" style={{ position: 'relative' }}>
        {/* Eyebrow chip */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,220,4,0.06)', border: '1px solid rgba(255,220,4,0.22)', borderRadius: 9999, padding: '8px 14px', marginBottom: 36 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFDC04', animation: 'audit-blink 2s infinite' }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFDC04' }}>
            Free Brand Audit · 48-hour turnaround · No commitment
          </span>
        </div>
        {/* Hero-level modal mount (used by primary hero CTA + BookingCard) */}
        <QualifyModal isOpen={modal.isOpen} onClose={modal.close} source="Audit LP Hero" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)',
          gap: 'clamp(32px, 5vw, 96px)',
          alignItems: 'end',
        }} className="hero-grid">
          {/* LEFT — Headline + body + stats */}
          <div>
            {/* AUDIT FIX: Hero rewritten to the proven message-match */}
            <h1 style={{ fontSize: 'clamp(44px, 7.2vw, 104px)', fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 0.98, margin: 0, color: '#fff', textWrap: 'balance' }}>
              Nobody knows<br />
              <span style={{ fontStyle: 'italic', fontWeight: 500, fontFamily: 'AuditGelasio, serif' }}>what you do.</span><br />
              We <span style={{ color: '#FFDC04' }}>fix that.</span>
            </h1>

            {/*
              AUDIT FIX (§4.5 #1): "Clarity problem" line woven into the hero subhead.
              This is the most-shared theme between the proven ad winner and the LP.
              Em dash removed; sentence split into two for Grade-7 UK English readability.
            */}
            <p className="fg-2" style={{ fontSize: 'clamp(17px, 1.4vw, 21px)', lineHeight: 1.55, maxWidth: 580, marginTop: 32 }}>
              It's not a design problem. It's a <span style={{ color: '#fff', fontWeight: 600 }}>clarity problem</span>. We build brand identities that make you the obvious choice. The right clients come to you, and your team knows exactly how to represent the business.
            </p>
            <p className="fg-3" style={{ fontSize: 14, marginTop: 14, letterSpacing: '0.02em' }}>
              200+ brands built · Average enquiry lift 250% · 4–6 week delivery
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 34, flexWrap: 'wrap' }}>
              <Button onClick={modal.open} size="lg">Get my free audit</Button>
              <Button href="#work" variant="secondary" size="lg" icon={false}>View case studies</Button>
            </div>

            <div style={{ display: 'flex', gap: 40, marginTop: 56, flexWrap: 'wrap' }}>
              {HERO_STATS.map((s, i) => (
                <div key={i} style={{ minWidth: 100 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>{s.n}</div>
                  <div className="fg-3" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Booking card (opens QualifyModal) */}
          <div id="start" style={{ position: 'relative' }}>
            <BookingCard onOpen={modal.open} />
          </div>
        </div>

        {/* Logo marquee strip
            AUDIT FIX: removed redundant outer top border. The label dividers
            on either side of "Trusted by..." already provide a top edge,
            and stacking another full-width line above looked like a double
            divider. borderBottom kept for separation from the next section. */}
        <div style={{ marginTop: 96, padding: '28px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span>Trusted by 200+ brands across 15 industries</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)' }}>
            <div className="marquee">
              {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((src, i) => (
                <img key={i} src={src} alt="" style={{ height: 28, maxWidth: 130, filter: 'brightness(0) invert(1)', opacity: 0.55, transition: 'opacity 0.3s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.95')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.55')}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile breakpoint — stack hero columns */}
      <style>{`
        @media (max-width: 900px) {
          .audit-lp .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

// ── Decorative orbits behind the hero ─────────────────────────────
const BackgroundOrbits: React.FC = () => {
  const [rot, setRot] = useState(0);
  useEffect(() => {
    let raf = 0;
    let t0 = 0;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      setRot(((t - t0) / 60) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden style={{ position: 'absolute', top: '-10%', right: '-25%', width: 900, height: 900, pointerEvents: 'none', opacity: 0.5, transform: `rotate(${rot * 0.15}deg)` }}>
      <svg viewBox="0 0 900 900" width="100%" height="100%">
        {[180, 260, 340, 420].map((r, i) => (
          <circle key={i} cx="450" cy="450" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="1 4" />
        ))}
        <circle cx="450" cy="270" r="4" fill="#FFDC04" />
        <circle cx="710" cy="450" r="3" fill="rgba(255,255,255,0.45)" />
        <circle cx="260" cy="610" r="2.5" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );
};

// ── BookingCard — preview card that opens the QualifyModal ─────────
// Previously a 5-field Formspree form. Now a single primary CTA so we
// don't ask the same question twice (the modal collects everything).
// The card still functions as a "visible form" trust signal on the
// hero — bullet list + CTA + microcopy reassurance.

const BOOKING_CARD_BULLETS = [
  'Personalised audit delivered in 48 hours',
  '30-min call to brief us on your brand',
  'Positioning, identity, and digital review',
  'Prioritised action plan — yours to keep',
];

const BookingCard: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 28,
        padding: 28,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ position: 'absolute', top: -1, left: 24, right: 24, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,220,4,0.5), transparent)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#63CC79', boxShadow: '0 0 10px rgba(99,204,121,0.8)' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>Free · 48-hour turnaround</span>
      </div>

      <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', margin: 0, lineHeight: 1.2 }}>
        Get your free brand audit.
      </h3>
      <p className="fg-2" style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10 }}>
        90-second qualifier → pick a 30-min call → audit in your inbox within 48 hours of the call.
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 22px', display: 'grid', gap: 10 }}>
        {BOOKING_CARD_BULLETS.map((b) => (
          <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.88)' }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%', background: '#FFDC04', color: '#000',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              marginTop: 1,
            }}>{Icon.check(10)}</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Button onClick={onOpen} size="md" style={{ width: '100%', justifyContent: 'center' }}>
        Get my free audit
      </Button>

      <div className="fg-3" style={{ fontSize: 12, marginTop: 12, textAlign: 'center' }}>
        No pitch decks. No obligation. Reply in under 48h.
      </div>
    </div>
  );
};

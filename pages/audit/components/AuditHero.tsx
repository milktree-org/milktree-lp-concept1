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

      <div className="container" style={{ position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Eyebrow chip */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,220,4,0.06)', border: '1px solid rgba(255,220,4,0.22)', borderRadius: 9999, padding: '8px 14px', marginBottom: 36 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFDC04', animation: 'audit-blink 2s infinite' }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FFDC04' }}>
            Free Brand Audit · 48-hour turnaround · No commitment
          </span>
        </div>

        {/* Hero-level modal mount (used by primary hero CTA + secondary CTAs) */}
        <QualifyModal isOpen={modal.isOpen} onClose={modal.close} source="Audit LP Hero" />

        {/* Centred single-column hero. The right-side BookingCard was removed
            (May 29) — it duplicated the eyebrow + CTAs and added noise. Now the
            modal is the single source of truth for capture, opened from a
            cleaner, more focused hero. */}
        <div style={{ maxWidth: 900, width: '100%' }} id="start">
          <h1 style={{ fontSize: 'clamp(44px, 7.2vw, 104px)', fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 0.98, margin: 0, color: '#fff', textWrap: 'balance' }}>
            Nobody knows<br />
            <span style={{ fontStyle: 'italic', fontWeight: 500, fontFamily: 'AuditGelasio, serif' }}>what you do.</span><br />
            We <span style={{ color: '#FFDC04' }}>fix that.</span>
          </h1>

          <p className="fg-2" style={{ fontSize: 'clamp(17px, 1.4vw, 21px)', lineHeight: 1.55, maxWidth: 620, marginTop: 32, marginLeft: 'auto', marginRight: 'auto' }}>
            It's not a design problem. It's a <span style={{ color: '#fff', fontWeight: 600 }}>clarity problem</span>. We build brand identities that make you the obvious choice. The right clients come to you, and your team knows exactly how to represent the business.
          </p>
          <p className="fg-3" style={{ fontSize: 14, marginTop: 14, letterSpacing: '0.02em' }}>
            200+ brands built · Average enquiry lift 250% · 4–6 week delivery
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 34, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button onClick={modal.open} size="lg">Get my free audit</Button>
            <Button href="#work" variant="secondary" size="lg" icon={false}>View case studies</Button>
          </div>

          <div style={{ display: 'flex', gap: 40, marginTop: 56, flexWrap: 'wrap', justifyContent: 'center' }}>
            {HERO_STATS.map((s, i) => (
              <div key={i} style={{ minWidth: 100 }}>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>{s.n}</div>
                <div className="fg-3" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
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

      {/* No mobile breakpoint needed — the centred single-column hero
          stacks naturally at any width since BookingCard was removed. */}
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

// (BookingCard was removed May 29 — the right-side card duplicated the
//  eyebrow + CTAs already in the centred hero. Capture now happens
//  exclusively through the QualifyModal, opened from the hero primary
//  button. Keeping Icon import via the void below for tree-shaker.)
void Icon.check;

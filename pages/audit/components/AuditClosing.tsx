/**
 * AuditClosing — sections 6, 7 + sticky mobile CTA + footer.
 *
 * AUDIT FIXES applied:
 *   - FinalCTA: form REMOVED, replaced with a Cal.com inline embed
 *     (May 2 v2). Hypothesis being tested: do paid-traffic visitors
 *     book a call directly more readily than they fill a form? The
 *     hero form is the primary capture path; the bottom Cal.com is
 *     the secondary "skip the form" path.
 *   - Cal.com defer-loaded per CLAUDE.md Rule 3 (embed.js is ~400KB;
 *     loading it eagerly would tank LCP on mobile).
 *   - bookingSuccessful event fires Schedule pixel + CAPI + GA4
 *     conversion so the call attribution flows the same way the
 *     /audit/thank-you page does.
 *   - StickyMobileCTA href + label aligned with hero CTA.
 *   - FAQ: removed "We don't do paid media" line.
 *   - Footer (May 2 v2): wordmark made visible (was outline-only),
 *     body text bumped to fg-2 + size 16, logo size 18 → 22.
 */
import React, { useEffect, useState } from 'react';
import { Eyebrow, Icon, Logo, Button } from './AuditPrimitives';
import { QualifyModal, useQualifyModal } from '../../../components/QualifyModal';

// (CalcomInline component + its CAL_LINK/CAL_NAMESPACE constants were
//  removed when this LP's FinalCTA moved to the QualifyModal-driven flow.
//  Cal.com embedding now lives inside <QualifyModal>.)

// ── FINAL CTA (QualifyModal trigger — replaces the old inline Cal embed) ─
// May 29: consolidated to a single primary CTA that opens the QualifyModal.
// Reason: the campaign objective is moving from "form filled" to "call
// booked," and we don't want two competing booking paths on the same LP.
// Hero + closing CTA both fire the same modal, ensuring uniform
// qualification and tracking.
export const FinalCTA: React.FC = () => {
  const modal = useQualifyModal();
  return (
    <section id="cta" className="section" style={{ padding: '0 clamp(20px, 4vw, 48px) clamp(72px, 9vw, 128px)' }}>
      <div style={{
        position: 'relative',
        maxWidth: 1400, margin: '0 auto',
        borderRadius: 48,
        padding: 'clamp(48px, 6vw, 96px) clamp(24px, 4vw, 80px)',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)',
        border: '1px solid rgba(255,220,4,0.22)',
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,220,4,0.12), transparent 65%)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: -150, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,93,255,0.08), transparent 65%)', pointerEvents: 'none' }} />

        {/* Centered content stack */}
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Eyebrow num="06 / Ready when you are">Book the call</Eyebrow>
          <h2 style={{ fontSize: 'clamp(36px, 5.4vw, 72px)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: '#fff', marginTop: 20, textWrap: 'balance' }}>
            90 seconds to qualify. <span style={{ color: '#FFDC04' }}>Then pick a slot.</span>
          </h2>
          <p className="fg-2" style={{ fontSize: 'clamp(16px, 1.4vw, 19px)', lineHeight: 1.55, marginTop: 20, maxWidth: 600 }}>
            Five short questions so the call isn't a discovery call. We come back within 48 hours of it with a short, honest audit. And whether we're the right studio for you.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 20px', maxWidth: 720 }}>
            {[
              '30-min discovery call',
              '48-hour written audit',
              'Positioning review',
              'Identity assessment',
              'Prioritised action plan',
            ].map((b, i) => (
              <li key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#FFDC04', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{Icon.check(10)}</span>
                {b}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 40 }}>
            <Button onClick={modal.open} size="lg">Get my free audit</Button>
          </div>
          <p className="fg-3" style={{ fontSize: 13, marginTop: 14, letterSpacing: '0.01em' }}>
            Free · No pitch decks · 4 spots / month
          </p>
        </div>
      </div>

      <QualifyModal isOpen={modal.isOpen} onClose={modal.close} source="Audit LP Closing" />
    </section>
  );
};

// ── FAQ ──────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'How long does a typical engagement take?',                a: 'Most identity + site builds ship in 4–6 weeks. Design systems and content ops run on retainer. You\'ll get a fixed scope and a written timeline after the audit.' },
  { q: 'What does it cost?',                                      a: 'Brand builds start from around £6,000. Websites and landing pages from around £3,500. Retainers are quoted per quarter. We share a clear number after we understand the scope.' },
  { q: 'Do you work with early-stage / pre-launch brands?',       a: 'Yes. Half our work is zero-to-one. We help you decide what to build before we build it.' },
  { q: 'How does the generative AI side actually work?',          a: 'We train on your brand assets to produce on-brand imagery, then hand over pipelines, prompts, and a template library your team can run without us.' },
  { q: 'Can we keep working with you after launch?',              a: 'Most clients do. After the initial build we move into a content + design retainer, or hand everything over with full guidelines. Your call.' },
  { q: 'Do you only work with UK clients?',                       a: 'No. We\'re London-based but work across the UK, Europe, and the US. Most engagements run remotely with one or two on-sites if it helps the work.' },
];

export const FAQ: React.FC = () => {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section">
      <div className="container" style={{ maxWidth: 980 }}>
        <div style={{ marginBottom: 48 }}>
          <Eyebrow num="07 / Questions">FAQ</Eyebrow>
          <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 64px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff', marginTop: 18 }}>
            Questions founders <span className="fg-3">actually</span> ask us.
          </h2>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {FAQ_ITEMS.map((it, i) => (
            <FAQItem
              key={i}
              {...it}
              num={i + 1}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQItem: React.FC<{ q: string; a: string; num: number; isOpen: boolean; onToggle: () => void }> = ({ q, a, num, isOpen, onToggle }) => (
  <div style={{
    background: isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
    border: `1px solid rgba(255,255,255,${isOpen ? 0.18 : 0.08})`,
    borderRadius: 24,
    overflow: 'hidden',
    transition: 'background 0.3s, border-color 0.3s',
  }}>
    <button onClick={onToggle} style={{
      width: '100%', border: 'none', background: 'transparent', color: '#fff',
      padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 18,
      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', background: isOpen ? '#FFDC04' : 'rgba(255,255,255,0.06)', color: isOpen ? '#000' : 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, transition: 'all 0.3s' }}>
        {String(num).padStart(2, '0')}
      </span>
      <span style={{ flex: 1, fontSize: 'clamp(16px, 1.6vw, 19px)', fontWeight: 600, letterSpacing: '-0.01em' }}>{q}</span>
      <span style={{ color: isOpen ? '#FFDC04' : 'rgba(255,255,255,0.5)', transition: 'transform 0.3s, color 0.3s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>
        {Icon.plus(20)}
      </span>
    </button>
    <div style={{ maxHeight: isOpen ? 240 : 0, transition: 'max-height 0.4s cubic-bezier(0.44,0,0.56,1)', overflow: 'hidden' }}>
      <div style={{ padding: '0 24px 24px 78px' }}>
        <p className="fg-2" style={{ fontSize: 16, lineHeight: 1.6, margin: 0, maxWidth: 680 }}>{a}</p>
      </div>
    </div>
  </div>
);

// ── FOOTER (paid-traffic, no nav noise) ──────────────────────────
// May 2 v3: removed the small "milktree" logo at the top of the footer
// (it was duplicate of the giant wordmark below). Top row is now just
// description + social icons. Giant wordmark uses the actual brand SVG
// (which has the sharp-corner yellow square baked in), full-width and
// centered end-to-end.
export const AuditFooter: React.FC = () => (
  <footer style={{ position: 'relative', zIndex: 3, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '72px clamp(20px, 4vw, 48px) 48px' }}>
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top row: description (left) + social icons (right). No logo here
          — the giant wordmark below carries the brand. */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 48, flexWrap: 'wrap' }}>
        <p className="fg-2" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 440, margin: 0 }}>
          A design-led studio building brands, systems, and content for the next generation of category leaders.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          {[Icon.linkedin, Icon.instagram, Icon.mail].map((Ic, i) => (
            <a
              key={i}
              href={i === 2 ? 'mailto:hello@milktreeagency.com' : '#'}
              aria-label={['LinkedIn', 'Instagram', 'Email'][i]}
              style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FFDC04'; e.currentTarget.style.color = '#000'; e.currentTarget.style.borderColor = '#FFDC04'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            >
              {Ic(18)}
            </a>
          ))}
        </div>
      </div>

      {/* Giant brand wordmark — actual brand SVG, full width, centred
          end-to-end. Yellow square is part of the SVG (sharp corners,
          part of the brand identity), not our hand-rolled rounded mark. */}
      <div aria-hidden style={{ marginTop: 80, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
        <img
          src="/audit-assets/milktree-logo.svg"
          alt=""
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.10)', flexWrap: 'wrap', gap: 12 }}>
        <div className="fg-2" style={{ fontSize: 14 }}>© 2026 Milktree Agency. All rights reserved.</div>
        <div className="fg-2" style={{ fontSize: 14 }}>Made in London · Working worldwide</div>
      </div>
    </div>
  </footer>
);

// ── STICKY MOBILE CTA ────────────────────────────────────────────
export const StickyMobileCTA: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="only-sm" style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 99,
      transform: visible ? 'translateY(0)' : 'translateY(140%)',
      transition: 'transform 0.4s cubic-bezier(0.44,0,0.56,1)',
    }}>
      <a
        href="#start"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '16px 24px', borderRadius: 9999,
          background: '#FFDC04', color: '#000', fontWeight: 700, fontSize: 15,
          boxShadow: '0 12px 40px rgba(255,220,4,0.4)', textDecoration: 'none',
        }}
      >
        Get my free audit {Icon.arrow(14)}
      </a>
    </div>
  );
};

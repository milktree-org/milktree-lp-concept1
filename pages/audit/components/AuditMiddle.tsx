/**
 * AuditMiddle — sections 4, 5, 6 of the audit LP.
 *   §4 Process — diagnosis to rollout in 4-6 weeks
 *   §5 Work    — 6 case-study cards with real result numbers
 *   §6 Proof   — testimonial carousel + lifetime stats
 *
 * AUDIT FIX: Process step 1 reworded from "30-min call + 48h audit" to
 * "Free Brand Audit · 48 hours" to match the unified deliverable everywhere.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Eyebrow, Icon } from './AuditPrimitives';
import { CaseStudyModal, type CaseStudyData } from '../../../components/CaseStudyModal';
import { caseStudies as fullCaseStudies } from '../../../data/content';

// ── PROCESS ──────────────────────────────────────────────────────
interface ProcessStep { num: string; title: string; desc: string; dur: string }

// AUDIT FIX (§4.4): step 01 reworded to carry the ENG-01 ad hook ("Give us 20 minutes...")
// onto the LP. Lifts ENG-01 message-match from 3/5 to 4/5 without ad-specific LP variants.
// May 2: em dashes removed across all step descs for Grade-7 UK English readability.
const STEPS: ProcessStep[] = [
  { num: '01', title: 'Audit & diagnose',     desc: 'Give us 20 minutes on a discovery call. Within 48 hours you get a tight, honest written audit. The read on your brand before anything else.', dur: 'Week 0' },
  { num: '02', title: 'Position & message',   desc: 'We set where you sit in the market and build the messaging framework that makes it stick everywhere.',                                          dur: 'Week 1–2' },
  { num: '03', title: 'Identity & system',    desc: 'Logo, colour, type, motion, components. Designed as a system, not a collection of files.',                                                       dur: 'Week 2–4' },
  { num: '04', title: 'Rollout & momentum',   desc: 'Guidelines, templates, and the first wave of assets. Your team ships day one, not month three.',                                                  dur: 'Week 4–6' },
];

export const Process: React.FC = () => (
  <section id="process" className="section">
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', marginBottom: 56 }}>
        <div style={{ maxWidth: 720 }}>
          <Eyebrow num="03 / How it works">The process</Eyebrow>
          <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 64px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff', marginTop: 18 }}>
            From diagnosis to<br />
            <span style={{ color: '#FFDC04' }}>rollout</span> <span className="fg-3">in four to six weeks.</span>
          </h2>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div aria-hidden style={{ position: 'absolute', left: 32, top: 24, bottom: 24, width: 1, background: 'linear-gradient(180deg, rgba(255,220,4,0.5), rgba(255,255,255,0.08))' }} className="hide-sm" />
        <div style={{ display: 'grid', gap: 16 }}>
          {STEPS.map((s, i) => <Step key={i} {...s} last={i === STEPS.length - 1} />)}
        </div>
      </div>
    </div>
  </section>
);

interface StepProps extends ProcessStep { last: boolean }
const Step: React.FC<StepProps> = ({ num, title, desc, dur, last }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 24, alignItems: 'center',
        padding: '28px 28px 28px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: last ? '1px solid rgba(255,255,255,0.08)' : 'none',
        transition: 'background 0.3s',
        background: hover ? 'linear-gradient(90deg, rgba(255,220,4,0.04), transparent)' : 'transparent',
      }}>
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        {/* AUDIT FIX: solid black background masks the timeline gradient line
            that sits behind the column. The previous near-transparent
            rgba(255,255,255,0.04) let the line bleed through the number. */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: hover ? '#FFDC04' : '#000',
          color: hover ? '#000' : '#fff',
          border: `1px solid ${hover ? '#FFDC04' : 'rgba(255,255,255,0.18)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
          transition: 'all 0.3s',
        }}>{num}</div>
      </div>
      <div>
        <h3 style={{ fontSize: 'clamp(20px, 2.4vw, 30px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', margin: 0, lineHeight: 1.15 }}>{title}</h3>
        <p className="fg-2" style={{ fontSize: 16, lineHeight: 1.55, marginTop: 8, maxWidth: 680 }}>{desc}</p>
      </div>
      <div className="hide-sm" style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase', color: hover ? '#FFDC04' : 'rgba(255,255,255,0.35)', transition: 'color 0.3s' }}>{dur}</div>
    </div>
  );
};

// ── WORK / CASE STUDIES ─────────────────────────────────────────
// AUDIT FIX (May 2): Cover images now come from data/content.ts case-study
// hero photos. Replaces the previous AbstractArt SVG gradients (which
// looked like generic placeholders) with real client work — much stronger
// proof for paid traffic.
// Each card declares the curated metric we want on the audit LP plus the
// `contentSlug` pointing at the full case-study record in data/content.ts.
// Click → CaseStudyModal renders the full record (description, scope,
// results, gallery, testimonial) without a full-page navigation.
interface CaseStudy {
  slug: string;
  contentSlug: string;
  brand: string;
  tags: string[];
  stat: string;
  label: string;
  accent: string;
  coverImage: string;
}

const CASES: CaseStudy[] = [
  { slug: 'flexibuy', contentSlug: 'flexibuy-vans',       brand: 'Flexibuy Vans',       tags: ['Web', 'Performance'], stat: '£3.27',  label: 'Cost per lead (60% below industry)', accent: '#FFDC04', coverImage: '/photos/case studies/flexibuy/R6SmStBRWkdMyr0M37aqdGCtXE4.png' },
  { slug: 'police',   contentSlug: 'police-mortgages',    brand: 'Police Mortgages',    tags: ['Brand', 'Web'],       stat: '300%',   label: 'Organic traffic increase',           accent: '#63CC79', coverImage: '/photos/case studies/police mortgages/0wJP1agTSjS5C320be836kZIJs.png' },
  { slug: 'ao',       contentSlug: 'ao-restaurant',       brand: 'Restaurant AO',       tags: ['Identity', 'Web'],    stat: '564%',   label: 'Page views, first 30 days',          accent: '#EF8869', coverImage: '/photos/case studies/restaurant ao/H1LRHrlVpO97096mUHjZSE4FtQ.png' },
  { slug: 'hmo',      contentSlug: 'hmo-checker',         brand: 'HMO Checker',         tags: ['SaaS', 'Funnel'],     stat: '1,500+', label: 'Early sign-ups, V1 launch',          accent: '#7D5DFF', coverImage: '/photos/case studies/hmo checker/vH7DvEmgOwmG0bLogLYVhsDns.png' },
  { slug: 'ptf',      contentSlug: 'playing-the-field',   brand: 'Playing The Field',   tags: ['Events', 'Web'],      stat: '+50%',   label: 'Ticket leads vs. prior page',        accent: '#EA6DF8', coverImage: '/photos/case studies/playing the field/X5fKwSMk9XDzKn4EWMXlgpmH2uU.png' },
  { slug: 'blue',     contentSlug: 'bluestone-mortgages', brand: 'Bluestone Mortgages', tags: ['Brand', 'Print'],     stat: '+20%',   label: 'Engagement lift',                    accent: '#FFDC04', coverImage: '/photos/case studies/bluestone mortgages/BnvDGMJ8q8bQ3qvekK0FEy0sUs.png' },
];

export const Work: React.FC = () => {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  // Build a quick lookup so click handlers don't re-scan the array.
  const fullBySlug = useMemo(() => {
    const m = new Map<string, CaseStudyData>();
    fullCaseStudies.forEach((c) => m.set(c.slug, c as unknown as CaseStudyData));
    return m;
  }, []);
  const activeCase = openSlug ? fullBySlug.get(openSlug) || null : null;

  return (
    <section id="work" className="section" style={{ background: '#050505' }}>
      <div className="container-wide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap', marginBottom: 48, padding: '0 clamp(0px, 1vw, 16px)' }}>
          <div style={{ maxWidth: 720 }}>
            <Eyebrow num="04 / Selected work">Recent wins</Eyebrow>
            <h2 style={{ fontSize: 'clamp(32px, 4.4vw, 64px)', fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff', marginTop: 18 }}>
              We measure by<br />
              <span className="fg-3">enquiries, not </span><span style={{ fontStyle: 'italic', fontFamily: 'AuditGelasio, serif', fontWeight: 500 }}>applause.</span>
            </h2>
          </div>
          <a href="#start" className="link-u" style={{ fontSize: 14 }}>
            Get my free audit {Icon.arrow(14)}
          </a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="work-grid">
          {CASES.map((c, i) => (
            <CaseCard key={i} {...c} onClick={() => setOpenSlug(c.contentSlug)} />
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 980px) { .audit-lp .work-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .audit-lp .work-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <CaseStudyModal
        caseStudy={activeCase}
        onClose={() => setOpenSlug(null)}
        source="Audit LP Recent Wins"
      />
    </section>
  );
};

const CaseCard: React.FC<CaseStudy & { onClick: () => void }> = ({ brand, tags, stat, label, accent, coverImage, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Open ${brand} case study`}
      style={{
        position: 'relative', borderRadius: 24, overflow: 'hidden',
        background: '#0A0A0A',
        border: `1px solid ${hover ? 'rgba(255,220,4,0.45)' : 'rgba(255,255,255,0.08)'}`,
        transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
        transform: hover ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hover ? '0 24px 60px rgba(0,0,0,0.5)' : 'none',
        aspectRatio: '4 / 5',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: 24,
        cursor: 'pointer',
        outline: 'none',
      }}>
      {/* Real client cover image (replaces AbstractArt) */}
      <img
        src={coverImage}
        alt={`${brand} case study`}
        loading="lazy"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: 0.95,
          transform: hover ? 'scale(1.04)' : 'scale(1)',
          transition: 'transform 0.5s cubic-bezier(0.21,0.47,0.32,0.98)',
        }}
      />
      {/* Gradient overlay so the stat + brand name stay legible */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.92) 100%)' }} />

      <div style={{ position: 'relative', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {tags.map(t => (
          <span key={t} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.18)', padding: '5px 10px', borderRadius: 9999 }}>{t}</span>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 'clamp(34px, 3.6vw, 56px)', fontWeight: 700, letterSpacing: '-0.035em', color: accent, lineHeight: 1, fontFamily: 'AuditSatoshi', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
          {stat}
        </div>
        <div className="fg-2" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 8, maxWidth: 280, color: 'rgba(255,255,255,0.78)' }}>{label}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{brand}</span>
          <span style={{ color: hover ? accent : 'rgba(255,255,255,0.6)', transition: 'color 0.3s, transform 0.3s', transform: hover ? 'translateX(3px)' : 'translateX(0)' }}>
            {Icon.arrow(16)}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── PROOF (testimonial carousel + lifetime stats) ────────────────
const QUOTES = [
  { q: "Milktree didn't just redesign our brand. They gave us a system our whole team can actually use. The result: more leads, better fit, less chaos.", n: 'Chris', r: 'Director, Police Mortgages' },
  { q: "They took us from an idea to a full growth engine. Website, funnel, ads, CRM, all working together. We didn't just prove demand, we built the system to scale.", n: 'Edward', r: 'Founder, HMO Checker' },
  { q: "The new site feels as refined as the restaurant itself. Bookings and engagement jumped from day one.", n: 'Daniel Rogan', r: 'Chef Patron, Restaurant AO' },
];

export const Proof: React.FC = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % QUOTES.length), 7000);
    return () => clearInterval(id);
  }, []);
  const t = QUOTES[i];

  return (
    <section id="proof" className="section">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }} className="proof-grid">
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(255,220,4,0.06), rgba(255,255,255,0.015))',
            border: '1px solid rgba(255,220,4,0.18)',
            borderRadius: 40,
            padding: 'clamp(32px, 4vw, 56px)',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 24, right: 28, fontSize: 140, fontFamily: 'AuditGelasio, serif', lineHeight: 0.7, color: 'rgba(255,220,4,0.18)', fontWeight: 700 }}>"</div>
            <Eyebrow num="05 / Proof">Clients</Eyebrow>
            <blockquote
              key={i}
              style={{
                fontSize: 'clamp(22px, 2.4vw, 34px)', fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.02em',
                color: '#fff', margin: '20px 0 0',
                fontFamily: 'AuditGelasio, serif', fontStyle: 'italic',
                animation: 'audit-fadeUp 0.6s cubic-bezier(0.21,0.47,0.32,0.98)',
              }}
            >
              "{t.q}"
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FFDC04', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>{t.n[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>{t.n}</div>
                <div className="fg-3" style={{ fontSize: 13 }}>{t.r}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                {QUOTES.map((_, j) => (
                  <button
                    key={j}
                    onClick={() => setI(j)}
                    aria-label={`Show quote ${j + 1}`}
                    style={{ width: j === i ? 24 : 8, height: 8, borderRadius: 9999, background: j === i ? '#FFDC04' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <StatBlock big="11k+" small="new users within weeks of a Police Mortgages relaunch" tone="green" />
            <StatBlock big="257"  small="qualified leads from £840 in Flexibuy ad spend"           tone="yellow" />
            <StatBlock big="400%" small="more sessions for Restaurant AO, first 30 days"          tone="coral" />
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .audit-lp .proof-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
};

const StatBlock: React.FC<{ big: string; small: string; tone: 'green' | 'yellow' | 'coral' }> = ({ big, small, tone }) => {
  const map = { green: '#63CC79', yellow: '#FFDC04', coral: '#EF8869' } as const;
  const c = map[tone];
  return (
    <div style={{
      borderRadius: 24, padding: 28,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 700, letterSpacing: '-0.035em', color: c, lineHeight: 1 }}>{big}</div>
      <div className="fg-2" style={{ fontSize: 14.5, lineHeight: 1.5 }}>{small}</div>
    </div>
  );
};

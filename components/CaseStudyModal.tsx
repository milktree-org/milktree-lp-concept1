/**
 * CaseStudyModal — content-rich popup for a single case study.
 *
 * Wired into:
 *   - sections/CaseStudies.tsx               (main LP "Real businesses. Real results.")
 *   - pages/audit/components/AuditMiddle.tsx (audit LP "Recent wins")
 *
 * Both spots used to either navigate to /work/{slug} (main LP) or be
 * non-interactive divs (audit LP). Now they open this modal in place,
 * keeping the visitor on the conversion page.
 *
 * Content comes from the existing `caseStudies` array in data/content.ts
 * (10 entries already there — no need to scrape the live site).
 *
 * A "Get my free audit" CTA at the bottom can hand off to the QualifyModal
 * via an optional onPrimaryCta prop, so the case study acts as a
 * mid-funnel asset rather than a dead end.
 */
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Quote } from 'lucide-react';
import { trackCustom } from '../utils/meta-tracking';

export interface CaseStudyData {
  slug: string;
  title: string;
  headline?: string;
  services?: string;
  tags?: string[];
  coverImage: string;
  description?: string;
  scopeOfWork?: string;
  deliverables?: string[];
  bodyText?: string;
  challenges?: string;
  solution?: string;
  results?: string[];
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialRole?: string;
  galleryImages?: string[];
}

export interface CaseStudyModalProps {
  caseStudy: CaseStudyData | null;
  onClose: () => void;
  /** Optional: called when the user clicks the bottom "Get my free audit" CTA.
   *  Use this to open your QualifyModal from the same surface. If omitted,
   *  the CTA scrolls to #audit / #start instead. */
  onPrimaryCta?: () => void;
  /** Tracking label, e.g. "Main LP CaseStudies" or "Audit LP RecentWins". */
  source?: string;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({
  caseStudy, onClose, onPrimaryCta, source = 'Case Study Modal',
}) => {
  const isOpen = !!caseStudy;

  // Body scroll lock + Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  // Fire a view event when a case study is opened
  useEffect(() => {
    if (!isOpen || !caseStudy) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'case_study_view', {
        event_category: 'Case Study',
        event_label: caseStudy.title,
        send_to: 'G-9GHX9JVN9S',
      });
    }
    trackCustom('CaseStudyView', {
      customData: { source, case_study: caseStudy.title, slug: caseStudy.slug },
    });
  }, [isOpen, caseStudy, source]);

  if (typeof document === 'undefined') return null;

  const handleCta = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {
        event_category: 'Case Study',
        event_label: `${caseStudy?.title} — Audit CTA`,
        send_to: 'G-9GHX9JVN9S',
      });
    }
    trackCustom('CTAClick', {
      customData: { source, case_study: caseStudy?.title || '' },
    });
    if (onPrimaryCta) {
      onClose();
      // Defer modal open to next tick so this one finishes closing first
      setTimeout(() => onPrimaryCta(), 50);
    } else {
      onClose();
      setTimeout(() => {
        document.getElementById('audit')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('start')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && caseStudy && (
        <motion.div
          className="csm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`${caseStudy.title} — case study`}
        >
          <motion.div
            className="csm-container"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            {/* Close button — floats over hero image */}
            <button type="button" className="csm-close" onClick={onClose} aria-label="Close case study">
              <X size={18} />
            </button>

            {/* Hero image */}
            <div className="csm-hero">
              <img src={caseStudy.coverImage} alt={caseStudy.title} className="csm-hero__img" />
              <div className="csm-hero__overlay" aria-hidden />
              <div className="csm-hero__title-wrap">
                {caseStudy.tags && caseStudy.tags.length > 0 && (
                  <div className="csm-tags">
                    {caseStudy.tags.map((t) => (
                      <span key={t} className="csm-tag">{t}</span>
                    ))}
                  </div>
                )}
                <h2 className="csm-title">{caseStudy.title}</h2>
                {caseStudy.headline && <p className="csm-headline">{caseStudy.headline}</p>}
              </div>
            </div>

            {/* Body content */}
            <div className="csm-body">
              {caseStudy.description && (
                <Section label="Overview">
                  <p className="csm-paragraph">{caseStudy.description}</p>
                </Section>
              )}

              {(caseStudy.deliverables && caseStudy.deliverables.length > 0) || caseStudy.scopeOfWork ? (
                <Section label="Scope of work">
                  {caseStudy.deliverables && caseStudy.deliverables.length > 0 ? (
                    <ul className="csm-deliverables">
                      {caseStudy.deliverables.map((d) => (
                        <li key={d}>
                          <CheckCircle size={16} color="#FFDC04" /> <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="csm-paragraph">{caseStudy.scopeOfWork}</p>
                  )}
                </Section>
              ) : null}

              {caseStudy.challenges && (
                <Section label="The challenge">
                  <p className="csm-paragraph">{caseStudy.challenges}</p>
                </Section>
              )}

              {caseStudy.solution && caseStudy.solution !== caseStudy.challenges && (
                <Section label="What we did">
                  <p className="csm-paragraph">{caseStudy.solution}</p>
                </Section>
              )}

              {caseStudy.results && caseStudy.results.length > 0 && (
                <Section label="Results">
                  <ul className="csm-results">
                    {caseStudy.results.map((r) => (
                      <li key={r}>
                        <span className="csm-results__bullet" /> <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {caseStudy.galleryImages && caseStudy.galleryImages.length > 0 && (
                <Section label="Selected screens">
                  <div className="csm-gallery">
                    {caseStudy.galleryImages.slice(0, 6).map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${caseStudy.title} sample ${i + 1}`}
                        className="csm-gallery__img"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </Section>
              )}

              {caseStudy.testimonialQuote && (
                <div className="csm-testimonial">
                  <Quote size={28} color="#FFDC04" />
                  <p className="csm-testimonial__quote">"{caseStudy.testimonialQuote}"</p>
                  {(caseStudy.testimonialName || caseStudy.testimonialRole) && (
                    <p className="csm-testimonial__attr">
                      {caseStudy.testimonialName}{caseStudy.testimonialName && caseStudy.testimonialRole ? ' · ' : ''}{caseStudy.testimonialRole}
                    </p>
                  )}
                </div>
              )}

              {/* CTA — hands off to QualifyModal (or scrolls to capture point) */}
              <div className="csm-cta">
                <p className="csm-cta__lead">Want results like these?</p>
                <button type="button" className="csm-cta__btn" onClick={handleCta}>
                  Get my free brand audit <ArrowRight size={18} />
                </button>
                <p className="csm-cta__note">Free · 90-second qualifier · Audit in 48h of the call</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <section className="csm-section">
    <h3 className="csm-section__label">{label}</h3>
    {children}
  </section>
);

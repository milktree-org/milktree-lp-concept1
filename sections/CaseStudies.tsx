import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Reveal } from '../components/animations/Reveal';
import { caseStudies } from '../data/content';
import { trackCustom } from '../utils/meta-tracking';
import { CaseStudyModal, type CaseStudyData } from '../components/CaseStudyModal';

export const CaseStudies: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const getCardWidth = () => {
    const margin = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-margin')) || 48;
    return (window.innerWidth - margin - 24 * 3) / 3 + 24;
  };

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, caseStudies.length - 1));
    setCurrentIndex(clamped);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: clamped * getCardWidth(), behavior: 'smooth' });
    }
  };

  const activeCase = openSlug
    ? (caseStudies.find((c) => c.slug === openSlug) as CaseStudyData | undefined) || null
    : null;

  const openCase = (slug: string, title: string) => {
    setOpenSlug(slug);
    trackCustom('CaseStudyOpen', { customData: { source: 'Main LP CaseStudies', case_study: title } });
  };

  return (
    <section className="cs-section" id="work">
      {/* Heading + "View all" link */}
      <div className="cs-container">
        <Reveal>
          <div className="cs-header">
            <h2 className="cs-heading">Real businesses.<br />Real results.</h2>
            {/* "View all work" still goes to the dedicated /work page for
                anyone who wants to browse the full archive. Card clicks
                open the modal in place. */}
            <Link to="/work" className="cs-view-all">
              View all work <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Full-width bleed card track */}
      <div className="cs-track-wrap">
        <div className="cs-track" ref={trackRef}>
          {caseStudies.map((study, i) => (
            <motion.div
              key={study.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98], delay: i * 0.06 }}
            >
              {/* Link still points to /work/{slug} so middle/cmd-click opens
                  the full archive page in a new tab; primary click is
                  intercepted to show the modal in place. */}
              <Link
                to={`/work/${study.slug}`}
                className="cs-card"
                onClick={(e) => {
                  // Don't intercept new-tab modifier clicks
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                  e.preventDefault();
                  openCase(study.slug, study.title);
                }}
                aria-label={`Open ${study.title} case study`}
              >
                <div className="cs-card__img-wrap">
                  <img
                    src={study.coverImage}
                    alt={study.title}
                    className="cs-card__img"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="cs-card__arrow"><ArrowRight size={18} /></div>
                </div>
                <div className="cs-card__body">
                  <div className="cs-card__meta">
                    <span className="cs-card__industry">{study.tags[0]}</span>
                  </div>
                  <h4 className="cs-card__title">{study.title}</h4>
                  <p className="cs-card__services">{study.services}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Arrow navigation */}
      <div className="cs-container">
        <div className="cs-arrows">
          <button
            className="cs-arrow-btn"
            onClick={() => scrollTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="cs-arrow-btn"
            onClick={() => scrollTo(currentIndex + 1)}
            disabled={currentIndex >= caseStudies.length - 1}
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <Reveal delay={0.1}>
          <p className="cs-cta-text">
            Want results like these?{' '}
            <button
              className="cs-cta-link"
              onClick={() => {
                if (typeof window.gtag === 'function') {
                  window.gtag('event', 'cta_click', { event_category: 'Case Studies', event_label: 'Get a free audit', send_to: 'G-9GHX9JVN9S' });
                }
                trackCustom('CTAClick', { customData: { source: 'Case Studies CTA' } });
                document.getElementById('audit')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get a free brand audit <ArrowRight size={14} />
            </button>
          </p>
        </Reveal>
      </div>

      <CaseStudyModal
        caseStudy={activeCase}
        onClose={() => setOpenSlug(null)}
        source="Main LP CaseStudies"
      />
    </section>
  );
};

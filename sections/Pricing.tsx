import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '../components/animations/Reveal';
import { Check } from 'lucide-react';
import { trackCustom } from '../utils/meta-tracking';

const oneOffIncludes = [
  'Brand positioning strategy',
  'Full messaging framework',
  'Visual identity system (logo, colour, type)',
  'Brand guidelines document',
  'Creative direction for launch',
  'Two rounds of revisions',
  '60-day post-launch support',
];

const retainerIncludes = [
  'Everything in Brand Build',
  'Monthly creative direction sessions',
  'Ongoing messaging refinement',
  'Campaign and content support',
  'Asset creation and design oversight',
  'Slack access to your brand strategist',
  'Quarterly brand performance review',
];

export const Pricing: React.FC = () => {
  const scrollToAudit = (source: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', { event_category: 'Pricing', event_label: source, send_to: 'G-9GHX9JVN9S' });
    }
    trackCustom('CTAClick', { customData: { source } });
    document.getElementById('audit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-container">

        <Reveal delay={0.05}>
          <h2 className="pricing__heading">
            One partner. Two ways to work together. No hiring headaches.
          </h2>
        </Reveal>

        <motion.div
          className="pricing__cards"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          {/* Left card — white, one-off project */}
          <div className="pricing__card pricing__card--light">
            <div className="pricing__card-top">
              <p className="pricing__card-label">Brand Build</p>
              <h3 className="pricing__card-name">One-off project</h3>
              <p className="pricing__card-price">Custom quote</p>
              <p className="pricing__card-desc">
                Everything you need to launch with a brand that positions you as the obvious choice.
              </p>
            </div>

            <div className="pricing__divider" />

            <div className="pricing__includes-label">What's included:</div>
            <ul className="pricing__list">
              {oneOffIncludes.map((item) => (
                <li key={item} className="pricing__list-item">
                  <span className="pricing__check">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="pricing__card-footer">
              <button className="pricing__cta pricing__cta--dark" onClick={() => scrollToAudit('Pricing Brand Build CTA')}>
                Book a free audit
              </button>
              <p className="pricing__footnote">Pricing depends on scope. We give you a clear quote after your free audit.</p>
            </div>
          </div>

          {/* Right card — black, monthly retainer */}
          <div className="pricing__card pricing__card--dark">
            <div className="pricing__card-top">
              <p className="pricing__card-label pricing__card-label--light">Brand Partner</p>
              <h3 className="pricing__card-name pricing__card-name--light">Monthly retainer</h3>
              <p className="pricing__card-price pricing__card-price--light">Custom quote</p>
              <p className="pricing__card-desc pricing__card-desc--light">
                Ongoing brand strategy and creative direction for companies scaling past their founding story.
              </p>
            </div>

            <div className="pricing__divider pricing__divider--light" />

            <div className="pricing__includes-label pricing__includes-label--light">What's included:</div>
            <ul className="pricing__list">
              {retainerIncludes.map((item) => (
                <li key={item} className="pricing__list-item pricing__list-item--light">
                  <span className="pricing__check pricing__check--light">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="pricing__card-footer">
              <button className="pricing__cta pricing__cta--yellow" onClick={() => scrollToAudit('Pricing Brand Partner CTA')}>
                Book a free audit
              </button>
              <p className="pricing__footnote pricing__footnote--muted">Minimum 3-month engagement.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

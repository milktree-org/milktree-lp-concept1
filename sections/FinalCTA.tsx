/**
 * FinalCTA — main LP closing section.
 *
 * Replaced with a single primary CTA that opens the <QualifyModal>. The
 * inline 2-step form was a half-step toward qualification; the modal
 * now owns the full qualification + mandatory Cal.com booking flow.
 * One source of truth for lead capture across the site.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '../components/animations/Reveal';
import { Zap, ShieldCheck, Clock, Users } from 'lucide-react';
import { QualifyModal, useQualifyModal } from '../components/QualifyModal';

export const FinalCTA: React.FC = () => {
  const modal = useQualifyModal();

  return (
    <section className="finalcta-section" id="audit">
      <div className="finalcta__container">

        <Reveal>
          <h2 className="finalcta__heading">
            See what your brand<br />is really saying.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="finalcta__subtext">
            Request your free brand audit. We'll qualify the fit in 90 seconds, then book a call and deliver your audit within 48 hours of it.
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="finalcta__form-wrap">

            {/* Single primary CTA — opens the QualifyModal */}
            <motion.button
              type="button"
              className="finalcta__btn finalcta__btn--submit"
              onClick={modal.open}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Zap size={20} fill="rgb(0,0,0)" stroke="none" />
              <span>Get My Free Audit</span>
            </motion.button>

            {/* Trust micro-row under the button */}
            <div className="finalcta__trust-row">
              <div className="finalcta__trust-item">
                <Clock size={14} /> 90-second qualifier
              </div>
              <div className="finalcta__trust-item">
                <ShieldCheck size={14} /> No pitch on the call
              </div>
              <div className="finalcta__trust-item">
                <Users size={14} /> 4 spots / month
              </div>
            </div>

            <p className="finalcta__note">Spots are limited. We take on 4 new brand builds per month.</p>

            {/* Social proof */}
            <div className="finalcta__proof">
              <p className="finalcta__proof-quote">"The audit alone gave us more clarity than 6 months of trying to figure it out ourselves."</p>
              <p className="finalcta__proof-attr">Chris, Director, Police Mortgages</p>
              <p className="finalcta__proof-stat">Join 200+ brands who started with a free audit</p>
            </div>
          </div>
        </Reveal>

      </div>

      <QualifyModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        source="Main LP FinalCTA"
      />
    </section>
  );
};

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, CalendarCheck, Phone, FileText, Mail, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { trackLead, trackCustom } from '../utils/meta-tracking';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../sections/Footer';

// Two flows arrive here:
//  (A) form-only fallback  → user submitted form but didn't book inline
//      (legacy path; CTA below sends them to Cal.com)
//  (B) ?booked=1           → user completed inline Cal.com booking on the
//      LP. Show booking-confirmation copy, hide the Book CTA.

const statusItemsBooked = [
  { icon: <CheckCircle size={16} />, label: 'Brief received' },
  { icon: <CalendarCheck size={16} />, label: 'Call booked' },
  { icon: <Mail size={16} />, label: 'Calendar invite sent' },
];

const statusItemsFallback = [
  { icon: <CheckCircle size={16} />, label: 'Brief received' },
  { icon: <Mail size={16} />, label: 'Confirmation email sent' },
  { icon: <CalendarCheck size={16} />, label: 'Book your free call below' },
];

const stepsBooked = [
  {
    icon: <CalendarCheck size={24} />,
    title: 'Your call is on the calendar',
    desc: 'Check your inbox for the confirmation and calendar invite. Add it to your calendar so you don\'t miss it.',
  },
  {
    icon: <Phone size={24} />,
    title: 'We take your brief on the call',
    desc: 'On the call, we\'ll dig into your brand, goals, and where you\'re stuck so the audit is tailored to you.',
  },
  {
    icon: <FileText size={24} />,
    title: 'Receive your audit in 48 hours',
    desc: 'Within 48 hours of the call, you\'ll get a personalised brand audit with clear, actionable next steps.',
  },
];

const stepsFallback = [
  {
    icon: <CalendarCheck size={24} />,
    title: 'Book your audit call',
    desc: 'Check your inbox. We\'ll send you a link to schedule a 30-minute call at a time that suits you.',
  },
  {
    icon: <Phone size={24} />,
    title: 'We take your brief on the call',
    desc: 'On the call, we\'ll dig into your brand, goals, and where you\'re stuck so the audit is tailored to you.',
  },
  {
    icon: <FileText size={24} />,
    title: 'Receive your audit in 48 hours',
    desc: 'Within 48 hours of the call, you\'ll get a personalised brand audit with clear, actionable next steps.',
  },
];

export const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBooked = new URLSearchParams(location.search).get('booked') === '1';
  const statusItems = isBooked ? statusItemsBooked : statusItemsFallback;
  const steps = isBooked ? stepsBooked : stepsFallback;

  useEffect(() => {
    window.scrollTo(0, 0);

    // Skip duplicate conversion firing when arriving with ?booked=1 — the
    // QualifyModal already fired Lead + Schedule + GA4 when the user confirmed
    // their slot. Re-firing here would double-count conversions (and the 2nd
    // fire carries no user data, hurting EMQ). Mirrors AuditThankYouPage.
    if (!isBooked) {
      // GA4 — thank-you page view = the LEAD conversion (form submitted).
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          event_category: 'Lead',
          event_label: 'Thank You Page View',
          value: 1,
          currency: 'GBP',
          send_to: 'G-9GHX9JVN9S',
        });
      }

      // Meta Lead event (Pixel + CAPI). Schedule is NOT fired here — it only
      // fires on a confirmed Cal.com booking (in the QualifyModal), so the
      // Schedule count reflects actual calls booked, not page views.
      trackLead({ eventSource: 'Thank You Page' });
    }
  }, [isBooked]);

  return (
    <>
      <Navbar />
      <div className="thankyou">
        <Helmet>
          <title>Thank You | Milktree Agency</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="thankyou__container">

        {/* Success icon */}
        <motion.div
          className="thankyou__icon-wrap"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <CheckCircle size={64} color="var(--color-accent)" strokeWidth={1.5} />
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="thankyou__heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isBooked ? "You're booked. Your audit starts with the call." : "You're in. Here's what happens next."}
        </motion.h1>

        <motion.p
          className="thankyou__subtext"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isBooked
            ? "Your call is booked — check your inbox for the calendar invite. We'll dig into your brand on the call, then send your personalised audit within 48 hours of it."
            : "Thanks for requesting your free brand audit. We just need one more thing: a quick call to understand your brand before we get to work."}
        </motion.p>

        {/* Status bar — moved below subtitle */}
        <motion.div
          className="thankyou__status-bar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          {statusItems.map((item, i) => (
            <div key={i} className="thankyou__status-item">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* What happens next steps */}
        <motion.div
          className="thankyou__steps"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          {steps.map((step, i) => (
            <div key={i} className="thankyou__step">
              <div className="thankyou__step-icon">
                <span className="thankyou__step-num">{i + 1}</span>
                {step.icon}
              </div>
              <div className="thankyou__step-content">
                <h3 className="thankyou__step-title">{step.title}</h3>
                <p className="thankyou__step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Book call CTA — hidden if user already booked inline on the LP */}
        {!isBooked && (
          <>
            <motion.a
              className="thankyou__book-btn"
              href="https://cal.com/milktree-agency/free-brand-digital-presence-audit-30-minutes"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (typeof window.gtag === 'function') {
                  window.gtag('event', 'book_call_click', {
                    event_category: 'Thank You',
                    event_label: 'Book My Free Call',
                    send_to: 'G-9GHX9JVN9S',
                  });
                }
                trackCustom('BookCallClick', { customData: { source: 'Thank You Page' } });
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CalendarCheck size={20} />
              <span>Book My Free Call</span>
              <ArrowRight size={18} />
            </motion.a>

            <motion.p
              className="thankyou__fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Clock size={14} />
              <span>Can't book now? Check your email for the booking link.</span>
            </motion.p>
          </>
        )}

        {/* Back to home */}
        <motion.button
          className="thankyou__home-btn"
          onClick={() => navigate('/')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
          <span>Back to Home</span>
        </motion.button>

        </div>
      </div>
      <Footer />
    </>
  );
};

import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FormspreeProvider } from '@formspree/react';
import { trackPageView, trackInitialPageViewCAPI } from './utils/meta-tracking';
import { captureLeadTracking } from './utils/lead-tracking';

// ── Analytics tracker (GA4 + Meta Pixel + CAPI) ─────────────────────────────
// Fires page_view on every route change
const AnalyticsTracker: React.FC = () => {
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Page view on route change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Capture marketing attribution (UTMs, click IDs) from the landing
      // URL into local/session storage, so any subsequent form submission
      // or Cal.com booking can include the full attribution context.
      // Must run on first render (before any conversion event) to lock in
      // the FIRST-TOUCH that brought the visitor to the site.
      captureLeadTracking();

      // Fire CAPI for the initial PageView (pixel already fired in index.html)
      trackInitialPageViewCAPI();
      return;
    }

    // SPA route change — re-check the URL in case attribution params landed
    // on a later route (e.g. user shared a /audit?utm_... link mid-session).
    captureLeadTracking();

    // GA4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
        send_to: 'G-9GHX9JVN9S',
      });
    }

    // Meta Pixel + CAPI (SPA route change)
    trackPageView();
  }, [location]);

  return null;
};
import { Navbar } from './components/ui/Navbar';
import { Hero } from './sections/Hero';
import { Footer } from './sections/Footer';
import { HomepageSchema } from './components/SchemaMarkup';
import { StickyMobileCTA } from './components/ui/StickyMobileCTA';

// Below-fold sections — code-split so they don't block initial render
const Problem    = lazy(() => import('./sections/Problem').then(m => ({ default: m.Problem })));
const Process    = lazy(() => import('./sections/Process').then(m => ({ default: m.Process })));
const WhatWeDo   = lazy(() => import('./sections/WhatWeDo').then(m => ({ default: m.WhatWeDo })));
const WhyMilktree = lazy(() => import('./sections/WhyMilktree').then(m => ({ default: m.WhyMilktree })));
const Results    = lazy(() => import('./sections/Results').then(m => ({ default: m.Results })));
const CaseStudies = lazy(() => import('./sections/CaseStudies').then(m => ({ default: m.CaseStudies })));
const Pricing    = lazy(() => import('./sections/Pricing').then(m => ({ default: m.Pricing })));
const TrustedBy  = lazy(() => import('./sections/TrustedBy').then(m => ({ default: m.TrustedBy })));
const FAQ        = lazy(() => import('./sections/FAQ').then(m => ({ default: m.FAQ })));
const FinalCTA   = lazy(() => import('./sections/FinalCTA').then(m => ({ default: m.FinalCTA })));
const CaseStudiesPage    = lazy(() => import('./pages/CaseStudiesPage').then(m => ({ default: m.CaseStudiesPage })));
const CaseStudyDetailPage = lazy(() => import('./pages/CaseStudyDetailPage').then(m => ({ default: m.CaseStudyDetailPage })));
const ThankYouPage       = lazy(() => import('./pages/ThankYouPage').then(m => ({ default: m.ThankYouPage })));
const AuditLandingPage   = lazy(() => import('./pages/AuditLandingPage').then(m => ({ default: m.AuditLandingPage })));
const AuditThankYouPage  = lazy(() => import('./pages/AuditThankYouPage').then(m => ({ default: m.AuditThankYouPage })));
const CareersPage        = lazy(() => import('./pages/CareersPage').then(m => ({ default: m.CareersPage })));
const PrivacyPolicyPage  = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));

// audit.milktreeagency.com is the dedicated subdomain for the paid-traffic LP.
// On that host:
//   /          → AuditLandingPage (URL stays clean)
//   /thank-you → AuditThankYouPage
//   *          → redirect back to /
// On the main domain (milktreeagency.com), all routes work as before, plus
//   /audit            → AuditLandingPage
//   /audit/thank-you  → AuditThankYouPage
const isAuditSubdomain =
  typeof window !== 'undefined' && window.location.hostname === 'audit.milktreeagency.com';

const HomePage: React.FC = () => (
  <>
    <Helmet>
      <title>Milktree Agency | Brand Identity That Sells For You</title>
      <meta name="description" content="We build brand identities that make businesses clear, trusted, and the obvious choice. 200+ brands built across 10+ industries. Book your free brand audit." />
      <link rel="canonical" href="https://milktreeagency.com/" />
      <meta property="og:title" content="Milktree Agency | Brand Identity That Sells For You" />
      <meta property="og:description" content="We build brand identities that make businesses clear, trusted, and the obvious choice. 200+ brands built. Book your free brand audit." />
      <meta property="og:url" content="https://milktreeagency.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://milktreeagency.com/logos/favicon.svg" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Milktree Agency | Brand Identity That Sells For You" />
      <meta name="twitter:description" content="We build brand identities that make businesses clear, trusted, and the obvious choice. 200+ brands built." />
    </Helmet>
    <HomepageSchema />
    <Navbar />
    <main>
      <Hero />
      <Suspense fallback={null}>
        <Problem />
        <Process />
        <WhatWeDo />
        <CaseStudies />
        <WhyMilktree />
        <Results />
        <Pricing />
        <TrustedBy />
        <FAQ />
        <FinalCTA />
      </Suspense>
    </main>
    <Footer />
    <StickyMobileCTA />
  </>
);

const App: React.FC = () => {
  return (
    <FormspreeProvider project="2950084415100813029">
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>
          {isAuditSubdomain ? (
            <>
              {/* On audit.milktreeagency.com: only the LP + LP thank-you exist */}
              <Route path="/" element={<Suspense fallback={null}><AuditLandingPage /></Suspense>} />
              <Route path="/thank-you" element={<Suspense fallback={null}><AuditThankYouPage /></Suspense>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/work" element={<Suspense fallback={null}><CaseStudiesPage /></Suspense>} />
              <Route path="/work/:slug" element={<Suspense fallback={null}><CaseStudyDetailPage /></Suspense>} />
              <Route path="/thank-you" element={<Suspense fallback={null}><ThankYouPage /></Suspense>} />
              <Route path="/audit" element={<Suspense fallback={null}><AuditLandingPage /></Suspense>} />
              <Route path="/audit/thank-you" element={<Suspense fallback={null}><AuditThankYouPage /></Suspense>} />
              <Route path="/careers" element={<Suspense fallback={null}><CareersPage /></Suspense>} />
              <Route path="/privacy-policy" element={<Suspense fallback={null}><PrivacyPolicyPage /></Suspense>} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </FormspreeProvider>
  );
};

export default App;

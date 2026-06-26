import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import AdminPage from './pages/AdminPage';
import ProductLandingPage from './pages/ProductLandingPage';
import CompressPage from './pages/CompressPage';

/**
 * SPA Route Change Tracker
 * ─────────────────────────────────────────────────────────────
 * Fires a `virtualPageView` event into the GTM dataLayer on every
 * React Router navigation. This is critical for SPAs because GTM's
 * default "Page View" trigger only fires on full HTML page loads.
 *
 * In GTM, create a trigger: Custom Event → Event name: virtualPageView
 * Then attach it to your GA4 / Meta Pixel pageview tags.
 */
function RouteChangeTracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'virtualPageView',
        pagePath: location.pathname + location.search,
        pageTitle: document.title,
      });
    }
    // Meta Pixel SPA tracking
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);
  return null;
}

function CatalogLayout() {
  return (
    <>
      <Navbar />
      <CatalogPage />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RouteChangeTracker />
      <Routes>
        <Route path="/"      element={<CatalogLayout />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/compress" element={<CompressPage />} />
        <Route path="/p/:id" element={<ProductLandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

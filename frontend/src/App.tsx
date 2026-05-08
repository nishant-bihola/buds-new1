import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useScroll, useSpring } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { AgeGate } from "./components/AgeGate";
import { SlidingCart } from "./components/SlidingCart";
import { motion, AnimatePresence } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ContentProvider } from "./context/ContentContext";
import { StoreProvider } from "./context/StoreContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Home = React.lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const ShopPage = React.lazy(() => import("./pages/Shop").then(m => ({ default: m.ShopPage })));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails").then(m => ({ default: m.ProductDetails })));
const Checkout = React.lazy(() => import("./pages/Checkout").then(m => ({ default: m.Checkout })));
const OrderTracking = React.lazy(() => import("./pages/OrderTracking").then(m => ({ default: m.OrderTracking })));
const AboutPage = React.lazy(() => import("./pages/About").then(m => ({ default: m.AboutPage })));
const Admin = React.lazy(() => import("./pages/Admin"));
const Till = React.lazy(() => import("./pages/Till").then(m => ({ default: m.Till })));
const SherwoodPark = React.lazy(() => import("./pages/seo/SherwoodPark").then(m => ({ default: m.SherwoodPark })));

function ScrollToTop() {
  const { pathname, search } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname, search]);
  return null;
}

function AppInner() {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const isAdmin = location.pathname.startsWith("/admin") || location.pathname.startsWith("/till");

  return (
    <div className="min-h-screen selection:bg-brand-green selection:text-brand-light-green">
      <motion.div className="scroll-progress" style={{ scaleX }} />

      <AgeGate>
        {!isAdmin && <Navbar />}
        <SlidingCart />
        <main>
          <React.Suspense
            fallback={
              <div className="h-screen bg-[#060b08] flex items-center justify-center">
                <div className="w-8 h-8 border-2.5 border-brand-light-green/20 border-t-brand-light-green rounded-full animate-spin" />
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order/:orderId" element={<OrderTracking />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/till" element={<Till />} />
                  <Route path="/sherwood-park-cannabis" element={<SherwoodPark />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </React.Suspense>
        </main>
        {!isAdmin && <Footer />}
      </AgeGate>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

const AppCrashFallback = (
  <div className="min-h-screen bg-[#060b08] flex flex-col items-center justify-center gap-6 text-white px-4">
    <img src="/images/buds_n_buddies_logo.png" alt="Bud N' Buddies" className="h-14 w-auto object-contain" />
    <p className="text-brand-light-green font-black uppercase tracking-widest text-sm">Something went wrong</p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="bg-brand-green text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:brightness-110 transition-all"
    >
      Reload Page
    </button>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary fallback={AppCrashFallback}>
      <ToastProvider>
        <StoreProvider>
          <ContentProvider>
            <CartProvider>
              <AppInner />
            </CartProvider>
          </ContentProvider>
        </StoreProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export function AppWrapper() {
  return (
    <Router>
      <ScrollToTop />
      <App />
    </Router>
  );
}

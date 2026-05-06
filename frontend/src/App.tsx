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

const Home = React.lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const AboutPage = React.lazy(() => import("./pages/About").then(m => ({ default: m.AboutPage })));
const ShopPage = React.lazy(() => import("./pages/Shop").then(m => ({ default: m.ShopPage })));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails").then(m => ({ default: m.ProductDetails })));
const Checkout = React.lazy(() => import("./pages/Checkout").then(m => ({ default: m.Checkout })));
const OrderSuccess = React.lazy(() => import("./pages/OrderSuccess").then(m => ({ default: m.OrderSuccess })));
const Admin = React.lazy(() => import("./pages/Admin"));
const OrderTracking = React.lazy(() => import("./pages/OrderTracking").then(m => ({ default: m.OrderTracking })));
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
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen selection:bg-brand-green selection:text-brand-light-green">
      <motion.div className="scroll-progress" style={{ scaleX }} />

      <AgeGate>
        {!isAdmin && <Navbar />}
        <SlidingCart />
        <main>
          <React.Suspense
            fallback={
              <div className="h-screen bg-brand-earth flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
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
                  <Route path="/order/success" element={<OrderSuccess />} />
                  <Route path="/order/:orderId" element={<OrderTracking />} />
                  <Route path="/admin" element={<Admin />} />
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

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </ToastProvider>
  );
}

export function AppWrapper() {
  return (
    <Router basename="/clickncollect">
      <ScrollToTop />
      <App />
    </Router>
  );
}

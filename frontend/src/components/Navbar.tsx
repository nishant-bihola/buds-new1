import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react"; // Change to "framer-motion" if you get import errors on older versions
import { ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";

export function Navbar() {
  const { cartCount, openCart } = useCart();
  const store = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
  ];

  const exploreCategories = [
    { name: "Dried Flower", path: "/shop?category=Dried Flower" },
    { name: "Edibles", path: "/shop?category=Edible" },
    { name: "Vapes", path: "/shop?category=Vape" },
    { name: "Pre-Rolls", path: "/shop?category=Pre-Roll" },
    { name: "Concentrates", path: "/shop?category=Concentrate" },
    { name: "Beverages", path: "/shop?category=Beverage" },
  ];

  const CartButton = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
    <button
      type="button"
      aria-label={`Open cart — ${cartCount} item${cartCount !== 1 ? "s" : ""}`}
      onClick={openCart}
      className={`relative p-2.5 rounded-full transition-all hover:scale-110 active:scale-95 ${className}`}
    >
      <ShoppingCart size={size} strokeWidth={2.5} />
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.span
            key="cart-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-0.5 -right-0.5 text-[9px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-[0_2px_10px_rgba(0,0,0,0.2)] bg-brand-light-green text-brand-green"
          >
            <motion.span
              key={cartCount}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              {cartCount > 99 ? "99+" : cartCount}
            </motion.span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-3 sm:px-4 md:px-8 pt-4 sm:pt-6 pointer-events-none">
      <div
        className={`max-w-7xl mx-auto h-16 sm:h-20 flex items-center px-4 sm:px-6 lg:px-10 rounded-full border transition-all duration-500 pointer-events-auto shadow-2xl relative ${isScrolled
          ? "bg-brand-earth/95 backdrop-blur-xl border-brand-green/10"
          : "bg-brand-green/95 backdrop-blur-md border-white/5"
          }`}
      >
        {/* Mobile Navbar */}
        <div className="flex lg:hidden items-center justify-between w-full gap-4">
          <Link to="/" className="shrink-0">
            <img
              src="/images/buds_n_buddies_logo.png"
              alt="Bud n' Buddies"
              className="h-10 sm:h-11 w-auto object-contain transition-all duration-300"
            />
          </Link>
          <div className="flex items-center gap-3">
            <CartButton
              size={18}
              className={isScrolled ? "bg-brand-green/5 text-brand-green" : "bg-white/10 text-white"}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2.5 rounded-full transition-colors ${
                isScrolled || isMenuOpen 
                  ? "bg-brand-green text-brand-earth" 
                  : "bg-white/10 text-white"
              }`}
            >
              {isMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
            </motion.button>
          </div>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden lg:flex items-center justify-between w-full">
          {/* Left: Explore */}
          <div className="flex-1 flex justify-start">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-all shrink-0 shadow-lg ${isScrolled ? "bg-brand-green text-brand-earth shadow-brand-green/10" : "bg-brand-earth text-brand-green shadow-black/10"
                }`}
            >
              {isMenuOpen ? <X size={14} strokeWidth={3} /> : <Menu size={14} strokeWidth={3} />}
              <span>Explore</span>
            </motion.button>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="group shrink-0 absolute left-1/2 -translate-x-1/2">
            <img
              src="/images/buds_n_buddies_logo.png"
              alt="Bud n' Buddies"
              className="h-12 xl:h-14 w-auto object-contain transition-all duration-500 group-hover:scale-105"
              loading="eager"
            />
          </Link>

          {/* Right: Nav Links & Cart */}
          <div className="flex-1 flex items-center justify-end gap-10 xl:gap-14">
            <div className="flex items-center gap-8 xl:gap-12">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:scale-110 whitespace-nowrap ${location.pathname === link.path
                    ? isScrolled
                      ? "text-brand-green"
                      : "text-brand-light-green"
                    : isScrolled
                      ? "text-brand-green/70 hover:text-brand-green"
                      : "text-white/70 hover:text-white"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center">
              <CartButton
                size={20}
                className={isScrolled ? "bg-brand-green/5 text-brand-green" : "bg-white/10 text-white"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 90% 10%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 90% 10%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 90% 10%)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 h-[100dvh] bg-brand-green z-[60] flex flex-col overflow-y-auto pointer-events-auto"
          >
            {/* Overlay Header */}
            <div className="flex justify-between items-center px-6 sm:px-12 pt-6 sm:pt-10 shrink-0 relative z-10">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <img
                  src="/images/buds_n_buddies_logo.png"
                  alt="Bud n' Buddies"
                  className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
                />
              </Link>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMenuOpen(false)}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-brand-earth/10 border border-brand-earth/20 flex items-center justify-center text-brand-earth hover:bg-brand-earth/20 transition-all"
              >
                <X size={24} strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Menu Links Content - Fixed justify-start for mobile scroll safety */}
            <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-start lg:justify-center gap-10 lg:gap-24 px-6 sm:px-12 py-10 sm:py-16 mt-4 sm:mt-8">
              {/* Primary Navigation */}
              <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-6">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-brand-earth/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1"
                >
                  Navigate
                </motion.span>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ 
                      delay: 0.3 + i * 0.1, 
                      duration: 0.8, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-[clamp(2.5rem,10vw,5rem)] font-black uppercase tracking-tighter leading-none transition-all hover:translate-x-4 ${
                        location.pathname === link.path
                          ? "text-brand-light-green"
                          : "text-brand-earth hover:text-brand-light-green"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Secondary Navigation (Categories) */}
              <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-5 pt-6 lg:pt-0 lg:border-l lg:border-brand-earth/20 lg:pl-24">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-brand-earth/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1"
                >
                  Shop by Category
                </motion.span>
                {exploreCategories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ 
                      delay: 0.5 + i * 0.08, 
                      duration: 0.8, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                  >
                    <Link
                      to={cat.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="group flex items-center gap-3 text-xl sm:text-2xl font-bold uppercase tracking-tight text-brand-earth hover:text-brand-light-green transition-colors"
                    >
                      {cat.name}
                      <ArrowRight
                        size={18}
                        className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer / Location Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="shrink-0 px-6 sm:px-12 pb-10 sm:pb-14 flex flex-col sm:flex-row items-center justify-between gap-6 text-brand-earth/60 mt-auto"
            >
              <div className="text-center sm:text-left flex flex-col gap-1">
                <p className="font-black uppercase tracking-[0.2em] text-[10px] mb-1">Our Location</p>
                <p className="font-bold uppercase tracking-widest text-[11px] text-brand-earth">
                  {store.addressShort}
                </p>
              </div>
              <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
                <div className="text-center sm:text-right">
                  <p className="mb-1">Call Us</p>
                  <a
                    href={`tel:${store.phoneDial}`}
                    className="text-[11px] text-brand-earth hover:text-brand-light-green transition-colors"
                  >
                    {store.phone}
                  </a>
                </div>
                <div className="text-center sm:text-right">
                  <p className="mb-1 text-brand-earth/60">Hours</p>
                  <p className="text-[11px] text-brand-earth">{store.hoursShort}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

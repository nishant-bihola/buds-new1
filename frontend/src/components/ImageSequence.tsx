/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Scroll-driven image sequence — cinematic product reveal inspired by framer.website
 */
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const FRAMES = [
  { src: "/images/island_pink_kush.png",          label: "Island Pink Kush",           cat: "Dried Flower", color: "#c084fc" },
  { src: "/images/nano_banana_kush.png",           label: "Nano Banana Kush",           cat: "Dried Flower", color: "#facc15" },
  { src: "/images/multi_pack_prerolls.png",        label: "Multi-Pack Pre-Rolls",       cat: "Pre-Roll",     color: "#34d399" },
  { src: "/images/bubble_kush_soda.png",           label: "Bubble Kush Soda",           cat: "Edible",       color: "#38bdf8" },
  { src: "/images/high_voltage_vape.png",          label: "High Voltage Vape",          cat: "Vape",         color: "#fb923c" },
  { src: "/images/bhang_cookies_cream.png",        label: "Bhang Cookies & Cream",     cat: "Edible",       color: "#e879f9" },
  { src: "/images/chowie_wowie_caramel.png",       label: "Chowie Wowie Caramel",       cat: "Edible",       color: "#fbbf24" },
  { src: "/images/snapback_blackberry_creamsicle.png", label: "Snapback Blackberry",   cat: "Pre-Roll",     color: "#a78bfa" },
  { src: "/images/signature_preroll_fan.png",      label: "Signature Pre-Roll Fan",     cat: "Pre-Roll",     color: "#4ade80" },
  { src: "/images/blue_tip_classic.png",           label: "Blue Tip Classic",           cat: "Pre-Roll",     color: "#60a5fa" },
];

const COPY = [
  "Premium Cannabis.",
  "Curated for You.",
  "Open Until 2AM.",
  "Price Matched.",
  "Sherwood Park's Best.",
];

export function ImageSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFrame, setActiveFrame] = useState(0);
  const [copyIdx, setCopyIdx]         = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring-smooth progress
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 18 });

  // Drive frame index off scroll
  useEffect(() => {
    return smoothProgress.on("change", (v) => {
      const idx = Math.min(FRAMES.length - 1, Math.floor(v * FRAMES.length));
      setActiveFrame(idx);
      setCopyIdx(Math.min(COPY.length - 1, Math.floor(v * COPY.length)));
    });
  }, [smoothProgress]);

  // Parallax transforms — reduced on mobile for performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const imgScale = useTransform(smoothProgress, [0, 1], isMobile ? [1.02, 0.98] : [1.08, 0.96]);
  const imgY     = useTransform(smoothProgress, [0, 1], isMobile ? ["0%", "-1%"] : ["0%", "-4%"]);

  const frame = FRAMES[activeFrame];

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: `${FRAMES.length * 100}vh` }}
      aria-label="Featured products scroll sequence"
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#050a07] flex flex-col">

        {/* Background image */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: imgScale, y: imgY }}
          transition={{ duration: 0 }}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={frame.src}
              src={frame.src}
              alt={frame.label}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            />
          </AnimatePresence>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a07] via-[#050a07]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050a07]/70 via-transparent to-transparent" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full px-6 md:px-16 py-8 md:py-12 max-w-7xl mx-auto w-full">

          {/* Top: eyebrow */}
          <div className="flex items-center gap-3 pt-2">
            <span className="w-8 h-px bg-brand-light-green/60" />
            <span className="text-brand-light-green/60 text-[9px] font-black uppercase tracking-[0.4em]">
              Featured Products
            </span>
          </div>

          {/* Middle: rotating copy */}
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={copyIdx}
                  className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black uppercase tracking-tighter leading-[0.85] text-white"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  {COPY[copyIdx]}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* Product label */}
            <AnimatePresence mode="wait">
              <motion.div
                key={frame.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <span
                  className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.35em]"
                  style={{ background: `${frame.color}22`, color: frame.color, border: `1px solid ${frame.color}40` }}
                >
                  {frame.cat}
                </span>
                <span className="text-white/50 text-sm font-bold uppercase tracking-widest">
                  {frame.label}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom: progress + CTA */}
          <div className="flex items-end justify-between">

            {/* Frame progress dots */}
            <div className="flex items-center gap-1.5">
              {FRAMES.map((_, i) => (
                <motion.div
                  key={i}
                  className="rounded-full bg-white"
                  animate={{
                    width: i === activeFrame ? 20 : 4,
                    opacity: i === activeFrame ? 1 : 0.2,
                  }}
                  style={{ height: 4 }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/shop"
              className="group flex items-center gap-2 bg-white/10 hover:bg-brand-light-green/20 backdrop-blur-sm border border-white/10 hover:border-brand-light-green/40 text-white px-5 py-3 rounded-full transition-all duration-300"
            >
              <span className="text-xs font-black uppercase tracking-widest">Shop Now</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Scroll hint */}
          <motion.div
            className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-white/40 text-[8px] font-black uppercase tracking-[0.4em] [writing-mode:vertical-lr]">
              Scroll
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

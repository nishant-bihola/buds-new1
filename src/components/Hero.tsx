/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Unauthorized copying or distribution of this file is strictly prohibited.
 */
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ImageTrail } from "@/components/ui/image-trail";
import { useMouseVector } from "@/components/hooks/use-mouse-vector";
import { TRANSITIONS } from "@/lib/animations";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll logic for fading text on scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 40, damping: 18, mass: 0.8 });

  const { vector: mouseVector } = useMouseVector(sectionRef);

  const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // Parallax logic
  const parallaxX = useSpring(0, { stiffness: 100, damping: 30 });
  const parallaxY = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    parallaxX.set(mouseVector.dx * 0.05);
    parallaxY.set(mouseVector.dy * 0.05);
  }, [mouseVector, parallaxX, parallaxY]);

  const contentX = useSpring(useTransform(parallaxX, (v) => v * 1.5), { stiffness: 100, damping: 30 });
  const contentY = useTransform([parallaxY], ([py]) => (py as number) * 1.5);

  const trailImages = [
    "/images/modern_dispensary_luxury.png",
    "/images/island_pink_kush.png",
    "/images/boutique_cannabis_lifestyle.png",
    "/images/nano_banana_kush.png",
    "/images/multi_pack_prerolls.png",
    "/images/bubble_kush_soda.png",
  ];

  const wordVars = {
    hidden: { y: "60%", opacity: 0 },
    visible: (i: number) => ({
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: TRANSITIONS.PREMIUM,
        delay: 0.15 + i * 0.1,
      },
    }),
  };

  const stats = [
    ["4.9★", "Google Rating"],
    ["2 AM", "Close Time"],
    ["365", "Days / Year"],
  ];

  return (
    <section ref={sectionRef} className="relative h-[100dvh] w-full bg-[#060b08] overflow-hidden">
      
      {/* ── Background Video ────────────────────────────────────────────── */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ x: parallaxX, y: parallaxY, scale: 1.05 }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover pointer-events-none"
          poster="/images/brand_hero.png"
          style={{ contentVisibility: 'auto' }}
        >
          <source src="/videos/hero_bg.mp4" type="video/mp4" />
        </video>
        {/* Stronger overlays for maximum text punch */}
        <div className="absolute inset-0 bg-black/50 z-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent z-1" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-1" />
      </motion.div>

      {/* ── Image Trail Overlay ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-5 pointer-events-none opacity-60">
        <ImageTrail containerRef={sectionRef}>
          {trailImages.map((url, i) => (
            <div key={i} className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-brand-green/20 backdrop-blur-sm">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </ImageTrail>
      </div>

      {/* ── Content Layer ──────────────────────────────────────────────── */}
      <motion.div
        style={{ x: contentX, y: contentY }}
        className="relative z-10 h-full flex flex-col justify-start pt-24 sm:pt-32 px-6 sm:px-12 md:px-20 lg:px-28 max-w-[1440px] mx-auto pointer-events-none"
      >
        <div className="w-full pointer-events-auto" style={{ maxWidth: "min(850px, 95vw)" }}>
          
          {/* Headline + Status Badge Group */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 shrink-0"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inset-0 rounded-full bg-brand-light-green opacity-75" />
                <span className="relative rounded-full h-2.5 w-2.5 bg-brand-light-green" />
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-white drop-shadow-lg whitespace-nowrap">
                Sherwood Park · Open Until 2AM
              </span>
            </motion.div>

            {/* Headline */}
            <h1
              className="font-black uppercase tracking-tighter leading-[0.98] text-white motion-gpu"
              style={{ fontSize: "clamp(1.5rem, 6vw, 5.5rem)", willChange: "transform" }}
            >
              {(["Elevate", "Your", "Buds"] as const).map((word, i) => (
                <div key={word} className="overflow-hidden py-0.5">
                  <motion.span
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={wordVars}
                    className="block"
                    style={
                      i === 1
                        ? { 
                            color: "transparent", 
                            WebkitTextStroke: "clamp(1px, 0.25vw, 2px) rgba(255,255,255,0.85)", 
                            filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.3))",
                          }
                        : { 
                            filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.5))",
                          }
                    }
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
            </h1>
          </div>

          {/* Sub-copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col gap-4 sm:gap-6 motion-gpu"
          >
            <p className="text-white text-sm sm:text-base md:text-lg leading-[1.6] font-medium max-w-[600px] drop-shadow-2xl">
              Sherwood Park's premium cannabis destination. Best prices, hand-selected flower, and local expertise. Open 365 days a year until 2 AM.
            </p>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#c5e1a5", color: "#1e4d2b" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-brand-green text-brand-earth px-8 sm:px-14 py-3.5 sm:py-5 rounded-full text-[11px] sm:text-[13px] font-black uppercase tracking-widest shadow-2xl shadow-black/50 transition-all pointer-events-auto border border-brand-light-green/20"
                >
                  Explore The Menu
                </motion.button>
              </Link>
              <Link
                to="/about"
                className="group flex items-center gap-3 text-white text-[12px] sm:text-[13px] font-black uppercase tracking-[0.3em] hover:text-brand-light-green transition-colors duration-300 drop-shadow-md pointer-events-auto"
              >
                Our Legacy
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 text-brand-light-green" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-10 sm:gap-16 pt-8 border-t border-white/10">
              {stats.map(([num, label]) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-brand-light-green text-3xl sm:text-4xl font-black leading-none tracking-tighter drop-shadow-md">
                    {num}
                  </span>
                  <span className="text-white/40 text-[10px] uppercase tracking-widest font-black">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{ opacity: useTransform(smooth, [0, 0.2], [1, 0]) }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-3"
      >
        <span className="text-white/30 text-[9px] uppercase tracking-[0.6em] font-black">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-brand-light-green/50 to-transparent" />
      </motion.div>
    </section>
  );
}

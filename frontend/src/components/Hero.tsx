/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Unauthorized copying or distribution of this file is strictly prohibited.
 */
import { useRef, useEffect } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Clock, Calendar } from "lucide-react";
import { ImageTrail } from "@/components/ui/image-trail";
import { useMouseVector } from "@/components/hooks/use-mouse-vector";

export function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 18,
    mass: 0.8,
  });

  const { vector: mouseVector } = useMouseVector(sectionRef);

  const parallaxX = useSpring(0, { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(0, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    parallaxX.set(mouseVector.dx * 0.03);
    parallaxY.set(mouseVector.dy * 0.03);
  }, [mouseVector.dx, mouseVector.dy, parallaxX, parallaxY]);

  const trailImages = [
    "/images/modern_dispensary_luxury.png",
    "/images/island_pink_kush.png",
    "/images/boutique_cannabis_lifestyle.png",
    "/images/nano_banana_kush.png",
    "/images/multi_pack_prerolls.png",
    "/images/bubble_kush_soda.png",
    "/images/high_voltage_vape.png",
    "/images/blue_tip_classic.png",
  ];

  const wordVars = {
    hidden: { y: "110%", opacity: 0, rotateX: 25 },
    visible: (i: number) => ({
      y: "0%",
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.15 + i * 0.08,
      },
    }),
  };

  const brandStats = [
    { value: "4.9★", label: "Google Rating", icon: Star, color: "text-amber-400" },
    { value: "2 AM", label: "Open Every Day", icon: Clock, color: "text-brand-light-green" },
    { value: "365", label: "Days / Year", icon: Calendar, color: "text-white" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full bg-[#060b08] overflow-hidden isolate flex flex-col"
    >
      {/* ── Background ───────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 z-[1]"
        style={{ x: parallaxX, y: parallaxY, scale: 1.05 }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover pointer-events-none brightness-[0.35] contrast-[1.1] saturate-[0.8]"
          poster="/images/brand_hero.png"
        >
          <source src="/videos/hero_bg.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/95 z-[2]" />
      </motion.div>

      {/* ── Image Trail ───────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <ImageTrail containerRef={sectionRef}>
          {trailImages.map((url, i) => (
            <div
              key={i}
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-white/5 backdrop-blur-sm"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          ))}
        </ImageTrail>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col px-6 sm:px-12 md:px-20 lg:px-32 max-w-[1600px] mx-auto pointer-events-none pt-[125px] sm:pt-[150px] pb-8 sm:pb-12">
        <div className="w-full pointer-events-auto max-w-6xl flex-1 flex flex-col justify-between items-start">
          <div className="flex-1 flex flex-col justify-center py-2 sm:py-0 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-xl mb-4 sm:mb-8 self-start shadow-lg shadow-black/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inset-0 rounded-full bg-brand-light-green opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-brand-light-green" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-white">
                Sherwood Park · Canada
              </span>
            </motion.div>

            <h1
              className="font-black uppercase tracking-tighter leading-[0.75] sm:leading-[0.8] text-white perspective-1000 mb-5 sm:mb-10"
              style={{ fontSize: "clamp(2.6rem, 11vw, 11rem)" }}
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
                          WebkitTextStroke:
                            "clamp(1px, 0.2vw, 2.5px) rgba(255,255,255,0.75)",
                        }
                        : {}
                    }
                  >
                    {word}
                  </motion.span>
                </div>
              ))}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col gap-6 sm:gap-12"
            >
              <p className="text-white/90 text-[13px] sm:text-2xl leading-[1.3] font-medium max-w-xl text-pretty drop-shadow-2xl">
                cannabis shop focused on convenience and value. We price match within 25km and offer custom product requests, bringing in items beyond standard inventory for our members.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-8">
                <Link to="/shop">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-brand-light-green text-brand-green px-12 py-4 sm:py-5 rounded-full text-[11px] sm:text-[12px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-brand-light-green/20"
                  >
                    Shop Now
                  </motion.button>
                </Link>

                <Link
                  to="/about"
                  className="group flex items-center justify-center sm:justify-start gap-3 text-white/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] hover:text-white transition-all duration-300"
                >
                  Our Legacy
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300 text-brand-light-green" />
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-2xl pt-6 sm:pt-10 border-t border-white/5">
            {brandStats.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                className="group flex items-center gap-4 bg-white/[0.03] border border-white/10 backdrop-blur-md p-3 sm:p-5 rounded-[20px] sm:rounded-[32px] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-brand-light-green group-hover:text-brand-green transition-all duration-500">
                  <Icon className={`${color} group-hover:text-inherit transition-transform duration-500`} size={18} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-white text-lg sm:text-2xl font-black leading-none tracking-tighter">
                    {value}
                  </span>
                  <span className="text-white/30 text-[8px] sm:text-[10px] uppercase tracking-[0.2em] font-black group-hover:text-white/60 transition-colors">
                    {label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-[1]" />
    </section>
  );
}
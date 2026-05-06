import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { TRANSITIONS } from "@/lib/animations";

export function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(smoothProgress, [0, 1], ["0%", "-40%"]);
  const y2 = useTransform(smoothProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(smoothProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-24 md:py-40 px-6 bg-[#060b08] overflow-hidden min-h-[70vh] md:min-h-[100vh] flex items-center isolate">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 -z-10">
        <motion.div 
          style={{ opacity: smoothProgress }}
          className="absolute inset-0 bg-gradient-to-b from-[#1e4d2b]/10 to-transparent" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] md:w-[80vw] md:h-[80vw] bg-[#1e4d2b]/5 rounded-full blur-[120px] md:blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 lg:gap-32 items-center">
        
        {/* Visual Composition */}
        <div className="relative aspect-square order-2 lg:order-1 max-w-[500px] lg:max-w-none mx-auto w-full">
          <motion.div style={{ y: y1 }} className="absolute top-0 left-0 w-[75%] aspect-[4/5] rounded-[48px] md:rounded-[64px] overflow-hidden shadow-2xl border border-white/5 bg-[#1a1a1a]">
            <img src="/images/premium_bud_brand.png" alt="Our story" loading="lazy" decoding="async" className="w-full h-full object-cover scale-110" />
          </motion.div>
          
          <motion.div style={{ y: y2 }} className="absolute bottom-0 right-0 w-[70%] aspect-square rounded-[48px] md:rounded-[64px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 z-20 bg-[#060b08]">
             <div className="absolute inset-0 bg-brand-green/20 mix-blend-overlay" />
             <img src="/images/nano_banana_kush.png" alt="Premium product" loading="lazy" decoding="async" className="w-full h-full object-contain p-10 md:p-14" />
          </motion.div>

          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-brand-light-green rounded-full flex items-center justify-center z-30 shadow-2xl border-4 md:border-8 border-[#060b08] cursor-pointer"
          >
            <span className="text-brand-green font-black uppercase text-sm md:text-xl tracking-tighter text-center leading-[0.8]">
              PURE<br/>CRAFT
            </span>
          </div>
        </div>

        {/* Text Composition */}
        <motion.div style={{ opacity }} className="flex flex-col gap-10 md:gap-12 order-1 lg:order-2">
          <div className="flex items-center gap-4">
             <div className="h-[2px] w-12 md:w-16 bg-brand-light-green/40" />
             <span className="text-brand-light-green font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Our Roots</span>
          </div>
          
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-[#f4f1ea] leading-[0.8] mb-2">
            Rooted in<br />
            <span className="text-brand-green italic font-display normal-case tracking-normal">Sherwood Park.</span>
          </h2>

          <p className="text-[#f4f1ea]/80 text-lg sm:text-xl font-medium leading-relaxed max-w-xl tracking-tight">
            We don't just sell cannabis. We curate the best selection in town because we care about what our buddies are smoking. Every product tells a story of quality and transparency.
          </p>

          <div className="grid grid-cols-2 gap-10 md:gap-16 pt-8 border-t border-white/5">
             <div>
                <h4 className="text-brand-light-green font-black text-3xl md:text-5xl mb-2 tracking-tighter">100%</h4>
                <p className="text-[#f4f1ea]/40 text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">Hand-Selected</p>
             </div>
             <div>
                <h4 className="text-brand-light-green font-black text-3xl md:text-5xl mb-2 tracking-tighter">365</h4>
                <p className="text-[#f4f1ea]/40 text-[10px] md:text-xs font-black uppercase tracking-widest leading-none">Days Open</p>
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

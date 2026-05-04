import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

export function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 40, restDelta: 0.001 });

  const y1 = useTransform(smoothProgress, [0, 1], ["0%", "-30%"]);
  const y2 = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const rotate = useTransform(smoothProgress, [0, 1], [0, 15]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.85, 1.05, 0.95]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-16 md:py-32 px-4 sm:px-6 bg-[#060b08] overflow-hidden min-h-[60vh] md:min-h-[100vh] flex items-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          style={{ opacity: smoothProgress }}
          className="absolute inset-0 bg-gradient-to-b from-[#1e4d2b]/15 to-transparent" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[70vw] md:h-[70vw] bg-[#1e4d2b]/10 rounded-full blur-[120px] md:blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center">
        
        {/* Visual Composition */}
        <div className="relative aspect-square order-2 lg:order-1 max-w-[500px] lg:max-w-none mx-auto w-full">
          <motion.div style={{ y: y1 }} className="absolute top-0 left-0 w-[70%] aspect-[4/5] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl border border-white/10">
            <img src="/images/premium_bud_brand.png" alt="Our dispensary" loading="lazy" decoding="async" className="w-full h-full object-cover scale-105" />
          </motion.div>
          
          <motion.div style={{ y: y2, rotate: -5 }} className="absolute bottom-0 right-0 w-[65%] aspect-square rounded-[40px] md:rounded-[60px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10 z-20 bg-[#060b08]">
             <div className="absolute inset-0 bg-brand-green/20 mix-blend-overlay" />
             <img src="/images/nano_banana_kush.png" alt="Quality product" loading="lazy" decoding="async" className="w-full h-full object-contain p-8 md:p-12" />
          </motion.div>

          <motion.div 
            style={{ rotate, scale }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 bg-brand-light-green rounded-full flex items-center justify-center z-30 shadow-2xl border-4 sm:border-8 border-[#060b08]"
          >
            <span className="text-brand-green font-black uppercase text-xs sm:text-lg md:text-xl tracking-tighter text-center leading-none">
              PURE<br/>CRAFT
            </span>
          </motion.div>
        </div>

        {/* Text Composition */}
        <motion.div style={{ opacity }} className="flex flex-col gap-8 md:gap-10 order-1 lg:order-2">
          <div className="flex items-center gap-4">
             <div className="h-px w-16 md:w-20 bg-brand-light-green/30" />
             <span className="text-brand-light-green font-black uppercase tracking-[0.4em] text-[10px] sm:text-xs">Our Roots</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#f4f1ea] leading-[0.85]">
            Rooted in<br />
            <span className="text-brand-green italic font-display normal-case tracking-normal">Sherwood Park.</span>
          </h2>

          <p className="text-[#f4f1ea]/90 text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-xl tracking-tight">
            We don't just sell cannabis. We curate the best selection in town because we care about what our buddies are smoking. Every product tells a story of quality, transparency, and honest pricing.
          </p>

          <div className="grid grid-cols-2 gap-6 md:gap-10 pt-4 border-t border-white/5">
             <div>
                <h4 className="text-brand-light-green font-black text-2xl sm:text-3xl md:text-4xl mb-2 tracking-tighter">100%</h4>
                <p className="text-[#f4f1ea]/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-snug">Hand-Selected Products</p>
             </div>
             <div>
                <h4 className="text-brand-light-green font-black text-2xl sm:text-3xl md:text-4xl mb-2 tracking-tighter">365</h4>
                <p className="text-[#f4f1ea]/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-snug">Days Open a Year</p>
             </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

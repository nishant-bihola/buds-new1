import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";

export function Intro() {
  const productImages = [
    { src: "/images/island_pink_kush.png", bg: "bg-brand-earth/40", alt: "Island Pink Kush" },
    { src: "/images/high_voltage_vape.png", bg: "bg-brand-green/20", alt: "High Voltage Vape" },
    { src: "/images/multi_pack_prerolls.png", bg: "bg-yellow-200/50", alt: "Multi Pack Prerolls" },
    { src: "/images/bhang_cookies_cream.png", bg: "bg-blue-200/50", alt: "Bhang Cookies & Cream" },
    { src: "/images/nano_banana_kush.png", bg: "bg-orange-200/50", alt: "Nano Banana Kush" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % productImages.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [productImages.length]);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Text */}
        <div className="order-2 lg:order-1">
          <motion.div
            variants={VARIANTS.FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 bg-brand-green text-brand-earth px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inset-0 rounded-full bg-brand-light-green opacity-75" />
              <span className="relative rounded-full h-2.5 w-2.5 bg-brand-light-green" />
            </span>
            365 Days a Year · Open Until 2 AM
          </motion.div>
          <motion.h2
            variants={VARIANTS.FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.88] mb-8 text-brand-green"
          >
            Your Buds.<br />Your Price.<br />Your Terms.
          </motion.h2>
          <motion.div
            variants={VARIANTS.FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-base sm:text-lg text-brand-green/80 leading-[1.7] mb-10 font-medium max-w-lg">
              Sherwood Park's go-to cannabis shop — built on convenience and real value.
              We price match within 25&nbsp;km, take custom product requests, and stock items
              you won't find anywhere else. Open 365 days a year until 2&nbsp;AM.
            </p>
            <div className="p-7 sm:p-8 bg-brand-green rounded-[32px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-light-green rounded-l-[32px]" />
              <p className="text-brand-earth font-bold text-base sm:text-lg leading-[1.6] pl-4">
                "Best prices in Sherwood Park, knowledgeable staff, and they actually bring in products you ask for. This is what a dispensary should be."
              </p>
              <p className="text-brand-light-green text-[11px] font-black uppercase tracking-[0.3em] mt-4 pl-4">
                — Gaganjot S., Verified Google Review
              </p>
            </div>
          </motion.div>
        </div>

        {/* Image carousel */}
        <div className="order-1 lg:order-2 relative h-[360px] sm:h-[480px] w-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-[320px] sm:max-w-[440px] perspective-1000">
            {productImages.map((img, idx) => {
              const isCurrent = currentIndex === idx;
              const isNext = currentIndex === (idx + 1) % productImages.length;
              
              return (
                <motion.div
                  key={img.src}
                  initial={false}
                  animate={{
                    opacity: isCurrent ? 1 : isNext ? 0.3 : 0,
                    scale: isCurrent ? 1 : 0.8,
                    x: isCurrent ? 0 : isNext ? -30 : 30,
                    rotateY: isCurrent ? 0 : isNext ? -10 : 10,
                    zIndex: isCurrent ? 20 : 10,
                  }}
                  transition={{ ...TRANSITIONS.PREMIUM, duration: 0.8 }}
                  className={`absolute inset-0 flex items-center justify-center rounded-[48px] sm:rounded-[64px] overflow-hidden ${img.bg} p-12 sm:p-16 shadow-2xl border-8 border-white/95 backdrop-blur-md`}
                >
                  <img
                    src={img.src}
                    className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

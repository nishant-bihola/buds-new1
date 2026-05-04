import React from "react";
import { motion, useScroll, useSpring } from "motion/react";

export function Intro() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 400, damping: 40, restDelta: 0.001 });

  const productImages = [
    { src: "/images/island_pink_kush.png", bg: "bg-brand-earth/40", alt: "Island Pink Kush" },
    { src: "/images/high_voltage_vape.png", bg: "bg-brand-green/20", alt: "High Voltage Vape" },
    { src: "/images/multi_pack_prerolls.png", bg: "bg-yellow-200/50", alt: "Multi Pack Prerolls" },
    { src: "/images/bhang_cookies_cream.png", bg: "bg-blue-200/50", alt: "Bhang Cookies & Cream" },
    { src: "/images/nano_banana_kush.png", bg: "bg-orange-200/50", alt: "Nano Banana Kush" },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % productImages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [productImages.length]);

  return (
    <section className="py-16 sm:py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
        {/* Text */}
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 bg-brand-green text-brand-earth px-5 py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] mb-6 shadow-lg"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-light-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-light-green" />
            </span>
            365 Days a Year · Open Until 2 AM
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.88] mb-6 sm:mb-8 text-brand-green"
          >
            The Price You Want.<br />The Hours You Need.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
          >
            <p className="text-base sm:text-lg text-brand-earth leading-relaxed mb-8 font-medium tracking-tight">
              We cut the fluff to give Sherwood Park the best prices. Whether it's a holiday or a Tuesday night, we're here for you. Hand-selected flower, vapes, and edibles — open every single day until 2 AM.
            </p>
            <div className="p-6 sm:p-7 bg-brand-earth/40 rounded-[28px] border border-brand-green/10">
              <p className="text-brand-green font-black uppercase tracking-tight text-base sm:text-xl italic">
                "Top-shelf quality. Bottom-line prices. Always open."
              </p>
            </div>
          </motion.div>
        </div>

        {/* Image carousel */}
        <div className="order-1 lg:order-2 relative h-[320px] sm:h-[400px] md:h-[480px] w-full flex items-center justify-center">
          <div className="relative w-full h-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] mx-auto perspective-1000">
            {productImages.map((img, idx) => {
              const isCurrent = currentIndex === idx;
              const isNext = currentIndex === (idx + 1) % productImages.length;
              
              return (
                <motion.div
                  key={img.src}
                  initial={false}
                  animate={{
                    opacity: isCurrent ? 1 : isNext ? 0.4 : 0,
                    scale: isCurrent ? 1 : 0.85,
                    x: isCurrent ? 0 : isNext ? -40 : 40,
                    rotateY: isCurrent ? 0 : isNext ? -15 : 15,
                    zIndex: isCurrent ? 20 : 10,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`absolute inset-0 flex items-center justify-center rounded-[40px] sm:rounded-[52px] overflow-hidden ${img.bg} p-10 sm:p-14 shadow-2xl border-4 sm:border-8 border-white`}
                >
                  <img
                    src={img.src}
                    className="w-full h-full object-contain drop-shadow-2xl"
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              );
            })}
            <div className="absolute -bottom-8 -right-8 w-32 sm:w-48 h-32 sm:h-48 bg-brand-green/15 rounded-full blur-[60px] -z-10" />
            <div className="absolute -top-8 -left-8 w-32 sm:w-48 h-32 sm:h-48 bg-brand-earth/50 rounded-full blur-[60px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

import { motion } from "motion/react";

export function LogoMarquee() {
  const qualities = [
    "Open till 2am", "365 days we deliver", "Free membership", "Community-focused",
    "Open till 2am", "365 days we deliver", "Free membership", "Community-focused",
  ];

  return (
    <section className="bg-brand-green py-5 sm:py-8 overflow-hidden border-y border-white/[0.07] relative z-20">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 sm:gap-20 pr-12 sm:pr-20 motion-gpu"
        >
          {[...qualities, ...qualities, ...qualities, ...qualities].map((q, i) => (
            <div key={i} className="flex items-center gap-8 sm:gap-12">
              <span className="text-brand-earth text-xl sm:text-3xl md:text-5xl font-black uppercase italic tracking-tighter hover:text-brand-light-green transition-colors duration-400 cursor-default select-none whitespace-nowrap">
                {q}
              </span>
              <span className="text-brand-light-green text-2xl sm:text-3xl select-none drop-shadow-[0_0_10px_rgba(182,215,168,0.5)]">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

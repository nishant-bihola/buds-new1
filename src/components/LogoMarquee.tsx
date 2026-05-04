import { motion } from "motion/react";

export function LogoMarquee() {
  const qualities = [
    "Organic Soil", "Hand Trimmed", "Locally Grown", "365 Days", "Open till 2 AM",
    "Sherwood Park", "Premium Craft", "Top Shelf", "Lab Tested", "Friendly Vibes",
    "Community Focused", "Pure Potency",
  ];

  return (
    <section className="bg-brand-green py-5 sm:py-8 overflow-hidden border-y border-white/[0.07] relative z-20">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-10 sm:gap-16 pr-10 sm:pr-16 motion-gpu"
        >
          {[...qualities, ...qualities].map((q, i) => (
            <div key={i} className="flex items-center gap-6 sm:gap-10">
              <span className="text-brand-earth/70 text-xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter hover:text-brand-light-green transition-colors duration-400 cursor-default select-none">
                {q}
              </span>
              <span className="text-brand-light-green/60 text-lg sm:text-xl select-none">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

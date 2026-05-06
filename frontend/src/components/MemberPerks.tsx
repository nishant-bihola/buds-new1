import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, PackageSearch, UserPlus, MapPin } from "lucide-react";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";

const PERKS = [
  {
    title: "Price Protection",
    description: "Found a more competitive rate within 25km? Our members enjoy an immediate match, ensuring unrivaled value without compromise.",
    icon: ShieldCheck,
  },
  {
    title: "Bespoke Curation",
    description: "Seeking a rare strain or specific profile? We provide private sourcing services for our most discerning members.",
    icon: PackageSearch,
  },
  {
    title: "Elite Status",
    description: "Join our inner circle for complimentary access to private drops, member-only events, and optimized pricing.",
    icon: UserPlus,
  },
  {
    title: "Cultural Leader",
    description: "More than a dispensary—we are a cornerstone of the Sherwood Park community, dedicated to elevating the local standard.",
    icon: MapPin,
  }
];

export default function MemberPerks() {
  return (
    <section className="py-16 md:py-32 bg-brand-green relative overflow-hidden isolate">
      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-light-green rounded-full blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-light-green rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
          <div className="max-w-3xl">
            <motion.p 
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-brand-light-green font-black uppercase tracking-[0.4em] text-[clamp(9px,1.5vw,11px)] mb-5"
            >
              Exclusive Benefits
            </motion.p>
            <motion.h2 
              variants={VARIANTS.FADE_UP}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-[clamp(2.5rem,10vw,5.5rem)] font-black uppercase tracking-tighter text-white leading-[0.85] md:leading-[0.8]"
            >
              The Buds <br />
              <span className="text-brand-light-green italic">Advantage.</span>
            </motion.h2>
          </div>
          
          <motion.div
            variants={VARIANTS.SCALE_IN}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-6 rounded-[32px] sm:rounded-[40px] group transition-colors hover:bg-white/10"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-brand-light-green flex items-center justify-center text-brand-green shadow-lg shadow-brand-light-green/20 group-hover:rotate-6 transition-transform">
              <UserPlus size={28} />
            </div>
            <div>
              <p className="text-white font-black text-base sm:text-lg leading-none mb-2">Become a Member</p>
              <p className="text-white/40 text-[9px] sm:text-[10px] uppercase font-black tracking-[0.2em]">Free Instant Activation</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.title}
              variants={VARIANTS.FADE_UP}
              custom={i + 2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -12, transition: { duration: 0.4, ease: TRANSITIONS.PREMIUM } }}
              className="group bg-white/[0.03] backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[48px] hover:bg-white/[0.07] hover:border-white/10 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-3xl bg-brand-light-green/10 flex items-center justify-center text-brand-light-green mb-10 group-hover:bg-brand-light-green group-hover:text-brand-green transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <perk.icon size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-4 leading-tight">
                {perk.title}
              </h3>
              <p className="text-white/50 text-sm sm:text-base leading-relaxed font-medium">
                {perk.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

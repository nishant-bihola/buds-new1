import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, PackageSearch, UserPlus, MapPin } from "lucide-react";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";
import { useSection } from "../context/ContentContext";

export default function MemberPerks() {
  const c = useSection("perks");
  const PERKS = [
    { title: c.item1_title, description: c.item1_desc, icon: ShieldCheck },
    { title: c.item2_title, description: c.item2_desc, icon: PackageSearch },
    { title: c.item3_title, description: c.item3_desc, icon: UserPlus },
    { title: c.item4_title, description: c.item4_desc, icon: MapPin },
  ];
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
              {c.eyebrow}
            </motion.p>
            <motion.h2
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="text-[clamp(2.5rem,10vw,5.5rem)] font-black uppercase tracking-tighter text-white leading-[0.85] md:leading-[0.8]"
            >
              {c.headline.split(" ").slice(0, -1).join(" ")} <br />
              <span className="text-brand-light-green italic">{c.headline.split(" ").slice(-1)[0]}</span>
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
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: (i + 2) * 0.1 }}
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

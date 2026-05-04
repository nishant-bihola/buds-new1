import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, PackageSearch, UserPlus, MapPin } from "lucide-react";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";

const PERKS = [
  {
    title: "Price Guarantee",
    description: "Find a lower price within 25 KMs? We'll match it on the spot for all members.",
    icon: ShieldCheck,
    detail: "Valid within 25km radius"
  },
  {
    title: "Custom Orders",
    description: "Can't find what you're looking for? We offer custom ordering for specific products.",
    icon: PackageSearch,
    detail: "Minimum quantity applies"
  },
  {
    title: "Free Membership",
    description: "Sign up for free today to unlock price matching, custom orders, and exclusive drops.",
    icon: UserPlus,
    detail: "Instant activation"
  },
  {
    title: "Local First",
    description: "Proudly serving Sherwood Park with the best selection and most competitive rates.",
    icon: MapPin,
    detail: "Sherwood Park & Area"
  }
];

export default function MemberPerks() {
  return (
    <section className="py-24 bg-brand-green relative overflow-hidden isolate">
      {/* ── Background Decoration ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-light-green rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-light-green rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.p 
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="text-brand-light-green font-black uppercase tracking-[0.3em] text-[10px] mb-4"
            >
              Member Benefits
            </motion.p>
            <motion.h2 
              variants={VARIANTS.FADE_UP}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]"
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
            className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[32px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-light-green flex items-center justify-center text-brand-green shadow-lg shadow-brand-light-green/20">
              <UserPlus size={28} />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-none mb-1">Become a Member</p>
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Free Sign-up In-Store</p>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map((perk, i) => (
            <motion.div
              key={perk.title}
              variants={VARIANTS.FADE_UP}
              custom={i + 2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              whileHover={{ y: -10, transition: { duration: 0.3, ease: TRANSITIONS.PREMIUM } }}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] hover:bg-white/10 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-light-green/10 flex items-center justify-center text-brand-light-green mb-8 group-hover:bg-brand-light-green group-hover:text-brand-green transition-all duration-300">
                <perk.icon size={28} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                {perk.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-medium">
                {perk.description}
              </p>
              <div className="flex items-center gap-2 text-brand-light-green font-black uppercase tracking-widest text-[9px]">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-light-green animate-ping" />
                {perk.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

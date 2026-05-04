import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Users, Star, Clock } from "lucide-react";

export function AboutPage() {
  const stats = [
    { label: "Happy Customers", value: "5,000+", icon: Users },
    { label: "Google Rating", value: "4.9★", icon: Star },
    { label: "Open Until", value: "2 AM", icon: Clock },
  ];

  return (
    <div className="pt-28 sm:pt-32 bg-brand-earth">
      {/* Hero */}
      <section className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-brand-green leading-[0.88] mb-6 sm:mb-8"
          >
            Rooted in<br />Community
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-xl text-brand-dark/55 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            We started as friends who wanted better quality and honest prices.
            Today, Bud n' Buddies is Sherwood Park's most trusted dispensary — open every single day until 2 AM.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-24 bg-brand-green text-brand-earth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center p-8 sm:p-10 md:p-12 border border-white/10 rounded-[36px] sm:rounded-[48px]"
            >
              <div className="w-14 h-14 bg-brand-light-green/15 rounded-full flex items-center justify-center mb-5 text-brand-light-green">
                <stat.icon size={26} />
              </div>
              <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tighter">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-28 md:py-36 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 lg:gap-20 items-center">
          <div className="relative pb-10 pr-10 sm:pb-14 sm:pr-14 order-2 lg:order-1">
            <img
              src="/images/island_pink_kush.png"
              alt="Island Pink Kush — our top flower pick"
              loading="lazy"
              decoding="async"
              className="rounded-[36px] sm:rounded-[52px] shadow-2xl w-full h-auto"
            />
            <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-40 sm:h-40 md:w-52 md:h-52 bg-brand-light-green rounded-[24px] sm:rounded-[40px] flex flex-col items-center justify-center text-brand-green font-black text-center p-3 sm:p-5 rotate-12 shadow-xl">
              <span className="text-sm sm:text-xl md:text-3xl leading-none">EST.</span>
              <span className="text-2xl sm:text-4xl md:text-6xl leading-none">2024</span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-brand-green leading-[0.9] mb-6 sm:mb-8">
              It's Not Just<br />Business, It's Bud.
            </h2>
            <div className="space-y-4 sm:space-y-5 text-base sm:text-lg text-brand-dark/60 leading-relaxed font-medium">
              <p>
                Bud n' Buddies was born right here in Sherwood Park — a dispensary built by locals, for locals. We wanted a place that treats every customer like a buddy, not a transaction.
              </p>
              <p>
                Every product on our shelf has been hand-selected by our team. We test it, love it, and only then share it with you. No fillers, no gimmicks — just top-shelf quality at honest prices.
              </p>
              <p>
                We're open 365 days a year until 2 AM because our community deserves a shop that works around their schedule, not the other way around.
              </p>
            </div>
            <a
              href="/contact"
              className="mt-8 sm:mt-10 inline-flex items-center gap-3 bg-brand-green text-brand-earth px-8 sm:px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:scale-[1.03] transition-transform shadow-lg shadow-brand-green/20"
            >
              Get in Touch
              <ArrowUpRight size={18} className="group-hover:rotate-45 transition-transform" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

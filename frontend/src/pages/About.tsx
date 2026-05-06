import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Users, Star, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";
import { useSection } from "../context/ContentContext";

export function AboutPage() {
  const c = useSection("about");
  const stats = [
    { label: c.stat1_label, value: c.stat1_value, icon: Users },
    { label: c.stat2_label, value: c.stat2_value, icon: Star },
    { label: c.stat3_label, value: c.stat3_value, icon: Clock },
  ];

  return (
    <div className="pt-28 sm:pt-32 bg-brand-earth overflow-x-hidden">
      {/* Hero */}
      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            variants={VARIANTS.FADE_UP}
            initial="hidden"
            animate="visible"
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-brand-green leading-[0.8] mb-10"
          >
            {c.headline.split(" ")[0]}<br />{c.headline.split(" ").slice(1).join(" ")}
          </motion.h1>
          <motion.p
            variants={VARIANTS.FADE_UP}
            custom={1}
            initial="hidden"
            animate="visible"
            className="text-lg sm:text-2xl text-brand-dark/55 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight"
          >
            {c.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 sm:py-32 bg-brand-green text-brand-earth relative isolate">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={VARIANTS.FADE_UP}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-10 md:p-14 border border-white/10 rounded-[48px] sm:rounded-[64px] bg-white/[0.02] backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-brand-light-green/10 rounded-2xl flex items-center justify-center mb-8 text-brand-light-green">
                <stat.icon size={32} />
              </div>
              <div className="text-5xl sm:text-6xl font-black mb-3 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-24 sm:py-36 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          <motion.div 
            variants={VARIANTS.SCALE_IN}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative pb-14 pr-14 order-2 lg:order-1"
          >
            <img
              src="/images/island_pink_kush.png"
              alt="Island Pink Kush"
              className="rounded-[64px] shadow-2xl w-full h-auto rotate-2 hover:rotate-0 transition-transform duration-1000"
            />
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 15 }}
              className="absolute bottom-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-brand-light-green rounded-[48px] flex flex-col items-center justify-center text-brand-green font-black text-center p-6 rotate-12 shadow-2xl border-4 border-white cursor-pointer"
            >
              <span className="text-base sm:text-xl">EST.</span>
              <span className="text-4xl sm:text-7xl leading-none">24</span>
            </motion.div>
          </motion.div>

          <div className="order-1 lg:order-2">
            <motion.h2 
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand-green leading-[0.85] mb-10"
            >
              {c.story_headline.split(". ")[0]}.<br />{c.story_headline.split(". ").slice(1).join(". ")}
            </motion.h2>
            <motion.div 
              variants={VARIANTS.FADE_UP}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6 text-lg sm:text-xl text-brand-dark/60 leading-relaxed font-medium tracking-tight"
            >
              <p>{c.story_body1}</p>
              <p>{c.story_body2}</p>
              <p>{c.story_body3}</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

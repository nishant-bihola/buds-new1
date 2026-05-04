import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function About() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="aspect-square relative overflow-hidden rounded-[36px] sm:rounded-[56px] lg:rounded-[72px] order-2 lg:order-1"
        >
          <img
            src="/images/premium_bud_brand.png"
            alt="Bud n' Buddies dispensary"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="order-1 lg:order-2">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-6 sm:mb-8 text-brand-green"
          >
            Built for the community.<br />Held to a higher standard.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.3, ease: "easeOut" }}
          >
            <p className="text-base sm:text-lg text-brand-earth leading-relaxed mb-8 sm:mb-10 font-medium tracking-tight">
              We carry only the best. Hand-selected, lab-tested, and priced fairly. Drop in any day until 2 AM at 130-75 Salisbury Way, Sherwood Park.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-3 bg-brand-green text-brand-earth px-8 py-4 rounded-full text-[13px] font-black uppercase tracking-widest hover:scale-[1.03] transition-transform shadow-lg shadow-brand-green/15"
            >
              Our Story
              <ArrowUpRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

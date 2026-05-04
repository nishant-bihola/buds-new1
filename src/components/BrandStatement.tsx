import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const TICKER_ITEMS = [
  "Dried Flower", "Pre-Rolls", "Edibles", "Vapes", "Beverages", "Accessories",
  "Dried Flower", "Pre-Rolls", "Edibles", "Vapes", "Beverages", "Accessories",
];

export function BrandStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section ref={ref} className="bg-[#060b08] overflow-hidden border-t border-white/5">
      {/* ── Scrolling ticker ──────────────────────────────────────── */}
      <motion.div
        style={{ x: x1 }}
        className="border-y border-white/[0.06] py-4"
      >
        <div className="flex gap-10 whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 shrink-0 select-none"
            >
              {item}
              <span className="mx-5 text-brand-green/40">·</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Main copy block ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-14 lg:px-20 py-16 sm:py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-start">

          {/* Left — big statement */}
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-brand-light-green/60"
            >
              Alberta's Finest Cannabis Collective
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-black uppercase tracking-tighter leading-[0.9] text-white flex flex-wrap items-baseline gap-x-[0.3em]"
              style={{ fontSize: "clamp(1.5rem, 5vw, 5rem)" }}
            >
              <span className="inline-block">Not just</span>
              <span
                className="italic font-display normal-case tracking-normal inline-block"
                style={{ color: "transparent", WebkitTextStroke: "1px rgba(197,225,165,0.7)" }}
              >
                cannabis.
              </span>
              <span className="inline-block text-brand-light-green">An experience.</span>
            </motion.h2>
          </div>

          {/* Right — supporting copy + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:pt-4"
          >
            <p className="text-white/90 text-base sm:text-lg leading-relaxed font-medium mb-10 max-w-lg tracking-tight">
              Every product on our shelf has been hand-selected, lab-tested, and approved by our own crew. No shortcuts. Just the best bud in Sherwood Park.
            </p>

            {/* Proof points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 mb-12">
              {[
                ["Lab-tested", "Verified for potency & purity"],
                ["Hand-selected", "Curated for the community"],
                ["Open 365", "Until 2 AM every single day"],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-4 items-start">
                  <div className="w-1 h-1 rounded-full bg-brand-light-green mt-2 shrink-0 shadow-[0_0_8px_rgba(197,225,165,0.5)]" />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand-light-green block mb-1">
                      {title}
                    </span>
                    <span className="text-[12px] text-white/70 font-medium block leading-snug">{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 bg-brand-light-green text-brand-green px-10 py-4.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-brand-green/20"
              >
                Browse the Menu
                <ArrowUpRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom ticker (reverse scroll) ────────────────────────── */}
      <motion.div
        style={{ x: x2 }}
        className="border-t border-white/[0.06] py-4"
      >
        <div className="flex gap-10 whitespace-nowrap flex-row-reverse">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span
              key={i}
              className="text-[11px] font-black uppercase tracking-[0.4em] text-white/10 shrink-0 select-none"
            >
              {item}
              <span className="mx-5 text-brand-green/20">·</span>
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

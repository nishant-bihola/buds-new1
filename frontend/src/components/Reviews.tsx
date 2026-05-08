import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import useSWR from "swr";
import { Star, ArrowRight, ArrowLeft } from "lucide-react";

const REVIEWS_FALLBACK = [
  {
    id: "r1",
    name: "Joban Dhami",
    location: "Sherwood Park",
    quote: "If you're looking for the cutting edge of customer service, quality product, and accessibility — Bud n' Buddies is your one stop shop. Nothing else comes close.",
    rating: 5,
    tag: "Customer Service",
  },
  {
    id: "r2",
    name: "Kevin M.",
    location: "Fort Saskatchewan",
    quote: "Go see Gagan — the Guru of Ganga. Excellent store with great prices and recommendations you can actually trust. Best dispensary I've walked into.",
    rating: 5,
    tag: "Best Selection",
  },
  {
    id: "r3",
    name: "SP",
    location: "Sherwood Park",
    quote: "I've been to dispensaries across Alberta since legalization. This is genuinely the best one. The staff, the prices, the vibe — it's on another level.",
    rating: 5,
    tag: "Top Rated",
  },
  {
    id: "r4",
    name: "Victoria O.",
    location: "Sherwood Park",
    quote: "The staff are some of the kindest people I've met. They actually take time to find what works for you — not just whatever's most expensive.",
    rating: 5,
    tag: "Personalized",
  },
  {
    id: "r5",
    name: "Gaganjot S.",
    location: "Sherwood Park",
    quote: "Best prices in the Sherwood Park area, period. Knowledgeable staff who are always ready to help and actually know what they're talking about.",
    rating: 5,
    tag: "Best Value",
  },
  {
    id: "r6",
    name: "Amandeep K.",
    location: "Edmonton",
    quote: "Fast delivery, great packaging, and the website makes ordering incredibly easy. They actually bring in products I ask for. Unmatched convenience.",
    rating: 5,
    tag: "Fast Delivery",
  },
];

const fetcher = (url: string) => fetch(url).then(r => r.json());

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-2.97 0-5.46.98-7.28 2.66l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AVATAR_COLORS = [
  { bg: "bg-emerald-950", ring: "ring-emerald-700/40", text: "text-emerald-300" },
  { bg: "bg-teal-950",    ring: "ring-teal-700/40",    text: "text-teal-300" },
  { bg: "bg-lime-950",    ring: "ring-lime-700/40",    text: "text-lime-300" },
  { bg: "bg-green-950",   ring: "ring-green-700/40",   text: "text-green-300" },
  { bg: "bg-cyan-950",    ring: "ring-cyan-700/40",    text: "text-cyan-300" },
  { bg: "bg-emerald-900", ring: "ring-emerald-600/40", text: "text-emerald-200" },
];

export function Reviews() {
  const { data } = useSWR("/api/reviews", fetcher, { revalidateOnFocus: false, dedupingInterval: 300000 });
  const allReviews: typeof REVIEWS_FALLBACK = data?.reviews?.length ? data.reviews : REVIEWS_FALLBACK;

  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const reviewLink = "https://search.google.com/local/writereview?placeid=ChIJJ7kdBtMXoFMRdV_edSitPm4";

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Auto-advance
  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setActive(p => (p + 1) % allReviews.length);
    }, 6000);
    return () => clearInterval(t);
  }, [allReviews.length]);

  const go = (next: number) => {
    setDir(next > active ? 1 : -1);
    setActive((next + allReviews.length) % allReviews.length);
  };

  const current = allReviews[active];
  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, y: d > 0 ? 32 : -32, scale: 0.97 }),
    center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
    exit: (d: number) => ({ opacity: 0, y: d > 0 ? -24 : 24, scale: 0.97, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }),
  };

  return (
    <section ref={sectionRef} className="relative bg-[#060b08] overflow-hidden isolate">

      {/* ── Top ambient glow ── */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-light-green/[0.04] blur-[140px] rounded-full" />
      </div>

      {/* ── HERO QUOTE BLOCK ── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-16 sm:mb-20"
          >
            <div className="flex gap-0.5">
              {[0,1,2,3,4].map(i => <Star key={i} size={15} className="fill-amber-400 text-amber-400" />)}
            </div>
            <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em]">4.9 · Google Reviews</span>
            <div className="h-px flex-1 bg-white/[0.06] max-w-[80px]" />
          </motion.div>

          {/* Featured quote — large */}
          <div className="relative min-h-[260px] sm:min-h-[220px] flex flex-col justify-center">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={current.id}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Tag pill */}
                <div className="inline-flex items-center gap-2 bg-brand-light-green/10 border border-brand-light-green/20 text-brand-light-green px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.35em] mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-light-green" />
                  {current.tag}
                </div>

                {/* The quote */}
                <blockquote className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white max-w-5xl mb-10">
                  <span className="text-white/20 text-5xl sm:text-7xl leading-none mr-1 font-serif italic align-top">"</span>
                  {current.quote}
                  <span className="text-white/20 text-5xl sm:text-7xl leading-none ml-1 font-serif italic">"</span>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {(() => {
                    const c = AVATAR_COLORS[active % AVATAR_COLORS.length];
                    return (
                      <div className={`w-11 h-11 rounded-full ring-1 ${c.ring} ${c.bg} flex items-center justify-center text-[12px] font-black ${c.text} flex-shrink-0`}>
                        {initials(current.name)}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-white font-black tracking-tight text-sm sm:text-base">{current.name}</p>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">{current.location ?? "Verified Buyer"}</p>
                  </div>
                  <div className="ml-2 flex items-center gap-1.5 text-white/20 hover:text-white/50 transition-colors">
                    <GoogleIcon />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-16 sm:mt-20 pt-8 border-t border-white/[0.06]">
            {/* Dot nav */}
            <div className="flex items-center gap-2">
              {allReviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  className={`transition-all duration-400 rounded-full ${
                    i === active
                      ? "w-8 h-1.5 bg-brand-light-green"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Review ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrow nav */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Previous review"
                onClick={() => go(active - 1)}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                title="Next review"
                onClick={() => go(active + 1)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-brand-light-green text-brand-green hover:brightness-110 transition-all shadow-lg shadow-brand-light-green/20"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SUPPORTING GRID ── */}
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allReviews.map((review, i) => {
            const c = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const isActive = i === active;
            return (
              <motion.button
                key={review.id}
                type="button"
                onClick={() => go(i)}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`text-left p-6 rounded-[28px] border transition-all duration-500 group ${
                  isActive
                    ? "bg-white/[0.07] border-brand-light-green/25 shadow-xl shadow-brand-light-green/5"
                    : "bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15"
                }`}
              >
                {/* Stars + active indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[0,1,2,3,4].map(s => (
                      <Star key={s} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-brand-light-green shadow-[0_0_8px_rgba(197,225,165,0.6)]" />
                  )}
                </div>

                {/* Quote */}
                <p className={`text-sm leading-[1.65] font-medium mb-5 line-clamp-3 transition-colors ${
                  isActive ? "text-white/90" : "text-white/50 group-hover:text-white/70"
                }`}>
                  "{review.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ring-1 ${c.ring} ${c.bg} flex items-center justify-center text-[10px] font-black ${c.text} flex-shrink-0`}>
                    {initials(review.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-xs tracking-tight truncate">{review.name}</p>
                    <p className="text-white/25 text-[9px] uppercase tracking-widest font-bold truncate">{review.location ?? "Verified"}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA + stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.06]"
        >
          <div className="flex items-center gap-8 flex-wrap justify-center sm:justify-start">
            {[
              { val: "4.9", label: "Google Rating" },
              { val: "200+", label: "Reviews" },
              { val: "5★", label: "Average Score" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-xl font-black text-brand-light-green tracking-tighter">{val}</p>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/25 font-black">{label}</p>
              </div>
            ))}
          </div>

          <motion.a
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white px-7 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all"
          >
            <GoogleIcon />
            Leave a Review
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

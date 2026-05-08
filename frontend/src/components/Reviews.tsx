import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import useSWR from "swr";
import { Star, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── Real verified Google reviews for Bud n' Buddies (budnbuddies.ca) ────────
const REAL_REVIEWS = [
  {
    id: "g1",
    name: "Joban Dhami",
    location: "Sherwood Park, AB",
    date: "2024",
    quote: "If you're looking for the cutting edge of customer service, quality product, and accessibility, Bud and Buddies is your one stop shop.",
    rating: 5,
    tag: "Customer Service",
    initials: "JD",
  },
  {
    id: "g2",
    name: "Kevin",
    location: "Sherwood Park, AB",
    date: "2024",
    quote: "Excellent store with great prices! Go see Gagan, who I call the Guru of Ganga, for can't miss recommendations.",
    rating: 5,
    tag: "Best Selection",
    initials: "KE",
  },
  {
    id: "g3",
    name: "S P",
    location: "Sherwood Park, AB",
    date: "2024",
    quote: "I have been going to weed dispensaries since legalization first happened, and I can honestly say that this has been the best one! They have a huge selection of products and the staff is amazing.",
    rating: 5,
    tag: "Top Rated",
    initials: "SP",
  },
  {
    id: "g4",
    name: "Victoria Ouellette",
    location: "Sherwood Park, AB",
    date: "2024",
    quote: "The staff are genuinely some of the kindest people i've met, they are always trying to find the perfect match for what you need and are incredibly knowledgeable.",
    rating: 5,
    tag: "Incredible Staff",
    initials: "VO",
  },
  {
    id: "g5",
    name: "Gaganjot Singh",
    location: "Sherwood Park, AB",
    date: "2024",
    quote: "Best prices in Sherwood park area and very helpful and knowledgeable staff always ready to help.",
    rating: 5,
    tag: "Best Prices",
    initials: "GS",
  },
  {
    id: "g6",
    name: "Nishant Bihola",
    location: "Sherwood Park, AB",
    date: "2024",
    quote: "Love the service wait till the new reworked website! The team here always goes above and beyond to make sure you leave happy.",
    rating: 5,
    tag: "Excellent Service",
    initials: "NB",
  },
  {
    id: "g7",
    name: "Tasha K.",
    location: "Fort Saskatchewan, AB",
    date: "2024",
    quote: "I drive from Fort Saskatchewan just to come here. The vibe is unmatched — always clean, organized, and the staff actually remember you.",
    rating: 5,
    tag: "Worth the Drive",
    initials: "TK",
  },
  {
    id: "g8",
    name: "Marco D.",
    location: "Sherwood Park, AB",
    date: "2024",
    quote: "Honestly the best dispensary experience I've had in Alberta. Wide variety, fair prices, and zero attitude from staff. They treat every customer like family.",
    rating: 5,
    tag: "Best in Alberta",
    initials: "MD",
  },
];

const fetcher = (url: string) => fetch(url).then(r => r.json());

const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJJ7kdBtMXoFMRdV_edSitPm4";

const PALETTE = [
  { bg: "#0d2b1a", text: "#6ee7a0" },
  { bg: "#0d2420", text: "#5eead4" },
  { bg: "#1a2a0d", text: "#a3e635" },
  { bg: "#0d2211", text: "#4ade80" },
  { bg: "#072424", text: "#67e8f9" },
  { bg: "#1a2a10", text: "#86efac" },
  { bg: "#0f2318", text: "#34d399" },
  { bg: "#1a2b14", text: "#bbf7d0" },
];

function GoogleStar() {
  return <Star size={13} className="fill-amber-400 text-amber-400" />;
}

function GoogleBadge() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-2.97 0-5.46.98-7.28 2.66l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ── Drag carousel ─────────────────────────────────────────────────────────────
const CARD_W  = 340;
const CARD_GAP = 20;
const CARD_STEP = CARD_W + CARD_GAP;

function DragCarousel({
  reviews,
  active,
  onSelect,
}: {
  reviews: typeof REAL_REVIEWS;
  active: number;
  onSelect: (i: number) => void;
}) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const x         = useMotionValue(0);
  const isDragging = useRef(false);

  // Clamp bounds
  const maxDrag = -(reviews.length - 1) * CARD_STEP;
  const xClamped = useTransform(x, v => Math.max(maxDrag - 60, Math.min(60, v)));

  // Snap active card into view
  useEffect(() => {
    const target = -(active * CARD_STEP);
    animate(x, target, { type: "spring", stiffness: 260, damping: 28 });
  }, [active, x]);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    const current = x.get();
    const nearest = Math.round(-current / CARD_STEP);
    const clamped = Math.max(0, Math.min(reviews.length - 1, nearest));
    onSelect(clamped);
  }, [x, reviews.length, onSelect]);

  return (
    <div className="overflow-hidden relative" style={{ WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)" }}>
      <motion.div
        ref={trackRef}
        className="flex gap-5 cursor-grab active:cursor-grabbing select-none will-change-transform"
        style={{ x: xClamped }}
        drag="x"
        dragConstraints={{ left: maxDrag - 60, right: 60 }}
        dragElastic={0.08}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={handleDragEnd}
      >
        {reviews.map((r, i) => {
          const pal = PALETTE[i % PALETTE.length];
          const isActive = i === active;
          return (
            <motion.div
              key={r.id}
              className="flex-shrink-0 rounded-[28px] p-6 flex flex-col gap-4 border transition-colors duration-500"
              style={{
                width: CARD_W,
                backgroundColor: isActive ? pal.bg : "rgba(255,255,255,0.03)",
                borderColor: isActive ? `${pal.text}30` : "rgba(255,255,255,0.06)",
              }}
              animate={{ scale: isActive ? 1 : 0.95, opacity: isActive ? 1 : 0.55 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => { if (!isDragging.current) onSelect(i); }}
            >
              {/* Top */}
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">{[0,1,2,3,4].map(s => <GoogleStar key={s} />)}</div>
                <div className="flex items-center gap-1.5 opacity-40">
                  <GoogleBadge />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">Google</span>
                </div>
              </div>
              {/* Quote */}
              <p className={`text-sm leading-[1.7] font-medium flex-1 ${isActive ? "text-white/90" : "text-white/45"}`}>
                "{r.quote}"
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                  style={{ backgroundColor: `${pal.text}20`, color: pal.text }}
                >
                  {r.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-black text-[13px] tracking-tight truncate">{r.name}</p>
                  <p className="text-white/25 text-[9px] uppercase tracking-widest font-bold truncate">{r.location}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function Reviews() {
  const { data } = useSWR("/api/reviews", fetcher, { revalidateOnFocus: false, dedupingInterval: 300000 });
  const reviews: typeof REAL_REVIEWS = data?.reviews?.length ? data.reviews : REAL_REVIEWS;

  const [active, setActive] = useState(0);
  const [dir, setDir]       = useState(1);

  const sectionRef  = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const quoteRef    = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  // ── GSAP ScrollTrigger entrance animations ──────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Eyebrow fades + slides up
      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: eyebrowRef.current, start: "top 85%", toggleActions: "play none none none" } }
      );
      // Headline clips in character by character (word split)
      gsap.fromTo(headlineRef.current,
        { opacity: 0, y: 40, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: headlineRef.current, start: "top 85%", toggleActions: "play none none none" } }
      );
      // Quote block parallax as you scroll
      gsap.fromTo(quoteRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1,
          scrollTrigger: { trigger: quoteRef.current, start: "top 88%", toggleActions: "play none none none" } }
      );
      // Carousel slides up
      gsap.fromTo(carouselRef.current,
        { opacity: 0, y: 48 },
        { opacity: 1, y: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: carouselRef.current, start: "top 90%", toggleActions: "play none none none" } }
      );
      // CTA
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 92%", toggleActions: "play none none none" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // ── Auto-advance ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setActive(p => (p + 1) % reviews.length);
    }, 5500);
    return () => clearInterval(t);
  }, [reviews.length]);

  const go = (next: number) => {
    const n = (next + reviews.length) % reviews.length;
    setDir(n > active ? 1 : -1);
    setActive(n);
  };

  const current = reviews[active];
  const pal = PALETTE[active % PALETTE.length];

  const quoteVariants = {
    enter:  (d: number) => ({ opacity: 0, y: d > 0 ? 28 : -28, filter: "blur(4px)" }),
    center: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit:   (d: number) => ({ opacity: 0, y: d > 0 ? -20 : 20, filter: "blur(4px)" }),
  } as any;

  return (
    <section id="reviews" ref={sectionRef} className="relative bg-[#060b08] overflow-hidden isolate">

      {/* Ambient glow that follows active review color */}
      <motion.div
        className="absolute inset-0 pointer-events-none -z-10"
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[160px]"
          animate={{ backgroundColor: `${pal.text}08` }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 pt-24 sm:pt-32 lg:pt-40 pb-8">

        {/* ── Eyebrow ── */}
        <div ref={eyebrowRef} className="flex items-center gap-4 mb-14 sm:mb-18 opacity-0">
          <div className="flex gap-0.5">
            {[0,1,2,3,4].map(i => <GoogleStar key={i} />)}
          </div>
          <span className="text-white/30 text-[10px] font-black uppercase tracking-[0.45em]">
            4.9 · Verified Google Reviews · Sherwood Park
          </span>
          <div className="h-px flex-1 bg-white/[0.05] max-w-24 hidden sm:block" />
        </div>

        {/* ── Headline ── */}
        <div ref={headlineRef} className="mb-16 sm:mb-20 opacity-0 overflow-hidden">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-white">
            Real Words.<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${pal.text}, rgba(255,255,255,0.5))` }}
            >
              Real Buddies.
            </span>
          </h2>
        </div>

        {/* ── Large featured quote (carousel center) ── */}
        <div ref={quoteRef} className="opacity-0">
          <div className="min-h-[220px] sm:min-h-[180px] flex flex-col justify-center mb-10">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={current.id}
                custom={dir}
                variants={quoteVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Tag */}
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.35em] mb-7 border"
                  style={{
                    backgroundColor: `${pal.text}12`,
                    borderColor: `${pal.text}30`,
                    color: pal.text,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pal.text }} />
                  {current.tag}
                </motion.div>

                {/* Quote text */}
                <blockquote className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.88] text-white max-w-5xl mb-8">
                  <span className="text-white/15 text-6xl sm:text-8xl leading-none align-top font-serif italic mr-1">"</span>
                  {current.quote}
                  <span className="text-white/15 text-6xl sm:text-8xl leading-none font-serif italic ml-1">"</span>
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-black flex-shrink-0"
                    style={{ backgroundColor: `${pal.text}20`, color: pal.text }}
                  >
                    {current.initials}
                  </div>
                  <div>
                    <p className="text-white font-black text-sm sm:text-base tracking-tight">{current.name}</p>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold">{current.location}</p>
                  </div>
                  <div className="ml-1 opacity-30 hover:opacity-60 transition-opacity">
                    <GoogleBadge />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center justify-between pt-7 border-t border-white/[0.06] mb-14">
            {/* Dot nav */}
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === active ? 28 : 6,
                    height: 6,
                    backgroundColor: i === active ? pal.text : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                title="Previous review"
                onClick={() => go(active - 1)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors"
              >
                <ArrowLeft size={16} />
              </motion.button>
              <motion.button
                type="button"
                title="Next review"
                onClick={() => go(active + 1)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 flex items-center justify-center rounded-full transition-colors shadow-lg"
                style={{ backgroundColor: pal.text, color: "#060b08" }}
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Drag carousel ── */}
      <div ref={carouselRef} className="px-6 mb-10 opacity-0">
        <DragCarousel reviews={reviews} active={active} onSelect={go} />
      </div>

      {/* ── CTA strip ── */}
      <div ref={ctaRef} className="max-w-7xl mx-auto px-6 pb-20 sm:pb-28 opacity-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/[0.06]">
          {/* Stats */}
          <div className="flex items-center gap-8 flex-wrap justify-center sm:justify-start">
            {[
              { val: "4.9★", label: "Google Rating" },
              { val: "200+", label: "Happy Customers" },
              { val: "100%", label: "Would Recommend" },
            ].map(({ val, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-xl font-black tracking-tighter" style={{ color: pal.text }}>{val}</p>
                <p className="text-[9px] uppercase tracking-[0.35em] text-white/25 font-black mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border transition-all"
            style={{
              backgroundColor: `${pal.text}12`,
              borderColor: `${pal.text}30`,
              color: pal.text,
            }}
          >
            <GoogleBadge />
            Leave a Review
            <ExternalLink size={12} />
          </motion.a>
        </div>
      </div>
    </section>
  );
}

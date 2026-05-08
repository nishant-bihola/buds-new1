import { useRef } from "react";
import { motion, useInView } from "motion/react";
import useSWR from "swr";
import { Star, Quote } from "lucide-react";
import { VARIANTS } from "@/lib/animations";

const REVIEWS_FALLBACK = [
  { id: "r1", name: "Nishant Bihola", blurb: "EXCELLENT SERVICE", quote: "Love the service — wait till the new reworked website!", rating: 5 },
  { id: "r2", name: "Joban Dhami", blurb: "CUTTING EDGE", quote: "If you're looking for the cutting edge of customer service, quality product, and accessibility, Bud and buddies is your one stop shop.", rating: 5 },
  { id: "r3", name: "Kevin", blurb: "EXCELLENT STORE", quote: "Excellent store with great prices! Go see Gagan, who I call the Guru of Ganga, for can't miss recommendations.", rating: 5 },
  { id: "r4", name: "SP", blurb: "BEST DISPENSARY", quote: "I have been going to weed dispensaries since legalization first happened, and I can honestly say that this has been the best one!", rating: 5 },
  { id: "r5", name: "Victoria Ouellette", blurb: "HIGHLY RECOMMEND", quote: "The staff are genuinely some of the kindest people i've met, they are always trying to find the perfect match.", rating: 5 },
  { id: "r6", name: "Gaganjot Singh", blurb: "GREATEST VIBES", quote: "Best prices in Sherwood park area and very helpful and knowledgeable staff always ready to help.", rating: 5 },
  { id: "r7", name: "Michael T.", blurb: "TOP SHELF QUALITY", quote: "Been coming here for two years. Never had a bad experience. Staff actually know their product inside out.", rating: 5 },
  { id: "r8", name: "Amandeep K.", blurb: "SUPER CONVENIENT", quote: "Fast delivery, great packaging, and the website makes ordering so easy. 10/10 would recommend.", rating: 5 },
];

const fetcher = (url: string) => fetch(url).then(r => r.json());

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-2.97 0-5.46.98-7.28 2.66l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function ReviewCard({ review, index }: { review: typeof REVIEWS_FALLBACK[0]; index: number }) {
  const initials = review.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = [
    "bg-emerald-900 text-emerald-300",
    "bg-teal-900 text-teal-300",
    "bg-lime-900 text-lime-300",
    "bg-green-900 text-green-300",
  ];
  const avatarColor = colors[index % colors.length];

  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white/[0.04] border border-white/8 rounded-[32px] p-7 flex flex-col gap-5 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-500 group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-0.5">
          {Array.from({ length: review.rating || 5 }).map((_, i) => (
            <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-70 transition-opacity">
          <GoogleIcon />
          <span className="text-[9px] font-black uppercase tracking-widest text-white">Google</span>
        </div>
      </div>

      {/* Quote */}
      <div className="relative flex-1">
        <Quote size={20} className="absolute -top-1 -left-1 text-brand-light-green/20" />
        <p className="text-white/70 text-sm leading-relaxed font-medium pl-5 italic">
          {review.quote}
        </p>
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/8">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black ${avatarColor}`}>
          {initials}
        </div>
        <div>
          <p className="text-white font-black text-[13px] tracking-tight">{review.name}</p>
          <p className="text-white/30 text-[9px] uppercase tracking-widest font-bold">{review.blurb}</p>
        </div>
      </div>
    </div>
  );
}

function MarqueeRow({ reviews, reverse = false }: { reviews: typeof REVIEWS_FALLBACK; reverse?: boolean }) {
  const doubled = [...reviews, ...reviews];
  return (
    <div className="flex overflow-hidden gap-5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        className="flex gap-5 flex-nowrap"
        animate={{ x: reverse ? ["0%", "50%"] : ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((review, i) => (
          <ReviewCard key={`${review.id}-${i}`} review={review} index={i} />
        ))}
      </motion.div>
    </div>
  );
}

export function Reviews() {
  const { data } = useSWR("/api/reviews", fetcher, { revalidateOnFocus: false, dedupingInterval: 300000 });
  const allReviews = data?.reviews?.length ? data.reviews : REVIEWS_FALLBACK;
  const reviewLink = "https://search.google.com/local/writereview?placeid=ChIJJ7kdBtMXoFMRdV_edSitPm4";

  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });

  const row1 = allReviews.slice(0, Math.ceil(allReviews.length / 2));
  const row2 = allReviews.slice(Math.ceil(allReviews.length / 2));
  // Ensure each row has enough items for seamless loop
  const padRow = (arr: typeof allReviews, min = 4) => {
    while (arr.length < min) arr = [...arr, ...arr];
    return arr;
  };

  return (
    <section className="relative py-28 bg-[#060b08] overflow-hidden isolate">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-brand-light-green/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-brand-green/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6" ref={headerRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <motion.p
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="text-brand-light-green text-[10px] font-black uppercase tracking-[0.5em] mb-5"
            >
              Verified Google Reviews
            </motion.p>
            <motion.h2
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ delay: 0.08 }}
              className="text-white text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.88]"
            >
              What Our<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light-green via-white/80 to-white/30 italic font-display normal-case tracking-normal">
                Buddies Say.
              </span>
            </motion.h2>

            <motion.div
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              transition={{ delay: 0.16 }}
              className="flex items-center gap-3 mt-6"
            >
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => <Star key={s} size={16} className="fill-amber-400 text-amber-400" />)}
              </div>
              <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">
                4.9 / 5 · 200+ Reviews
              </span>
            </motion.div>
          </div>

          <motion.div
            variants={VARIANTS.SCALE_IN}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            transition={{ delay: 0.22 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.a
              href={reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center justify-center gap-2.5 bg-brand-light-green text-brand-green px-8 py-4 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-xl shadow-brand-light-green/15"
            >
              <GoogleIcon />
              Leave a Review
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="flex flex-col gap-5">
        <MarqueeRow reviews={padRow([...row1])} />
        <MarqueeRow reviews={padRow([...row2])} reverse />
      </div>

      {/* Bottom stat strip */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <motion.div
          variants={VARIANTS.FADE_UP}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-3 gap-px bg-white/8 rounded-3xl overflow-hidden border border-white/8"
        >
          {[
            { value: "4.9★", label: "Google Rating" },
            { value: "200+", label: "Happy Customers" },
            { value: "100%", label: "Satisfaction Rate" },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white/[0.03] py-8 px-6 text-center hover:bg-white/[0.06] transition-colors">
              <div className="text-3xl sm:text-4xl font-black text-brand-light-green tracking-tighter mb-1">{value}</div>
              <div className="text-[10px] uppercase tracking-widest text-white/30 font-black">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

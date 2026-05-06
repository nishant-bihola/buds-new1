import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";

export function Reviews() {
  const allReviews = [
    { name: "Nishant Bihola", blurb: "EXCELLENT SERVICE", quote: "Love the service wait till the new reworked website!" },
    { name: "Joban Dhami", blurb: "CUTTING EDGE", quote: "If you're looking for the cutting edge of customer service, quality product, and accessibility, Bud and buddies is your one stop shop." },
    { name: "Kevin", blurb: "EXCELLENT STORE", quote: "Excellent store with great prices! Go see Gagan, who I call the Guru of Ganga, for can't miss recommendations." },
    { name: "SP", blurb: "BEST DISPENSARY", quote: "I have been going to weed dispensaries since legalization first happened, and I can honestly say that this has been the best one!" },
    { name: "Victoria Ouellette", blurb: "HIGHLY RECOMMEND", quote: "The staff are genuinely some of the kindest people i've met, they are always trying to find the perfect match." },
    { name: "Gaganjot Singh", blurb: "GREATEST VIBES", quote: "Best prices in Sherwood park area and very helpful and knowledgeable staff always ready to help." },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1 >= allReviews.length ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [allReviews.length, itemsToShow]);

  const visibleReviews = Array.from({ length: itemsToShow }).map((_, i) =>
    allReviews[(currentIndex + i) % allReviews.length]
  );

  const reviewLink = "https://search.google.com/local/writereview?placeid=ChIJJ7kdBtMXoFMRdV_edSitPm4";

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1c-2.97 0-5.46.98-7.28 2.66l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <section className="relative py-24 px-6 bg-brand-green overflow-hidden isolate">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(197,225,165,0.4)_0%,transparent_70%)] -z-10" />

      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <motion.h2 
              variants={VARIANTS.FADE_UP}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-brand-earth text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]"
            >
              What Our Buddies Say
            </motion.h2>
            <motion.div 
              variants={VARIANTS.FADE_UP}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-center gap-3 mt-6"
            >
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => <span key={s} className="text-brand-light-green text-xl sm:text-2xl">★</span>)}
              </div>
              <span className="text-brand-earth/60 font-black uppercase tracking-widest text-[10px] sm:text-xs">4.9/5 Google Reviews</span>
            </motion.div>
          </div>
          <motion.a
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            variants={VARIANTS.SCALE_IN}
            initial="hidden"
            whileInView="visible"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 bg-brand-earth text-brand-green px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-brand-light-green transition-all shadow-2xl w-full sm:w-auto"
          >
            <GoogleIcon />
            Review us on Google
          </motion.a>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {visibleReviews.map((review, i) => (
              <motion.div
                key={`${review.name}-${i}`}
                variants={VARIANTS.FADE_UP}
                custom={i}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.3 } }}
                className="bg-brand-earth p-8 sm:p-10 rounded-[48px] flex flex-col shadow-2xl border border-white/5 group motion-gpu"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => <span key={s} className="text-brand-green text-sm">★</span>)}
                  </div>
                  <GoogleIcon />
                </div>
                <h4 className="text-brand-green font-black uppercase text-xl mb-4 leading-tight">
                  {review.blurb}
                </h4>
                <p className="text-base text-brand-dark/60 font-medium italic mb-10 flex-1 leading-relaxed">
                  "{review.quote}"
                </p>
                <div className="mt-auto pt-8 border-t border-brand-green/10 flex items-center justify-between">
                  <span className="font-black uppercase tracking-tight text-brand-green text-sm">{review.name}</span>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-green-700 bg-green-100 px-4 py-1.5 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 bg-green-700 rounded-full animate-pulse" />
                    Local Guide
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

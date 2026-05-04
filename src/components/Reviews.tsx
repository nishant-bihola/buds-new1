import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Reviews() {
  const allReviews = [
    { name: "Nishant Bihola", blurb: "EXCELLENT SERVICE", quote: "Love the service wait till the new reworked website!" },
    { name: "Joban Dhami", blurb: "CUTTING EDGE", quote: "If you're looking for the cutting edge of customer service, quality product, and accessibility, Bud and buddies is your one stop shop for everything cannabis related in the greater Edmonton area." },
    { name: "Kevin", blurb: "EXCELLENT STORE", quote: "Excellent store with great prices! Go see Gagan, who I call the Guru of Ganga, for can't miss recommendations. He will not steer you wrong!" },
    { name: "SP", blurb: "BEST DISPENSARY", quote: "I have been going to weed dispensaries since legalization first happened, and I can honestly say that this has been the best one I have ever been to!!! Bud n buddies also has some of the lowest prices I have seen yet!" },
    { name: "Victoria Ouellette", blurb: "HIGHLY RECOMMEND", quote: "The staff are genuinely some of the kindest people i've met, they are always trying to find the perfect match for your needs. Everything about this place is amazing!" },
    { name: "Gaganjot Singh", blurb: "GREATEST VIBES", quote: "Best prices in Sherwood park area and very helpful and knowledgeable staff always ready to help definitely suggest visiting this place." },
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
      setCurrentIndex((prev) => (prev + itemsToShow >= allReviews.length ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [allReviews.length, itemsToShow]);

  const visibleReviews = Array.from({ length: itemsToShow }).map((_, i) =>
    allReviews[(currentIndex + i) % allReviews.length]
  );

  const reviewLink = "https://search.google.com/local/writereview?placeid=ChIJJ7kdBtMXoFMRdV_edSitPm4";

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden min-h-[500px] md:min-h-[700px] flex items-center">
      <div className="absolute inset-0 z-0 bg-brand-green overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(197,225,165,0.4)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-brand-earth text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter">
              What Our Buddies Say
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5 sm:gap-1">
                {[1,2,3,4,5].map((s) => <span key={s} className="text-brand-light-green text-lg sm:text-xl">★</span>)}
              </div>
              <span className="text-brand-earth/80 font-bold ml-1 text-sm sm:text-base">4.9/5 Google Reviews</span>
            </div>
          </div>
          <motion.a
            href={reviewLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 sm:gap-3 bg-brand-earth text-brand-green px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black uppercase tracking-widest text-xs sm:text-sm hover:bg-brand-light-green transition-colors shadow-lg w-full sm:w-auto"
          >
            <GoogleIcon />
            Review us on Google
          </motion.a>
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {visibleReviews.map((review, i) => (
              <motion.div
                key={`${review.name}-${i}`}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-brand-earth p-6 sm:p-8 md:p-10 rounded-[32px] sm:rounded-[40px] flex flex-col shadow-2xl border border-white/5 relative group motion-gpu"
              >
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((s) => <span key={s} className="text-brand-green text-sm">★</span>)}
                  </div>
                  <GoogleIcon />
                </div>
                <h4 className="text-brand-green font-black uppercase text-lg sm:text-xl mb-3">
                  {review.blurb}
                </h4>
                <p className="text-sm sm:text-base text-brand-dark/60 font-medium italic mb-8 flex-1">
                  "{review.quote}"
                </p>
                <div className="mt-auto pt-4 sm:pt-6 border-t border-brand-green/10 flex items-center justify-between">
                  <span className="font-bold text-brand-green text-sm">{review.name}</span>
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-green-700 bg-green-100 px-2 sm:px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-700 rounded-full" />
                    Google Local Guide
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

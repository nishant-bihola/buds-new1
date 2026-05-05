import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft, ShieldCheck } from "lucide-react";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";

const STORAGE_KEY = "bnb-age-verified";
type Screen = "loading" | "gate" | "denied" | "done";

const RING_CLASSES = [
  "age-ring-1", "age-ring-2", "age-ring-3", "age-ring-4",
  "age-ring-5", "age-ring-6", "age-ring-7", "age-ring-8",
];

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>("loading");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const verified = sessionStorage.getItem(STORAGE_KEY) === "yes";
    setScreen(verified ? "done" : "gate");
    setMounted(true);
  }, []);

  const handleYes = () => {
    sessionStorage.setItem(STORAGE_KEY, "yes");
    setScreen("done");
  };

  const handleNo = () => {
    setScreen("denied");
    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 2500);
  };

  if (!mounted || screen === "loading") {
    return <div className="fixed inset-0 bg-[#060b08] z-[10000]" />;
  }

  return (
    <>
      {screen === "done" && children}

      <AnimatePresence>
        {screen !== "done" && (
          <motion.div
            key="age-gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: TRANSITIONS.PREMIUM }}
            className="age-gate-overlay fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden isolate custom-scrollbar"
          >
            <div aria-hidden className="age-gate-checker fixed inset-0 pointer-events-none opacity-20" />

            <div aria-hidden className="fixed inset-0 flex items-center justify-center pointer-events-none">
              {RING_CLASSES.map((cls, i) => (
                <motion.div
                  key={cls}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 1.2, ease: TRANSITIONS.PREMIUM }}
                  className={`absolute rounded-full border border-white/5 ${cls}`}
                />
              ))}
            </div>

            <div aria-hidden className="fixed inset-0 pointer-events-none age-gate-radial" />

            <div className="min-h-full w-full flex flex-col items-center justify-center py-12 sm:py-20 relative z-10">
              <AnimatePresence mode="wait">
                {screen === "gate" && (
                  <motion.div
                    key="gate-content"
                    variants={VARIANTS.FADE_UP}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    className="flex flex-col items-center text-center px-5 sm:px-6 md:px-8 w-full max-w-xl sm:max-w-2xl mx-auto"
                  >
                    {/* Logo */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, ease: TRANSITIONS.PREMIUM }}
                      className="mb-8 sm:mb-10"
                    >
                      <img
                        src="/images/buds_n_buddies_logo.png"
                        alt="Bud n' Buddies"
                        className="h-[clamp(3rem,8vw,6rem)] w-auto object-contain brightness-0 invert"
                      />
                    </motion.div>

                    {/* Badge */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 bg-white/5 px-4 sm:px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                      <ShieldCheck size={14} className="text-brand-light-green shrink-0" />
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-brand-light-green whitespace-nowrap">
                        Secure Age Verification
                      </span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-[clamp(2.2rem,6vw,4.8rem)] font-black uppercase tracking-tight leading-[0.85] text-white mb-8 sm:mb-10">
                      Are you<br />
                      <span className="text-brand-light-green">18 or older?</span>
                    </h1>

                    {/* Description */}
                    <p className="text-sm sm:text-base md:text-lg text-white/50 font-medium leading-relaxed mb-10 sm:mb-12 max-w-md mx-auto">
                      You must be of legal age with valid government-issued ID to purchase cannabis in your province.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full max-w-md">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, backgroundColor: "#fff" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleYes}
                        className="bg-brand-light-green text-brand-green py-4 sm:py-5 rounded-[24px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[11px] sm:text-[12px] flex-1 shadow-2xl shadow-brand-light-green/20 transition-all"
                      >
                        Yes, I'm 18+
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNo}
                        className="bg-white/5 text-white/40 py-4 sm:py-5 rounded-[24px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-[11px] sm:text-[12px] flex-1 border border-white/10 transition-all"
                      >
                        No, I'm Not
                      </motion.button>
                    </div>

                    {/* Footer */}
                    <p className="mt-10 sm:mt-12 text-[9px] sm:text-[10px] text-white/20 font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] px-4 sm:px-8 text-center leading-loose">
                      By entering, you agree to our Terms & Privacy Policy.
                      <br className="hidden sm:block" />
                      Please consume responsibly.
                    </p>
                  </motion.div>
                )}

                {screen === "denied" && (
                  <motion.div
                    key="denied-content"
                    variants={VARIANTS.FADE_UP}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center text-center px-6 sm:px-8 w-full max-w-md sm:max-w-xl mx-auto"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] border-2 border-red-500/20 flex items-center justify-center mb-8 sm:mb-10 bg-red-500/5">
                      <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" strokeWidth={3} />
                    </div>

                    <h2 className="text-[clamp(2rem,5vw,3.2rem)] font-black uppercase tracking-tight text-white mb-4 sm:mb-6">
                      Access Denied
                    </h2>

                    <p className="text-sm sm:text-base md:text-lg text-white/40 font-medium leading-relaxed mb-10 sm:mb-12 max-w-sm mx-auto">
                      You must be 18 or older to visit this site. Redirecting you to a safe resource...
                    </p>

                    <button
                      type="button"
                      onClick={() => setScreen("gate")}
                      className="group flex items-center gap-3 text-white/60 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:text-white transition-all"
                    >
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                      Go back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
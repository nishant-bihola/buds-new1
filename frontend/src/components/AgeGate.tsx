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
                    className="age-gate-card flex flex-col items-center text-center"
                  >
                    {/* Logo */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, ease: TRANSITIONS.PREMIUM }}
                      className="mb-6 sm:mb-8"
                    >
                      <img
                        src="/images/buds_n_buddies_logo.png"
                        alt="Bud n' Buddies"
                        className="age-gate-logo w-auto object-contain"
                      />
                    </motion.div>
[1/2]
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-6 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                      <ShieldCheck size={12} className="text-brand-light-green shrink-0" />
                      <span className="age-gate-label whitespace-nowrap">
                        Secure Age Verification
                      </span>
                    </div>

                    {/* Heading */}
                    <h1 className="age-gate-h1 font-black uppercase tracking-tight leading-[0.9] text-white mb-6 sm:mb-8">
                      Are you<br />
                      <span className="text-brand-light-green">18 or older?</span>
                    </h1>

                    {/* Description */}
                    <p className="age-gate-body text-white/50 font-medium leading-relaxed mb-8 sm:mb-10 mx-auto">
                      You must be of legal age with valid government-issued ID to purchase cannabis in your province.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleYes}
                        className="age-gate-btn age-gate-btn-primary"
                      >
                        Yes, I'm 18+
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNo}
                        className="age-gate-btn age-gate-btn-secondary"
                      >
                        No, I'm Not
                      </motion.button>
                    </div>

                    {/* Footer */}
                    <p className="age-gate-legal mt-8 sm:mt-10 text-white/20 font-black uppercase tracking-[0.25em] text-center leading-loose mx-auto">
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
                    className="age-gate-card age-gate-denied flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] border-2 border-red-500/20 flex items-center justify-center mb-8 sm:mb-10 bg-red-500/5">
                      <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" strokeWidth={3} />
                    </div>

                    <h2 className="age-gate-denied-h2 font-black uppercase tracking-tight text-white mb-4 sm:mb-6">
                      Access Denied
                    </h2>

                    <p className="age-gate-body text-white/40 font-medium leading-relaxed mb-10 sm:mb-12 mx-auto">
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
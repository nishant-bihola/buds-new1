import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft } from "lucide-react";

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
    // Standard practice: Redirect to a safe site after a delay
    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 2000);
  };

  if (!mounted || screen === "loading") return <div className="fixed inset-0 bg-[#060b08] z-[10000]" />;

  return (
    <>
      {screen === "done" && children}

      <AnimatePresence>
        {screen !== "done" && (
          <motion.div
            key="age-gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="age-gate-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          >
            {/* Checkerboard bg */}
            <div aria-hidden className="age-gate-checker absolute inset-0 pointer-events-none" />

            {/* Bullseye rings */}
            <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {RING_CLASSES.map((cls, i) => (
                <motion.div
                  key={cls}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute rounded-full ${cls}`}
                />
              ))}
            </div>

            {/* Radial vignette to darken centre */}
            <div aria-hidden className="age-gate-radial absolute inset-0 pointer-events-none" />

            {/* Gate / Denied */}
            <AnimatePresence mode="wait">
              {screen === "gate" && (
                <motion.div
                  key="gate-content"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="age-gate-card relative z-10 flex flex-col items-center text-center px-6"
                >
                    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-2 sm:mb-3"
                      >
                        <img
                          src="/images/buds_n_buddies_logo.png"
                          alt="Bud n' Buddies"
                          className="h-10 sm:h-14 w-auto object-contain brightness-0 invert"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-brand-light-green mb-5 opacity-60"
                      >
                        Secure Identity Verification
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8] text-white mb-8 text-center"
                      >
                        Are you<br /> 18 or older?
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-base sm:text-lg text-white/70 font-medium leading-relaxed mb-10 sm:mb-14 text-center max-w-md px-6"
                      >
                        You must be of legal age with valid government-issued ID to purchase cannabis in your province.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-6"
                      >
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleYes}
                          className="bg-brand-green text-brand-earth py-5 rounded-full font-black uppercase tracking-widest text-[12px] flex-1 shadow-[0_0_40px_rgba(30,77,43,0.3)] hover:shadow-[0_0_50px_rgba(30,77,43,0.5)] transition-all"
                        >
                          Yes, I'm 18+
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNo}
                          className="bg-white/5 text-white py-5 rounded-full font-black uppercase tracking-widest text-[12px] flex-1 border border-white/10 hover:bg-white/10 transition-all"
                        >
                          No, I'm Not
                        </motion.button>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] px-8 text-center"
                      >
                        By entering, you agree to our Terms & Privacy Policy.
                      </motion.p>
                    </div>
                </motion.div>
              )}

              {screen === "denied" && (
                <motion.div
                  key="denied-content"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="age-gate-denied relative z-10 flex flex-col items-center text-center px-6 w-full"
                >
                  <motion.img
                    src="/images/buds_n_buddies_logo.png"
                    alt="Bud n' Buddies"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="age-gate-denied-logo w-auto object-contain mb-9 brightness-0 invert opacity-20"
                  />

                  <div className="age-gate-x-wrap rounded-full border-2 border-red-500/30 flex items-center justify-center mb-7">
                    <X className="w-8 h-8 text-red-400/70" strokeWidth={3} />
                  </div>

                  <h2 className="age-gate-denied-h2 font-black uppercase tracking-tighter text-white leading-none mb-3">
                    Access Denied
                  </h2>
                  <p className="age-gate-body text-white/35 font-medium leading-relaxed mb-9">
                    You must be 18 or older to visit this site. Come back when you're of legal age.
                  </p>

                  <button
                    type="button"
                    onClick={() => setScreen("gate")}
                    className="group flex items-center gap-2 text-white/90 text-[12px] sm:text-[13px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors duration-300 drop-shadow-md"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                    Go back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

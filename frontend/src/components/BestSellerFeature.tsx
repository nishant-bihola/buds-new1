import { motion } from "motion/react";
import { Check, X, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TRANSITIONS, VARIANTS } from "@/lib/animations";

const benefits = [
  { text: "Long-lasting effects", positive: true },
  { text: "Organic cultivation", positive: true },
  { text: "No synthetic pesticides", positive: false },
  { text: "No fake terpenes", positive: false },
  { text: "No harsh chemicals", positive: false },
];

export function BestSellerFeature() {
  return (
    <section className="py-24 sm:py-32 px-6 bg-brand-earth overflow-hidden isolate">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">

        {/* Text side */}
        <div className="order-2 lg:order-1">
          <motion.h2
            variants={VARIANTS.FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9] mb-8 text-brand-green"
          >
            Hand-picked buds<br />for every buddy
          </motion.h2>

          <Link to="/shop?category=Dried Flower">
            <motion.div
              variants={VARIANTS.SCALE_IN}
              initial="hidden"
              whileInView="visible"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-4 bg-brand-green text-brand-earth px-8 py-4 rounded-full text-[13px] font-black uppercase tracking-widest mb-12 cursor-pointer shadow-2xl shadow-brand-green/20 border border-brand-light-green/10"
            >
              Shop Flower
              <ArrowUpRight size={18} />
            </motion.div>
          </Link>

          <motion.div
            variants={VARIANTS.FADE_UP}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-4 text-brand-dark">
              The right way to grow.
            </h3>
            <p className="text-brand-dark/70 text-lg mb-10 max-w-md leading-relaxed font-medium">
              Our products are grown without shortcuts. Pure, potent, and hand-selected for our buddies in Sherwood Park.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <motion.div 
                  key={b.text} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`p-2 rounded-full shrink-0 ${b.positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                  >
                    {b.positive
                      ? <Check size={12} strokeWidth={4} />
                      : <X size={12} strokeWidth={4} />}
                  </div>
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-brand-dark/80">
                    {b.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Image side */}
        <motion.div
          variants={VARIANTS.SCALE_IN}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="order-1 lg:order-2 relative"
        >
          <div className="absolute inset-0 bg-brand-light-green/20 blur-[100px] rounded-full -z-10" />
          <img
            src="/images/nano_banana_kush.png"
            alt="Nano Banana Kush — premium dried flower"
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-[48px] sm:rounded-[64px] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700"
          />
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const benefits = [
  { text: "Long-lasting effects", positive: true },
  { text: "Organic cultivation", positive: true },
  { text: "No synthetic pesticides", positive: false },
  { text: "No fake terpenes", positive: false },
  { text: "No harsh chemicals", positive: false },
];

export function BestSellerFeature() {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-brand-earth overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* Text side */}
        <div className="order-2 lg:order-1">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-6 text-brand-green"
          >
            Hand-picked buds<br />for every buddy
          </motion.h2>

          <Link to="/shop?category=Dried Flower">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 bg-brand-green text-brand-earth px-7 py-3.5 rounded-full text-[12px] font-black uppercase tracking-widest mb-8 sm:mb-10 cursor-pointer shadow-lg shadow-brand-green/20"
            >
              Shop Flower
              <ArrowUpRight size={16} />
            </motion.div>
          </Link>

          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-3 text-brand-dark">
            The right way to grow.
          </h3>
          <p className="text-brand-dark/70 text-base mb-6 max-w-md leading-relaxed font-medium">
            Our products are grown without shortcuts. Pure, potent, and hand-selected for our buddies in Sherwood Park.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-full shrink-0 ${b.positive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                >
                  {b.positive
                    ? <Check size={12} strokeWidth={3.5} />
                    : <X size={12} strokeWidth={3.5} />}
                </div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wide text-brand-dark/70">
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Image side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 0.999, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="order-1 lg:order-2"
        >
          <img
            src="/images/nano_banana_kush.png"
            alt="Nano Banana Kush — premium dried flower"
            loading="lazy"
            decoding="async"
            className="w-full h-auto rounded-[36px] sm:rounded-[52px] shadow-2xl"
          />
        </motion.div>
      </div>
    </section>
  );
}

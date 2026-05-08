import { motion } from "motion/react";
import { Truck, MapPin, Star, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useSection } from "../context/ContentContext";

const ZONE_COLORS = [
  "border-brand-light-green/30 bg-brand-light-green/5",
  "border-white/10 bg-white/[0.02]",
  "border-white/10 bg-white/[0.02]",
  "border-red-500/10 bg-red-500/[0.02]",
];
const ZONE_FEE_COLORS = ["text-brand-light-green", "text-white", "text-white", "text-red-400/60"];

export function DeliveryZones() {
  const c = useSection("delivery");

  const zones = [
    { name: c.zone1_name, range: c.zone1_range, fee: c.zone1_fee, perk: c.zone1_perk, icon: Star },
    { name: c.zone2_name, range: c.zone2_range, fee: c.zone2_fee, perk: c.zone2_perk, icon: Truck },
    { name: c.zone3_name, range: c.zone3_range, fee: c.zone3_fee, perk: c.zone3_perk, icon: MapPin },
    { name: c.zone4_name, range: c.zone4_range, fee: c.zone4_fee, perk: c.zone4_perk, icon: Phone },
  ];

  return (
    <section id="delivery-zones" className="bg-[#060b08] border-t border-white/5 py-20 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-light-green/60 mb-4">
            Local Delivery
          </p>
          <h2
            className="font-black uppercase tracking-tighter text-white leading-[0.9] mb-5"
            style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
          >
            {c.heading}
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto font-medium leading-relaxed">
            {c.subheading}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {zones.map((z, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-3xl border p-6 flex flex-col gap-4 ${ZONE_COLORS[i]}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{z.range}</span>
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                  <z.icon size={14} className="text-white/30" />
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">{z.name}</p>
                <p className={`text-2xl font-black tracking-tighter ${ZONE_FEE_COLORS[i]}`}>{z.fee}</p>
              </div>
              <p className="text-[11px] text-white/40 font-medium leading-snug mt-auto">{z.perk}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link to="/shop">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-brand-light-green text-brand-green px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-brand-light-green/10"
            >
              {c.cta}
            </motion.button>
          </Link>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-4">
            Fee calculated live at checkout based on your address
          </p>
        </motion.div>
      </div>
    </section>
  );
}

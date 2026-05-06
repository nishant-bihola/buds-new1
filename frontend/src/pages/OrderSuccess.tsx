import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, Package, Phone, MapPin, ArrowRight } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  status: string;
}

export function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    fetch(`/api/orders?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then(({ order }) => { setOrder(order); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  if (!loading && !sessionId) {
    return (
      <div className="pt-40 pb-16 px-4 bg-brand-earth min-h-screen flex flex-col items-center text-center">
        <h1 className="text-2xl font-black text-brand-green mb-4">No Order Found</h1>
        <p className="text-brand-dark/60 mb-8 font-medium">This link doesn't include an order session.</p>
        <Link to="/shop" className="bg-brand-green text-brand-earth px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 sm:pt-40 pb-16 px-4 bg-brand-earth min-h-screen flex flex-col items-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-20 h-20 sm:w-24 sm:h-24 bg-brand-green text-brand-earth rounded-full flex items-center justify-center mb-6"
      >
        <CheckCircle2 size={40} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10 max-w-md"
      >
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand-green mb-4">
          Order Confirmed!
        </h1>
        <p className="text-brand-dark/60 text-base sm:text-lg font-medium">
          {order
            ? `Thanks ${order.customerName.split(" ")[0]}! A confirmation email is on its way.`
            : "Your payment was successful. Check your email for confirmation."}
        </p>
      </motion.div>

      {!loading && order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-xl mb-8"
        >
          <h2 className="font-black uppercase tracking-tight text-lg mb-4 text-brand-green">
            Order Summary
          </h2>
          <div className="space-y-3 mb-6">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm font-medium">
                <span className="text-brand-dark/80">{item.name} ×{item.quantity}</span>
                <span className="font-black">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-black text-lg border-t border-brand-green/10 pt-4">
            <span>Total</span>
            <span className="text-brand-green">${order.total.toFixed(2)} CAD</span>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md bg-brand-green text-brand-earth rounded-[32px] p-6 sm:p-8 mb-8"
      >
        <h2 className="font-black uppercase tracking-tight text-lg mb-4 text-brand-light-green">
          Pickup Info
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="mt-0.5 shrink-0 text-brand-light-green" />
            <span className="text-sm font-medium text-brand-earth/80">130-75 Salisbury Way, Sherwood Park, AB T8B 1K4</span>
          </div>
          <div className="flex items-center gap-3">
            <Package size={16} className="shrink-0 text-brand-light-green" />
            <span className="text-sm font-medium text-brand-earth/80">Open every day until 2:00 AM</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="shrink-0 text-brand-light-green" />
            <span className="text-sm font-medium text-brand-earth/80">(825) 218-8234</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4"
      >
        <Link
          to="/"
          className="bg-brand-green text-brand-earth px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
        >
          Back Home <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Truck, Store, Check, X, RefreshCw, ChevronDown, Bell, BellOff } from "lucide-react";
import { api } from "../lib/api";

/* ── Sound ─────────────────────────────────────────────────── */
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch { /* audio blocked */ }
}

/* ── Status config ─────────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  confirmed:    "bg-blue-500/20 text-blue-300 border-blue-500/30",
  preparing:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
  dispatched:   "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  delivered:    "bg-green-500/20 text-green-300 border-green-500/30",
  ready_pickup: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  picked_up:    "bg-gray-500/20 text-gray-400 border-gray-500/30",
  cancelled:    "bg-red-500/20 text-red-400 border-red-500/30",
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed", preparing: "Preparing", dispatched: "Dispatched",
  delivered: "Delivered", ready_pickup: "Ready Pickup", picked_up: "Picked Up", cancelled: "Cancelled",
};

const ACTIVE_STATUSES = ["confirmed", "preparing", "ready_pickup", "dispatched"];

/* ── PIN gate ──────────────────────────────────────────────── */
const TILL_PIN = "0000";
const TILL_ADMIN_KEY = "bud";

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);

  // Ensure admin key is stored so API calls work
  useEffect(() => {
    if (!sessionStorage.getItem("admin_secret")) {
      sessionStorage.setItem("admin_secret", TILL_ADMIN_KEY);
      localStorage.setItem("admin_secret", TILL_ADMIN_KEY);
    }
  }, []);

  const press = (d: string) => {
    const next = (digits + d).slice(0, 4);
    setDigits(next);
    if (next.length === 4) {
      if (next === TILL_PIN) {
        sessionStorage.setItem("till_auth", "1");
        onUnlock();
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setDigits(""); }, 600);
      }
    }
  };

  const clear = () => setDigits(d => d.slice(0, -1));

  return (
    <div className="min-h-screen bg-[#060b08] flex flex-col items-center justify-center p-6 gap-8">
      <img src="/images/buds_n_buddies_logo.png" alt="Bud N' Buddies" className="h-12 object-contain" />
      <p className="text-white/40 text-sm font-black uppercase tracking-widest">Till — Enter PIN</p>

      <motion.div
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        className="flex gap-4"
      >
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
            digits.length > i ? "bg-brand-light-green border-brand-light-green" : "border-white/20"
          }`} />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
          <button
            key={i}
            type="button"
            onClick={() => k === "⌫" ? clear() : k !== "" ? press(k) : undefined}
            disabled={k === ""}
            className={`h-16 rounded-2xl text-xl font-black transition-all active:scale-90 ${
              k === "" ? "opacity-0 pointer-events-none" :
              k === "⌫" ? "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10" :
              "bg-white/10 text-white border border-white/10 hover:bg-brand-light-green hover:text-brand-green hover:border-brand-light-green"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Order card ────────────────────────────────────────────── */
function OrderCard({ order, onAction }: { order: any; onAction: (id: string, status: string) => Promise<void> }) {
  const isDelivery = order.delivery?.method === "delivery";
  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const FLOW_DELIVERY = ["confirmed", "preparing", "dispatched", "delivered"];
  const FLOW_PICKUP   = ["confirmed", "preparing", "ready_pickup", "picked_up"];
  const flow = isDelivery ? FLOW_DELIVERY : FLOW_PICKUP;
  const idx = flow.indexOf(order.status);
  const next = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  const isFinal = ["delivered", "picked_up", "cancelled"].includes(order.status);

  const act = async (status: string) => {
    setLoading(status);
    await onAction(order.orderId, status);
    setLoading(null);
  };

  const nextLabel: Record<string, string> = {
    preparing: "Start Preparing",
    dispatched: "Mark Dispatched",
    delivered: "Mark Delivered",
    ready_pickup: "Ready for Pickup",
    picked_up: "Mark Picked Up",
  };

  const statusCls = STATUS_COLORS[order.status] ?? "bg-white/10 text-white/60 border-white/10";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`bg-[#111815] border rounded-2xl overflow-hidden transition-all ${
        order.status === "confirmed" ? "border-brand-light-green/40 shadow-lg shadow-brand-light-green/5" : "border-white/8"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/3 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isDelivery ? "bg-orange-500/15 text-orange-400" : "bg-purple-500/15 text-purple-400"
        }`}>
          {isDelivery ? <Truck size={18} /> : <Store size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-sm tracking-tight text-white">{order.orderId}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${statusCls}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <p className="text-white/40 text-xs mt-0.5 truncate">{order.customer?.name} · {isDelivery ? order.delivery?.street : "Pickup"}</p>
        </div>

        <div className="text-right flex-shrink-0 ml-2">
          <p className="font-black text-lg text-white">${Number(order.total ?? 0).toFixed(2)}</p>
          <ChevronDown size={14} className={`ml-auto opacity-30 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              {/* Items */}
              <div className="space-y-1.5">
                {(order.items as any[])?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-white/60 truncate flex-1">{item.name}</span>
                    <span className="text-white/40 text-xs ml-2 flex-shrink-0">×{item.quantity}</span>
                    <span className="text-white font-bold ml-3 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-white/5 pt-2 space-y-1 text-xs text-white/50">
                <div className="flex justify-between">
                  <span>Subtotal</span><span>${Number(order.subtotal ?? 0).toFixed(2)}</span>
                </div>
                {isDelivery && (
                  <div className="flex justify-between">
                    <span>Delivery</span><span>{Number(order.deliveryFee ?? 0) === 0 ? "FREE" : `$${Number(order.deliveryFee).toFixed(2)}`}</span>
                  </div>
                )}
                {Number(order.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-brand-light-green">
                    <span>Discount</span><span>-${Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-white/5">
                  <span>Total</span><span>${Number(order.total ?? 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="text-xs text-white/40 space-y-0.5">
                <p>{order.customer?.phone}</p>
                {isDelivery && <p>{order.delivery?.street}, {order.delivery?.city} {order.delivery?.postal}</p>}
                {isDelivery && order.delivery?.slot && <p>Window: {order.delivery.slot === "asap" ? "ASAP (45–75 min)" : order.delivery.slot === "2h" ? "Today in 2h" : "Today in 4h"}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {!isFinal && (
        <div className="flex gap-2 px-4 pb-4">
          {next && (
            <button
              type="button"
              disabled={!!loading}
              onClick={() => act(next)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-light-green text-brand-green font-black uppercase text-[10px] tracking-widest hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-brand-light-green/10"
            >
              {loading === next ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {nextLabel[next] ?? next}
            </button>
          )}
          <button
            type="button"
            disabled={!!loading}
            onClick={() => act("cancelled")}
            className="px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading === "cancelled" ? <RefreshCw size={14} className="animate-spin" /> : <X size={14} />}
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Till page ────────────────────────────────────────── */
export function Till() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("till_auth") === "1");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const prevCountRef = useRef(0);
  const initializedRef = useRef(false);
  const secret = sessionStorage.getItem("admin_secret") || localStorage.getItem("admin_secret") || "";

  const fetchOrders = async () => {
    if (!secret) return;
    setLoading(true);
    try {
      const data = await api.admin.getOrders();
      const sorted = (data.orders ?? []).sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch { /* network error */ }
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchOrders();
    const id = setInterval(fetchOrders, 12000);
    return () => clearInterval(id);
  }, [authed]);

  // New-order alert
  useEffect(() => {
    if (!initializedRef.current) {
      prevCountRef.current = orders.length;
      initializedRef.current = true;
      return;
    }
    if (orders.length > prevCountRef.current && soundOn) {
      playChime();
    }
    prevCountRef.current = orders.length;
  }, [orders.length, soundOn]);

  const handleAction = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, status);
      await fetchOrders();
    } catch { /* ignore */ }
  };

  const filtered = useMemo(() =>
    filter === "active"
      ? orders.filter(o => ACTIVE_STATUSES.includes(o.status))
      : orders,
    [orders, filter]
  );

  const activeCount = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;

  if (!authed) return <PinGate onUnlock={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#060b08] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#060b08]/95 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <img src="/images/buds_n_buddies_logo.png" alt="Bud N' Buddies" className="h-7 object-contain" />
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Till View</p>
        </div>

        {activeCount > 0 && (
          <div className="flex items-center gap-1.5 bg-brand-light-green/10 border border-brand-light-green/30 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inset-0 rounded-full bg-brand-light-green opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-brand-light-green" />
            </span>
            <span className="text-brand-light-green font-black text-[10px] uppercase tracking-widest">{activeCount} active</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSoundOn(s => !s)}
          className={`p-2.5 rounded-xl border transition-all ${soundOn ? "bg-brand-light-green/10 border-brand-light-green/30 text-brand-light-green" : "bg-white/5 border-white/10 text-white/30"}`}
          title={soundOn ? "Sound on" : "Sound off"}
        >
          {soundOn ? <Bell size={16} /> : <BellOff size={16} />}
        </button>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="px-4 pt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
            filter === "active" ? "bg-brand-light-green text-brand-green border-brand-light-green" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
          }`}
        >
          Active {activeCount > 0 && `(${activeCount})`}
        </button>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
            filter === "all" ? "bg-brand-light-green text-brand-green border-brand-light-green" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
          }`}
        >
          All Orders
        </button>
      </div>

      {/* Order list */}
      <div className="px-4 py-4 space-y-3 pb-8">
        {loading && filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-white/20">
            <RefreshCw size={28} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-3">
            <ShoppingBag size={36} className="opacity-30" />
            <p className="text-sm font-medium">{filter === "active" ? "No active orders" : "No orders yet"}</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(order => (
              <OrderCard key={order.orderId} order={order} onAction={handleAction} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

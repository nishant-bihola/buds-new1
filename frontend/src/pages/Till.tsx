import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Truck, Store, Check, X, RefreshCw, Bell, BellOff,
  LogOut, Clock, DollarSign, ChevronRight, Phone, MapPin, Package,
  AlertTriangle, Search, ChevronDown, Printer, Eye,
} from "lucide-react";
import { api } from "../lib/api";

/* ─────────────────────────────────────────────────────────────
   Sound
───────────────────────────────────────────────────────────── */
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.start(t); osc.stop(t + 0.55);
    });
  } catch { /* blocked */ }
}

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const TILL_PIN      = "0000";
const TILL_ADMIN_KEY = "bud";

const STATUS_COLOR: Record<string, string> = {
  confirmed:    "bg-blue-500/20 text-blue-300 border-blue-500/30",
  preparing:    "bg-amber-500/20 text-amber-300 border-amber-500/30",
  dispatched:   "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  delivered:    "bg-green-500/20 text-green-300 border-green-500/30",
  ready_pickup: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  picked_up:    "bg-gray-500/20 text-gray-400 border-gray-500/30",
  cancelled:    "bg-red-500/20 text-red-400 border-red-500/30",
};
const STATUS_LABEL: Record<string, string> = {
  confirmed: "New", preparing: "Preparing", dispatched: "On Way",
  delivered: "Delivered", ready_pickup: "Ready", picked_up: "Picked Up", cancelled: "Cancelled",
};
const NEXT_LABEL: Record<string, string> = {
  preparing:    "Start Preparing",
  dispatched:   "Out for Delivery",
  delivered:    "Mark Delivered",
  ready_pickup: "Ready for Pickup",
  picked_up:    "Picked Up ✓",
};
const FLOW_DELIVERY = ["confirmed", "preparing", "dispatched", "delivered"];
const FLOW_PICKUP   = ["confirmed", "preparing", "ready_pickup", "picked_up"];
const ACTIVE = new Set(["confirmed", "preparing", "ready_pickup", "dispatched"]);

/* ─────────────────────────────────────────────────────────────
   PIN Gate
───────────────────────────────────────────────────────────── */
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake]   = useState(false);
  const [time, setTime]     = useState(() => new Date());

  useEffect(() => {
    sessionStorage.setItem("admin_secret", TILL_ADMIN_KEY);
    localStorage.setItem("admin_secret", TILL_ADMIN_KEY);
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
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

  const del = () => setDigits(d => d.slice(0, -1));

  const pad = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  return (
    <div className="min-h-screen bg-[#060b08] flex flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <p className="text-white/20 text-xs font-black uppercase tracking-widest">Bud N' Buddies</p>
        <p className="text-white/30 text-xs font-black tabular-nums">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="flex flex-col items-center gap-2">
          <img src="/images/buds_n_buddies_logo.png" alt="Bud N' Buddies" className="h-10 object-contain mb-2" />
          <p className="text-white/50 text-[11px] font-black uppercase tracking-[0.4em]">Till Terminal</p>
          <p className="text-white/20 text-[10px] mt-1">
            {time.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* PIN dots */}
        <motion.div
          animate={shake ? { x: [0, -12, 12, -12, 12, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-5"
        >
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ scale: digits.length > i ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className={`w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
                digits.length > i
                  ? "bg-brand-light-green border-brand-light-green"
                  : "border-white/25 bg-transparent"
              }`}
            />
          ))}
        </motion.div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {pad.map((k, i) => (
            <motion.button
              key={i}
              type="button"
              whileTap={k !== "" ? { scale: 0.88 } : {}}
              onClick={() => k === "⌫" ? del() : k !== "" ? press(k) : undefined}
              disabled={k === ""}
              className={`h-[68px] rounded-2xl text-lg font-black transition-colors ${
                k === "" ? "opacity-0 pointer-events-none" :
                k === "⌫"
                  ? "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 text-2xl"
                  : "bg-[#1a2b1e] text-white border border-white/8 hover:bg-brand-light-green hover:text-brand-green hover:border-brand-light-green active:bg-brand-light-green/80"
              }`}
            >
              {k}
            </motion.button>
          ))}
        </div>

        {shake && (
          <p className="text-red-400 text-xs font-black uppercase tracking-widest animate-pulse">
            Incorrect PIN
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Logout confirm overlay
───────────────────────────────────────────────────────────── */
function LogoutOverlay({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
        className="bg-[#111815] border border-white/10 rounded-3xl w-full max-w-sm p-8 space-y-6"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <LogOut size={22} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Lock Till?</h2>
            <p className="text-white/40 text-sm mt-1">You'll need the PIN to get back in.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 font-black uppercase text-xs tracking-widest text-white/60 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl bg-red-500/20 border border-red-500/30 font-black uppercase text-xs tracking-widest text-red-400 hover:bg-red-500/30 transition-all"
          >
            Lock Till
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Order Detail Modal
───────────────────────────────────────────────────────────── */
function OrderModal({
  order, onClose, onAction,
}: { order: any; onClose: () => void; onAction: (id: string, status: string) => Promise<void> }) {
  const isDelivery = order.delivery?.method === "delivery";
  const [loading, setLoading]       = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const flow = isDelivery ? FLOW_DELIVERY : FLOW_PICKUP;
  const idx  = flow.indexOf(order.status);
  const next = idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  const isFinal = ["delivered", "picked_up", "cancelled"].includes(order.status);

  const act = async (status: string) => {
    setLoading(status);
    await onAction(order.orderId, status);
    setLoading(null);
    if (status !== "cancelled") onClose();
    else setConfirmCancel(false);
  };

  const elapsed = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const elapsedLabel = elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m ago`;

  const printReceipt = () => {
    const lines = [
      "BUD N' BUDDIES",
      "─────────────────────",
      `Order: ${order.orderId}`,
      `Date: ${new Date(order.createdAt).toLocaleString()}`,
      `Customer: ${order.customer?.name}`,
      `Phone: ${order.customer?.phone}`,
      "",
      "ITEMS:",
      ...(order.items ?? []).map((i: any) => `  ${i.name} ×${i.quantity}  $${(i.price * i.quantity).toFixed(2)}`),
      "─────────────────────",
      `Subtotal: $${Number(order.subtotal ?? 0).toFixed(2)}`,
      isDelivery
        ? `Delivery: ${Number(order.deliveryFee) === 0 ? "FREE" : "$" + Number(order.deliveryFee).toFixed(2)}`
        : "Pickup: In-Store",
      Number(order.discount) > 0 ? `Discount: -$${Number(order.discount).toFixed(2)}` : "",
      `TOTAL: $${Number(order.total).toFixed(2)}`,
      "─────────────────────",
      isDelivery
        ? `Deliver to: ${order.delivery?.street}, ${order.delivery?.city}`
        : "Pay at store",
      "",
      "Thank you!",
    ].filter(l => l !== undefined);

    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    w.document.write(`<pre style="font-family:monospace;font-size:13px;padding:16px">${lines.join("\n")}</pre>`);
    w.document.close();
    w.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 380 }}
        className="bg-[#0d1210] border-t sm:border border-white/10 rounded-t-[2rem] sm:rounded-3xl w-full sm:max-w-md max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isDelivery ? "bg-orange-500/15 text-orange-400" : "bg-purple-500/15 text-purple-400"
            }`}>
              {isDelivery ? <Truck size={16} /> : <Store size={16} />}
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">{order.orderId}</p>
              <p className="text-white/30 text-[10px]">{elapsedLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printReceipt}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
              title="Print receipt"
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              title="Close"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Status flow */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {flow.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border ${
                  s === order.status
                    ? (STATUS_COLOR[s] ?? "bg-white/10 text-white border-white/20")
                    : i < idx
                      ? "bg-white/5 text-white/20 border-white/5 line-through"
                      : "bg-white/3 text-white/15 border-white/5"
                }`}>{STATUS_LABEL[s] ?? s}</span>
                {i < flow.length - 1 && <ChevronRight size={10} className="text-white/15 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Customer */}
          <div className="bg-[#111815] rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Customer</p>
            <p className="font-black text-base">{order.customer?.name}</p>
            <a href={`tel:${order.customer?.phone}`} className="flex items-center gap-2 text-brand-light-green text-sm font-medium hover:underline">
              <Phone size={13} /> {order.customer?.phone}
            </a>
            {isDelivery && (
              <div className="flex items-start gap-2 text-white/50 text-sm">
                <MapPin size={13} className="mt-0.5 flex-shrink-0 text-orange-400" />
                <span>{order.delivery?.street}, {order.delivery?.city} {order.delivery?.postal}</span>
              </div>
            )}
            {isDelivery && order.delivery?.slot && (
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <Clock size={12} />
                {order.delivery.slot === "asap" ? "ASAP (45–75 min)" : order.delivery.slot === "2h" ? "Today in 2h" : "Today in 4h"}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-[#111815] rounded-2xl p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">
              Items ({(order.items ?? []).length})
            </p>
            <div className="space-y-2.5">
              {(order.items ?? []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
                      <Package size={12} className="text-white/30" />
                    </div>
                    <span className="text-sm text-white/80 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-white/30 text-xs bg-white/5 px-2 py-0.5 rounded-lg">×{item.quantity}</span>
                    <span className="font-bold text-sm text-white w-16 text-right">
                      ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-[#111815] rounded-2xl p-4 space-y-2 text-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">Payment</p>
            <div className="flex justify-between text-white/50">
              <span>Subtotal</span><span>${Number(order.subtotal ?? 0).toFixed(2)}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between text-white/50">
                <span>Delivery</span>
                <span className={Number(order.deliveryFee) === 0 ? "text-brand-light-green font-bold" : ""}>
                  {Number(order.deliveryFee) === 0 ? "FREE" : `$${Number(order.deliveryFee).toFixed(2)}`}
                </span>
              </div>
            )}
            {Number(order.discount ?? 0) > 0 && (
              <div className="flex justify-between text-brand-light-green">
                <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                <span>−${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-white text-base pt-2 border-t border-white/5">
              <span>Total</span>
              <span className="text-brand-light-green text-lg">${Number(order.total).toFixed(2)}</span>
            </div>
            <p className="text-white/25 text-[10px] pt-1">
              {isDelivery ? "Pay on delivery" : "Pay at store"} · {order.customer?.paymentMethod === "pay_on_delivery" ? "Cash/Card at door" : "Cash/Card at counter"}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/5 space-y-3">
          {confirmCancel ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">
                <AlertTriangle size={15} />
                <span className="font-bold">Cancel this order?</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 font-black uppercase text-xs tracking-widest text-white/50 hover:bg-white/10 transition-all"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={() => act("cancelled")}
                  disabled={loading === "cancelled"}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 font-black uppercase text-xs tracking-widest text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading === "cancelled" ? <RefreshCw size={13} className="animate-spin" /> : <X size={13} />}
                  Confirm Cancel
                </button>
              </div>
            </div>
          ) : isFinal ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase text-xs tracking-widest text-white/50 hover:bg-white/10 transition-all"
            >
              Close
            </button>
          ) : (
            <div className="flex gap-2">
              {next && (
                <button
                  type="button"
                  disabled={!!loading}
                  onClick={() => act(next)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-light-green text-brand-green font-black uppercase text-[11px] tracking-widest hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-brand-light-green/10"
                >
                  {loading === next
                    ? <RefreshCw size={15} className="animate-spin" />
                    : <Check size={15} />}
                  {NEXT_LABEL[next] ?? next}
                </button>
              )}
              <button
                type="button"
                disabled={!!loading}
                onClick={() => setConfirmCancel(true)}
                className="px-4 py-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/20 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Order row (compact list item)
───────────────────────────────────────────────────────────── */
function OrderRow({ order, onOpen }: { order: any; onOpen: () => void }) {
  const isDelivery = order.delivery?.method === "delivery";
  const isNew = order.status === "confirmed";
  const statusCls = STATUS_COLOR[order.status] ?? "bg-white/10 text-white/50 border-white/10";
  const elapsed = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={onOpen}
      className={`w-full text-left bg-[#111815] border rounded-2xl p-4 hover:border-brand-light-green/30 hover:bg-[#151f14] transition-all active:scale-[0.99] ${
        isNew ? "border-brand-light-green/40 shadow-md shadow-brand-light-green/5" : "border-white/8"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isDelivery ? "bg-orange-500/15 text-orange-400" : "bg-purple-500/15 text-purple-400"
        }`}>
          {isDelivery ? <Truck size={17} /> : <Store size={17} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-black text-sm tracking-tight text-white">{order.orderId}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${statusCls}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
            {isNew && (
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inset-0 rounded-full bg-brand-light-green opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-brand-light-green" />
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs truncate">{order.customer?.name}</p>
          <p className="text-white/25 text-[10px] mt-0.5">
            {isDelivery ? order.delivery?.street : "In-store pickup"} · {elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ago`}
          </p>
        </div>

        <div className="text-right flex-shrink-0 ml-1 flex flex-col items-end gap-1.5">
          <p className="font-black text-base text-white">${Number(order.total ?? 0).toFixed(2)}</p>
          <div className="flex items-center gap-1 text-white/20 text-[10px]">
            <Eye size={11} />
            <span>View</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Stats bar
───────────────────────────────────────────────────────────── */
function StatsBar({ orders }: { orders: any[] }) {
  const today = useMemo(() => {
    const todayStr = new Date().toDateString();
    return orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  }, [orders]);

  const revenue  = today.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const active   = orders.filter(o => ACTIVE.has(o.status)).length;
  const pickups  = today.filter(o => o.delivery?.method === "pickup").length;
  const deliveries = today.filter(o => o.delivery?.method === "delivery").length;

  return (
    <div className="grid grid-cols-4 gap-2 px-4 pt-3">
      {[
        { label: "Today", value: today.length, icon: ShoppingBag, color: "text-white" },
        { label: "Active", value: active, icon: Clock, color: active > 0 ? "text-brand-light-green" : "text-white/40" },
        { label: "Revenue", value: `$${revenue.toFixed(0)}`, icon: DollarSign, color: "text-white" },
        { label: "Pickup", value: pickups, icon: Store, color: "text-purple-400" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="bg-[#111815] border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1">
          <Icon size={14} className={`${color} opacity-60`} />
          <p className={`font-black text-lg leading-none ${color}`}>{value}</p>
          <p className="text-white/25 text-[8px] font-black uppercase tracking-widest">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Till
───────────────────────────────────────────────────────────── */
export function Till() {
  const [authed, setAuthed]       = useState(() => sessionStorage.getItem("till_auth") === "1");
  const [orders, setOrders]       = useState<any[]>([]);
  const [fetching, setFetching]   = useState(false);
  const [lastSync, setLastSync]   = useState<Date | null>(null);
  const [soundOn, setSoundOn]     = useState(true);
  const [filter, setFilter]       = useState<"active" | "pickup" | "delivery" | "all">("active");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<any>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [clock, setClock]         = useState(() => new Date());
  const prevCountRef              = useRef(0);
  const initRef                   = useRef(false);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fetchOrders = async () => {
    setFetching(true);
    try {
      const data = await api.admin.getOrders();
      const sorted = (data.orders ?? []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
      setLastSync(new Date());
    } catch { /* network error */ }
    setFetching(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchOrders();
    const id = setInterval(fetchOrders, 12000);
    return () => clearInterval(id);
  }, [authed]);

  // New-order chime
  useEffect(() => {
    if (!initRef.current) {
      prevCountRef.current = orders.length;
      initRef.current = true;
      return;
    }
    if (orders.length > prevCountRef.current && soundOn) playChime();
    prevCountRef.current = orders.length;
  }, [orders.length, soundOn]);

  const handleAction = async (orderId: string, status: string) => {
    await api.admin.updateOrderStatus(orderId, status).catch(() => {});
    await fetchOrders();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("till_auth");
    setAuthed(false);
    setShowLogout(false);
    setOrders([]);
  };

  const filtered = useMemo(() => {
    let list = orders;
    if (filter === "active")   list = list.filter(o => ACTIVE.has(o.status));
    if (filter === "pickup")   list = list.filter(o => o.delivery?.method === "pickup");
    if (filter === "delivery") list = list.filter(o => o.delivery?.method === "delivery");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderId?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.delivery?.street?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  const activeCount = useMemo(() => orders.filter(o => ACTIVE.has(o.status)).length, [orders]);

  if (!authed) return <PinGate onUnlock={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-[#060b08] text-white flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#060b08]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <img src="/images/buds_n_buddies_logo.png" alt="Bud N' Buddies" className="h-7 object-contain flex-shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">Till</p>
              {activeCount > 0 && (
                <span className="flex items-center gap-1 bg-brand-light-green/15 border border-brand-light-green/30 text-brand-light-green text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inset-0 rounded-full bg-brand-light-green opacity-75" />
                    <span className="relative rounded-full h-1.5 w-1.5 bg-brand-light-green" />
                  </span>
                  {activeCount}
                </span>
              )}
            </div>
            <p className="text-white/30 text-[10px] tabular-nums">
              {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>

          {/* Sound */}
          <button
            type="button"
            onClick={() => setSoundOn(s => !s)}
            className={`p-2.5 rounded-xl border transition-all ${soundOn ? "bg-brand-light-green/10 border-brand-light-green/30 text-brand-light-green" : "bg-white/5 border-white/10 text-white/25"}`}
            title={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? <Bell size={15} /> : <BellOff size={15} />}
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchOrders}
            disabled={fetching}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
            title="Lock till"
          >
            <LogOut size={15} />
          </button>
        </div>

        {/* Last sync */}
        {lastSync && (
          <p className="text-center text-white/15 text-[9px] pb-1.5 tabular-nums">
            Last sync {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · auto-refreshes every 12s
          </p>
        )}
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <StatsBar orders={orders} />

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order ID, name, address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111815] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-light-green/40 transition-colors"
          />
          {search && (
            <button
              type="button"
              title="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ─────────────────────────────────────── */}
      <div className="px-4 pt-3 flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {(["active", "pickup", "delivery", "all"] as const).map(f => {
          const count = f === "active"   ? orders.filter(o => ACTIVE.has(o.status)).length
                      : f === "pickup"   ? orders.filter(o => o.delivery?.method === "pickup").length
                      : f === "delivery" ? orders.filter(o => o.delivery?.method === "delivery").length
                      : orders.length;
          const labels = { active: "Active", pickup: "Pickup", delivery: "Delivery", all: "All" };
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                filter === f
                  ? "bg-brand-light-green text-brand-green border-brand-light-green"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}
            >
              {labels[f]} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* ── Order list ──────────────────────────────────────── */}
      <div className="flex-1 px-4 py-3 space-y-2.5 pb-8">
        {fetching && filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-white/20">
            <RefreshCw size={26} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-3">
            <ShoppingBag size={32} className="opacity-30" />
            <p className="text-sm font-medium">
              {search ? "No orders matching search" : filter === "active" ? "No active orders" : "No orders"}
            </p>
            {search && (
              <button type="button" onClick={() => setSearch("")}
                className="text-brand-light-green text-xs font-black uppercase tracking-widest hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(order => (
              <OrderRow key={order.orderId} order={order} onOpen={() => setSelected(order)} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ── Order detail modal ──────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <OrderModal
            order={selected}
            onClose={() => setSelected(null)}
            onAction={async (id, status) => {
              await handleAction(id, status);
              // Update selected order in-place
              setSelected((prev: any) => prev ? { ...prev, status } : null);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Logout confirm ──────────────────────────────────── */}
      <AnimatePresence>
        {showLogout && (
          <LogoutOverlay onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

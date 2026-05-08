import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Truck, ArrowRight, Loader2, Store, Check, MapPin, Tag, X, ChevronLeft,
} from "lucide-react";

type CheckoutStep = "details" | "confirm";
type DeliverySlot = "asap" | "2h" | "4h";

const DELIVERY_SLOTS: { value: DeliverySlot; label: string; sub: string }[] = [
  { value: "asap", label: "ASAP",        sub: "Est. 45–75 min" },
  { value: "2h",   label: "2 Hours",     sub: "Scheduled window" },
  { value: "4h",   label: "4 Hours",     sub: "Scheduled window" },
];

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "BNB-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const inputCls =
  "w-full bg-white rounded-2xl px-5 py-4 text-sm font-medium text-brand-dark border border-brand-green/10 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/40 transition-all placeholder:text-brand-dark/30";

export function Checkout() {
  const {
    cart, subtotal, deliveryFee, deliveryFeeOverride, setDeliveryFeeOverride,
    discount, totalPrice, appliedPromo, removePromo, promoCode, setPromoCode,
    applyPromo, clearCart, deliveryMethod, setDeliveryMethod, deliverySlot, setDeliverySlot,
  } = useCart();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);

  const [step, setStep]             = useState<CheckoutStep>("details");
  const [loading, setLoading]       = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeQuote, setFeeQuote]     = useState<{ km: number | null; label: string; zone: string } | null>(null);
  const [outsideZone, setOutsideZone]   = useState(false);
  const [addrError, setAddrError]       = useState<string | null>(null);
  const quoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    street: "", city: "Sherwood Park", postal: "",
    ageConfirm: false,
  });

  const set = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const scrollTop = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);

  const goToStep = (s: CheckoutStep) => { setStep(s); scrollTop(); };

  // ── Delivery fee quote (debounced 700ms) ────────────────────────────────
  useEffect(() => {
    if (deliveryMethod !== "delivery") {
      setDeliveryFeeOverride(null); setFeeQuote(null); setOutsideZone(false); setAddrError(null);
      return;
    }
    if (!form.street.trim() || !form.postal.trim()) {
      setDeliveryFeeOverride(null); setFeeQuote(null); setAddrError(null); setOutsideZone(false);
      return;
    }
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(async () => {
      setFeeLoading(true);
      setAddrError(null);
      setOutsideZone(false);
      try {
        const res = await fetch("/api/delivery/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ street: form.street, city: form.city, postal: form.postal, orderTotal: subtotal }),
        });
        const data = await res.json();
        if (data.zone === "unavailable") {
          setOutsideZone(true);
          setDeliveryFeeOverride(null);
          setFeeQuote(null);
        } else if (data.fee === null || data.zone === "unknown" || data.zone === "failed") {
          setAddrError("We couldn't find this address. Double-check your street and postal code.");
          setDeliveryFeeOverride(null);
          setFeeQuote(null);
        } else {
          setOutsideZone(false);
          setAddrError(null);
          setDeliveryFeeOverride(data.fee);
          setFeeQuote({ km: data.km, label: data.label, zone: data.zone });
        }
      } catch {
        setAddrError("Could not calculate delivery fee. Please try again.");
        setDeliveryFeeOverride(null);
      }
      setFeeLoading(false);
    }, 700);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.street, form.postal, form.city, deliveryMethod, subtotal]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateDetails = (): boolean => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toastError("Please fill in your name, email, and phone."); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toastError("Enter a valid email address."); return false;
    }
    if (deliveryMethod === "delivery") {
      if (!form.street.trim() || !form.postal.trim()) {
        toastError("Please fill in your delivery address."); return false;
      }
      if (feeLoading) {
        toastError("Please wait — calculating your delivery fee."); return false;
      }
      if (outsideZone) {
        toastError("Your address is outside our delivery zone."); return false;
      }
      if (addrError) {
        toastError("Please fix your address before continuing."); return false;
      }
    }
    return true;
  };

  // ── Promo ────────────────────────────────────────────────────────────────
  const handleApplyPromo = async () => {
    setPromoLoading(true);
    const result = await applyPromo();
    setPromoLoading(false);
    if (result.ok) success(result.message);
    else toastError(result.message);
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!form.ageConfirm) { toastError("Please confirm you are 19+ with valid ID."); return; }
    setLoading(true);
    const orderId = generateOrderId();
    try {
      const paymentMethod = deliveryMethod === "delivery" ? "pay_on_delivery" : "pay_at_store";
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customer: { name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() },
          delivery: deliveryMethod === "delivery"
            ? { method: "delivery", street: form.street.trim(), city: form.city.trim(), postal: form.postal.trim(), slot: deliverySlot }
            : { method: "pickup" },
          items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, category: i.category, image: i.image })),
          subtotal,
          deliveryFee,
          discount,
          total: totalPrice,
          promoCode: appliedPromo?.code ?? null,
          paymentMethod,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toastError(err.error ?? "Order failed. Please call (825) 218-8234.");
        setLoading(false); return;
      }
      clearCart();
      navigate(`/order/${orderId}`);
    } catch {
      toastError("Network error. Please call (825) 218-8234.");
      setLoading(false);
    }
  };

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="pt-32 pb-20 px-4 bg-brand-earth min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-[32px] bg-brand-green/10 flex items-center justify-center mb-6 border border-brand-green/10">
          <svg className="w-10 h-10 text-brand-green/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand-green mb-3">Your cart is empty</h1>
        <p className="text-brand-dark/50 mb-8 font-medium">Add some products first.</p>
        <Link to="/shop" className="bg-brand-green text-brand-earth px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl text-sm">
          Browse Menu
        </Link>
      </div>
    );
  }

  // ── Derived display values ────────────────────────────────────────────────
  const feeDisplay = deliveryMethod === "pickup"
    ? "Free"
    : feeLoading
    ? "Calculating…"
    : deliveryFee === 0
    ? "FREE"
    : `$${deliveryFee.toFixed(2)}`;

  const canContinue = !feeLoading && !outsideZone && !addrError;

  return (
    <div ref={topRef} className="pt-20 sm:pt-28 pb-16 bg-[#f5f0e8] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-green/40 mb-2">Bud n' Buddies</p>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-brand-green leading-none">Checkout</h1>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-3 mb-8">
          {(["details", "confirm"] as CheckoutStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                step === s
                  ? "bg-brand-green text-brand-earth border-brand-green"
                  : i < ["details","confirm"].indexOf(step)
                  ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                  : "bg-white/60 border-brand-green/10 text-brand-dark/30"
              }`}>
                {i < ["details","confirm"].indexOf(step) ? <Check size={11} strokeWidth={3} /> : <span className="w-3.5 h-3.5 flex items-center justify-center">{i+1}</span>}
                {s}
              </div>
              {i < 1 && <div className="w-6 h-px bg-brand-green/15" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── Left column: form ── */}
          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div key="details"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Contact */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-brand-green/5">
                  <h2 className="text-xs font-black uppercase tracking-[0.35em] text-brand-green/50 mb-5">Contact</h2>
                  <input type="text" placeholder="Full Name *" value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
                  <input type="email" placeholder="Email Address *" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} />
                  <input type="tel" placeholder="Phone Number *" value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} />
                </div>

                {/* Method */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-green/5">
                  <h2 className="text-xs font-black uppercase tracking-[0.35em] text-brand-green/50 mb-5">Fulfillment</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {(["pickup", "delivery"] as const).map(m => (
                      <button key={m} type="button" onClick={() => setDeliveryMethod(m)}
                        className={`p-5 rounded-2xl border-2 transition-all text-left ${
                          deliveryMethod === m
                            ? "bg-brand-green/8 border-brand-green"
                            : "border-brand-green/10 hover:border-brand-green/30 bg-[#f5f0e8]/50"
                        }`}>
                        <div className="flex items-center gap-2.5 mb-2">
                          {m === "pickup" ? <Store size={18} className="text-brand-green" /> : <Truck size={18} className="text-brand-green" />}
                          <span className="font-black uppercase text-[11px] tracking-widest text-brand-green">
                            {m === "pickup" ? "Pickup" : "Delivery"}
                          </span>
                        </div>
                        <p className="text-[10px] text-brand-dark/40 font-medium leading-tight">
                          {m === "pickup" ? "Free · Ready in ~30 min" : "To your door · from $5.49"}
                        </p>
                        {deliveryMethod === m && (
                          <div className="mt-3 flex items-center gap-1.5 text-brand-green">
                            <Check size={11} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Selected</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery address */}
                {deliveryMethod === "delivery" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm border border-brand-green/5"
                  >
                    <h2 className="text-xs font-black uppercase tracking-[0.35em] text-brand-green/50">Delivery Address</h2>
                    <input type="text" placeholder="Street Address *" value={form.street} onChange={e => set("street", e.target.value)} className={inputCls} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} className={inputCls} />
                      <input type="text" placeholder="Postal Code *" value={form.postal} onChange={e => set("postal", e.target.value.toUpperCase())} className={inputCls} />
                    </div>

                    {/* Fee feedback */}
                    <AnimatePresence mode="wait">
                      {feeLoading && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-3 text-xs text-brand-dark/50 bg-brand-green/5 border border-brand-green/10 rounded-2xl px-4 py-3">
                          <Loader2 size={14} className="animate-spin text-brand-green shrink-0" />
                          Calculating delivery fee…
                        </motion.div>
                      )}
                      {!feeLoading && outsideZone && (
                        <motion.div key="outside" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
                          ⚠️ Outside our 25 km delivery zone. Please choose <strong>Pickup</strong> or call <strong>(825) 218-8234</strong>.
                        </motion.div>
                      )}
                      {!feeLoading && addrError && (
                        <motion.div key="addr-error" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 font-medium">
                          📍 {addrError}
                        </motion.div>
                      )}
                      {!feeLoading && feeQuote && !outsideZone && !addrError && (
                        <motion.div key="fee" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="bg-brand-green/5 border border-brand-green/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-brand-dark/60">
                            <MapPin size={14} className="text-brand-green shrink-0" />
                            <span className="font-medium">{feeQuote.km !== null ? `${feeQuote.km} km away` : "Address found"}</span>
                            {feeQuote.label && <span className="text-brand-dark/30">· {feeQuote.label}</span>}
                          </div>
                          <span className={`font-black text-base shrink-0 ${deliveryFee === 0 ? "text-brand-green" : "text-brand-dark"}`}>
                            {deliveryFee === 0 ? "FREE 🎉" : `$${deliveryFee.toFixed(2)}`}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Delivery slot */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green/40 mb-3">Delivery Window</p>
                      <div className="grid grid-cols-3 gap-2">
                        {DELIVERY_SLOTS.map(slot => (
                          <button key={slot.value} type="button" onClick={() => setDeliverySlot(slot.value)}
                            className={`p-3 rounded-2xl border-2 text-center transition-all ${
                              deliverySlot === slot.value
                                ? "bg-brand-green text-brand-earth border-brand-green shadow-md"
                                : "border-brand-green/10 text-brand-dark hover:border-brand-green/30 bg-[#f5f0e8]/50"
                            }`}>
                            <p className="text-[10px] font-black uppercase">{slot.label}</p>
                            <p className="text-[8px] opacity-60 mt-0.5 leading-tight">{slot.sub}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <button type="button" disabled={!canContinue}
                  onClick={() => { if (validateDetails()) goToStep("confirm"); }}
                  className="w-full bg-brand-green text-brand-earth py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand-green/20">
                  {feeLoading ? <><Loader2 size={18} className="animate-spin" /> Calculating…</> : <>Continue <ArrowRight size={18} /></>}
                </button>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div key="confirm"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Review details */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-green/5 space-y-5">
                  <h2 className="text-xs font-black uppercase tracking-[0.35em] text-brand-green/50">Review Your Order</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-dark/30 mb-1.5">Contact</p>
                      <p className="font-bold text-brand-dark">{form.name}</p>
                      <p className="text-sm text-brand-dark/50">{form.email}</p>
                      <p className="text-sm text-brand-dark/50">{form.phone}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-brand-dark/30 mb-1.5">
                        {deliveryMethod === "delivery" ? "Delivery To" : "Pickup At"}
                      </p>
                      {deliveryMethod === "delivery" ? (
                        <>
                          <p className="font-bold text-brand-dark">{form.street}</p>
                          <p className="text-sm text-brand-dark/50">{form.city}, {form.postal}</p>
                          <p className="text-sm text-brand-dark/40 mt-1">{DELIVERY_SLOTS.find(s => s.value === deliverySlot)?.label} · {DELIVERY_SLOTS.find(s => s.value === deliverySlot)?.sub}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-brand-dark">Buds N' Buddies</p>
                          <p className="text-sm text-brand-dark/50">Salisbury Way, Sherwood Park</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-brand-green/5 border border-brand-green/15 rounded-2xl p-4 flex items-center gap-3">
                    {deliveryMethod === "pickup" ? <Store size={20} className="text-brand-green shrink-0" /> : <Truck size={20} className="text-brand-green shrink-0" />}
                    <div>
                      <p className="font-black text-sm text-brand-green uppercase tracking-tight">
                        {deliveryMethod === "pickup" ? "Pay at Store" : "Pay on Delivery"}
                      </p>
                      <p className="text-xs text-brand-dark/40 mt-0.5">Cash or card accepted</p>
                    </div>
                  </div>
                </div>

                {/* Age confirm */}
                <label className="bg-white rounded-3xl p-5 shadow-sm border border-brand-green/5 flex items-start gap-4 cursor-pointer hover:border-brand-green/20 transition-colors">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    form.ageConfirm ? "bg-brand-green border-brand-green" : "border-brand-green/20 bg-white"
                  }`} onClick={() => set("ageConfirm", !form.ageConfirm)}>
                    {form.ageConfirm && <Check size={13} className="text-brand-earth" strokeWidth={3} />}
                  </div>
                  <div onClick={() => set("ageConfirm", !form.ageConfirm)}>
                    <p className="font-black text-brand-green text-sm">I am 19 years of age or older</p>
                    <p className="text-xs text-brand-dark/40 mt-1 leading-relaxed">I have a valid government-issued ID and confirm I am legally permitted to purchase cannabis in Alberta.</p>
                  </div>
                </label>

                {/* Actions */}
                <div className="flex gap-3">
                  <button type="button" onClick={() => goToStep("details")}
                    className="flex items-center gap-2 px-6 py-4 bg-white border border-brand-green/10 rounded-2xl font-black uppercase tracking-widest text-[11px] text-brand-dark hover:border-brand-green/30 transition-all">
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button type="button" onClick={handlePlaceOrder} disabled={loading || !form.ageConfirm}
                    className="flex-1 bg-brand-green text-brand-earth py-4 rounded-2xl font-black uppercase tracking-[0.25em] text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xl shadow-brand-green/20">
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Processing…</> : <><Check size={18} /> Place Order</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Right column: order summary (sticky) ── */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-green/5">
              <h2 className="text-xs font-black uppercase tracking-[0.35em] text-brand-green/50 mb-5">
                Your Order · {cart.reduce((t, i) => t + i.quantity, 0)} items
              </h2>

              {/* Items */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1 mb-5">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f5f0e8] shrink-0 overflow-hidden p-1">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain"
                        onError={e => (e.currentTarget.style.display = "none")} loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-brand-dark line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-brand-dark/30 font-black uppercase tracking-wider">×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-black text-brand-dark shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Promo input */}
              {!appliedPromo ? (
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Tag size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-green/30" />
                    <input type="text" placeholder="Promo code" value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                      className="w-full bg-[#f5f0e8] border border-brand-green/10 rounded-2xl pl-9 pr-3 py-3 text-[11px] font-black uppercase tracking-wider focus:outline-none focus:border-brand-green/30 transition-all placeholder:text-brand-dark/20 placeholder:normal-case placeholder:tracking-normal placeholder:font-medium" />
                  </div>
                  <button type="button" onClick={handleApplyPromo} disabled={promoLoading || !promoCode.trim()}
                    className="bg-brand-green text-brand-earth px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-30 transition-all">
                    {promoLoading ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-brand-green/8 border border-brand-green/20 rounded-2xl px-4 py-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-brand-green" />
                    <div>
                      <p className="text-[10px] font-black text-brand-green uppercase tracking-wider">{appliedPromo.code}</p>
                      <p className="text-[9px] text-brand-green/60 font-bold">
                        {appliedPromo.type === "percent" ? `${appliedPromo.discount}%` : `$${appliedPromo.discount.toFixed(2)}`} off
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={removePromo} title="Remove promo" className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-brand-green/10 text-brand-green/60 hover:text-brand-green transition-all">
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2 text-sm border-t border-brand-green/8 pt-4">
                <div className="flex justify-between text-brand-dark/50">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-dark">${subtotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="flex justify-between text-brand-dark/50">
                    <span>Delivery</span>
                    <span className={`font-bold ${deliveryFee === 0 && !feeLoading ? "text-brand-green" : "text-brand-dark"}`}>
                      {feeDisplay}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="flex justify-between text-brand-green font-bold">
                    <span>Promo ({appliedPromo?.code})</span>
                    <span>−${discount.toFixed(2)}</span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-green/8">
                <span className="font-black text-brand-dark uppercase tracking-tight text-sm">Total</span>
                <span className="text-3xl font-black text-brand-green tracking-tighter">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Savings badge */}
              {(discount > 0 || (subtotal >= 75 && deliveryMethod === "delivery")) && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 flex items-center justify-between bg-brand-green/8 rounded-2xl px-4 py-2.5 border border-brand-green/15">
                  <span className="text-[10px] font-black text-brand-green uppercase tracking-widest">You saved</span>
                  <span className="font-black text-brand-green text-sm">
                    ${(discount + (subtotal >= 75 && deliveryMethod === "delivery" ? 5.49 : 0)).toFixed(2)}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "🔒", label: "Secure" },
                { icon: "✅", label: "19+ Only" },
                { icon: "🌿", label: "Licensed" },
              ].map(b => (
                <div key={b.label} className="bg-white/60 rounded-2xl p-3 text-center border border-brand-green/5">
                  <span className="text-lg">{b.icon}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-dark/40 mt-1">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

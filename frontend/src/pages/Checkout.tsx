import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  Trash2, Plus, Minus, CreditCard, Truck, ShieldCheck,
  ArrowRight, Loader2, Package, Store, Clock,
  MapPin, Phone, Tag, X, Check, AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

type CheckoutStep = "details" | "payment" | "confirm";
type DeliveryMethod = "delivery" | "pickup";
type DeliverySlot = "asap" | "2h" | "4h";

const DELIVERY_SLOTS: { value: DeliverySlot; label: string; sub: string }[] = [
  { value: "asap", label: "ASAP", sub: "Est. 45–75 min" },
  { value: "2h", label: "Today in 2h", sub: "Scheduled window" },
  { value: "4h", label: "Today in 4h", sub: "Scheduled window" },
];

function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "BNB-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

const inp = "w-full bg-brand-earth/60 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10 focus:border-brand-green transition-colors";
const lbl = "text-[10px] font-black uppercase tracking-widest text-brand-dark/70 ml-1";

export function Checkout() {
  const { cart, removeFromCart, updateQuantity, subtotal, deliveryFee, discount, totalPrice,
    appliedPromo, removePromo, promoCode, setPromoCode, applyPromo, clearCart,
    deliveryMethod, setDeliveryMethod, deliverySlot, setDeliverySlot } = useCart();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>("details");
  const [loading, setLoading] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    street: "", city: "Sherwood Park", postal: "",
    card: "", expiry: "", cvc: "",
    ageConfirm: false,
  });

  const set = (key: keyof typeof form, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleApplyPromo = async () => {
    setPromoLoading(true);
    const result = await applyPromo();
    setPromoLoading(false);
    if (result.ok) success(result.message);
    else toastError(result.message);
  };

  const validateDetails = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toastError("Please fill in your name, email, and phone."); return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toastError("Enter a valid email address."); return false;
    }
    if (deliveryMethod === "delivery" && (!form.street.trim() || !form.postal.trim())) {
      toastError("Please fill in your delivery address."); return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!form.card.trim() || !form.expiry.trim() || !form.cvc.trim()) {
      toastError("Please fill in your payment details."); return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!form.ageConfirm) {
      toastError("You must confirm you are 19+ with valid ID to proceed."); return;
    }
    setLoading(true);
    const orderId = generateOrderId();

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customer: {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
          },
          delivery: deliveryMethod === "delivery"
            ? { method: "delivery", street: form.street.trim(), city: form.city.trim(), postal: form.postal.trim(), slot: deliverySlot }
            : { method: "pickup" },
          items: cart.map((item) => ({
            id: item.id, name: item.name, price: item.price,
            quantity: item.quantity, category: item.category, image: item.image,
          })),
          subtotal,
          deliveryFee,
          discount,
          total: totalPrice,
          promoCode: appliedPromo?.code ?? null,
          paymentMethod: deliveryMethod === "delivery" ? "pay_at_door" : "credit_card",
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

  if (cart.length === 0 && step !== "confirm") {
    return (
      <div className="pt-28 sm:pt-40 pb-16 px-4 bg-brand-earth min-h-screen flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand-green mb-6">Your cart is empty</h1>
        <Link to="/shop" className="bg-brand-green text-brand-earth px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 sm:pt-32 pb-16 md:pb-24 bg-brand-earth min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-brand-green mb-8 md:mb-12">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {(["details", "payment", "confirm"] as CheckoutStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                step === s ? "bg-brand-green text-brand-earth" :
                (["details","payment","confirm"].indexOf(step) > i) ? "bg-brand-green/20 text-brand-green" :
                "bg-brand-green/8 text-brand-dark/25"
              }`}>
                {(["details","payment","confirm"].indexOf(step) > i) ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${step === s ? "text-brand-green" : "text-brand-dark/70"}`}>
                {s}
              </span>
              {i < 2 && <div className="w-8 h-px bg-brand-green/15 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">

              {/* STEP 1: Details */}
              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="space-y-6"
                >
                  {/* Contact */}
                  <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-brand-green/5 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green shrink-0">
                        <Phone size={16} />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-tight">Contact Info</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className={lbl}>Full Name *</label>
                        <input type="text" placeholder="John Doe" value={form.name}
                          onChange={e => set("name", e.target.value)} className={inp} />
                      </div>
                      <div className="space-y-2">
                        <label className={lbl}>Phone *</label>
                        <input type="tel" placeholder="(825) 555-0100" value={form.phone}
                          onChange={e => set("phone", e.target.value)} className={inp} />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <label className={lbl}>Email *</label>
                        <input type="email" placeholder="john@example.com" value={form.email}
                          onChange={e => set("email", e.target.value)} className={inp} />
                      </div>
                    </div>
                  </div>

                  {/* Delivery method */}
                  <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-brand-green/5 shadow-xl">
                    <h2 className="text-xl font-black uppercase tracking-tight mb-6">How would you like it?</h2>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {([
                        { value: "delivery" as const, icon: Truck, label: "Local Delivery", sub: "To your door" },
                        { value: "pickup" as const, icon: Store, label: "In-Store Pickup", sub: "130-75 Salisbury Way" },
                      ]).map(({ value, icon: Icon, label, sub }) => (
                        <button key={value} type="button"
                          onClick={() => setDeliveryMethod(value)}
                          className={`flex flex-col items-start gap-2 p-5 rounded-2xl border-2 transition-all text-left ${
                            deliveryMethod === value ? "border-brand-green bg-brand-green/5" : "border-brand-green/10 hover:border-brand-green/30"
                          }`}
                        >
                          <Icon size={20} className={deliveryMethod === value ? "text-brand-green" : "text-brand-dark/40"} />
                          <span className={`text-sm font-black uppercase tracking-tight ${deliveryMethod === value ? "text-brand-green" : "text-brand-dark/60"}`}>{label}</span>
                          <span className="text-[11px] text-brand-dark/40 font-medium">{sub}</span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {deliveryMethod === "delivery" ? (
                        <motion.div key="delivery-fields" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={14} className="text-brand-green" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-brand-dark/40">Delivery Address</span>
                          </div>
                          <div className="space-y-2">
                            <label className={lbl}>Street Address *</label>
                            <input type="text" placeholder="123 Main Street" value={form.street}
                              onChange={e => set("street", e.target.value)} className={inp} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className={lbl}>City</label>
                              <input type="text" value={form.city} aria-label="City"
                                onChange={e => set("city", e.target.value)} className={inp} />
                            </div>
                            <div className="space-y-2">
                              <label className={lbl}>Postal Code *</label>
                              <input type="text" placeholder="T8A 0A1" value={form.postal}
                                onChange={e => set("postal", e.target.value.toUpperCase())} className={inp} />
                            </div>
                          </div>
                          <div className="pt-2">
                            <div className="flex items-center gap-2 mb-3">
                              <Clock size={14} className="text-brand-green" />
                              <span className="text-[11px] font-black uppercase tracking-widest text-brand-dark/40">Delivery Window</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {DELIVERY_SLOTS.map(slot => (
                                <button key={slot.value} type="button"
                                  onClick={() => setDeliverySlot(slot.value as DeliverySlot)}
                                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                                    deliverySlot === slot.value ? "border-brand-green bg-brand-green/5" : "border-brand-green/10 hover:border-brand-green/30"
                                  }`}
                                >
                                  <p className={`text-xs font-black uppercase tracking-tight ${deliverySlot === slot.value ? "text-brand-green" : "text-brand-dark/60"}`}>{slot.label}</p>
                                  <p className="text-[10px] text-brand-dark/40 font-medium mt-0.5">{slot.sub}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="pickup-info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="bg-brand-earth/40 rounded-2xl p-5 flex gap-4 items-start">
                          <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center shrink-0">
                            <Store size={16} className="text-brand-green" />
                          </div>
                          <div>
                            <p className="font-black text-brand-dark text-sm uppercase tracking-tight mb-1">Bud N' Buddies Sherwood Park</p>
                            <p className="text-brand-dark/60 text-sm font-medium">130-75 Salisbury Way, Sherwood Park, AB</p>
                            <p className="text-brand-dark/40 text-[11px] font-bold uppercase tracking-wider mt-2">Open Every Day · Until 2AM</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button type="button"
                    onClick={() => { 
                      if (validateDetails()) {
                        if (deliveryMethod === "delivery") setStep("confirm");
                        else setStep("payment");
                      } 
                    }}
                    className="w-full bg-brand-green text-brand-earth py-4 rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {deliveryMethod === "delivery" ? "Review Order" : "Continue to Payment"} <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Payment (Only for Pickup or if requested) */}
              {step === "payment" && deliveryMethod !== "delivery" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-brand-green/5 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green shrink-0">
                        <CreditCard size={16} />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-tight">Payment</h2>
                    </div>
                    <div className="grid gap-4">
                      <div className="sm:col-span-2 space-y-2">
                        <label className={lbl}>Card Number *</label>
                        <input type="text" placeholder="**** **** **** ****" value={form.card}
                          onChange={e => set("card", e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                          maxLength={19} className={inp} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={lbl}>Expiry *</label>
                          <input type="text" placeholder="MM/YY" value={form.expiry}
                            onChange={e => set("expiry", e.target.value)} maxLength={5} className={inp} />
                        </div>
                        <div className="space-y-2">
                          <label className={lbl}>CVC *</label>
                          <input type="text" placeholder="***" value={form.cvc}
                            onChange={e => set("cvc", e.target.value.replace(/\D/g, ""))} maxLength={4} className={inp} />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-brand-dark/30 font-bold uppercase tracking-widest mt-4 flex items-center gap-1.5">
                      <ShieldCheck size={11} /> Secured by 256-bit SSL encryption
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep("details")}
                      className="px-6 py-4 rounded-full border-2 border-brand-green/15 font-black uppercase tracking-widest text-sm text-brand-dark/50 hover:border-brand-green/30 transition-colors">
                      Back
                    </button>
                    <button type="button"
                      onClick={() => { if (validatePayment()) setStep("confirm"); }}
                      className="flex-1 bg-brand-green text-brand-earth py-4 rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      Review Order <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Confirm */}
              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="space-y-6"
                >
                  {/* Summary recap */}
                  <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-brand-green/5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                       <h2 className="font-black uppercase tracking-tight text-xl text-brand-green">Review Your Order</h2>
                       {deliveryMethod === "delivery" && (
                         <div className="bg-brand-green/10 text-brand-green px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                           Pay at Delivery
                         </div>
                       )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={lbl + " mb-1"}>Name</p>
                        <p className="font-bold">{form.name}</p>
                      </div>
                      <div>
                        <p className={lbl + " mb-1"}>Phone</p>
                        <p className="font-bold">{form.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className={lbl + " mb-1"}>Email</p>
                        <p className="font-bold">{form.email}</p>
                      </div>
                      <div className="col-span-2">
                        <p className={lbl + " mb-1"}>Delivery</p>
                        <p className="font-bold">{deliveryMethod === "delivery"
                          ? `${form.street}, ${form.city} ${form.postal}`
                          : "In-Store Pickup — 130-75 Salisbury Way"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Age confirmation */}
                  <div className={`bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border-2 transition-colors shadow-xl ${form.ageConfirm ? "border-brand-green" : "border-amber-300"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 transition-colors cursor-pointer ${form.ageConfirm ? "bg-brand-green border-brand-green" : "border-amber-400"}`}
                        onClick={() => set("ageConfirm", !form.ageConfirm)}>
                        {form.ageConfirm && <Check size={12} className="text-white" />}
                      </div>
                      <div onClick={() => set("ageConfirm", !form.ageConfirm)} className="cursor-pointer">
                        <p className="font-black text-sm text-brand-dark uppercase tracking-tight">I confirm I am 19 years or older</p>
                        <p className="text-xs text-brand-dark/50 font-medium mt-1">
                          I have valid government-issued photo ID. I understand cannabis products are for 19+ adults only in Alberta. Delivery requires ID verification at the door.
                        </p>
                      </div>
                    </div>
                    {!form.ageConfirm && (
                      <div className="flex items-center gap-2 mt-4 text-amber-600">
                        <AlertTriangle size={13} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Required before placing your order</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(deliveryMethod === "delivery" ? "details" : "payment")}
                      className="px-6 py-4 rounded-full border-2 border-brand-green/15 font-black uppercase tracking-widest text-sm text-brand-dark/50 hover:border-brand-green/30 transition-colors">
                      Back
                    </button>
                    <button type="button"
                      onClick={handlePlaceOrder}
                      disabled={loading || !form.ageConfirm}
                      className="flex-1 bg-brand-green text-brand-earth py-4 rounded-full font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                    >
                      {loading ? <><Loader2 size={16} className="animate-spin" />Processing…</> : <>Place Order <ArrowRight size={16} /></>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-brand-green rounded-[28px] sm:rounded-[40px] p-6 sm:p-10 text-brand-earth lg:sticky lg:top-28 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 relative z-10">Order Summary</h2>

              {/* Cart items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-1 relative z-10">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    {item.image && (
                      <div className="w-14 h-14 bg-white rounded-xl p-1.5 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-black uppercase tracking-tight text-sm truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center bg-white/10 rounded-full p-0.5">
                          <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                            <Minus size={9} />
                          </button>
                          <span className="w-5 text-center text-[11px] font-black">{item.quantity}</span>
                          <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
                            <Plus size={9} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                      <button type="button" aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.id)} className="text-brand-earth/30 hover:text-red-300 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo */}
              <div className="mb-4 relative z-10">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag size={12} />
                      <span className="text-xs font-black uppercase tracking-widest">{appliedPromo.code}</span>
                      <span className="text-[10px] text-brand-earth/60 font-bold">
                        {appliedPromo.type === "percent" ? `${appliedPromo.discount}%` : `$${appliedPromo.discount}`} off
                      </span>
                    </div>
                    <button type="button" aria-label="Remove promo code" onClick={removePromo} className="text-brand-earth/40 hover:text-red-300 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && handleApplyPromo()}
                      className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-white/30 placeholder:normal-case placeholder:font-medium placeholder:tracking-normal placeholder:text-brand-earth/30"
                    />
                    <button type="button" onClick={handleApplyPromo} disabled={!promoCode || promoLoading}
                      className="bg-brand-earth text-brand-green px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40">
                      {promoLoading ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-white/10 relative z-10">
                <div className="flex justify-between text-brand-earth/60 font-bold text-xs uppercase tracking-widest">
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-earth/60 font-bold text-xs uppercase tracking-widest">
                  <span>{deliveryMethod === "delivery" ? "Delivery" : "Pickup"}</span>
                  <span className={deliveryFee === 0 ? "text-brand-light-green" : ""}>{deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-brand-light-green font-bold text-xs uppercase tracking-widest">
                    <span>Discount</span><span>−${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black uppercase tracking-tighter pt-3 border-t border-white/10">
                  <span>Total</span><span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-brand-earth/40 relative z-10">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Discreet</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">19+ ID Required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

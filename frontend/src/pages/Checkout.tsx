import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  Trash2, Plus, Minus, Truck, ShieldCheck,
  ArrowRight, Loader2, Package, Store, MapPin, Phone, Tag, X, Check, AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";

type CheckoutStep = "details" | "confirm";
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

  const handlePlaceOrder = async () => {
    if (!form.ageConfirm) {
      toastError("You must confirm you are 19+ with valid ID to proceed."); return;
    }
    setLoading(true);
    const orderId = generateOrderId();

    try {
      const paymentMethod = deliveryMethod === "delivery" ? "pay_on_delivery" : "pay_at_store";

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
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toastError(err.error ?? "Order failed. Please call (780) 123-4567.");
        setLoading(false); return;
      }

      clearCart();
      navigate(`/order/${orderId}`);
    } catch {
      toastError("Network error. Please call (780) 123-4567.");
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
          {(["details", "confirm"] as CheckoutStep[]).map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2 flex-1 sm:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                step === s || (s === "details") ? "bg-brand-green text-brand-earth" : "bg-brand-green/20 text-brand-green/40"
              }`}>
                {i + 1}
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-brand-dark/50 hidden sm:inline">{s}</span>
              {i < arr.length - 1 && <div className="hidden sm:block h-px w-6 sm:w-12 bg-brand-green/20" />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {step === "details" && (
                <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="space-y-6">
                    {/* Contact */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-brand-green mb-4">Contact Details</h2>
                      <div className="space-y-3">
                        <input type="text" placeholder="Full Name" value={form.name} onChange={e => set("name", e.target.value)} className="w-full bg-brand-earth/60 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10 focus:border-brand-green transition-colors" />
                        <input type="email" placeholder="Email Address" value={form.email} onChange={e => set("email", e.target.value)} className="w-full bg-brand-earth/60 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10 focus:border-brand-green transition-colors" />
                        <input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => set("phone", e.target.value)} className="w-full bg-brand-earth/60 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10 focus:border-brand-green transition-colors" />
                      </div>
                    </div>

                    {/* Delivery Method */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-brand-green mb-4">Delivery Method</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("pickup")}
                          className={`p-6 rounded-2xl border-2 transition-all text-center ${
                            deliveryMethod === "pickup"
                              ? "bg-brand-green/10 border-brand-green"
                              : "bg-white border-brand-green/10 hover:border-brand-green/30"
                          }`}
                        >
                          <Store size={24} className="mx-auto mb-2 text-brand-green" />
                          <p className="font-black uppercase text-[11px] text-brand-green">In-Store Pickup</p>
                          <p className="text-[9px] text-brand-dark/50 mt-1">Pick up at our store</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryMethod("delivery")}
                          className={`p-6 rounded-2xl border-2 transition-all text-center ${
                            deliveryMethod === "delivery"
                              ? "bg-brand-green/10 border-brand-green"
                              : "bg-white border-brand-green/10 hover:border-brand-green/30"
                          }`}
                        >
                          <Truck size={24} className="mx-auto mb-2 text-brand-green" />
                          <p className="font-black uppercase text-[11px] text-brand-green">Local Delivery</p>
                          <p className="text-[9px] text-brand-dark/50 mt-1">Delivered to you</p>
                        </button>
                      </div>
                    </div>

                    {/* Address (delivery only) */}
                    {deliveryMethod === "delivery" && (
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-brand-green mb-4">Delivery Address</h2>
                        <div className="space-y-3">
                          <input type="text" placeholder="Street Address" value={form.street} onChange={e => set("street", e.target.value)} className="w-full bg-brand-earth/60 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10 focus:border-brand-green transition-colors" />
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} className="w-full bg-brand-earth/60 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10 focus:border-brand-green transition-colors" />
                            <input type="text" placeholder="Postal Code" value={form.postal} onChange={e => set("postal", e.target.value)} className="w-full bg-brand-earth/60 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10 focus:border-brand-green transition-colors" />
                          </div>

                          {/* Delivery Slot */}
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-dark/70 ml-1 block mb-2">Delivery Window</label>
                            <div className="grid grid-cols-3 gap-2">
                              {DELIVERY_SLOTS.map(slot => (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => setDeliverySlot(slot.value)}
                                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                                    deliverySlot === slot.value
                                      ? "bg-brand-green text-brand-earth border-brand-green"
                                      : "bg-white border-brand-green/10 text-brand-dark hover:border-brand-green/30"
                                  }`}
                                >
                                  <p className="text-[9px] sm:text-[10px] font-black uppercase">{slot.label}</p>
                                  <p className="text-[7px] sm:text-[8px] opacity-60 mt-1">{slot.sub}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <button
                      type="button"
                      onClick={() => validateDetails() && setStep("confirm")}
                      className="w-full bg-brand-green text-brand-earth py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl"
                    >
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "confirm" && (
                <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-brand-green mb-4">Order Summary</h2>
                      <div className="bg-white rounded-2xl p-6 space-y-4">
                        <div>
                          <p className="text-[9px] font-black uppercase text-brand-dark/50 mb-2">Recipient</p>
                          <p className="text-lg font-bold">{form.name}</p>
                          <p className="text-sm text-brand-dark/60">{form.email}</p>
                          <p className="text-sm text-brand-dark/60">{form.phone}</p>
                        </div>

                        {deliveryMethod === "delivery" && (
                          <div className="border-t border-brand-green/10 pt-4">
                            <p className="text-[9px] font-black uppercase text-brand-dark/50 mb-2">Delivery Address</p>
                            <p className="text-sm font-bold">{form.street}</p>
                            <p className="text-sm text-brand-dark/60">{form.city}, {form.postal}</p>
                            <p className="text-sm text-brand-dark/60 mt-2">Arrival: {DELIVERY_SLOTS.find(s => s.value === deliverySlot)?.label}</p>
                          </div>
                        )}

                        {deliveryMethod === "pickup" && (
                          <div className="border-t border-brand-green/10 pt-4">
                            <p className="text-[9px] font-black uppercase text-brand-dark/50 mb-2">Pick Up At</p>
                            <p className="text-sm font-bold">Buds N' Buddies Store</p>
                            <p className="text-sm text-brand-dark/60">Sherwood Park, AB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-brand-green mb-4">Payment Method</h2>
                      <div className={`bg-white rounded-2xl p-6 border-2 border-brand-green`}>
                        <div className="flex items-start gap-4">
                          {deliveryMethod === "pickup" ? (
                            <>
                              <Store size={28} className="text-brand-green flex-shrink-0" />
                              <div>
                                <p className="font-black uppercase text-brand-green">Pay at Store</p>
                                <p className="text-sm text-brand-dark/60 mt-1">Show your order confirmation at the counter. Cash or card accepted.</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Truck size={28} className="text-brand-green flex-shrink-0" />
                              <div>
                                <p className="font-black uppercase text-brand-green">Pay on Delivery</p>
                                <p className="text-sm text-brand-dark/60 mt-1">Cash or card accepted at your door when your order arrives.</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Age Confirmation */}
                    <div className="bg-brand-green/5 border border-brand-green/20 rounded-2xl p-4 flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={form.ageConfirm}
                        onChange={e => set("ageConfirm", e.target.checked)}
                        className="w-5 h-5 rounded-lg mt-0.5 cursor-pointer"
                      />
                      <label className="flex-1 cursor-pointer text-sm">
                        <p className="font-bold text-brand-green">Age Confirmation (19+)</p>
                        <p className="text-brand-dark/60 mt-1">I confirm that I am 19 years of age or older and have a valid government ID</p>
                      </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep("details")}
                        className="flex-1 bg-brand-dark/10 text-brand-dark py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-dark/20 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handlePlaceOrder}
                        disabled={loading || !form.ageConfirm}
                        className="flex-1 bg-brand-green text-brand-earth py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 transition-all shadow-xl"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        {loading ? "Processing..." : "Place Order"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sticky top-24 space-y-6">
              <h2 className="text-lg font-black uppercase text-brand-green">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="flex-1">
                      <p className="font-bold text-brand-dark">{item.name}</p>
                      <p className="text-[12px] text-brand-dark/50">x{item.quantity}</p>
                    </div>
                    <p className="font-bold text-brand-dark shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-green/10 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-dark/60">Subtotal</span>
                  <span className="font-bold text-brand-dark">${subtotal.toFixed(2)}</span>
                </div>
                {deliveryMethod === "delivery" && (
                  <div className="flex justify-between">
                    <span className="text-brand-dark/60">Delivery {subtotal >= 75 ? "(FREE)" : ""}</span>
                    <span className="font-bold text-brand-dark">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-brand-green">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span className="font-bold">-${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-brand-green/10 pt-4 flex justify-between items-center text-lg">
                <span className="font-bold text-brand-dark">Total</span>
                <span className="text-3xl font-black text-brand-green">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Promo */}
              {!appliedPromo && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="w-full bg-brand-earth/60 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-brand-green outline-none font-medium text-sm border border-brand-green/10"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="w-full bg-brand-dark/10 text-brand-dark py-2.5 rounded-xl font-bold uppercase text-[10px] hover:bg-brand-dark/20 disabled:opacity-50 transition-all"
                  >
                    {promoLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

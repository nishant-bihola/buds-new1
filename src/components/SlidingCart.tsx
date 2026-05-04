import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Trash2, Plus, Minus, Truck, Store, Tag, Check,
  ChevronRight, ShoppingBag, Loader2, Clock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const SLOT_LABELS: Record<string, string> = {
  asap: "ASAP · Est. 45–75 min",
  "2h": "Today in 2 hours",
  "4h": "Today in 4 hours",
};

const FREE_THRESHOLD = 75;

export function SlidingCart() {
  const {
    cart, removeFromCart, updateQuantity,
    cartCount, subtotal, deliveryFee, discount, totalPrice,
    deliveryMethod, setDeliveryMethod,
    deliverySlot, setDeliverySlot,
    promoCode, setPromoCode, appliedPromo, applyPromo, removePromo,
    isCartOpen, closeCart,
  } = useCart();

  const { success, error: toastError } = useToast();
  const [promoLoading, setPromoLoading] = useState(false);
  const promoRef = useRef<HTMLInputElement>(null);

  const handleApplyPromo = async () => {
    setPromoLoading(true);
    const result = await applyPromo();
    setPromoLoading(false);
    if (result.ok) success(result.message);
    else toastError(result.message);
  };

  const toFreeDelivery = Math.max(0, FREE_THRESHOLD - subtotal);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-[150] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36, mass: 1 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-earth z-[160] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-green/10 shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-brand-green" />
                <h2 className="font-black uppercase tracking-tighter text-brand-green text-lg">
                  Your Cart
                </h2>
                {cartCount > 0 && (
                  <span className="bg-brand-green text-brand-earth text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="w-9 h-9 rounded-full bg-brand-green/8 flex items-center justify-center text-brand-green hover:bg-brand-green/15 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Delivery / Pickup Toggle */}
            <div className="px-6 pt-4 pb-3 shrink-0">
              <div className="grid grid-cols-2 gap-2 p-1 bg-brand-green/8 rounded-2xl">
                {(["delivery", "pickup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDeliveryMethod(m)}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      deliveryMethod === m
                        ? "bg-brand-green text-brand-earth shadow-sm"
                        : "text-brand-green/60 hover:text-brand-green"
                    }`}
                  >
                    {m === "delivery" ? <Truck size={12} /> : <Store size={12} />}
                    {m === "delivery" ? "Delivery" : "Pickup"}
                  </button>
                ))}
              </div>

              {deliveryMethod === "delivery" && (
                <div className="mt-3 flex gap-1.5">
                  {(["asap", "2h", "4h"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDeliverySlot(s)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                        deliverySlot === s
                          ? "border-brand-green bg-brand-green/8 text-brand-green"
                          : "border-brand-green/15 text-brand-dark/40 hover:border-brand-green/30"
                      }`}
                    >
                      <Clock size={9} className="mx-auto mb-0.5" />
                      {s === "asap" ? "ASAP" : s}
                    </button>
                  ))}
                </div>
              )}

              {deliveryMethod === "pickup" && (
                <div className="mt-3 bg-white rounded-xl p-3 flex items-center gap-3 border border-brand-green/10">
                  <Store size={14} className="text-brand-green shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark/40">Pickup at</p>
                    <p className="text-xs font-bold text-brand-dark">130-75 Salisbury Way, Sherwood Park</p>
                  </div>
                </div>
              )}

              {/* Free delivery progress */}
              {deliveryMethod === "delivery" && subtotal < FREE_THRESHOLD && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-dark/40 mb-1.5">
                    <span>Add ${toFreeDelivery.toFixed(2)} for free delivery</span>
                    <span>{Math.round((subtotal / FREE_THRESHOLD) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-brand-green/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-green rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (subtotal / FREE_THRESHOLD) * 100)}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              )}
              {deliveryMethod === "delivery" && subtotal >= FREE_THRESHOLD && (
                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-brand-green flex items-center gap-1.5">
                  <Check size={11} /> Free delivery unlocked!
                </p>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3 min-h-0">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-48 gap-4"
                  >
                    <ShoppingBag size={40} className="text-brand-green/20" />
                    <div className="text-center">
                      <p className="font-black uppercase tracking-tight text-brand-dark/30">Cart is empty</p>
                      <p className="text-xs text-brand-dark/20 mt-1">Add some premium products</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeCart}
                      className="text-[11px] font-black uppercase tracking-widest text-brand-green border border-brand-green/20 px-5 py-2 rounded-full hover:bg-brand-green/5 transition-colors"
                    >
                      Browse Menu
                    </button>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.22 }}
                      className="bg-white rounded-2xl p-3.5 flex gap-3 items-center border border-brand-green/5 shadow-sm"
                    >
                      {item.image && (
                        <div className="w-14 h-14 rounded-xl bg-brand-earth shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-brand-green text-sm uppercase tracking-tight truncate">{item.name}</p>
                        <p className="text-[10px] text-brand-dark/40 font-bold uppercase tracking-wider">{item.category}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center bg-brand-earth rounded-full p-0.5">
                            <button type="button" aria-label="Decrease" onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-brand-green/10 rounded-full transition-colors text-brand-green">
                              <Minus size={10} strokeWidth={3} />
                            </button>
                            <span className="w-6 text-center text-xs font-black text-brand-green">{item.quantity}</span>
                            <button type="button" aria-label="Increase" onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-brand-green/10 rounded-full transition-colors text-brand-green">
                              <Plus size={10} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-black text-brand-green text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        <button type="button" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}
                          className="text-brand-dark/20 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer: Promo + Totals + CTA */}
            {cart.length > 0 && (
              <div className="px-6 pb-6 pt-3 border-t border-brand-green/10 shrink-0 space-y-4">
                {/* Promo code */}
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-brand-green/8 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-brand-green" />
                      <span className="text-xs font-black text-brand-green uppercase tracking-widest">{appliedPromo.code}</span>
                      <span className="text-[10px] text-brand-green/60 font-bold">
                        — {appliedPromo.type === "percent" ? `${appliedPromo.discount}%` : `$${appliedPromo.discount}`} off
                      </span>
                    </div>
                    <button type="button" onClick={removePromo} className="text-brand-dark/30 hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-green/40" />
                      <input
                        ref={promoRef}
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                        className="w-full bg-white border border-brand-green/15 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green/30 placeholder:normal-case placeholder:font-medium placeholder:tracking-normal"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!promoCode || promoLoading}
                      className="bg-brand-green text-brand-earth px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {promoLoading ? <Loader2 size={12} className="animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-brand-dark/50 font-medium">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-brand-dark/50 font-medium">
                    <span>{deliveryMethod === "delivery" ? "Delivery" : "Pickup"}</span>
                    <span className={deliveryFee === 0 ? "text-brand-green font-bold" : ""}>
                      {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-brand-green font-bold">
                      <span>Discount</span>
                      <span>−${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-brand-green text-base border-t border-brand-green/10 pt-2 mt-2">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  {deliveryMethod === "delivery" && (
                    <p className="text-[10px] text-brand-dark/30 font-bold uppercase tracking-widest">
                      {SLOT_LABELS[deliverySlot]}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full bg-brand-green text-brand-earth py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-brand-green/20"
                >
                  Checkout <ChevronRight size={16} />
                </Link>

                <p className="text-center text-[10px] text-brand-dark/25 font-bold uppercase tracking-widest">
                  19+ · Valid ID Required · Alberta Compliant
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

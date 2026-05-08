import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, Trash2, Plus, Minus, Truck, Store, Tag,
  ChevronRight, ShoppingBag, Loader2, Clock,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { TRANSITIONS } from "@/lib/animations";

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
  // Savings: waived delivery (5.49 standard rate) + promo discount
  const deliveryWaived = subtotal >= FREE_THRESHOLD && deliveryMethod === "delivery" ? 5.49 : 0;
  const totalSaved = Number((deliveryWaived + discount).toFixed(2));

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
            transition={{ ...TRANSITIONS.PREMIUM, duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 z-[150] backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35, mass: 0.8 }}
            className="fixed top-0 right-0 h-[100dvh] w-full sm:max-w-md bg-brand-earth z-[160] flex flex-col shadow-2xl overflow-hidden isolate"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-green/10 shrink-0 bg-brand-earth/80 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ShoppingBag size={20} className="text-brand-green" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-light-green rounded-full border-2 border-brand-earth"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <h2 className="font-black uppercase tracking-tighter text-brand-green text-xl leading-none">
                    Your Menu
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 mt-0.5">
                    {cartCount} {cartCount === 1 ? "Item" : "Items"} Selection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="w-10 h-10 rounded-xl bg-brand-green/5 flex items-center justify-center text-brand-green hover:bg-brand-green hover:text-brand-earth active:scale-90 transition-all duration-300"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Delivery / Pickup Toggle */}
            <div className="px-4 pt-3 pb-2 shrink-0 bg-brand-earth">
              <div className="grid grid-cols-2 gap-2 p-1 bg-brand-green/5 rounded-[20px] border border-brand-green/10">
                {(["delivery", "pickup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDeliveryMethod(m)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${
                      deliveryMethod === m
                        ? "bg-brand-green text-brand-earth shadow-lg shadow-brand-green/20"
                        : "text-brand-green/40 hover:text-brand-green"
                    }`}
                  >
                    {m === "delivery" ? <Truck size={14} /> : <Store size={14} />}
                    {m === "delivery" ? "Delivery" : "Pickup"}
                  </button>
                ))}
              </div>

              <div className="mt-3">
                <AnimatePresence mode="wait">
                  {deliveryMethod === "delivery" ? (
                    <motion.div key="delivery-slots" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex gap-2">
                      {(["asap", "2h", "4h"] as const).map((s) => (
                        <button key={s} type="button" onClick={() => setDeliverySlot(s)}
                          className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all flex flex-col items-center gap-1 ${
                            deliverySlot === s ? "border-brand-green bg-brand-green/5 text-brand-green" : "border-brand-green/10 text-brand-dark/30 hover:border-brand-green/30"
                          }`}>
                          <Clock size={11} className={deliverySlot === s ? "text-brand-green" : "text-brand-green/30"} />
                          {s === "asap" ? "ASAP" : s}
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="pickup-info" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="bg-white/60 rounded-xl px-4 py-2.5 flex items-center gap-3 border border-brand-green/10">
                      <Store size={16} className="text-brand-green shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-brand-green/50">Pickup Location</p>
                        <p className="text-xs font-black text-brand-dark truncate">Salisbury Way, Sherwood Park</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Free delivery progress */}
              {deliveryMethod === "delivery" && (
                <div className="mt-2 px-3 py-2.5 rounded-2xl bg-brand-green/5 border border-brand-green/10">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mb-1.5">
                    <span className={subtotal >= FREE_THRESHOLD ? "text-brand-green" : "text-brand-dark/40"}>
                      {subtotal >= FREE_THRESHOLD ? "Free delivery unlocked!" : `Add $${toFreeDelivery.toFixed(2)} for free delivery`}
                    </span>
                    <span className="text-brand-green">{Math.min(100, Math.round((subtotal / FREE_THRESHOLD) * 100))}%</span>
                  </div>
                  <div className="h-1 bg-brand-green/10 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-brand-green" initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (subtotal / FREE_THRESHOLD) * 100)}%` }}
                      transition={{ type: "spring", stiffness: 40, damping: 20 }} />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto min-h-0 px-6 pt-2 pb-4 space-y-3 custom-scrollbar isolate">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div
                    key="empty-cart"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-24 h-24 rounded-[32px] bg-brand-green/5 flex items-center justify-center mb-6 border border-brand-green/10">
                      <ShoppingBag size={40} className="text-brand-green/20" />
                    </div>
                    <h3 className="font-black uppercase tracking-tight text-brand-green text-xl mb-2">Cart is empty</h3>
                    <p className="text-sm text-brand-dark/40 max-w-[200px] mb-8 leading-relaxed font-medium">Add some premium craft products to your menu.</p>
                    <button
                      type="button"
                      onClick={closeCart}
                      className="group flex items-center gap-3 bg-brand-green text-brand-earth px-8 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest hover:bg-brand-light-green hover:text-brand-green transition-all"
                    >
                      Browse Menu <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="group bg-white rounded-2xl p-3 flex items-center gap-3 border border-brand-green/5 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-xl bg-brand-earth/50 shrink-0 overflow-hidden p-1.5 border border-brand-green/5">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-black text-brand-green text-[12px] uppercase tracking-tight leading-tight line-clamp-2 flex-1">{item.name}</h4>
                          <span className="font-black text-brand-green text-[13px] whitespace-nowrap ml-1">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <p className="text-[8px] text-brand-dark/30 font-black uppercase tracking-[0.2em] mt-0.5">{item.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-brand-earth rounded-lg p-0.5 border border-brand-green/5">
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity"
                              className="w-6 h-6 flex items-center justify-center hover:bg-brand-green hover:text-brand-earth rounded-md transition-all text-brand-green">
                              <Minus size={10} strokeWidth={3} />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-brand-green">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity"
                              className="w-6 h-6 flex items-center justify-center hover:bg-brand-green hover:text-brand-earth rounded-md transition-all text-brand-green">
                              <Plus size={10} strokeWidth={3} />
                            </button>
                          </div>
                          <button type="button" onClick={() => removeFromCart(item.id)} aria-label="Remove item"
                            className="text-brand-dark/20 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-4 pb-3 pt-2 border-t border-brand-green/10 bg-brand-earth/95 backdrop-blur-xl shrink-0 space-y-2">
                {/* Promo code */}
                <div className="relative">
                  {appliedPromo ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-between bg-brand-green/10 rounded-[16px] px-4 py-2.5 border border-brand-green/20">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-brand-green" />
                        <div>
                          <p className="text-[9px] font-black text-brand-green uppercase tracking-[0.2em]">{appliedPromo.code}</p>
                          <p className="text-[8px] text-brand-green/60 font-bold uppercase tracking-wider">
                            {appliedPromo.type === "percent" ? `${appliedPromo.discount}%` : `$${appliedPromo.discount}`} Off
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={removePromo} aria-label="Remove promo code" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-green/10 text-brand-green transition-all">
                        <X size={14} />
                      </button>
                    </motion.div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative group">
                        <Tag size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-green/30 group-focus-within:text-brand-green transition-colors" />
                        <input
                          ref={promoRef}
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                          className="w-full bg-white border border-brand-green/10 rounded-[16px] pl-9 pr-3 py-3 text-[9px] font-black uppercase tracking-[0.2em] outline-none focus:border-brand-green/30 focus:ring-4 focus:ring-brand-green/5 transition-all placeholder:text-brand-dark/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!promoCode || promoLoading}
                        className="bg-brand-green text-brand-earth px-5 rounded-[16px] text-[9px] font-black uppercase tracking-widest hover:bg-brand-light-green hover:text-brand-green transition-all disabled:opacity-30 shadow-lg shadow-brand-green/10"
                      >
                        {promoLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="bg-white/40 rounded-2xl p-2.5 space-y-1 border border-brand-green/5">
                  <div className="flex justify-between text-[9px] font-black text-brand-dark/40 uppercase tracking-[0.2em]">
                    <span>Subtotal</span>
                    <span className="text-brand-dark font-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-brand-dark/40 uppercase tracking-[0.2em]">
                    <span>{deliveryMethod === "delivery" ? "Delivery Fee" : "Pickup"}</span>
                    <span className={deliveryFee === 0 ? "text-brand-green font-black" : "text-brand-dark font-black"}>
                      {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      className="flex justify-between text-[9px] font-black text-brand-green uppercase tracking-[0.2em]">
                      <span>Promo Discount</span>
                      <span>−${discount.toFixed(2)}</span>
                    </motion.div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-brand-green/10 mt-0.5">
                    <span className="font-black text-brand-green uppercase tracking-[0.3em] text-[8px]">Total</span>
                    <span className="text-xl font-black text-brand-green tracking-tighter leading-none">${totalPrice.toFixed(2)}</span>
                  </div>
                  {totalSaved > 0 && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between items-center bg-brand-green/10 rounded-xl px-3 py-2 border border-brand-green/20">
                      <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">🎉 You saved</span>
                      <span className="text-[13px] font-black text-brand-green">−${totalSaved.toFixed(2)}</span>
                    </motion.div>
                  )}
                </div>

                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="group relative w-full bg-brand-green text-brand-earth py-4 rounded-[20px] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:bg-brand-light-green hover:text-brand-green transition-all shadow-lg shadow-brand-green/20"
                >
                  <span>Checkout</span> 
                  <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Product } from "../types";

export interface CartItem extends Product {
  quantity: number;
}

export type DeliveryMethod = "delivery" | "pickup";
export type DeliverySlot = "asap" | "2h" | "4h";

export interface AppliedPromo {
  code: string;
  discount: number;
  type: "percent" | "fixed";
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  deliveryFeeOverride: number | null;
  setDeliveryFeeOverride: (fee: number | null) => void;
  discount: number;
  totalPrice: number;
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (m: DeliveryMethod) => void;
  deliverySlot: DeliverySlot;
  setDeliverySlot: (s: DeliverySlot) => void;
  promoCode: string;
  setPromoCode: (c: string) => void;
  appliedPromo: AppliedPromo | null;
  applyPromo: () => Promise<{ ok: boolean; message: string }>;
  removePromo: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE_FALLBACK = 5.49;
const FREE_DELIVERY_THRESHOLD = 75;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod>("delivery");
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot>("asap");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [deliveryFeeOverride, setDeliveryFeeOverride] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("buds-cart");
      if (saved) setCart(JSON.parse(saved));
      const savedPromo = localStorage.getItem("buds-promo");
      if (savedPromo) setAppliedPromo(JSON.parse(savedPromo));
    } catch { /* corrupt storage — ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("buds-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  const setDeliveryMethod = (m: DeliveryMethod) => {
    setDeliveryMethodState(m);
    // Reset override when switching to pickup — pickup is always free
    if (m === "pickup") setDeliveryFeeOverride(null);
  };

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const subtotal  = cart.reduce((t, i) => t + Number(i.price) * i.quantity, 0);

  // Delivery fee: pickup = 0, else use override if set, else free at $75+, else flat fallback
  const deliveryFee =
    deliveryMethod === "pickup"
      ? 0
      : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : deliveryFeeOverride !== null
      ? deliveryFeeOverride
      : DELIVERY_FEE_FALLBACK;

  // Discount is applied to subtotal only (not delivery)
  const discount = appliedPromo
    ? appliedPromo.type === "percent"
      ? Math.round((subtotal * appliedPromo.discount) / 100 * 100) / 100
      : Math.min(appliedPromo.discount, subtotal)
    : 0;

  const totalPrice = Math.max(0, subtotal - discount + deliveryFee);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((i) => i.id !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((i) => i.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setPromoCode("");
    localStorage.removeItem("buds-promo");
  };

  const applyPromo = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return { ok: false, message: "Enter a promo code." };
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const promo: AppliedPromo = {
          code: data.promo.code,
          discount: Number(data.promo.discount),
          type: data.promo.type,
        };
        setAppliedPromo(promo);
        localStorage.setItem("buds-promo", JSON.stringify(promo));
        const label = promo.type === "percent" ? `${promo.discount}% off` : `$${promo.discount.toFixed(2)} off`;
        return { ok: true, message: `${promo.code} applied — ${label}!` };
      }
      return { ok: false, message: data.error ?? "Invalid or expired code." };
    } catch {
      return { ok: false, message: "Could not validate code. Try again." };
    }
  }, [promoCode]);

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    localStorage.removeItem("buds-promo");
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, subtotal, deliveryFee, deliveryFeeOverride, setDeliveryFeeOverride,
      discount, totalPrice,
      deliveryMethod, setDeliveryMethod,
      deliverySlot, setDeliverySlot,
      promoCode, setPromoCode, appliedPromo, applyPromo, removePromo,
      isCartOpen, openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

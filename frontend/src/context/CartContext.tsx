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

  // delivery
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (m: DeliveryMethod) => void;
  deliverySlot: DeliverySlot;
  setDeliverySlot: (s: DeliverySlot) => void;

  // promo
  promoCode: string;
  setPromoCode: (c: string) => void;
  appliedPromo: AppliedPromo | null;
  applyPromo: () => Promise<{ ok: boolean; message: string }>;
  removePromo: () => void;

  // sliding cart
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

}

const CartContext = createContext<CartContextType | undefined>(undefined);

const DELIVERY_FEE_FALLBACK = 5.49;


export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [deliverySlot, setDeliverySlot] = useState<DeliverySlot>("asap");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [deliveryFeeOverride, setDeliveryFeeOverride] = useState<number | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("buds-cart");
    if (saved) setCart(JSON.parse(saved));
    const savedPromo = localStorage.getItem("buds-promo");
    if (savedPromo) setAppliedPromo(JSON.parse(savedPromo));
  }, []);

  useEffect(() => {
    localStorage.setItem("buds-cart", JSON.stringify(cart));
  }, [cart]);

  // lock scroll when cart is open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isCartOpen]);

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const deliveryFee =
    deliveryMethod === "pickup"
      ? 0
      : deliveryFeeOverride !== null
      ? deliveryFeeOverride
      : DELIVERY_FEE_FALLBACK;

  const discount = appliedPromo
    ? appliedPromo.type === "percent"
      ? Math.round((subtotal * appliedPromo.discount) / 100 * 100) / 100
      : Math.min(appliedPromo.discount, subtotal)
    : 0;

  const totalPrice = Math.max(0, subtotal + deliveryFee - discount);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, { ...product, quantity }];
    });
    setNotification(`${quantity}× ${product.name} added!`);
    setTimeout(() => setNotification(null), 3000);
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
    localStorage.removeItem("buds-promo");
  };

  const applyPromo = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    if (!promoCode.trim()) return { ok: false, message: "Enter a promo code." };
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const promo: AppliedPromo = { 
          code: data.promo.code, 
          discount: data.promo.discount, 
          type: data.promo.type 
        };
        setAppliedPromo(promo);
        localStorage.setItem("buds-promo", JSON.stringify(promo));
        return { ok: true, message: `Code applied — ${promo.type === "percent" ? `${promo.discount}% off` : `$${promo.discount} off`}!` };
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
      cartCount, subtotal, deliveryFee, deliveryFeeOverride, setDeliveryFeeOverride, discount, totalPrice,
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

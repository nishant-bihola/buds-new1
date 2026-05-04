/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const url = (import.meta as any).env?.VITE_SUPABASE_URL ?? "";
const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(url, key);

// ── Type definitions shared between frontend and API ──────────────────────────

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  isBestSeller: boolean;
  color?: string;
  splashImage?: string;
  inStock: boolean;
  sortOrder: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  stripeSessionId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: "pending" | "paid" | "fulfilled" | "cancelled";
  createdAt: string;
}

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt: string | null;
}

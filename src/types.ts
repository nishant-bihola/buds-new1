export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  isBestSeller?: boolean;
  category: string;
  color?: string;
  splashImage?: string;
  // cannabis-specific
  thc?: string;
  cbd?: string;
  terpenes?: string[];
  brand?: string;
  weight?: string;
  strain?: "Indica" | "Sativa" | "Hybrid" | "CBD";
  // inventory
  inStock?: boolean;
  sortOrder?: number;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  date: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "dispatched"
  | "delivered"
  | "ready_pickup"
  | "cancelled";

export interface OrderDelivery {
  method: "delivery" | "pickup";
  street?: string;
  city?: string;
  postal?: string;
  slot?: "asap" | "2h" | "4h";
}

export interface Order {
  id?: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  delivery: OrderDelivery;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: OrderStatus;
  driverName?: string;
  driverPhone?: string;
  emailLog?: { event: string; sentAt: string }[];
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  type: "percent" | "fixed";
  active: boolean;
  usageCount?: number;
  maxUses?: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  postalPrefix: string;
  fee: number;
  minOrder: number;
  active: boolean;
}

export interface StoreHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

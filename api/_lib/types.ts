export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  thc?: string;
  isBestSeller?: boolean;
  sortOrder?: number;
  inStock?: boolean;
}

export interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customer?: any;
  delivery?: any;
  items: any[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: string;
  createdAt?: Date;
}

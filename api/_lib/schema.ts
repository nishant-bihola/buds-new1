import { pgTable, text, doublePrecision, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  image: text("image"),
  category: text("category"),
  description: text("description"),
  thc: text("thc"),
  cbd: text("cbd"),
  brand: text("brand"),
  weight: text("weight"),
  strain: text("strain"),
  inStock: boolean("in_stock").default(true),
  quantity: integer("quantity").default(0),
  isBestSeller: boolean("is_best_seller").default(false),
  sortOrder: integer("sort_order").default(0),
  source: text("source").default("website"), // "website" or "barnet"
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  orderId: text("order_id").primaryKey(),
  total: doublePrecision("total").notNull(),
  status: text("status").default("pending"), // "confirmed", "dispatched", "delivered", "ready_pickup"
  customer: jsonb("customer").notNull(), // { name, email, phone }
  customerName: text("customer_name"), // denormalized for easier querying
  customerEmail: text("customer_email"), // denormalized for easier querying
  customerPhone: text("customer_phone"), // denormalized for easier querying
  delivery: jsonb("delivery"), // { method, street, city, postal, slot }
  items: jsonb("items").notNull(), // Array of products
  subtotal: doublePrecision("subtotal"),
  deliveryFee: doublePrecision("delivery_fee"),
  discount: doublePrecision("discount"),
  promoCode: text("promo_code"),
  emailLog: jsonb("email_log").default([]),
  source: text("source").default("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  totalOrders: integer("total_orders").default(0),
  totalSpent: doublePrecision("total_spent").default(0),
  lastOrderAt: timestamp("last_order_at"),
  lastAddress: text("last_address"),
  preferredMethod: text("preferred_method"), // "delivery" or "pickup"
  createdAt: timestamp("created_at").defaultNow(),
});

export const promoCodes = pgTable("promo_codes", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  discount: doublePrecision("discount").notNull(),
  type: text("type").notNull(), // "percent" or "fixed"
  active: boolean("active").default(true),
  usageCount: integer("usage_count").default(0),
  maxUses: integer("max_uses"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const automations = pgTable("automations", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").default(true),
});

export const deliveryZones = pgTable("delivery_zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  postalPrefix: text("postal_prefix"),
  fee: doublePrecision("fee").default(0),
  minOrder: doublePrecision("min_order").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storeHours = pgTable("store_hours", {
  id: integer("id").primaryKey(),
  day: text("day").notNull(),
  open: text("open"),
  close: text("close"),
  closed: boolean("closed").default(false),
});

export const config = pgTable("config", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stockLogs = pgTable("stock_logs", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  type: text("type").notNull(), // "in", "out", "adjustment"
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  staffId: text("staff_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const specialOrders = pgTable("special_orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id"),
  status: text("status").default("requested"), // "requested", "approved", "ordered", "arrived", "completed"
  productDetails: jsonb("product_details").notNull(), // { name, brand, notes }
  notes: text("notes"),
  staffId: text("staff_id"),
  eta: timestamp("eta"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const priceMatchHistory = pgTable("price_match_history", {
  id: text("id").primaryKey(),
  orderId: text("order_id"),
  productId: text("product_id").notNull(),
  competitorUrl: text("competitor_url"),
  competitorPrice: doublePrecision("competitor_price").notNull(),
  approvedPrice: doublePrecision("approved_price").notNull(),
  approvedBy: text("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  staffId: text("staff_id").notNull(),
  action: text("action").notNull(), // "create", "update", "delete", "login"
  targetType: text("target_type").notNull(), // "product", "order", "customer", etc.
  targetId: text("target_id"),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staff = pgTable("staff", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("staff"), // "admin", "manager", "staff"
  permissions: jsonb("permissions").default([]),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

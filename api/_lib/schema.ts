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

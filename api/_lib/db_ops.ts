import { db } from "./db.js";
import { products, orders, customers, promoCodes, automations, deliveryZones, drivers, storeHours } from "./schema.js";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import crypto from "crypto";

// ── PRODUCTS ─────────────────────────────────────────────────────────────

export async function getProducts(adminAll = false) {
  if (!adminAll) {
    return await db.select().from(products).where(eq(products.inStock, true)).orderBy(asc(products.sortOrder));
  }
  return await db.select().from(products).orderBy(asc(products.sortOrder));
}

export async function upsertProduct(product: any) {
  return await db.insert(products)
    .values(product)
    .onConflictDoUpdate({
      target: products.id,
      set: { ...product, updatedAt: new Date() }
    })
    .returning();
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

// ── ORDERS ───────────────────────────────────────────────────────────────

export async function getOrders() {
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrderById(orderId: string) {
  const result = await db.select().from(orders).where(eq(orders.orderId, orderId));
  return result[0] || null;
}

export async function insertOrder(order: any) {
  const result = await db.insert(orders).values(order).returning();
  return result[0];
}

export async function updateOrder(orderId: string, patch: any) {
  const result = await db.update(orders)
    .set(patch)
    .where(eq(orders.orderId, orderId))
    .returning();
  return result[0];
}

// ── CUSTOMERS ────────────────────────────────────────────────────────────

export async function getCustomers() {
  return await db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function upsertCustomer(email: string, patch: any) {
  const existing = await db.select().from(customers).where(eq(customers.email, email.toLowerCase()));
  if (existing.length > 0) {
    await db.update(customers)
      .set({
        totalOrders: (existing[0].totalOrders || 0) + 1,
        totalSpent: (existing[0].totalSpent || 0) + (Number(patch.totalSpent) || 0),
        phone: patch.phone || existing[0].phone,
        name: patch.name || existing[0].name,
      })
      .where(eq(customers.email, email.toLowerCase()));
  } else {
    await db.insert(customers).values({
      id: crypto.randomUUID(),
      name: patch.name,
      email: email.toLowerCase(),
      phone: patch.phone,
      totalOrders: 1,
      totalSpent: Number(patch.totalSpent) || 0,
    });
  }
}

// ── PROMO CODES ─────────────────────────────────────────────────────────

export async function getPromoCodes() {
  return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
}

export async function getPromoByCode(code: string) {
  const result = await db.select()
    .from(promoCodes)
    .where(and(eq(promoCodes.code, code.toUpperCase()), eq(promoCodes.active, true)));
  return result[0] || null;
}

export async function upsertPromoCode(data: any) {
  const id = data.id || `promo_${Date.now()}`;
  return await db.insert(promoCodes).values({
    id,
    code: data.code.toUpperCase(),
    discount: Number(data.discount),
    type: data.type || "percent",
    active: data.active !== undefined ? data.active : true,
    maxUses: data.maxUses ? Number(data.maxUses) : null,
  }).onConflictDoUpdate({
    target: promoCodes.id,
    set: {
      code: data.code.toUpperCase(),
      discount: Number(data.discount),
      type: data.type,
      active: data.active,
      maxUses: data.maxUses,
    }
  }).returning();
}

export async function deletePromoCode(id: string) {
  return await db.delete(promoCodes).where(eq(promoCodes.id, id));
}

// ── STATS ───────────────────────────────────────────────────────────────

export async function getStats() {
  // Use SQL aggregations for lightning fast stats
  const [basicStats] = await db
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${orders.total} AS NUMERIC)), 0)`,
      totalOrders: sql<number>`COUNT(*)`,
      avgOrderValue: sql<number>`COALESCE(AVG(CAST(${orders.total} AS NUMERIC)), 0)`,
    })
    .from(orders);

  const [customerStats] = await db
    .select({
      totalCustomers: sql<number>`COUNT(*)`,
    })
    .from(customers);

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [weeklyOrders] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${weekAgo}`);

  // For the revenue chart, we still need some day-by-day data, but let's aggregate it in SQL
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
  const revenueChartData = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      revenue: sql<number>`SUM(CAST(${orders.total} AS NUMERIC))`,
    })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${thirtyDaysAgo}`)
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(asc(sql`DATE(${orders.createdAt})`));

  // Top products - this is tricky with jsonb items, but we can try a simple version or just fetch recent orders
  // For now, let's keep the product logic but maybe limit it or optimize if possible.
  // Actually, let's just fetch the last 100 orders to calculate top products for now to keep it fast.
  const recentOrders = await db.select({ items: orders.items }).from(orders).orderBy(desc(orders.createdAt)).limit(200);
  
  const productTotals: Record<string, { name: string; units: number; revenue: number }> = {};
  for (const o of recentOrders) {
    const items = (o.items as any[]) ?? [];
    for (const item of items) {
      const key = item.id ?? item.name;
      if (!productTotals[key]) productTotals[key] = { name: item.name, units: 0, revenue: 0 };
      productTotals[key].units += Number(item.quantity) || 1;
      productTotals[key].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }
  }
  const topProducts = Object.values(productTotals)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue: Number(basicStats.totalRevenue),
    totalOrders: Number(basicStats.totalOrders),
    totalCustomers: Number(customerStats.totalCustomers),
    avgOrderValue: Number(basicStats.avgOrderValue),
    ordersThisWeek: Number(weeklyOrders.count),
    revenueByDay: revenueChartData.map(d => ({ date: d.date, revenue: Number(d.revenue) })),
    topProducts,
  };
}

// ── OTHERS ───────────────────────────────────────────────────────────────

export async function getAutomations() {
  return await db.select().from(automations);
}

export async function isAutomationEnabled(key: string): Promise<boolean> {
  const result = await db.select().from(automations).where(eq(automations.key, key));
  return result[0]?.enabled ?? false;
}

export async function getDeliveryZones() {
  return await db.select().from(deliveryZones).orderBy(asc(deliveryZones.createdAt));
}

export async function getDrivers() {
  return await db.select().from(drivers).orderBy(asc(drivers.createdAt));
}

export async function getStoreHours() {
  return await db.select().from(storeHours).orderBy(asc(storeHours.id));
}

// ── CONFIG & SETTINGS ───────────────────────────────────────────────────

export async function getConfig(key: string) {
  const result = await db.select().from(config).where(eq(config.key, key));
  return result[0]?.value || null;
}

export async function setConfig(key: string, value: any) {
  return await db.insert(config)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: config.key,
      set: { value, updatedAt: new Date() }
    })
    .returning();
}

export async function updateAutomation(key: string, enabled: boolean) {
  return await db.insert(automations)
    .values({ key, enabled })
    .onConflictDoUpdate({
      target: automations.key,
      set: { enabled }
    })
    .returning();
}

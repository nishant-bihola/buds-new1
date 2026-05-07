import { db } from "./db.js";
import { 
  products, orders, customers, promoCodes, automations, 
  deliveryZones, drivers, storeHours, config, 
  specialOrders, stockLogs, auditLogs, staff 
} from "./schema.js";
import { eq, and, desc, asc, sql, gte } from "drizzle-orm";
import crypto from "crypto";

// ── PRODUCTS ─────────────────────────────────────────────────────────────

export async function getProducts(adminAll = false) {
  if (!adminAll) {
    return await db.select().from(products).where(eq(products.inStock, true)).orderBy(asc(products.sortOrder));
  }
  return await db.select().from(products).orderBy(asc(products.sortOrder));
}

export async function upsertProduct(product: any, staffId?: string) {
  const result = await db.insert(products)
    .values(product)
    .onConflictDoUpdate({
      target: products.id,
      set: { ...product, updatedAt: new Date() }
    })
    .returning();

  if (staffId && result[0]) {
    await logAudit(staffId, "update", "product", result[0].id, null, result[0]);
  }
  
  return result;
}

export async function deleteProduct(id: string, staffId?: string) {
  await db.delete(products).where(eq(products.id, id));
  if (staffId) {
    await logAudit(staffId, "delete", "product", id);
  }
}

// ── STOCK LOGS ───────────────────────────────────────────────────────────

export async function logStockChange(data: { productId: string; type: string; quantity: number; reason?: string; staffId?: string }) {
  const id = crypto.randomUUID();
  return await db.insert(stockLogs).values({ id, ...data }).returning();
}

export async function getStockLogs(productId?: string) {
  let query = db.select().from(stockLogs).orderBy(desc(stockLogs.createdAt));
  if (productId) {
    return await query.where(eq(stockLogs.productId, productId));
  }
  return await query;
}

// ── SPECIAL ORDERS ───────────────────────────────────────────────────────

export async function getSpecialOrders() {
  return await db.select().from(specialOrders).orderBy(desc(specialOrders.createdAt));
}

export async function upsertSpecialOrder(data: any) {
  const id = data.id || crypto.randomUUID();
  return await db.insert(specialOrders)
    .values({ id, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: specialOrders.id,
      set: { ...data, updatedAt: new Date() }
    })
    .returning();
}

// ── AUDIT LOGS ───────────────────────────────────────────────────────────

export async function logAudit(staffId: string, action: string, targetType: string, targetId?: string, oldData?: any, newData?: any) {
  const id = crypto.randomUUID();
  return await db.insert(auditLogs).values({
    id,
    staffId,
    action,
    targetType,
    targetId,
    oldData,
    newData
  }).returning();
}

export async function getAuditLogs() {
  return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(500);
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

export async function getCustomerByEmail(email: string) {
  const result = await db.select().from(customers).where(eq(customers.email, email.toLowerCase()));
  return result[0] || null;
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
        lastOrderAt: new Date(),
        lastAddress: patch.address || existing[0].lastAddress,
        preferredMethod: patch.preferredMethod || existing[0].preferredMethod,
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
      lastOrderAt: new Date(),
      lastAddress: patch.address,
      preferredMethod: patch.preferredMethod,
    });
  }
}

export async function rebuildCustomersFromOrders() {
  const allOrders = await db.select().from(orders);

  // Reset stats mapping
  const stats: Record<string, any> = {};

  for (const order of allOrders) {
    const email = (order.customerEmail || (order.customer as any)?.email)?.toLowerCase();
    if (!email) continue; // skip if no email found
    const delivery = (order.customer as any)?.delivery || (order as any).delivery;
    
    if (!stats[email]) {
      stats[email] = {
        name: order.customerName,
        email,
        phone: order.customerPhone,
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: order.createdAt,
        lastAddress: delivery?.method === "delivery" ? `${delivery.street}, ${delivery.city} ${delivery.postal}` : null,
        preferredMethod: delivery?.method ?? "pickup",
      };
    }
    
    stats[email].totalOrders += 1;
    stats[email].totalSpent += Number(order.total) || 0;
    if (new Date(order.createdAt) > new Date(stats[email].lastOrderAt)) {
      stats[email].lastOrderAt = order.createdAt;
      stats[email].lastAddress = delivery?.method === "delivery" ? `${delivery.street}, ${delivery.city} ${delivery.postal}` : null;
      stats[email].preferredMethod = delivery?.method ?? "pickup";
    }
  }

  // Upsert all gathered stats
  for (const email of Object.keys(stats)) {
    const s = stats[email];
    const existing = await db.select().from(customers).where(eq(customers.email, email));
    
    if (existing.length > 0) {
      await db.update(customers).set(s).where(eq(customers.email, email));
    } else {
      await db.insert(customers).values({ id: crypto.randomUUID(), ...s });
    }
  }
  
  return Object.keys(stats).length;
}

// ── PROMO CODES ─────────────────────────────────────────────────────────

export async function getPromoCodes() {
  return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
}

export async function getPromoByCode(code: string) {
  const upperCode = code.toUpperCase();
  
  // Real DB check
  const result = await db.select()
    .from(promoCodes)
    .where(and(eq(promoCodes.code, upperCode), eq(promoCodes.active, true)));
  
  return result[0] ?? null;
}

export async function incrementPromoUsage(promoId: string) {
  if (!promoId) return;
  try {
    await db.execute(
      sql`UPDATE ${promoCodes} SET usage_count = usage_count + 1 WHERE id = ${promoId}`
    );
  } catch (err) {
    console.error(`[incrementPromoUsage] Failed to increment promo ${promoId}:`, err);
  }
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

  // Monthly Revenue (Last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRevenue = await db
    .select({
      month: sql<string>`TO_CHAR(${orders.createdAt}, 'Mon YYYY')`,
      revenue: sql<number>`SUM(CAST(${orders.total} AS NUMERIC))`,
    })
    .from(orders)
    .where(sql`${orders.createdAt} >= ${sixMonthsAgo}`)
    .groupBy(sql`TO_CHAR(${orders.createdAt}, 'Mon YYYY'), DATE_TRUNC('month', ${orders.createdAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${orders.createdAt})`);

  // Category Breakdown
  const categoryStats = await db
    .select({
      category: products.category,
      count: sql<number>`COUNT(*)`,
    })
    .from(products)
    .groupBy(products.category);

  // Special Order Conversion
  const [specialOrderStats] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`COUNT(*) FILTER (WHERE ${specialOrders.status} = 'completed')`,
    })
    .from(specialOrders);

  // For the revenue chart, we still need some day-by-day data
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

  // Top products
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
    monthlyRevenue: monthlyRevenue.map(m => ({ month: m.month, revenue: Number(m.revenue) })),
    categoryStats: categoryStats.map(c => ({ category: c.category || "Unknown", count: Number(c.count) })),
    specialOrderConversion: {
      total: Number(specialOrderStats.total),
      completed: Number(specialOrderStats.completed),
      rate: specialOrderStats.total > 0 ? (specialOrderStats.completed / specialOrderStats.total) * 100 : 0
    },
    topProducts,
  };
}

// ── OTHERS ───────────────────────────────────────────────────────────────

export async function getAutomations() {
  return await db.select().from(automations);
}

export async function isAutomationEnabled(key: string): Promise<boolean> {
  const result = await db.select().from(automations).where(eq(automations.key, key));
  return result[0]?.enabled ?? true; // default ON — send emails unless explicitly disabled
}

export async function getDeliveryZones() {
  return await db.select().from(deliveryZones).orderBy(asc(deliveryZones.createdAt));
}

export async function getStoreHours() {
  return await db.select().from(storeHours).orderBy(asc(storeHours.id));
}

export async function upsertStoreHours(hours: { id: number; day: string; open?: string; close?: string; closed?: boolean }[]) {
  for (const h of hours) {
    await db.insert(storeHours)
      .values({ id: h.id, day: h.day, open: h.open ?? null, close: h.close ?? null, closed: h.closed ?? false })
      .onConflictDoUpdate({
        target: storeHours.id,
        set: { open: h.open ?? null, close: h.close ?? null, closed: h.closed ?? false },
      });
  }
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

// ── DRIVERS ──────────────────────────────────────────────────────────────

export async function getDrivers() {
  const allDrivers = await db.select().from(drivers).orderBy(asc(drivers.name));
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const results = await Promise.all(allDrivers.map(async (d) => {
    const active = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.driverName, d.name), eq(orders.status, "dispatched")));
    
    const today = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.driverName, d.name), 
        eq(orders.status, "delivered"),
        gte(orders.createdAt, startOfDay)
      ));

    return {
      ...d,
      activeOrders: Number(active[0]?.count ?? 0),
      todayDeliveries: Number(today[0]?.count ?? 0),
    };
  }));

  return results;
}

export async function upsertDriver(data: { id?: string; name: string; phone?: string; active?: boolean }) {
  const id = data.id || crypto.randomUUID();
  return await db.insert(drivers)
    .values({ id, name: data.name, phone: data.phone ?? null, active: data.active ?? true })
    .onConflictDoUpdate({
      target: drivers.id,
      set: { name: data.name, phone: data.phone ?? null, active: data.active ?? true },
    })
    .returning();
}

export async function deleteDriver(id: string) {
  return await db.delete(drivers).where(eq(drivers.id, id)).returning();
}

// ── EMAIL LOG ─────────────────────────────────────────────────────────────

export async function logEmailEvent(orderId: string, event: string): Promise<void> {
  try {
    const result = await db.select().from(orders).where(eq(orders.orderId, orderId));
    if (!result[0]) return;

    const existing = (result[0].emailLog as { event: string; sentAt: string }[]) ?? [];
    const updated = [...existing, { event, sentAt: new Date().toISOString() }];

    await db.update(orders)
      .set({ emailLog: updated })
      .where(eq(orders.orderId, orderId));
  } catch (err) {
    console.error("[logEmailEvent] Failed:", err);
  }
}

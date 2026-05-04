import { db } from "../_lib/supabaseAdmin";
import { requireAdmin } from "../_lib/adminAuth";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  try {
    const [ordersRes, customersRes, weekOrdersRes] = await Promise.all([
      db.from("orders").select("total, created_at, items, status").eq("status", "paid"),
      db.from("customers").select("id, created_at"),
      db.from("orders")
        .select("id")
        .eq("status", "paid")
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    ]);

    const orders = ordersRes.data ?? [];
    const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total ?? 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customersRes.data?.length ?? 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const ordersThisWeek = weekOrdersRes.data?.length ?? 0;

    // Revenue by day — last 30 days
    const now = new Date();
    const dayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const o of orders) {
      const day = (o.created_at as string).slice(0, 10);
      if (dayMap[day] !== undefined) dayMap[day] += o.total ?? 0;
    }
    const revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue }));

    // Top products from items JSONB
    const productTotals: Record<string, { name: string; units: number; revenue: number }> = {};
    for (const o of orders) {
      for (const item of (o.items as any[]) ?? []) {
        const key = item.id ?? item.name;
        if (!productTotals[key]) productTotals[key] = { name: item.name, units: 0, revenue: 0 };
        productTotals[key].units += item.quantity ?? 1;
        productTotals[key].revenue += (item.price ?? 0) * (item.quantity ?? 1);
      }
    }
    const topProducts = Object.values(productTotals)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return res.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      ordersThisWeek,
      revenueByDay,
      topProducts,
    });
  } catch (error) {
    console.error("Admin stats failed. Likely missing Supabase credentials:", error);
    return res.json({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      avgOrderValue: 0,
      ordersThisWeek: 0,
      revenueByDay: [],
      topProducts: [],
    });
  }
}

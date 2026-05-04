import { db } from "../_lib/supabaseAdmin";
import { requireAdmin } from "../_lib/adminAuth";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  const { limit = "50", offset = "0" } = req.query ?? {};

  const { data, count, error } = await db
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });

  const customers = (data ?? []).map((c: any) => ({
    id: c.id,
    email: c.email,
    name: c.name ?? "",
    phone: c.phone ?? "",
    totalOrders: c.total_orders ?? 0,
    totalSpent: c.total_spent ?? 0,
    createdAt: c.created_at,
    lastOrderAt: c.last_order_at ?? null,
  }));

  return res.json({ customers, total: count ?? 0 });
}

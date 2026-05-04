import { db } from "../_lib/supabaseAdmin";
import { requireAdmin } from "../_lib/adminAuth";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { status, limit = "50", offset = "0", session_id } = req.query ?? {};

  // Public lookup by Stripe session ID — customers use this on the success page, no auth required
  if (session_id) {
    const { data } = await db
      .from("orders")
      .select("id, customer_name, customer_email, items, total, status, created_at")
      .eq("stripe_session_id", session_id)
      .single();
    return res.json({ order: data ? mapOrder(data) : null });
  }

  // All other operations require admin auth
  if (!requireAdmin(req, res)) return;

  let query = db
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ orders: (data ?? []).map(mapOrder), total: count ?? 0 });
}

function mapOrder(o: any) {
  return {
    id: o.id,
    stripeSessionId: o.stripe_session_id,
    customerEmail: o.customer_email,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    shippingAddress: o.shipping_address,
    items: o.items ?? [],
    subtotal: o.subtotal,
    total: o.total,
    status: o.status,
    createdAt: o.created_at,
  };
}

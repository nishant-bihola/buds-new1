import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrders, updateOrder } from "../_lib/supabase.js";
import { requireAdmin, json, parseBody } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const orders = await getOrders();
      return json(res as any, { orders });
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing ID" });
      const body = await parseBody(req as any);
      const order = await updateOrder(id as string, body);
      return json(res as any, { order });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[Admin Orders API Error]:", err);
    return res.status(500).json({ error: String(err) });
  }
}

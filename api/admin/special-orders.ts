import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSpecialOrders, upsertSpecialOrder } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const orders = await getSpecialOrders();
      return json(res as any, { orders });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const order = await upsertSpecialOrder(req.body);
      return json(res as any, { order });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[Admin Special Orders Error]", err);
    return json(res as any, { error: "Internal server error" }, 500);
  }
}

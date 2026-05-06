import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPromoCodes, upsertPromoCode, deletePromoCode } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const promos = await getPromoCodes();
      return json(res as any, { promos });
    }

    if (req.method === "POST") {
      const promo = await upsertPromoCode(req.body);
      return json(res as any, { promo });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return json(res as any, { error: "Missing ID" }, 400);
      await deletePromoCode(id as string);
      return json(res as any, { success: true });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[Admin Promos Error]", err);
    return json(res as any, { error: "Internal server error" }, 500);
  }
}

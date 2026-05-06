import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStoreHours, upsertStoreHours } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const hours = await getStoreHours();
      return json(res as any, { hours });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const { hours } = body;
      if (!Array.isArray(hours)) return json(res as any, { error: "hours must be an array" }, 400);
      await upsertStoreHours(hours);
      return json(res as any, { success: true });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[admin/store-hours]", err);
    return json(res as any, { error: err.message || "Internal server error" }, 500);
  }
}

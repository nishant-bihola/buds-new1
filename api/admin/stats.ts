import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStats } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    const stats = await getStats();
    return json(res as any, stats);
  } catch (err: any) {
    console.error("[Admin Stats Error]", err);
    return json(res as any, { error: err.message }, 500);
  }
}

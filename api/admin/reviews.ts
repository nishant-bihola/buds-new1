import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, setConfig } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";
import { REVIEWS_DEFAULTS } from "../reviews.js";
import crypto from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    const stored = await getConfig("site.reviews").catch(() => null);
    const current: any[] = Array.isArray(stored) ? stored : [...REVIEWS_DEFAULTS];

    if (req.method === "GET") {
      return json(res as any, { reviews: current });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const review = { id: `r_${crypto.randomUUID().slice(0, 8)}`, active: true, ...body };
      const updated = [...current, review];
      await setConfig("site.reviews", updated);
      return json(res as any, { review, reviews: updated });
    }

    if (req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body.id) return json(res as any, { error: "Missing id" }, 400);
      const updated = current.map(r => r.id === body.id ? { ...r, ...body } : r);
      await setConfig("site.reviews", updated);
      return json(res as any, { reviews: updated });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return json(res as any, { error: "Missing id" }, 400);
      const updated = current.filter(r => r.id !== id);
      await setConfig("site.reviews", updated);
      return json(res as any, { success: true });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[admin/reviews]", err);
    return json(res as any, { error: err.message || "Internal server error" }, 500);
  }
}

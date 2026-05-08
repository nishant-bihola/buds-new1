import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPromoByCode } from "./_lib/db_ops.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
    const { code } = body;
    if (!code) return res.status(400).json({ error: "Missing promo code" });

    const promo = await getPromoByCode(String(code).trim().toUpperCase());
    if (!promo) return res.status(404).json({ error: "Invalid promo code" });
    if (!promo.active) return res.status(400).json({ error: "This promo code is no longer active" });
    if (promo.maxUses && promo.usageCount !== null && promo.usageCount >= promo.maxUses) {
      return res.status(400).json({ error: "This promo code has reached its usage limit" });
    }

    return res.status(200).json({ success: true, promo: { code: promo.code, discount: Number(promo.discount), type: promo.type } });
  } catch (err: any) {
    console.error("[Promos Error]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

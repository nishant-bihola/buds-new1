import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPromoByCode } from "../_lib/db_ops.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Missing code" });

    const promo = await getPromoByCode(code);

    if (!promo || !promo.active) {
      return res.status(404).json({ error: "Invalid or expired promo code" });
    }

    if (promo.maxUses && promo.usageCount >= promo.maxUses) {
      return res.status(400).json({ error: "Promo code has reached max uses" });
    }

    return res.status(200).json({ 
      success: true, 
      promo: {
        code: promo.code,
        discount: promo.discount,
        type: promo.type
      }
    });
  } catch (err: any) {
    console.error("[Promo Validation Error]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

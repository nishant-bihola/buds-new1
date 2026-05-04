import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPromoByCode } from "../_lib/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { code } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: "No code provided." });

  const promo = await getPromoByCode(code.trim().toUpperCase()).catch(() => null);
  if (!promo) return res.status(404).json({ valid: false, message: "Code not found or expired." });
  if (promo.max_uses && (promo.usage_count ?? 0) >= promo.max_uses) {
    return res.status(410).json({ valid: false, message: "This code has reached its usage limit." });
  }
  return res.json({ valid: true, code: promo.code, discount: promo.discount, type: promo.type });
}

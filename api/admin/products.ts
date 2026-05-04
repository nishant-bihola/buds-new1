import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProducts, upsertProduct, deleteProduct } from "../_lib/supabase.js";
import { requireAdmin, json, parseBody } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const products = await getProducts(true);
      return json(res as any, { products });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = await parseBody(req as any);
      const product = await upsertProduct(body);
      return json(res as any, { product });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing ID" });
      await deleteProduct(id as string);
      return json(res as any, { success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[Admin Products API Error]:", err);
    return res.status(500).json({ error: String(err) });
  }
}

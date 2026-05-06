import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProducts, upsertProduct, deleteProduct } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const products = await getProducts(true);
      return json(res as any, { products });
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const product = await upsertProduct(body);
      return json(res as any, { product });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return json(res as any, { error: "Missing ID" }, 400);
      await deleteProduct(id as string);
      return json(res as any, { success: true });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[Admin Products Error]", err);
    return json(res as any, { error: "Internal server error" }, 500);
  }
}

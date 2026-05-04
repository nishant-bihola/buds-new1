import { db } from "../../_lib/supabaseAdmin";
import { requireAdmin } from "../../_lib/adminAuth";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  const { id } = req.query;

  if (req.method === "PUT") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const update: any = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.price !== undefined) update.price = body.price;
    if (body.description !== undefined) update.description = body.description;
    if (body.image !== undefined) update.image = body.image;
    if (body.category !== undefined) update.category = body.category;
    if (body.isBestSeller !== undefined) update.is_best_seller = body.isBestSeller;
    if (body.inStock !== undefined) update.in_stock = body.inStock;
    if (body.sortOrder !== undefined) update.sort_order = body.sortOrder;

    const { data, error } = await db.from("products").update(update).eq("id", id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ product: data });
  }

  if (req.method === "DELETE") {
    // Soft delete — mark out of stock
    const { error } = await db.from("products").update({ in_stock: false }).eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).end();
}

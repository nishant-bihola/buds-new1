import { db } from "../../_lib/supabaseAdmin";
import { requireAdmin } from "../../_lib/adminAuth";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    const { data, error } = await db
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ products: (data ?? []).map(mapProduct) });
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { data, error } = await db.from("products").insert(toRow(body)).select().single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ product: mapProduct(data) });
  }

  return res.status(405).end();
}

function mapProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    description: p.description ?? "",
    category: p.category,
    isBestSeller: p.is_best_seller,
    inStock: p.in_stock,
    sortOrder: p.sort_order,
  };
}

function toRow(body: any) {
  return {
    id: body.id,
    name: body.name,
    price: body.price,
    image: body.image,
    description: body.description,
    category: body.category,
    is_best_seller: body.isBestSeller ?? false,
    in_stock: body.inStock ?? true,
    sort_order: body.sortOrder ?? 99,
  };
}

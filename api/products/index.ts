import { db } from "../_lib/supabaseAdmin";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

  const { category, limit = "50" } = req.query ?? {};

  let query = db
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("sort_order", { ascending: true })
    .limit(Number(limit));

  if (category && category !== "All") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[products]", error.message);
    return res.status(500).json({ error: "Failed to load products" });
  }

  const products = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    description: p.description ?? "",
    category: p.category,
    isBestSeller: p.is_best_seller,
    color: p.color ?? null,
    splashImage: p.splash_image ?? null,
    inStock: p.in_stock,
  }));

  return res.json({ products });
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProducts } from "./_lib/db_ops.js";
import { db } from "./_lib/db.js";
import { products as productsTable } from "./_lib/schema.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    // /api/products/:id — single product lookup
    const urlParts = (req.url ?? "").replace(/^\/api\/products\/?/, "").split("?");
    const idSegment = urlParts[0];
    if (idSegment) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      const result = await db.select().from(productsTable).where(eq(productsTable.id, idSegment));
      if (!result[0]) return res.status(404).json({ error: "Product not found" });
      return res.status(200).json({ product: result[0] });
    }

    // /api/products — list
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=3600");
    const { category, search, sort } = req.query;
    let allProducts = await getProducts(false);

    // Return distinct categories for the shop filter UI
    const categories = Array.from(
      new Set(allProducts.map(p => p.category).filter(Boolean))
    ).sort();

    let filtered = allProducts;
    if (category && category !== "All") {
      const catLower = String(category).toLowerCase().trim();
      filtered = filtered.filter(p => (p.category ?? "").toLowerCase().trim() === catLower);
    }
    if (search) { const s = String(search).toLowerCase(); filtered = filtered.filter(p => p.name.toLowerCase().includes(s)); }
    if (sort === "price-low") filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-high") filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else filtered.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    return res.status(200).json({ products: filtered, categories });
  } catch (err: any) {
    console.error("[Products API Error]:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}

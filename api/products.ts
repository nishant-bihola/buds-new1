import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProducts } from "./_lib/db_ops.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=3600");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { category, search, sort } = req.query;
    
    // Fetch products from Neon using our helper
    let products = await getProducts(false);

    // Apply filtering
    if (category && category !== "All") {
      products = products.filter(p => p.category === category);
    }

    if (search) {
      const s = String(search).toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(s));
    }

    // Sorting
    if (sort === "price-low") {
      products.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sort === "price-high") {
      products.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      products.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));
    }

    return res.status(200).json({ products });
  } catch (err: any) {
    console.error("[Products API Error]:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}

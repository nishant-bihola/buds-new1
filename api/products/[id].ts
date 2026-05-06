import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_lib/db.js";
import { products } from "../_lib/schema.js";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing product ID" });

  try {
    const result = await db.select().from(products).where(eq(products.id, id));
    if (!result[0]) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json({ product: result[0] });
  } catch (err: any) {
    console.error("[Product Detail Error]:", err);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchBarnetProducts, mapBarnetProductToBuds } from "../_lib/barnet.js";
import { db } from "../_lib/db.js";
import { products as productsTable } from "../_lib/schema.js";
import { requireAdmin, json } from "../_lib/auth.js";
import { sql } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("[Sync] Starting Barnet POS sync...");
    
    // 1. Fetch from Barnet
    const data = await fetchBarnetProducts();
    const barnetProducts = Array.isArray(data) ? data : (data.products || data.Products || []);
    
    if (!barnetProducts.length) {
      return json(res as any, { success: false, message: "No products found in Barnet response" });
    }

    // 2. Normalize data
    const normalized = barnetProducts.map((p: any) => {
      const mapped = mapBarnetProductToBuds(p);
      return {
        id: mapped.id,
        name: mapped.name,
        price: mapped.price,
        image: mapped.image,
        category: mapped.category,
        description: mapped.description,
        inStock: mapped.in_stock,
        source: "barnet",
        updatedAt: new Date(),
      };
    });

    // 3. Upsert into Neon (Postgres)
    // We use a transaction for safety
    await db.insert(productsTable)
      .values(normalized)
      .onConflictDoUpdate({
        target: productsTable.id,
        set: {
          name: sql`EXCLUDED.name`,
          price: sql`EXCLUDED.price`,
          image: sql`EXCLUDED.image`,
          category: sql`EXCLUDED.category`,
          description: sql`EXCLUDED.description`,
          inStock: sql`EXCLUDED.in_stock`,
          updatedAt: sql`EXCLUDED.updated_at`,
        }
      });

    return json(res as any, {
      success: true,
      message: `Successfully synced ${normalized.length} products from Barnet POS.`,
      count: normalized.length
    });

  } catch (err: any) {
    console.error("[Sync Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

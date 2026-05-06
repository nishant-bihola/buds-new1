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
    
    // Improved product detection logic
    let barnetProducts = [];
    if (Array.isArray(data)) {
      barnetProducts = data;
    } else if (data.products && Array.isArray(data.products)) {
      barnetProducts = data.products;
    } else if (data.Products && Array.isArray(data.Products)) {
      barnetProducts = data.Products;
    } else if (data.data && Array.isArray(data.data)) {
      barnetProducts = data.data; // Paginated fallback
    } else if (data.items && Array.isArray(data.items)) {
      barnetProducts = data.items;
    } else if (typeof data === 'object' && data !== null) {
      // If none of the above, try to find any array property
      const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
      if (arrayKey) barnetProducts = data[arrayKey];
    }
    
    if (!barnetProducts || !barnetProducts.length) {
      console.warn("[Sync] No products found in Barnet response keys:", Object.keys(data || {}));
      return json(res as any, { 
        success: false, 
        message: "No products found in Barnet response. Check your API settings or use 'Bulk Populate' as a fallback." 
      });
    }

    // 2. Normalize data and Deduplicate
    const seenIds = new Set();
    const normalized = [];
    
    for (const p of barnetProducts) {
      const mapped = mapBarnetProductToBuds(p);
      // Ensure we have a valid ID and haven't seen it yet in this batch
      if (mapped.id && !seenIds.has(mapped.id)) {
        seenIds.add(mapped.id);
        normalized.push({
          id: mapped.id,
          name: mapped.name,
          price: mapped.price,
          image: mapped.image,
          category: mapped.category,
          description: mapped.description,
          inStock: mapped.in_stock,
          source: "barnet",
          updatedAt: new Date(),
        });
      }
    }

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

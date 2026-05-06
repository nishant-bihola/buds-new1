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

    const barnetProducts = await fetchBarnetProducts();

    if (!barnetProducts.length) {
      return json(res as any, {
        success: false,
        message: "No products returned from Barnet POS. Verify your store_id and credentials.",
      });
    }

    const seenIds = new Set<string>();
    const normalized: any[] = [];

    for (const p of barnetProducts) {
      const mapped = mapBarnetProductToBuds(p);
      if (mapped.id && !seenIds.has(mapped.id)) {
        seenIds.add(mapped.id);
        normalized.push({
          id: mapped.id,
          name: mapped.name,
          price: mapped.price,
          image: mapped.image,
          category: mapped.category,
          description: mapped.description,
          brand: mapped.brand,
          thc: mapped.thc != null ? String(mapped.thc) : null,
          cbd: mapped.cbd != null ? String(mapped.cbd) : null,
          inStock: mapped.in_stock,
          source: "barnet",
          updatedAt: new Date(),
        });
      }
    }

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
          brand: sql`EXCLUDED.brand`,
          thc: sql`EXCLUDED.thc`,
          cbd: sql`EXCLUDED.cbd`,
          inStock: sql`EXCLUDED.in_stock`,
          updatedAt: sql`EXCLUDED.updated_at`,
        },
      });

    return json(res as any, {
      success: true,
      message: `Synced ${normalized.length} products from Barnet POS.`,
      count: normalized.length,
    });

  } catch (err: any) {
    console.error("[Sync Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

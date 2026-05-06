import type { VercelRequest, VercelResponse } from "@vercel/node";
import { upsertProduct } from "../_lib/db_ops.js";
import { requireAdmin, json } from "../_lib/auth.js";
import fs from "fs";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    const csvPath = path.join(process.cwd(), "inventory_template.csv");
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: "Inventory template not found on server." });
    }

    const content = fs.readFileSync(csvPath, "utf-8");
    const [headers, ...rows] = content.split("\n").filter(r => r.trim());
    const headerKeys = headers.split(",").map(h => h.trim());

    let count = 0;
    for (const row of rows) {
      const values = row.match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, "").trim()) || [];
      const product: any = {};
      headerKeys.forEach((key, i) => { product[key] = values[i]; });
      
      if (product.id && product.name) {
        await upsertProduct({
          ...product,
          price: Number(product.price) || 0,
          inStock: product.inStock === "true" || product.inStock === true,
          updatedAt: new Date(),
        });
        count++;
      }
    }

    return json(res as any, { 
      success: true, 
      message: `Bulk import successful. ${count} products synchronized.` 
    });
  } catch (err: any) {
    console.error("[Bulk Import Error]", err);
    return res.status(500).json({ error: err.message });
  }
}

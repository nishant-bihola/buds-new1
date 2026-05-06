import type { VercelRequest, VercelResponse } from "@vercel/node";
import { rebuildCustomersFromOrders } from "../_lib/db_ops.js";
import { requireAdmin, json } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  
  if (!requireAdmin(req as any, res as any)) return;

  try {
    const count = await rebuildCustomersFromOrders();
    return json(res as any, { 
      success: true, 
      message: `Successfully synchronized ${count} customer profiles from order history.` 
    });
  } catch (err: any) {
    console.error("[Sync Customers Error]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCustomers } from "../_lib/db_ops.js";
import { requireAdmin, json } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  
  // High-security gate using shared auth lib
  if (!requireAdmin(req as any, res as any)) return;

  try {
    // Pull real-time data from the 'customers' table 
    // This table is automatically populated by api/orders.ts
    const customers = await getCustomers();
    
    return json(res as any, { 
      success: true,
      count: customers.length,
      customers 
    });
  } catch (err: any) {
    console.error("[Admin Customers API Error]:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to retrieve shopper intelligence data." 
    });
  }
}

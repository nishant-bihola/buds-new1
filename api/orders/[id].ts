import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrderById } from "../_lib/db_ops.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing order ID" });

    const order = await getOrderById(id as string);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    return res.status(200).json({ order });
  } catch (err: any) {
    console.error("[Order Detail Error]", err);
    return res.status(500).json({ error: "Failed to fetch order details" });
  }
}

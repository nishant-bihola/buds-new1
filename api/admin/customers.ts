import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCustomers } from "../_lib/db_ops.js";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "budnbuddies2026";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = req.headers.authorization ?? "";
  if (auth !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const customers = await getCustomers();
    return res.status(200).json({ customers });
  } catch (err: any) {
    console.error("[Admin Customers Error]", err);
    return res.status(500).json({ error: err.message });
  }
}

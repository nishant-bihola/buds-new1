import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCustomers } from "./_lib/supabase.js";
import { requireAdmin } from "./_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAdmin(req as any, res as any)) return;
  const customers = await getCustomers();
  return res.json({ customers });
}

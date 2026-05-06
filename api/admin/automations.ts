import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAutomations, updateAutomation } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const data = await getAutomations();
      return json(res as any, { automations: data });
    }
    
    if (req.method === "POST") {
      const { key, enabled } = req.body;
      if (!key) return json(res as any, { error: "Key required" }, 400);
      await updateAutomation(key, !!enabled);
      return json(res as any, { success: true });
    }

    return res.status(405).end();
  } catch (err: any) {
    return json(res as any, { error: err.message }, 500);
  }
}

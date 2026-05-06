import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuditLogs } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const logs = await getAuditLogs();
      return json(res as any, { logs });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[Admin Audit Logs Error]", err);
    return json(res as any, { error: err.message }, 500);
  }
}

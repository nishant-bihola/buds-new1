import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, setConfig } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";
import { STORE_DEFAULTS } from "../store.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const stored = await getConfig("store.info").catch(() => null);
      const info = stored ? { ...STORE_DEFAULTS, ...stored } : { ...STORE_DEFAULTS };
      return json(res as any, { store: info });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const merged = { ...STORE_DEFAULTS, ...body };
      await setConfig("store.info", merged);
      return json(res as any, { store: merged });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[admin/store]", err);
    return json(res as any, { error: err.message || "Internal server error" }, 500);
  }
}

import { db } from "../_lib/supabaseAdmin";
import { requireAdmin } from "../_lib/adminAuth";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    const { data, error } = await db.from("automation_settings").select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ settings: data ?? [] });
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { key, enabled } = body ?? {};
    if (!key) return res.status(400).json({ error: "key required" });
    const { error } = await db
      .from("automation_settings")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true });
  }

  return res.status(405).end();
}

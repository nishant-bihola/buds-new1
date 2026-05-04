import { db } from "../_lib/supabaseAdmin";

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { sessionKey, email, phone, name, items, total } = body ?? {};

  if (!sessionKey || !items?.length) return res.json({ ok: true });

  await db.from("abandoned_carts").upsert(
    {
      session_key: sessionKey,
      email: email || null,
      phone: phone || null,
      name: name || null,
      items,
      total: total ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "session_key" }
  );

  return res.json({ ok: true });
}

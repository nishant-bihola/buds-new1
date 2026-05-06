import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  // Silently acknowledge — cart tracking is best-effort only
  // In a future iteration this can write to an abandoned_carts table
  const { sessionKey, items, total } = req.body ?? {};
  if (!sessionKey) return res.status(400).json({ error: "Missing sessionKey" });

  console.log(`[Cart Track] session=${sessionKey} items=${items?.length ?? 0} total=${total}`);

  return res.status(200).json({ ok: true });
}

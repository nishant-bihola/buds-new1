import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  return res.status(501).json({ error: "Barnet POS sync has been disabled. Use manual inventory management instead." });
}

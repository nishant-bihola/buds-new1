import type { VercelRequest, VercelResponse } from "@vercel/node";
import { json } from "../_lib/auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { secret } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return json(res, { error: "Invalid credentials" }, 401);
    }

    return json(res, { success: true });
  } catch (err) {
    return json(res, { error: "Internal server error" }, 500);
  }
}

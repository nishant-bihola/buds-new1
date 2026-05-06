import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig, setConfig } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";
import { CONTENT_DEFAULTS } from "../content.js";

const SECTIONS = ["hero", "brand", "perks", "story", "about", "delivery"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const content: Record<string, any> = {};
      for (const section of SECTIONS) {
        const stored = await getConfig(`content.${section}`).catch(() => null);
        content[section] = stored
          ? { ...CONTENT_DEFAULTS[section as keyof typeof CONTENT_DEFAULTS], ...stored }
          : { ...CONTENT_DEFAULTS[section as keyof typeof CONTENT_DEFAULTS] };
      }
      return json(res as any, { content });
    }

    if (req.method === "POST") {
      const { section, data } = req.body;
      if (!section || !SECTIONS.includes(section)) return json(res as any, { error: "Invalid section" }, 400);
      await setConfig(`content.${section}`, data);
      return json(res as any, { success: true });
    }

    return res.status(405).end();
  } catch (err: any) {
    console.error("[Admin Content Error]", err);
    return json(res as any, { error: "Internal server error" }, 500);
  }
}

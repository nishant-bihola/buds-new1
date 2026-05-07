import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig } from "./_lib/db_ops.js";

export const STORE_DEFAULTS = {
  name: "Bud N' Buddies",
  address: "130-75 Salisbury Way, Sherwood Park, AB T8B 1K4",
  addressShort: "130-75 Salisbury Way, Sherwood Park, AB",
  phone: "(825) 218-8234",
  phoneDial: "+18252188234",
  hours: "Open Every Day · Until 2:00 AM",
  hoursShort: "Open Until 2AM",
  googleMapsUrl: "https://maps.google.com/?q=130-75+Salisbury+Way+Sherwood+Park+AB",
  instagram: "",
  twitter: "",
  facebook: "",
  email: "",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  if (req.method !== "GET") return res.status(405).end();

  try {
    const stored = await getConfig("store.info").catch(() => null);
    const info = stored ? { ...STORE_DEFAULTS, ...(stored as object) } : { ...STORE_DEFAULTS };
    return res.status(200).json({ store: info });
  } catch (err: any) {
    return res.status(200).json({ store: STORE_DEFAULTS });
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig } from "./_lib/db_ops.js";

export const REVIEWS_DEFAULTS = [
  { id: "r1", name: "Nishant Bihola", blurb: "EXCELLENT SERVICE", quote: "Love the service wait till the new reworked website!", active: true },
  { id: "r2", name: "Joban Dhami", blurb: "CUTTING EDGE", quote: "If you're looking for the cutting edge of customer service, quality product, and accessibility, Bud and buddies is your one stop shop.", active: true },
  { id: "r3", name: "Kevin", blurb: "EXCELLENT STORE", quote: "Excellent store with great prices! Go see Gagan, who I call the Guru of Ganga, for can't miss recommendations.", active: true },
  { id: "r4", name: "SP", blurb: "BEST DISPENSARY", quote: "I have been going to weed dispensaries since legalization first happened, and I can honestly say that this has been the best one!", active: true },
  { id: "r5", name: "Victoria Ouellette", blurb: "HIGHLY RECOMMEND", quote: "The staff are genuinely some of the kindest people i've met, they are always trying to find the perfect match.", active: true },
  { id: "r6", name: "Gaganjot Singh", blurb: "GREATEST VIBES", quote: "Best prices in Sherwood park area and very helpful and knowledgeable staff always ready to help.", active: true },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  if (req.method !== "GET") return res.status(405).end();

  try {
    const stored = await getConfig("site.reviews").catch(() => null);
    const reviews = Array.isArray(stored) ? stored : REVIEWS_DEFAULTS;
    return res.status(200).json({ reviews: reviews.filter((r: any) => r.active !== false) });
  } catch {
    return res.status(200).json({ reviews: REVIEWS_DEFAULTS });
  }
}

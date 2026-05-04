import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProducts } from "./_lib/supabase";
import { INITIAL_PRODUCTS } from "../src/constants";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const products = await getProducts(false);
    if (products && products.length > 0) {
      return res.json({ products });
    }
  } catch (err) {
    console.error("Supabase fetch failed, falling back to local data:", err);
  }
  
  // 100% Parity Fallback: Return the local db.json equivalent
  return res.json({ products: INITIAL_PRODUCTS });
}

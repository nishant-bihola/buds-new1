import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Industry-standard Supabase initialization with failsafe
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const INITIAL_PRODUCTS = [
  { id: "flower-01", name: "Nano Banana Kush", price: 35.00, image: "/images/nano_banana_kush.png", category: "Dried Flower" },
  { id: "flower-02", name: "Island Pink Kush", price: 32.00, image: "/images/island_pink_kush.png", category: "Dried Flower" },
  { id: "vape-01", name: "High Voltage HTFSE Cartridge", price: 45.00, image: "/images/high_voltage_vape.png", category: "Vape" },
  { id: "edible-01", name: "Sour Peach Rings", price: 19.99, image: "/images/sour_peach_rings.png", category: "Edible" }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set high-performance caching headers
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=3600");

  try {
    const { category, search, sort } = req.query;
    
    if (!supabase) {
      console.warn("Supabase not configured, using fallback products.");
      return res.json({ products: filterFallback(INITIAL_PRODUCTS, category, search) });
    }

    let query = supabase.from("products").select("*").eq("active", true);

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Advanced sorting logic
    const sortConfig = {
      "price-low": { col: "price", asc: true },
      "price-high": { col: "price", asc: false },
      "newest": { col: "created_at", asc: false }
    };

    const config = sortConfig[sort as keyof typeof sortConfig] || sortConfig.newest;
    query = query.order(config.col, { ascending: config.asc });

    const { data: products, error } = await query.limit(50);

    if (error) throw error;

    if (products && products.length > 0) {
      return res.status(200).json({ products });
    }
    
    return res.status(200).json({ products: filterFallback(INITIAL_PRODUCTS, category, search) });
  } catch (err) {
    console.error("[Products API Error]:", err);
    return res.status(200).json({ 
      products: filterFallback(INITIAL_PRODUCTS, req.query.category, req.query.search),
      error: process.env.NODE_ENV === "development" ? String(err) : undefined
    });
  }
}

function filterFallback(items: typeof INITIAL_PRODUCTS, category: any, search: any) {
  let filtered = [...items];
  if (category && category !== "All") {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s));
  }
  return filtered;
}

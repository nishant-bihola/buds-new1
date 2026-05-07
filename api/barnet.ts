import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, json, cors } from "./_lib/auth.js";
import { upsertProduct, getProducts, deleteProduct } from "./_lib/db_ops.js";

const BARNET_BASE = (process.env.BARNET_API_URL || "http://budnbuddies.barnetportal.com/ht")
  .replace(/^http:\/\//, "https://"); // always use HTTPS
const BARNET_KEY = process.env.BARNET_API_KEY || "";
const BARNET_PASS = process.env.BARNET_API_PASS || "";
const BARNET_STORE_ID = parseInt(process.env.BARNET_STORE_ID || "5", 10);

function basicAuth(): string {
  return "Basic " + Buffer.from(`${BARNET_KEY}:${BARNET_PASS}`).toString("base64");
}

async function barnetFetch(path: string): Promise<any> {
  // BARNET_BASE = "http://budnbuddies.barnetportal.com/ht"
  // API docs: endpoint is at /ht/swagger/products
  const base = BARNET_BASE.replace(/\/$/, "");
  const url = `${base}/swagger${path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Barnet ${path} → ${res.status}`);
  return res.json();
}

function normalizeCategory(raw: string): string {
  const s = (raw || "").toLowerCase().trim();
  if (s.includes("flower") || s.includes("bud") || s.includes("cannabis") && !s.includes("oil")) return "Dried Flower";
  if (s.includes("pre-roll") || s.includes("preroll") || s.includes("pre roll") || s.includes("joint") || s.includes("blunt")) return "Pre-Roll";
  if (s.includes("vape") || s.includes("cartridge") || s.includes("disposable") || s.includes("pen")) return "Vape";
  if (s.includes("edible") || s.includes("gummy") || s.includes("chocolate") || s.includes("candy") || s.includes("cookie") || s.includes("brownie")) return "Edible";
  if (s.includes("beverage") || s.includes("drink") || s.includes("soda") || s.includes("tea") || s.includes("water")) return "Beverage";
  if (s.includes("extract") || s.includes("concentrate") || s.includes("shatter") || s.includes("wax") || s.includes("rosin") || s.includes("resin") || s.includes("hash") || s.includes("oil")) return "Extract";
  if (s.includes("accessory") || s.includes("accessories") || s.includes("gear") || s.includes("device") || s.includes("pipe") || s.includes("paper")) return "Accessories";
  if (s.includes("topical") || s.includes("cream") || s.includes("lotion") || s.includes("patch")) return "Topical";
  if (s.includes("capsule") || s.includes("pill") || s.includes("tablet") || s.includes("tincture") || s.includes("drop") || s.includes("spray")) return "Capsule";
  return raw || "Other";
}

function mapBarnetProduct(item: any): any {
  const variations = Array.isArray(item.variations) ? item.variations : [];
  const variation = variations[0] ?? null;

  // Price — use price1 (regular), fall back to price2 (member)
  const price = parseFloat(variation?.price1 ?? variation?.price2 ?? variation?.price ?? 0) || 0;

  // Stock — check quantityStatus from variation
  const qStatus = variation?.quantityStatus?.quantityName ?? "";
  const inStock = qStatus === "In Stock" || qStatus === "Available" || price > 0;

  // Weight from variation displayname (e.g. "0.5g", "3.5g")
  const weight = variation?.displayname ?? variation?.unit ?? variation?.name ?? "";

  // THC/CBD from variation
  const thcRaw = parseFloat(variation?.thc_percent ?? variation?.thc ?? 0);
  const cbdRaw = parseFloat(variation?.cbd_percent ?? variation?.cbd ?? 0);
  const thc = thcRaw > 0 ? `${thcRaw}%` : "";
  const cbd = cbdRaw > 0 ? `${cbdRaw}%` : "";

  // Images
  const thumbs = item.thumbs && typeof item.thumbs === "object" ? item.thumbs : {};
  const imageArr = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  const image = thumbs["320"] || thumbs["540"] || thumbs["140"] || imageArr[0] || "";

  // Full SKU name from description, display name from productName
  // Use description as the full product name (e.g. "1964 Comatose FSE Resin 0.5g Disposable Vape")
  const name = item.description || item.productName || "";

  // Rich description from product_info
  const description = item.product_info || "";

  // Terpenes as comma string
  const terpenes = Array.isArray(item.terpenes) ? item.terpenes.filter(Boolean).join(", ") : "";

  return {
    id: `barnet_${item.productId}`,
    name,
    price,
    image: typeof image === "string" ? image : "",
    category: normalizeCategory(item.category || item.productType || item.type || ""),
    description: description + (terpenes ? `\n\nTerpenes: ${terpenes}` : ""),
    thc,
    cbd,
    brand: item.brandname || "",
    weight,
    strain: item.species || "",
    inStock,
    quantity: 0, // Barnet hides exact quantity, just tracks in/out of stock
    isBestSeller: item.favorite === true,
    sortOrder: 0,
    source: "barnet",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  const action = (req.query._path as string) || "";

  // GET /api/barnet/preview — fetch from Barnet without saving
  if (action === "preview" && req.method === "GET") {
    try {
      const data = await barnetFetch(`/products?store_id=${BARNET_STORE_ID}&page_size=200`);
      const items = (data.items || []).map(mapBarnetProduct);
      return json(res as any, { products: items, total: data.paginator?.items_count ?? items.length });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 502);
    }
  }

  // POST /api/barnet/sync — fetch from Barnet and upsert into DB
  if (action === "sync" && req.method === "POST") {
    try {
      const { removeStale = false } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});

      let page = 1;
      const pageSize = 200;
      let allItems: any[] = [];
      let totalPages = 1;

      do {
        const data = await barnetFetch(
          `/products?store_id=${BARNET_STORE_ID}&page_size=${pageSize}&page=${page}`
        );
        const items: any[] = data.items || [];
        allItems = allItems.concat(items);
        totalPages = data.paginator?.pages ?? 1;
        page++;
      } while (page <= totalPages);

      const mapped = allItems.map(mapBarnetProduct);
      const results = { synced: 0, errors: 0, removed: 0 };

      for (const product of mapped) {
        try {
          await upsertProduct(product);
          results.synced++;
        } catch {
          results.errors++;
        }
      }

      // Optionally remove products in DB that are no longer in Barnet
      if (removeStale) {
        const barnetIds = new Set(mapped.map((p) => p.id));
        const existing = await getProducts(true);
        for (const p of existing) {
          if ((p as any).source === "barnet" && !barnetIds.has((p as any).id)) {
            await deleteProduct((p as any).id).catch(() => {});
            results.removed++;
          }
        }
      }

      return json(res as any, { success: true, ...results });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 502);
    }
  }

  return json(res as any, { error: "Not found" }, 404);
}

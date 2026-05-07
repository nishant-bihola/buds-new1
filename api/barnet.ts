import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, json, cors } from "./_lib/auth.js";
import { upsertProduct, getProducts, deleteProduct } from "./_lib/db_ops.js";

const BARNET_BASE = (process.env.BARNET_API_URL || "http://budnbuddies.barnetportal.com/ht")
  .replace(/^http:\/\//, "https://"); // always use HTTPS
const BARNET_KEY = process.env.BARNET_API_KEY || "";
const BARNET_PASS = process.env.BARNET_API_PASS || "";
const BARNET_STORE_ID = parseInt(process.env.BARNET_STORE_ID || "1", 10);

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

function mapBarnetProduct(item: any): any {
  // Pick the first variation price, fallback to 0
  const variation = Array.isArray(item.variations) ? item.variations[0] : null;
  const price = variation?.price ?? item.price ?? 0;
  const quantity = variation?.on_hand ?? item.on_hand ?? 0;
  const weight = variation?.unit ?? variation?.name ?? "";

  // Build THC/CBD display string
  const thc = item.thc_percent
    ? `${item.thc_percent}%`
    : item.thc
    ? `${item.thc}mg`
    : "";
  const cbd = item.cbd_percent
    ? `${item.cbd_percent}%`
    : item.cbd
    ? `${item.cbd}mg`
    : "";

  // Pick best image
  const image =
    item.thumbs?.["320"] ||
    item.thumbs?.["140"] ||
    (Array.isArray(item.images) && item.images[0]) ||
    "";

  return {
    id: `barnet_${item.productId}`,
    name: item.productName || "",
    price: parseFloat(price) || 0,
    image: typeof image === "string" ? image : "",
    category: item.category || "",
    description: item.description || "",
    thc,
    cbd,
    brand: item.brandname || "",
    weight,
    strain: item.species || "",
    inStock: quantity > 0,
    quantity: parseInt(quantity, 10) || 0,
    isBestSeller: false,
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
      const data = await barnetFetch(`/products?store_id=${BARNET_STORE_ID}&on_hand=True&page_size=200`);
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
          `/products?store_id=${BARNET_STORE_ID}&on_hand=True&page_size=${pageSize}&page=${page}`
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

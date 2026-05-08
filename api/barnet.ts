import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, json, cors } from "./_lib/auth.js";
import { upsertProduct, getProducts, deleteProduct } from "./_lib/db_ops.js";
import { db } from "./_lib/db.js";
import * as schema from "./_lib/schema.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const BARNET_BASE = (process.env.BARNET_API_URL || "http://budnbuddies.barnetportal.com/ht")
  .replace(/^http:\/\//, "https://");
const BARNET_KEY      = process.env.BARNET_API_KEY  || "";
const BARNET_PASS     = process.env.BARNET_API_PASS || "";
const BARNET_STORE_ID = parseInt(process.env.BARNET_STORE_ID || "5", 10);

function basicAuth(): string {
  return "Basic " + Buffer.from(`${BARNET_KEY}:${BARNET_PASS}`).toString("base64");
}

async function barnetFetch(path: string): Promise<any> {
  const base = BARNET_BASE.replace(/\/$/, "");
  const url = `${base}/swagger${path}`;
  const res = await fetch(url, {
    headers: { Authorization: basicAuth(), "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Barnet ${path} → ${res.status}`);
  return res.json();
}

function normalizeCategory(raw: string): string {
  const s = (raw || "").toLowerCase().trim();
  if (s.includes("flower") || s.includes("bud") || (s.includes("cannabis") && !s.includes("oil"))) return "Dried Flower";
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
  const variation  = variations[0] ?? null;
  const price      = parseFloat(variation?.price1 ?? variation?.price2 ?? variation?.price ?? 0) || 0;
  const qStatus    = variation?.quantityStatus?.quantityName ?? "";
  const inStock    = qStatus === "In Stock" || qStatus === "Available" || price > 0;
  const weight     = variation?.displayname ?? variation?.unit ?? variation?.name ?? "";
  const thcRaw     = parseFloat(variation?.thc_percent ?? variation?.thc ?? 0);
  const cbdRaw     = parseFloat(variation?.cbd_percent ?? variation?.cbd ?? 0);
  const thc        = thcRaw > 0 ? `${thcRaw}%` : "";
  const cbd        = cbdRaw > 0 ? `${cbdRaw}%` : "";
  const thumbs     = item.thumbs && typeof item.thumbs === "object" ? item.thumbs : {};
  const imageArr   = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  const image      = thumbs["320"] || thumbs["540"] || thumbs["140"] || imageArr[0] || "";
  const name       = item.description || item.productName || "";
  const description = item.product_info || "";
  const terpenes   = Array.isArray(item.terpenes) ? item.terpenes.filter(Boolean).join(", ") : "";

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
    quantity: 0,
    isBestSeller: item.favorite === true,
    sortOrder: 0,
    source: "barnet",
    _raw: item, // include raw for detail view
  };
}

// ── Config helpers (use config table for key/value storage) ──────────────────
async function getConfig(key: string): Promise<any> {
  const rows = await db.select().from(schema.config).where(eq(schema.config.key, key));
  return rows[0]?.value ?? null;
}

async function setConfig(key: string, value: any) {
  await db.insert(schema.config)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.config.key, set: { value, updatedAt: new Date() } });
}

// ── Full sync helper (shared by sync + auto-sync) ────────────────────────────
async function runSync(removeStale = false, triggerSource = "manual"): Promise<{ synced: number; errors: number; removed: number; timestamp: string; source: string }> {
  let page = 1;
  const pageSize = 200;
  let allItems: any[] = [];
  let totalPages = 1;

  do {
    const data = await barnetFetch(`/products?store_id=${BARNET_STORE_ID}&page_size=${pageSize}&page=${page}`);
    const items: any[] = data.items || [];
    allItems = allItems.concat(items);
    totalPages = data.paginator?.pages ?? 1;
    page++;
  } while (page <= totalPages);

  // Apply any saved category/price overrides before upserting
  const overrides: Record<string, any> = (await getConfig("barnet_overrides")) ?? {};
  const mapped = allItems.map(item => {
    const product = mapBarnetProduct(item);
    const ov = overrides[product.id];
    if (ov) {
      if (ov.category) product.category = ov.category;
      if (ov.price !== undefined) product.price = ov.price;
      if (ov.isBestSeller !== undefined) product.isBestSeller = ov.isBestSeller;
    }
    return product;
  });

  const results = { synced: 0, errors: 0, removed: 0 };
  for (const product of mapped) {
    const { _raw: _, ...clean } = product; // strip _raw before saving
    try {
      await upsertProduct(clean);
      results.synced++;
    } catch {
      results.errors++;
    }
  }

  if (removeStale) {
    const barnetIds = new Set(mapped.map(p => p.id));
    const existing  = await getProducts(true);
    for (const p of existing) {
      if ((p as any).source === "barnet" && !barnetIds.has((p as any).id)) {
        await deleteProduct((p as any).id).catch(() => {});
        results.removed++;
      }
    }
  }

  const timestamp = new Date().toISOString();

  // Persist sync log
  const history: any[] = (await getConfig("barnet_sync_history")) ?? [];
  history.unshift({ ...results, timestamp, source: triggerSource });
  if (history.length > 50) history.splice(50);
  await setConfig("barnet_sync_history", history);
  await setConfig("barnet_last_sync", { timestamp, ...results, source: triggerSource });

  return { ...results, timestamp, source: triggerSource };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  const action = (req.query._path as string) || "";
  const body   = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});

  // ── GET /api/barnet/preview ─────────────────────────────────────────────
  if (action === "preview" && req.method === "GET") {
    try {
      const data  = await barnetFetch(`/products?store_id=${BARNET_STORE_ID}&page_size=200`);
      const items = (data.items || []).map(mapBarnetProduct);
      return json(res as any, { products: items, total: data.paginator?.items_count ?? items.length });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 502);
    }
  }

  // ── POST /api/barnet/sync ───────────────────────────────────────────────
  if (action === "sync" && req.method === "POST") {
    try {
      const { removeStale = false } = body;
      const result = await runSync(removeStale, "manual");
      return json(res as any, { success: true, ...result });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 502);
    }
  }

  // ── GET /api/barnet/status ─ last sync info + auto-sync config ──────────
  if (action === "status" && req.method === "GET") {
    try {
      const lastSync    = await getConfig("barnet_last_sync");
      const history     = await getConfig("barnet_sync_history") ?? [];
      const autoSync    = await getConfig("barnet_auto_sync") ?? { enabled: false, intervalHours: 6 };
      const overrides   = await getConfig("barnet_overrides") ?? {};
      return json(res as any, { lastSync, history, autoSync, overrideCount: Object.keys(overrides).length });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 500);
    }
  }

  // ── POST /api/barnet/auto-sync ─ enable/disable + set interval ──────────
  if (action === "auto-sync" && req.method === "POST") {
    try {
      const { enabled, intervalHours = 6 } = body;
      await setConfig("barnet_auto_sync", { enabled: !!enabled, intervalHours: Number(intervalHours) });
      return json(res as any, { success: true, enabled: !!enabled, intervalHours });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 500);
    }
  }

  // ── POST /api/barnet/override ─ set price/category/bestSeller override ───
  // Body: { productId, category?, price?, isBestSeller?, clear? }
  if (action === "override" && req.method === "POST") {
    try {
      const { productId, category, price, isBestSeller, clear } = body;
      if (!productId) return json(res as any, { error: "productId required" }, 400);

      const overrides: Record<string, any> = (await getConfig("barnet_overrides")) ?? {};

      if (clear) {
        delete overrides[productId];
      } else {
        overrides[productId] = {
          ...(overrides[productId] ?? {}),
          ...(category     !== undefined ? { category }     : {}),
          ...(price        !== undefined ? { price: Number(price) } : {}),
          ...(isBestSeller !== undefined ? { isBestSeller: !!isBestSeller } : {}),
        };
      }

      await setConfig("barnet_overrides", overrides);

      // Apply override immediately to the product in DB if it exists
      const patch: any = {};
      if (!clear) {
        if (category     !== undefined) patch.category     = category;
        if (price        !== undefined) patch.price        = Number(price);
        if (isBestSeller !== undefined) patch.isBestSeller = !!isBestSeller;
      }
      if (Object.keys(patch).length) {
        await db.update(schema.products).set(patch).where(eq(schema.products.id, productId));
      }

      return json(res as any, { success: true, overrides });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 500);
    }
  }

  // ── GET /api/barnet/overrides ─ list all saved overrides ────────────────
  if (action === "overrides" && req.method === "GET") {
    try {
      const overrides = await getConfig("barnet_overrides") ?? {};
      return json(res as any, { overrides });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 500);
    }
  }

  // ── POST /api/barnet/bulk ─ bulk best-seller, stock toggle, delete ───────
  // Body: { action: "bestSeller"|"toggleStock"|"delete", ids: string[], value?: boolean }
  if (action === "bulk" && req.method === "POST") {
    try {
      const { action: bulkAction, ids, value } = body;
      if (!Array.isArray(ids) || !ids.length) return json(res as any, { error: "ids required" }, 400);

      let affected = 0;
      for (const id of ids) {
        try {
          if (bulkAction === "bestSeller") {
            await db.update(schema.products).set({ isBestSeller: !!value }).where(eq(schema.products.id, id));
            affected++;
          } else if (bulkAction === "toggleStock") {
            await db.update(schema.products).set({ inStock: !!value }).where(eq(schema.products.id, id));
            affected++;
          } else if (bulkAction === "delete") {
            await deleteProduct(id);
            affected++;
          }
        } catch { /* skip individual failures */ }
      }

      return json(res as any, { success: true, affected });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 500);
    }
  }

  // ── GET /api/barnet/stock-alerts ─ products low/out of stock ────────────
  if (action === "stock-alerts" && req.method === "GET") {
    try {
      const all     = await getProducts(true);
      const barnet  = all.filter((p: any) => p.source === "barnet");
      const outOfStock = barnet.filter((p: any) => !p.inStock);
      return json(res as any, { outOfStock, total: barnet.length, outCount: outOfStock.length });
    } catch (err: any) {
      return json(res as any, { error: err.message }, 500);
    }
  }

  return json(res as any, { error: "Not found" }, 404);
}

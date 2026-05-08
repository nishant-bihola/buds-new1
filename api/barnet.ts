import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, json, cors } from "./_lib/auth.js";
import { upsertProduct, getProducts, deleteProduct, logStockChange } from "./_lib/db_ops.js";
import { db } from "./_lib/db.js";
import * as schema from "./_lib/schema.js";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

const BARNET_BASE     = (process.env.BARNET_API_URL || "http://budnbuddies.barnetportal.com/ht").replace(/^http:\/\//, "https://");
const BARNET_KEY      = process.env.BARNET_API_KEY  || "";
const BARNET_PASS     = process.env.BARNET_API_PASS || "";
const BARNET_STORE_ID = parseInt(process.env.BARNET_STORE_ID || "5", 10);

function basicAuth() { return "Basic " + Buffer.from(`${BARNET_KEY}:${BARNET_PASS}`).toString("base64"); }

async function barnetFetch(path: string): Promise<any> {
  const url = `${BARNET_BASE.replace(/\/$/, "")}/swagger${path}`;
  const res = await fetch(url, { headers: { Authorization: basicAuth(), "Content-Type": "application/json" } });
  if (!res.ok) throw new Error(`Barnet ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

// ── Category normalizer ─────────────────────────────────────────────────────
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

// ── Full product mapper (includes all variation data) ───────────────────────
function mapBarnetProduct(item: any, includeVariations = false): any {
  const variations  = Array.isArray(item.variations) ? item.variations : [];
  const variation   = variations[0] ?? null;
  const price       = parseFloat(variation?.price1 ?? variation?.price2 ?? variation?.price ?? 0) || 0;
  const memberPrice = parseFloat(variation?.price2 ?? variation?.price1 ?? 0) || 0;
  const qStatus     = variation?.quantityStatus?.quantityName ?? "";
  const inStock     = qStatus === "In Stock" || qStatus === "Available" || price > 0;
  const weight      = variation?.displayname ?? variation?.unit ?? variation?.name ?? "";
  const thcRaw      = parseFloat(variation?.thc_percent ?? variation?.thc ?? 0);
  const cbdRaw      = parseFloat(variation?.cbd_percent ?? variation?.cbd ?? 0);
  const thumbs      = item.thumbs && typeof item.thumbs === "object" ? item.thumbs : {};
  const imageArr    = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  const image       = thumbs["320"] || thumbs["540"] || thumbs["140"] || imageArr[0] || "";
  const terpenes    = Array.isArray(item.terpenes) ? item.terpenes.filter(Boolean).join(", ") : "";

  const mapped: any = {
    id:          `barnet_${item.productId}`,
    barnetId:    item.productId,
    name:        item.description || item.productName || "",
    price,
    memberPrice: memberPrice !== price ? memberPrice : null,
    image:       typeof image === "string" ? image : "",
    images:      imageArr.slice(0, 4),
    category:    normalizeCategory(item.category || item.productType || item.type || ""),
    rawCategory: item.category || item.productType || item.type || "",
    description: (item.product_info || "") + (terpenes ? `\n\nTerpenes: ${terpenes}` : ""),
    thc:         thcRaw > 0 ? `${thcRaw}%` : "",
    cbd:         cbdRaw > 0 ? `${cbdRaw}%` : "",
    brand:       item.brandname || "",
    weight,
    strain:      item.species || "",
    inStock,
    quantity:    0,
    isBestSeller: item.favorite === true,
    sortOrder:   0,
    source:      "barnet",
    terpenes,
    sku:         item.sku || variation?.sku || "",
  };

  if (includeVariations) {
    mapped.variations = variations.map((v: any) => ({
      name:         v.displayname || v.name || "",
      sku:          v.sku || "",
      price1:       parseFloat(v.price1 ?? 0) || 0,
      price2:       parseFloat(v.price2 ?? 0) || 0,
      thc:          parseFloat(v.thc_percent ?? v.thc ?? 0) || 0,
      cbd:          parseFloat(v.cbd_percent ?? v.cbd ?? 0) || 0,
      inStock:      v.quantityStatus?.quantityName === "In Stock" || v.quantityStatus?.quantityName === "Available",
      quantityName: v.quantityStatus?.quantityName ?? "",
    }));
  }

  return mapped;
}

// ── Config store ────────────────────────────────────────────────────────────
async function getConfig(key: string): Promise<any> {
  const rows = await db.select().from(schema.config).where(eq(schema.config.key, key));
  return rows[0]?.value ?? null;
}
async function setConfig(key: string, value: any) {
  await db.insert(schema.config).values({ key, value })
    .onConflictDoUpdate({ target: schema.config.key, set: { value, updatedAt: new Date() } });
}

// ── Core sync (shared) ──────────────────────────────────────────────────────
async function runSync(removeStale = false, source = "manual") {
  let page = 1, allItems: any[] = [], totalPages = 1;
  do {
    const data = await barnetFetch(`/products?store_id=${BARNET_STORE_ID}&page_size=200&page=${page}`);
    allItems = allItems.concat(data.items || []);
    totalPages = data.paginator?.pages ?? 1;
    page++;
  } while (page <= totalPages);

  const overrides: Record<string, any> = (await getConfig("barnet_overrides")) ?? {};
  const mapped = allItems.map(item => {
    const p  = mapBarnetProduct(item);
    const ov = overrides[p.id];
    if (ov) {
      if (ov.category     !== undefined) p.category     = ov.category;
      if (ov.price        !== undefined) p.price        = ov.price;
      if (ov.isBestSeller !== undefined) p.isBestSeller = ov.isBestSeller;
      if (ov.sortOrder    !== undefined) p.sortOrder    = ov.sortOrder;
      if (ov.hidden)                     p.inStock      = false; // hidden = pulled from site
    }
    return p;
  });

  const results = { synced: 0, errors: 0, removed: 0 };
  for (const { _raw: _, barnetId: __, memberPrice: _m, images: _i, rawCategory: _r, terpenes: _t, sku: _s, variations: _v, ...clean } of mapped) {
    try { await upsertProduct(clean); results.synced++; }
    catch { results.errors++; }
  }

  if (removeStale) {
    const ids = new Set(mapped.map(p => p.id));
    for (const p of await getProducts(true)) {
      if ((p as any).source === "barnet" && !ids.has((p as any).id)) {
        await deleteProduct((p as any).id).catch(() => {});
        results.removed++;
      }
    }
  }

  const timestamp = new Date().toISOString();
  const history: any[] = (await getConfig("barnet_sync_history")) ?? [];
  history.unshift({ ...results, timestamp, source });
  if (history.length > 100) history.splice(100);
  await setConfig("barnet_sync_history", history);
  await setConfig("barnet_last_sync", { timestamp, ...results, source });
  return { ...results, timestamp, source };
}

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  const action = (req.query._path as string) || "";
  const body   = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});

  // ── GET /api/barnet/preview — live Barnet data (not saved) ──────────────
  if (action === "preview" && req.method === "GET") {
    try {
      const page   = parseInt((req.query.page as string) || "1", 10);
      const search = ((req.query.search as string) || "").toLowerCase();
      const cat    = (req.query.category as string) || "";
      const data   = await barnetFetch(`/products?store_id=${BARNET_STORE_ID}&page_size=200&page=${page}`);
      let items    = (data.items || []).map((i: any) => mapBarnetProduct(i, true));
      if (search) items = items.filter((p: any) => p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search));
      if (cat && cat !== "All") items = items.filter((p: any) => p.category === cat);
      return json(res as any, { products: items, total: data.paginator?.items_count ?? items.length, pages: data.paginator?.pages ?? 1 });
    } catch (err: any) { return json(res as any, { error: err.message }, 502); }
  }

  // ── POST /api/barnet/sync ───────────────────────────────────────────────
  if (action === "sync" && req.method === "POST") {
    try {
      const result = await runSync(body.removeStale ?? false, "manual");
      return json(res as any, { success: true, ...result });
    } catch (err: any) { return json(res as any, { error: err.message }, 502); }
  }

  // ── GET /api/barnet/status — dashboard info ─────────────────────────────
  if (action === "status" && req.method === "GET") {
    try {
      const [lastSync, history, autoSync, overrides, brandMap] = await Promise.all([
        getConfig("barnet_last_sync"),
        getConfig("barnet_sync_history"),
        getConfig("barnet_auto_sync"),
        getConfig("barnet_overrides"),
        getConfig("barnet_brand_map"),
      ]);
      return json(res as any, {
        lastSync,
        history:       history ?? [],
        autoSync:      autoSync ?? { enabled: false, intervalHours: 6 },
        overrideCount: Object.keys(overrides ?? {}).length,
        brandMapCount: Object.keys(brandMap ?? {}).length,
      });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── POST /api/barnet/auto-sync ──────────────────────────────────────────
  if (action === "auto-sync" && req.method === "POST") {
    try {
      const { enabled, intervalHours = 6 } = body;
      await setConfig("barnet_auto_sync", { enabled: !!enabled, intervalHours: Number(intervalHours) });
      return json(res as any, { success: true, enabled: !!enabled, intervalHours });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── POST /api/barnet/override — price/category/bestSeller/hidden/sortOrder
  if (action === "override" && req.method === "POST") {
    try {
      const { productId, category, price, isBestSeller, hidden, sortOrder, name, clear } = body;
      if (!productId) return json(res as any, { error: "productId required" }, 400);
      const overrides: Record<string, any> = (await getConfig("barnet_overrides")) ?? {};
      if (clear) {
        delete overrides[productId];
      } else {
        overrides[productId] = {
          ...(overrides[productId] ?? {}),
          ...(category     !== undefined ? { category }              : {}),
          ...(price        !== undefined ? { price: Number(price) }  : {}),
          ...(isBestSeller !== undefined ? { isBestSeller: !!isBestSeller } : {}),
          ...(hidden       !== undefined ? { hidden: !!hidden }      : {}),
          ...(sortOrder    !== undefined ? { sortOrder: Number(sortOrder) } : {}),
          ...(name         !== undefined ? { name }                  : {}),
        };
      }
      await setConfig("barnet_overrides", overrides);
      // Apply immediately to DB
      const patch: any = {};
      if (!clear) {
        if (category     !== undefined) patch.category     = category;
        if (price        !== undefined) patch.price        = Number(price);
        if (isBestSeller !== undefined) patch.isBestSeller = !!isBestSeller;
        if (hidden       !== undefined) patch.inStock      = !hidden;
        if (sortOrder    !== undefined) patch.sortOrder    = Number(sortOrder);
        if (name         !== undefined) patch.name         = name;
      } else {
        // clear = restore from next sync; for now just mark updatedAt
        patch.updatedAt = new Date();
      }
      if (Object.keys(patch).length) {
        await db.update(schema.products).set(patch).where(eq(schema.products.id, productId));
      }
      return json(res as any, { success: true, overrides });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── GET /api/barnet/overrides ───────────────────────────────────────────
  if (action === "overrides" && req.method === "GET") {
    try {
      return json(res as any, { overrides: (await getConfig("barnet_overrides")) ?? {} });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── POST /api/barnet/bulk — bestSeller|toggleStock|delete|hide|sortOrder ─
  if (action === "bulk" && req.method === "POST") {
    try {
      const { action: act, ids, value } = body;
      if (!Array.isArray(ids) || !ids.length) return json(res as any, { error: "ids required" }, 400);
      let affected = 0;
      for (const id of ids) {
        try {
          if (act === "bestSeller")   { await db.update(schema.products).set({ isBestSeller: !!value }).where(eq(schema.products.id, id)); affected++; }
          if (act === "toggleStock")  { await db.update(schema.products).set({ inStock: !!value }).where(eq(schema.products.id, id)); affected++; }
          if (act === "delete")       { await deleteProduct(id); affected++; }
          if (act === "hide")         { await db.update(schema.products).set({ inStock: false }).where(eq(schema.products.id, id)); affected++; }
          if (act === "sortOrder" && value !== undefined) { await db.update(schema.products).set({ sortOrder: Number(value) }).where(eq(schema.products.id, id)); affected++; }
        } catch { /* skip individual */ }
      }
      return json(res as any, { success: true, affected });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── GET /api/barnet/stock-alerts ────────────────────────────────────────
  if (action === "stock-alerts" && req.method === "GET") {
    try {
      const all    = await getProducts(true);
      const barnet = all.filter((p: any) => p.source === "barnet");
      return json(res as any, {
        outOfStock: barnet.filter((p: any) => !p.inStock),
        total:      barnet.length,
        outCount:   barnet.filter((p: any) => !p.inStock).length,
        inCount:    barnet.filter((p: any) => p.inStock).length,
      });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── GET /api/barnet/analytics — sales & inventory stats ─────────────────
  if (action === "analytics" && req.method === "GET") {
    try {
      const [allProducts, allOrders] = await Promise.all([getProducts(true), db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt))]);
      const barnet = allProducts.filter((p: any) => p.source === "barnet");

      // Revenue from orders containing barnet products
      let barnetRevenue = 0;
      const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
      for (const order of allOrders) {
        const items = (order.items as any[]) || [];
        for (const item of items) {
          if (String(item.id || "").startsWith("barnet_")) {
            const rev = Number(item.price || 0) * Number(item.quantity || 1);
            barnetRevenue += rev;
            if (!productSales[item.id]) productSales[item.id] = { name: item.name || item.id, qty: 0, revenue: 0 };
            productSales[item.id].qty     += Number(item.quantity || 1);
            productSales[item.id].revenue += rev;
          }
        }
      }

      const topSellers = Object.entries(productSales)
        .sort(([, a], [, b]) => b.qty - a.qty)
        .slice(0, 10)
        .map(([id, s]) => ({ id, ...s }));

      const byCategory: Record<string, { count: number; inStock: number; avgPrice: number }> = {};
      for (const p of barnet) {
        const cat = (p as any).category || "Other";
        if (!byCategory[cat]) byCategory[cat] = { count: 0, inStock: 0, avgPrice: 0 };
        byCategory[cat].count++;
        if ((p as any).inStock) byCategory[cat].inStock++;
        byCategory[cat].avgPrice += Number((p as any).price || 0);
      }
      for (const cat of Object.keys(byCategory)) {
        byCategory[cat].avgPrice = Math.round((byCategory[cat].avgPrice / byCategory[cat].count) * 100) / 100;
      }

      const brands: Record<string, number> = {};
      for (const p of barnet) {
        const b = (p as any).brand || "Unknown";
        brands[b] = (brands[b] || 0) + 1;
      }

      return json(res as any, {
        barnetRevenue: Math.round(barnetRevenue * 100) / 100,
        topSellers,
        byCategory,
        brands,
        totalProducts: barnet.length,
        inStock:       barnet.filter((p: any) => p.inStock).length,
        bestSellers:   barnet.filter((p: any) => p.isBestSeller).length,
      });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── POST /api/barnet/stock-adjust — manual quantity / in-out-of-stock ───
  if (action === "stock-adjust" && req.method === "POST") {
    try {
      const { productId, inStock, reason } = body;
      if (!productId) return json(res as any, { error: "productId required" }, 400);
      await db.update(schema.products).set({ inStock: !!inStock }).where(eq(schema.products.id, productId));
      await logStockChange({ productId, type: inStock ? "in" : "out", quantity: 0, reason: reason || "manual admin override" });
      return json(res as any, { success: true });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── POST /api/barnet/brand-map — remap brand names ─────────────────────
  if (action === "brand-map" && req.method === "POST") {
    try {
      const { from, to, clear } = body;
      const map: Record<string, string> = (await getConfig("barnet_brand_map")) ?? {};
      if (clear && from) { delete map[from]; }
      else if (from && to) {
        map[from] = to;
        // Apply immediately to all matching products
        const all = await getProducts(true);
        for (const p of all) {
          if ((p as any).source === "barnet" && (p as any).brand === from) {
            await db.update(schema.products).set({ brand: to }).where(eq(schema.products.id, (p as any).id));
          }
        }
      }
      await setConfig("barnet_brand_map", map);
      return json(res as any, { success: true, map });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── GET /api/barnet/brand-map ───────────────────────────────────────────
  if (action === "brand-map" && req.method === "GET") {
    try {
      return json(res as any, { map: (await getConfig("barnet_brand_map")) ?? {} });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── GET /api/barnet/product/:id — single product with full variation data
  if (action.startsWith("product/") && req.method === "GET") {
    try {
      const barnetId = action.replace("product/", "");
      const data     = await barnetFetch(`/products/${barnetId}?store_id=${BARNET_STORE_ID}`);
      const mapped   = mapBarnetProduct(data, true);
      const overrides: Record<string, any> = (await getConfig("barnet_overrides")) ?? {};
      return json(res as any, { product: mapped, override: overrides[mapped.id] ?? null });
    } catch (err: any) { return json(res as any, { error: err.message }, 502); }
  }

  // ── GET /api/barnet/brands — all brands from synced products ────────────
  if (action === "brands" && req.method === "GET") {
    try {
      const all    = await getProducts(true);
      const barnet = all.filter((p: any) => p.source === "barnet");
      const brandMap: Record<string, string> = (await getConfig("barnet_brand_map")) ?? {};
      const brands = [...new Set(barnet.map((p: any) => p.brand || "Unknown"))].sort();
      return json(res as any, { brands, brandMap });
    } catch (err: any) { return json(res as any, { error: err.message }, 500); }
  }

  // ── GET /api/barnet/cron-sync — Vercel cron job (every 6h) ────────────────
  if (action === "cron-sync") {
    // Vercel cron jobs call with GET and set Authorization: Bearer <CRON_SECRET>
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = (req.headers?.["authorization"] as string) || "";
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const autoSync = (await getConfig("barnet_auto_sync")) ?? { enabled: false };
      if (!autoSync.enabled && cronSecret) {
        return json(res as any, { skipped: true, reason: "auto-sync disabled" });
      }
      const result = await runSync(false, "auto");
      return json(res as any, { success: true, ...result });
    } catch (err: any) { return json(res as any, { error: err.message }, 502); }
  }

  return json(res as any, { error: "Not found" }, 404);
}

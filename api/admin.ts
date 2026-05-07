import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import {
  getOrders, updateOrder, getOrderById, deleteOrder,
  getProducts, upsertProduct, deleteProduct,
  getPromoCodes, upsertPromoCode, deletePromoCode,
  getCustomers, getDrivers, upsertDriver, deleteDriver,
  getAutomations, updateAutomation,
  getStoreHours, upsertStoreHours,
  getStats, getAuditLogs,
  getConfig, setConfig,
  clearAllOrders, clearAllProducts, clearAllCustomers,
} from "./_lib/db_ops.js";
import { requireAdmin, json, cors } from "./_lib/auth.js";
import {
  sendPreparing, sendDispatched, sendDelivered,
  sendReadyForPickup, sendCancelled, sendOrderConfirmation,
} from "./_lib/email.js";
import { CONTENT_DEFAULTS } from "./content.js";
import { STORE_DEFAULTS } from "./store.js";
import { REVIEWS_DEFAULTS } from "./reviews.js";

function body(req: VercelRequest): any {
  return typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
}

const CONTENT_SECTIONS = ["hero", "brand", "perks", "story", "about", "delivery"];

const SAMPLE_ORDER = {
  orderId: "BNB-TEST-001",
  customerName: "Test Customer",
  customerEmail: process.env.TEST_EMAIL || "nishant15bihola@gmail.com",
  customer: { name: "Test Customer", email: process.env.TEST_EMAIL || "nishant15bihola@gmail.com", phone: "(825) 218-8234", paymentMethod: "pay_on_delivery" },
  delivery: { method: "delivery", street: "123 Test St", city: "Sherwood Park", postal: "T8A 0A1", slot: "asap" },
  items: [{ name: "Blue Dream 3.5g", quantity: 2, price: 29.99 }],
  subtotal: 59.98, deliveryFee: 5.99, discount: 0, total: 65.97, promoCode: null,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();

  // /api/admin/auth — public (no requireAdmin)
  const url = req.url ?? "";
  const queryPath = req.query._path as string;
  const path = queryPath || url.replace(/^\/api\/admin\/?/, "").split("?")[0];

  if (path === "auth") {
    if (req.method !== "POST") return json(res as any, { error: "Method not allowed" }, 405);
    const { secret } = body(req);
    if (!secret || secret !== process.env.ADMIN_SECRET) return json(res as any, { error: "Invalid credentials" }, 401);
    return json(res as any, { success: true });
  }

  if (!requireAdmin(req as any, res as any)) return;

  try {
    // ── ORDERS ───────────────────────────────────────────────────────
    if (path === "orders") {
      if (req.method === "GET") {
        const orders = await getOrders();
        return json(res as any, { orders });
      }
      if (req.method === "PATCH" || req.method === "PUT") {
        const { id } = req.query;
        if (!id) return json(res as any, { error: "Missing order ID" }, 400);
        const { status, driverName, driverPhone, ...rest } = body(req);
        const VALID = ["confirmed","preparing","dispatched","delivered","ready_pickup","picked_up","cancelled"];
        if (status && !VALID.includes(status)) return json(res as any, { error: "Invalid status" }, 400);
        const patch: Record<string, any> = { ...rest };
        if (status) patch.status = status;
        if (driverName !== undefined) patch.driverName = driverName;
        if (driverPhone !== undefined) patch.driverPhone = driverPhone;
        const order = await updateOrder(id as string, patch);
        if (!order) return json(res as any, { error: "Order not found" }, 404);
        if (status) {
          const full = await getOrderById(id as string);
          if (full) {
            const isPickup = (full.delivery as any)?.method === "pickup";
            if (status === "preparing") sendPreparing(full).catch(console.error);
            else if (status === "dispatched" && !isPickup) sendDispatched({ ...full, driverName, driverPhone }).catch(console.error);
            else if (status === "delivered") {
              await sendDelivered(full).catch(console.error);
              await deleteOrder(id as string).catch(console.error);
            }
            else if (status === "picked_up" && isPickup) {
              // Auto-delete picked up orders as they are considered finished
              await deleteOrder(id as string).catch(console.error);
            }
            else if (status === "ready_pickup" && isPickup) {
              await sendReadyForPickup(full).catch(console.error);
            }
            else if (status === "cancelled") sendCancelled(full).catch(console.error);
          }
        }
        return json(res as any, { order });
      }
    }

    // ── PRODUCTS ─────────────────────────────────────────────────────
    if (path === "products") {
      if (req.method === "GET") return json(res as any, { products: await getProducts(true) });
      if (req.method === "POST" || req.method === "PUT") {
        const product = await upsertProduct(body(req));
        return json(res as any, { product });
      }
      if (req.method === "DELETE") {
        const { id } = req.query;
        if (!id) return json(res as any, { error: "Missing ID" }, 400);
        await deleteProduct(id as string);
        return json(res as any, { success: true });
      }
    }

    // ── PROMOS ───────────────────────────────────────────────────────
    if (path === "promos") {
      if (req.method === "GET") return json(res as any, { promos: await getPromoCodes() });
      if (req.method === "POST" || req.method === "PUT") return json(res as any, { promo: await upsertPromoCode(body(req)) });
      if (req.method === "DELETE") {
        const { id } = req.query;
        if (!id) return json(res as any, { error: "Missing ID" }, 400);
        await deletePromoCode(id as string);
        return json(res as any, { success: true });
      }
    }

    // ── CUSTOMERS ────────────────────────────────────────────────────
    if (path === "customers") {
      if (req.method === "GET") return json(res as any, { customers: await getCustomers() });
    }

    // ── DRIVERS ──────────────────────────────────────────────────────
    if (path === "drivers") {
      if (req.method === "GET") return json(res as any, { drivers: await getDrivers() });
      if (req.method === "POST" || req.method === "PUT") {
        const b = body(req);
        if (!b.name) return json(res as any, { error: "Driver name required" }, 400);
        const driver = await upsertDriver(b);
        return json(res as any, { driver: driver[0] });
      }
      if (req.method === "DELETE") {
        const { id } = req.query;
        if (!id) return json(res as any, { error: "Missing ID" }, 400);
        await deleteDriver(id as string);
        return json(res as any, { success: true });
      }
    }

    // ── AUTOMATIONS ──────────────────────────────────────────────────
    if (path === "automations") {
      if (req.method === "GET") return json(res as any, { automations: await getAutomations() });
      if (req.method === "POST") {
        const { key, enabled } = body(req);
        if (!key) return json(res as any, { error: "Key required" }, 400);
        await updateAutomation(key, !!enabled);
        return json(res as any, { success: true });
      }
    }

    // ── STORE HOURS ──────────────────────────────────────────────────
    if (path === "store-hours") {
      if (req.method === "GET") return json(res as any, { hours: await getStoreHours() });
      if (req.method === "POST") {
        const { hours } = body(req);
        if (!Array.isArray(hours)) return json(res as any, { error: "hours must be an array" }, 400);
        await upsertStoreHours(hours);
        return json(res as any, { success: true });
      }
    }

    // ── STORE INFO ───────────────────────────────────────────────────
    if (path === "store") {
      if (req.method === "GET") {
        const stored = await getConfig("store.info").catch(() => null);
        return json(res as any, { store: stored ? { ...STORE_DEFAULTS, ...(stored as object) } : { ...STORE_DEFAULTS } });
      }
      if (req.method === "POST") {
        const merged = { ...STORE_DEFAULTS, ...body(req) };
        await setConfig("store.info", merged);
        return json(res as any, { store: merged });
      }
    }

    // ── CONTENT ──────────────────────────────────────────────────────
    if (path === "content") {
      if (req.method === "GET") {
        const content: Record<string, any> = {};
        for (const section of CONTENT_SECTIONS) {
          const stored = await getConfig(`content.${section}`).catch(() => null);
          const defaults = CONTENT_DEFAULTS[section as keyof typeof CONTENT_DEFAULTS] as Record<string, any>;
          content[section] = stored ? { ...defaults, ...(stored as object) } : { ...defaults };
        }
        return json(res as any, { content });
      }
      if (req.method === "POST") {
        const { section, data } = body(req);
        if (!section || !CONTENT_SECTIONS.includes(section)) return json(res as any, { error: "Invalid section" }, 400);
        await setConfig(`content.${section}`, data);
        return json(res as any, { success: true });
      }
    }

    // ── REVIEWS ──────────────────────────────────────────────────────
    if (path === "reviews") {
      const stored = await getConfig("site.reviews").catch(() => null);
      const current: any[] = Array.isArray(stored) ? stored : [...REVIEWS_DEFAULTS];
      if (req.method === "GET") return json(res as any, { reviews: current });
      if (req.method === "POST") {
        const review = { id: `r_${crypto.randomUUID().slice(0, 8)}`, active: true, ...body(req) };
        const updated = [...current, review];
        await setConfig("site.reviews", updated);
        return json(res as any, { review, reviews: updated });
      }
      if (req.method === "PUT") {
        const b = body(req);
        if (!b.id) return json(res as any, { error: "Missing id" }, 400);
        const updated = current.map((r: any) => r.id === b.id ? { ...r, ...b } : r);
        await setConfig("site.reviews", updated);
        return json(res as any, { reviews: updated });
      }
      if (req.method === "DELETE") {
        const { id } = req.query;
        if (!id) return json(res as any, { error: "Missing id" }, 400);
        const updated = current.filter((r: any) => r.id !== id);
        await setConfig("site.reviews", updated);
        return json(res as any, { success: true });
      }
    }

    // ── STATS ────────────────────────────────────────────────────────
    if (path === "stats") {
      const stats = await getStats();
      return json(res as any, stats);
    }

    // ── AUDIT LOGS ───────────────────────────────────────────────────
    if (path === "audit-logs") {
      const logs = await getAuditLogs();
      return json(res as any, { logs });
    }

    // ── CONFIG ───────────────────────────────────────────────────────
    if (path === "config") {
      if (req.method === "GET") {
        const key = req.query.key as string;
        if (!key) return json(res as any, { error: "Key required" }, 400);
        return json(res as any, { value: await getConfig(key) });
      }
      if (req.method === "POST") {
        const { key, value } = body(req);
        if (!key) return json(res as any, { error: "Key required" }, 400);
        await setConfig(key, value);
        return json(res as any, { success: true });
      }
    }

    // ── CLEAR DATA ───────────────────────────────────────────────────
    if (path === "clear") {
      if (req.method !== "POST") return json(res as any, { error: "Method not allowed" }, 405);
      const { target } = body(req);
      if (target === "orders") { await clearAllOrders(); return json(res as any, { success: true, cleared: "orders" }); }
      if (target === "products") { await clearAllProducts(); return json(res as any, { success: true, cleared: "products" }); }
      if (target === "customers") { await clearAllCustomers(); return json(res as any, { success: true, cleared: "customers" }); }
      if (target === "all") {
        await clearAllOrders();
        await clearAllProducts();
        await clearAllCustomers();
        return json(res as any, { success: true, cleared: "orders, products, customers" });
      }
      return json(res as any, { error: "Invalid target. Use: orders, products, customers, all" }, 400);
    }

    // ── TEST EMAIL ───────────────────────────────────────────────────
    if (path === "test-email") {
      if (req.method !== "POST") return json(res as any, { error: "Method not allowed" }, 405);
      await sendOrderConfirmation(SAMPLE_ORDER);
      return json(res as any, { success: true, message: `Test email sent to ${SAMPLE_ORDER.customerEmail}` });
    }

    return json(res as any, { error: "Not found" }, 404);
  } catch (err: any) {
    console.error(`[admin/${path}]`, err);
    return json(res as any, { error: err.message || "Internal server error" }, 500);
  }
}

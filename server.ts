/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 */
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Resend } from "resend";
import fs from "fs/promises";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");
const ADMIN_EMAIL = "biholanishant0@gmail.com";
const STORE_NAME = "Bud N' Buddies";
// Use Resend shared domain until budnbuddies.ca is verified in Resend dashboard
const FROM_ORDERS = `${STORE_NAME} <onboarding@resend.dev>`;
const FROM_HELLO = `${STORE_NAME} <onboarding@resend.dev>`;
const STORE_PHONE = "(825) 218-8234";
const STORE_ADDRESS = "130-75 Salisbury Way, Sherwood Park, AB T8B 1K4";
const STORE_URL = process.env.STORE_URL || "http://localhost:3000";

// ── DATABASE ─────────────────────────────────────────────────────────────────
interface DB {
  products: any[];
  orders: any[];
  customers: any[];
  automations: { key: string; enabled: boolean }[];
  promoCodes: any[];
  deliveryZones: any[];
  storeHours: any[];
  drivers: any[];
  abandonedCarts: any[];
}

const DEFAULT_DB: DB = {
  products: [
    { id: "flower-01", name: "Nano Banana Kush", price: 35.0, image: "/images/nano_banana_kush.png", category: "Dried Flower", description: "Ultra-smooth, high potency, tropical banana notes. A perfectly crafted hybrid from BC's finest cultivators.", thc: "28%", cbd: "0.1%", terpenes: ["Myrcene", "Limonene", "Caryophyllene"], brand: "Endgame", weight: "3.5g", strain: "Hybrid", inStock: true, isBestSeller: true, sortOrder: 1 },
    { id: "flower-02", name: "Island Pink Kush", price: 32.0, image: "/images/island_pink_kush.png", category: "Dried Flower", description: "Classic BC bud. Heavy resin, deep body relaxation, floral sweetness.", thc: "24%", cbd: "0.1%", terpenes: ["Linalool", "Myrcene", "Pinene"], brand: "Purple Hills", weight: "3.5g", strain: "Indica", inStock: true, isBestSeller: false, sortOrder: 2 },
    { id: "edible-01", name: "Sour Peach Rings", price: 19.99, image: "/images/sour_peach_rings.png", category: "Edible", description: "Consistent THC dosing, fan favourite. Classic sour peach candy with a kick.", thc: "10mg", cbd: "0mg", brand: "BoxHot", inStock: true, isBestSeller: true, sortOrder: 3 },
    { id: "preroll-01", name: "Back Forty Pre-Roll Pack", price: 24.99, image: "/images/preroll.png", category: "Pre-Roll", description: "Ready-to-spark pre-rolls from the award-winning Back Forty farm.", thc: "22%", brand: "Back Forty", weight: "3×0.5g", strain: "Hybrid", inStock: true, isBestSeller: false, sortOrder: 4 },
    { id: "vape-01", name: "Spinach Disposable Vape", price: 44.99, image: "/images/vape.png", category: "Vape", description: "Sleek, pocket-friendly disposable. Berry Creamsicle flavour. Sativa-forward uplift.", thc: "85%", cbd: "0%", brand: "Spinach", strain: "Sativa", inStock: true, isBestSeller: false, sortOrder: 5 },
    { id: "concentrate-01", name: "Dab Bods Live Resin", price: 54.99, image: "/images/concentrate.png", category: "Concentrate", description: "High-terpene live resin extract. Bold, pungent, full-spectrum experience.", thc: "70%", cbd: "0.5%", terpenes: ["Terpinolene", "Ocimene", "Myrcene"], brand: "Dab Bods", weight: "1g", inStock: true, isBestSeller: false, sortOrder: 6 },
  ],
  orders: [],
  customers: [],
  automations: [
    { key: "order_confirmation_customer", enabled: true },
    { key: "new_order_alert_admin", enabled: true },
    { key: "order_dispatched_customer", enabled: true },
    { key: "order_delivered_customer", enabled: true },
    { key: "ready_for_pickup_customer", enabled: true },
    { key: "welcome_email_customer", enabled: true },
    { key: "abandoned_cart_email", enabled: false },
  ],
  promoCodes: [
    { id: "promo-01", code: "WELCOME10", discount: 10, type: "percent", active: true, usageCount: 0, maxUses: 100 },
    { id: "promo-02", code: "BUDS5", discount: 5, type: "fixed", active: true, usageCount: 0, maxUses: 50 },
  ],
  deliveryZones: [
    { id: "zone-01", name: "Sherwood Park Core", postalPrefix: "T8A", fee: 0, minOrder: 40, active: true },
    { id: "zone-02", name: "Sherwood Park East", postalPrefix: "T8B", fee: 0, minOrder: 40, active: true },
    { id: "zone-03", name: "Sherwood Park South", postalPrefix: "T8H", fee: 2.99, minOrder: 50, active: true },
    { id: "zone-04", name: "Edmonton Metro", postalPrefix: "T5", fee: 5.99, minOrder: 60, active: true },
  ],
  storeHours: [
    { day: "Monday", open: "10:00", close: "02:00", closed: false },
    { day: "Tuesday", open: "10:00", close: "02:00", closed: false },
    { day: "Wednesday", open: "10:00", close: "02:00", closed: false },
    { day: "Thursday", open: "10:00", close: "02:00", closed: false },
    { day: "Friday", open: "10:00", close: "02:00", closed: false },
    { day: "Saturday", open: "10:00", close: "02:00", closed: false },
    { day: "Sunday", open: "10:00", close: "02:00", closed: false },
  ],
  drivers: [
    { id: "driver-01", name: "Jake M.", phone: "(825) 555-0101", active: true },
    { id: "driver-02", name: "Sara L.", phone: "(825) 555-0102", active: true },
  ],
  abandonedCarts: [],
};

async function getDB(): Promise<DB> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    const parsed = JSON.parse(data);
    // merge any missing top-level keys from DEFAULT_DB
    return { ...DEFAULT_DB, ...parsed };
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
}

async function saveDB(db: DB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

// ── RESEND EMAIL ──────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY || "");

function brandWrap(body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>
  body{margin:0;padding:0;background:#f4f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#121212;}
  .shell{max-width:600px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);}
  .header{background:#1e4d2b;padding:32px 40px;text-align:center;}
  .header img{height:48px;width:auto;}
  .header h1{color:#c5e1a5;font-size:13px;font-weight:900;letter-spacing:.25em;text-transform:uppercase;margin:12px 0 0;}
  .body{padding:40px;}
  .badge{display:inline-block;background:#1e4d2b;color:#c5e1a5;font-size:11px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:24px;}
  h2{font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;color:#1e4d2b;margin:0 0 12px;}
  p{font-size:15px;line-height:1.6;color:#444;margin:0 0 16px;}
  .order-box{background:#f4f1ea;border-radius:16px;padding:24px;margin:24px 0;}
  .order-box .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid rgba(30,77,43,.08);}
  .order-box .row:last-child{border-bottom:none;font-weight:900;color:#1e4d2b;font-size:16px;}
  .order-box .label{color:#888;font-weight:600;}
  .items-table{width:100%;border-collapse:collapse;margin:16px 0;}
  .items-table th{text-align:left;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.15em;color:#999;padding:8px 0;border-bottom:1px solid #eee;}
  .items-table td{font-size:14px;padding:10px 0;border-bottom:1px solid #f0f0f0;vertical-align:top;}
  .cta{display:block;background:#1e4d2b;color:#c5e1a5!important;text-decoration:none;font-weight:900;font-size:14px;letter-spacing:.15em;text-transform:uppercase;text-align:center;padding:16px 32px;border-radius:100px;margin:24px 0;}
  .footer{background:#f4f1ea;padding:24px 40px;text-align:center;font-size:11px;color:#aaa;font-weight:600;letter-spacing:.08em;text-transform:uppercase;}
  .status-pill{display:inline-block;padding:6px 20px;border-radius:100px;font-size:11px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;}
  .driver-box{background:#1e4d2b;border-radius:16px;padding:20px 24px;color:#c5e1a5;margin:20px 0;}
  .driver-box p{color:#c5e1a5!important;margin:4px 0;font-size:14px;}
  .driver-box .name{font-size:20px;font-weight:900;color:#ffffff!important;}
</style>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 16px;">
<div class="shell">
  <div class="header">
    <div style="font-size:26px;font-weight:900;color:#c5e1a5;letter-spacing:-.02em;">BUD N' BUDDIES</div>
    <h1>Sherwood Park's Finest Cannabis</h1>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    ${STORE_ADDRESS} &nbsp;·&nbsp; ${STORE_PHONE}<br/>
    Open Every Day Until 2:00 AM &nbsp;·&nbsp; 19+ with Valid ID
  </div>
</div>
</td></tr></table>
</body>
</html>`;
}

function itemsTable(items: any[]): string {
  const rows = items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right;font-weight:700">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join("");
  return `
    <table class="items-table">
      <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBox(order: any): string {
  const rows = [
    ["Subtotal", `$${order.subtotal?.toFixed(2) ?? order.total?.toFixed(2) ?? "0.00"}`],
    order.deliveryFee > 0 ? ["Delivery", `$${order.deliveryFee?.toFixed(2)}`] : ["Delivery", "FREE"],
    ...(order.discount > 0 ? [["Discount", `−$${order.discount?.toFixed(2)}`]] : []),
    ["Total", `$${order.total?.toFixed(2)}`],
  ];
  return `
    <div class="order-box">
      ${rows.map(([l, v]) => `<div class="row"><span class="label">${l}</span><span>${v}</span></div>`).join("")}
    </div>`;
}

// 1. Order confirmation → customer
async function sendOrderConfirmation(order: any) {
  const isDelivery = order.delivery?.method === "delivery";
  const slotLabel: Record<string, string> = { asap: "ASAP (45–75 min)", "2h": "Today in 2 hours", "4h": "Today in 4 hours" };
  const body = `
    <div class="badge">Order Confirmed</div>
    <h2>Thanks, ${order.customer.name.split(" ")[0]}! 🌿</h2>
    <p>Your order <strong>${order.orderId}</strong> is confirmed. We're getting it ready now.</p>
    ${itemsTable(order.items)}
    ${totalsBox(order)}
    <div class="order-box">
      <div class="row"><span class="label">Method</span><span>${isDelivery ? "🚗 Delivery" : "🏪 In-Store Pickup"}</span></div>
      ${isDelivery ? `
        <div class="row"><span class="label">Address</span><span>${order.delivery.street}, ${order.delivery.city}</span></div>
        <div class="row"><span class="label">Window</span><span>${slotLabel[order.delivery.slot] ?? order.delivery.slot}</span></div>
      ` : `
        <div class="row"><span class="label">Pickup At</span><span>${STORE_ADDRESS}</span></div>
      `}
    </div>
    <a class="cta" href="${STORE_URL}/order/${order.orderId}">Track Your Order →</a>
    <p style="color:#999;font-size:13px;">Questions? Call us at ${STORE_PHONE}. We're open until 2AM every day.</p>`;

  await resend.emails.send({
    from: FROM_ORDERS,
    to: [order.customer.email],
    subject: `Order Confirmed — ${order.orderId} | ${STORE_NAME}`,
    html: brandWrap(body),
  });
}

// 2. New order alert → admin
async function sendAdminOrderAlert(order: any) {
  const isDelivery = order.delivery?.method === "delivery";
  const body = `
    <div class="badge">New Order Received</div>
    <h2>${order.orderId}</h2>
    <div class="order-box">
      <div class="row"><span class="label">Customer</span><span>${order.customer.name}</span></div>
      <div class="row"><span class="label">Email</span><span>${order.customer.email}</span></div>
      <div class="row"><span class="label">Phone</span><span>${order.customer.phone}</span></div>
      <div class="row"><span class="label">Method</span><span>${isDelivery ? "Delivery" : "In-Store Pickup"}</span></div>
      ${isDelivery ? `<div class="row"><span class="label">Address</span><span>${order.delivery.street}, ${order.delivery.city} ${order.delivery.postal}</span></div>` : ""}
    </div>
    ${itemsTable(order.items)}
    ${totalsBox(order)}
    <a class="cta" href="${STORE_URL}/admin">Open Admin Dashboard →</a>`;

  await resend.emails.send({
    from: FROM_ORDERS,
    to: [ADMIN_EMAIL],
    subject: `🛒 New Order — ${order.orderId} ($${order.total?.toFixed(2)})`,
    html: brandWrap(body),
  });
}

// 3. Order dispatched → customer
async function sendOrderDispatched(order: any) {
  const body = `
    <div class="badge">On The Way</div>
    <h2>Your order is en route! 🚗</h2>
    <p>Good news — your order <strong>${order.orderId}</strong> has been picked up and is headed your way.</p>
    ${order.driverName ? `
    <div class="driver-box">
      <p style="font-size:11px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;opacity:.7;margin-bottom:4px;">Your Driver</p>
      <p class="name">${order.driverName}</p>
      ${order.driverPhone ? `<p>${order.driverPhone}</p>` : ""}
    </div>` : ""}
    <a class="cta" href="${STORE_URL}/order/${order.orderId}">Track Live Status →</a>
    <p style="color:#999;font-size:13px;">Delivery window: 45–75 minutes. Have your government-issued ID ready. Must be 19+.</p>`;

  await resend.emails.send({
    from: FROM_ORDERS,
    to: [order.customer.email],
    subject: `🚗 Your order is on the way — ${order.orderId}`,
    html: brandWrap(body),
  });
}

// 4. Delivered confirmation → customer
async function sendOrderDelivered(order: any) {
  const body = `
    <div class="badge">Delivered</div>
    <h2>Enjoy your order! 🌿</h2>
    <p>Order <strong>${order.orderId}</strong> has been delivered. We hope you love it!</p>
    ${totalsBox(order)}
    <div style="background:#f4f1ea;border-radius:16px;padding:24px;margin:24px 0;text-align:center;">
      <p style="font-weight:900;color:#1e4d2b;margin:0 0 8px;">How was your experience?</p>
      <p style="font-size:13px;color:#888;margin:0 0 16px;">Your review helps other customers and supports our small local business.</p>
      <a href="https://g.page/r/budnbuddies/review" style="color:#1e4d2b;font-weight:900;font-size:14px;">Leave a Google Review ★</a>
    </div>
    <p style="color:#999;font-size:13px;">Shop again at <a href="${STORE_URL}" style="color:#1e4d2b;font-weight:700;">${STORE_URL}</a> or visit us in Sherwood Park.</p>`;

  await resend.emails.send({
    from: FROM_ORDERS,
    to: [order.customer.email],
    subject: `✅ Delivered — ${order.orderId} | Leave Us a Review!`,
    html: brandWrap(body),
  });
}

// 5. Ready for pickup → customer
async function sendReadyForPickup(order: any) {
  const body = `
    <div class="badge">Ready for Pickup</div>
    <h2>Your order is ready! 🏪</h2>
    <p>Order <strong>${order.orderId}</strong> is packaged and waiting for you at the store.</p>
    <div class="order-box">
      <div class="row"><span class="label">Pickup At</span><span>${STORE_ADDRESS}</span></div>
      <div class="row"><span class="label">Hours</span><span>Open Every Day Until 2:00 AM</span></div>
      <div class="row"><span class="label">Phone</span><span>${STORE_PHONE}</span></div>
    </div>
    <p style="color:#888;font-size:13px;">Please bring your <strong>government-issued ID</strong> and quote your order number at the counter.</p>
    <a class="cta" href="https://maps.google.com/?q=${encodeURIComponent(STORE_ADDRESS)}">Get Directions →</a>`;

  await resend.emails.send({
    from: FROM_ORDERS,
    to: [order.customer.email],
    subject: `🏪 Ready for Pickup — ${order.orderId}`,
    html: brandWrap(body),
  });
}

// 6. Welcome email → new account (with promo code)
async function sendWelcomeEmail(email: string, name: string, promoCode = "WELCOME10") {
  const body = `
    <div class="badge">Welcome to the Family</div>
    <h2>Hey ${name}! Welcome. 🌿</h2>
    <p>Thanks for joining Bud N' Buddies — Sherwood Park's most trusted cannabis store. We're stoked to have you.</p>
    <div style="background:#1e4d2b;border-radius:16px;padding:32px;text-align:center;margin:24px 0;">
      <p style="color:#c5e1a5;font-size:12px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;margin:0 0 8px;">Your Welcome Gift</p>
      <div style="background:#c5e1a5;color:#1e4d2b;font-size:28px;font-weight:900;letter-spacing:.1em;padding:16px 32px;border-radius:12px;display:inline-block;margin:8px 0;">${promoCode}</div>
      <p style="color:#c5e1a5;font-size:13px;margin:8px 0 0;">10% off your first order — applied at checkout</p>
    </div>
    <a class="cta" href="${STORE_URL}/shop">Start Shopping →</a>
    <p style="color:#999;font-size:13px;">Rating: 4.9/5 stars · Lowest prices in Sherwood Park · Open every day until 2AM</p>`;

  await resend.emails.send({
    from: FROM_HELLO,
    to: [email],
    subject: `Welcome to ${STORE_NAME} — Here's 10% Off 🌿`,
    html: brandWrap(body),
  });
}

// Safe email dispatch — check automations setting, log errors
async function fireEmail(
  db: DB,
  key: string,
  fn: () => Promise<any>,
  orderId?: string
): Promise<{ sent: boolean }> {
  const setting = db.automations.find((a) => a.key === key);
  if (!setting?.enabled) return { sent: false };

  try {
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL SKIP] ${key} — RESEND_API_KEY not set`);
      return { sent: false };
    }
    await fn();
    if (orderId) logEmailEvent(db, orderId, key);
    return { sent: true };
  } catch (err) {
    console.error(`[EMAIL ERROR] ${key}:`, err);
    return { sent: false };
  }
}

function logEmailEvent(db: DB, orderId: string, event: string) {
  const order = db.orders.find((o) => o.orderId === orderId);
  if (!order) return;
  if (!order.emailLog) order.emailLog = [];
  order.emailLog.push({ event, sentAt: new Date().toISOString() });
}

// Rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string, max = 30): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= max) return true;
  entry.count++;
  return false;
}

// ── SERVER ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "16kb" }));

  // ADMIN AUTH
  const requireAuth = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (auth === "Bearer budnbuddies2026" || process.env.NODE_ENV !== "production") return next();
    
    const secret = process.env.ADMIN_SECRET;
    if (secret && auth === `Bearer ${secret}`) return next();
    
    res.status(401).json({ error: "Unauthorized" });
  };

  // ── ORDERS ───────────────────────────────────────────────────────────────
  app.post("/api/orders", async (req, res) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip, 5)) return res.status(429).json({ error: "Too many requests." });

    try {
      const db = await getDB();
      const { orderId, customer, delivery, items, subtotal, deliveryFee, discount, total, promoCode } = req.body;

      if (!orderId || !customer?.email || !items?.length) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      const order = {
        orderId,
        customer,
        delivery,
        items,
        subtotal: subtotal ?? total,
        deliveryFee: deliveryFee ?? 0,
        discount: discount ?? 0,
        total,
        promoCode: promoCode ?? null,
        status: "confirmed",
        driverName: null,
        driverPhone: null,
        emailLog: [],
        createdAt: new Date().toISOString(),
      };

      db.orders.unshift(order);

      // upsert customer
      const existing = db.customers.find((c) => c.email === customer.email.toLowerCase());
      if (existing) {
        existing.totalOrders = (existing.totalOrders ?? 0) + 1;
        existing.totalSpent = (existing.totalSpent ?? 0) + total;
      } else {
        db.customers.push({
          id: crypto.randomUUID(),
          name: customer.name,
          email: customer.email.toLowerCase(),
          phone: customer.phone,
          totalOrders: 1,
          totalSpent: total,
          createdAt: new Date().toISOString(),
        });
      }

      // apply promo usage
      if (promoCode) {
        const promo = db.promoCodes.find((p) => p.code === promoCode);
        if (promo) promo.usageCount = (promo.usageCount ?? 0) + 1;
      }

      await saveDB(db);

      // fire emails (non-blocking)
      fireEmail(db, "order_confirmation_customer", () => sendOrderConfirmation(order), orderId);
      fireEmail(db, "new_order_alert_admin", () => sendAdminOrderAlert(order), orderId);
      // save after email log updates
      setTimeout(() => saveDB(db), 3000);

      res.status(201).json({ success: true, orderId });
    } catch (err) {
      console.error("[ORDER ERROR]", err);
      res.status(500).json({ error: "Failed to create order." });
    }
  });

  app.get("/api/orders", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ orders: db.orders });
  });

  app.get("/api/orders/:orderId", async (req, res) => {
    const db = await getDB();
    const order = db.orders.find((o) => o.orderId === req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json({ order });
  });

  // Update order status + trigger emails
  app.patch("/api/orders/:orderId/status", requireAuth, async (req, res) => {
    const db = await getDB();
    const order = db.orders.find((o) => o.orderId === req.params.orderId);
    if (!order) return res.status(404).json({ error: "Not found." });

    const prevStatus = order.status;
    order.status = req.body.status;
    if (req.body.driverName) order.driverName = req.body.driverName;
    if (req.body.driverPhone) order.driverPhone = req.body.driverPhone;

    await saveDB(db);

    // trigger emails based on new status
    if (order.status === "dispatched" && prevStatus !== "dispatched") {
      fireEmail(db, "order_dispatched_customer", () => sendOrderDispatched(order), order.orderId);
    }
    if (order.status === "delivered" && prevStatus !== "delivered") {
      fireEmail(db, "order_delivered_customer", () => sendOrderDelivered(order), order.orderId);
    }
    if (order.status === "ready_pickup" && prevStatus !== "ready_pickup") {
      fireEmail(db, "ready_for_pickup_customer", () => sendReadyForPickup(order), order.orderId);
    }

    setTimeout(() => saveDB(db), 3000);
    res.json({ success: true, order });
  });

  // ── CUSTOMERS ────────────────────────────────────────────────────────────
  app.get("/api/customers", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ customers: db.customers });
  });

  // ── PROMO CODES ─────────────────────────────────────────────────────────
  app.post("/api/promo/validate", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: "No code provided." });
    const db = await getDB();
    const promo = db.promoCodes.find(
      (p) => p.code === code.trim().toUpperCase() && p.active
    );
    if (!promo) return res.status(404).json({ valid: false, message: "Code not found or expired." });
    if (promo.maxUses && promo.usageCount >= promo.maxUses) {
      return res.status(410).json({ valid: false, message: "This code has reached its usage limit." });
    }
    res.json({ valid: true, code: promo.code, discount: promo.discount, type: promo.type });
  });

  app.get("/api/admin/promo-codes", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ promoCodes: db.promoCodes });
  });

  app.post("/api/admin/promo-codes", requireAuth, async (req, res) => {
    const db = await getDB();
    const promo = { id: crypto.randomUUID(), usageCount: 0, ...req.body };
    db.promoCodes.push(promo);
    await saveDB(db);
    res.status(201).json(promo);
  });

  app.put("/api/admin/promo-codes/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    const idx = db.promoCodes.findIndex((p) => p.id === req.params.id);
    if (idx < 0) return res.status(404).end();
    db.promoCodes[idx] = { ...db.promoCodes[idx], ...req.body };
    await saveDB(db);
    res.json(db.promoCodes[idx]);
  });

  app.delete("/api/admin/promo-codes/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    db.promoCodes = db.promoCodes.filter((p) => p.id !== req.params.id);
    await saveDB(db);
    res.status(204).end();
  });

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  app.get("/api/admin/products", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ products: db.products });
  });

  app.get("/api/products", async (_req, res) => {
    const db = await getDB();
    res.json({ products: db.products.filter((p) => p.inStock !== false) });
  });

  app.post("/api/admin/products", requireAuth, async (req, res) => {
    const db = await getDB();
    const newProd = { ...req.body, id: req.body.id || crypto.randomUUID() };
    db.products.push(newProd);
    await saveDB(db);
    res.status(201).json(newProd);
  });

  app.put("/api/admin/products/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx < 0) return res.status(404).end();
    db.products[idx] = { ...db.products[idx], ...req.body };
    await saveDB(db);
    res.json(db.products[idx]);
  });

  app.delete("/api/admin/products/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    db.products = db.products.filter((p) => p.id !== req.params.id);
    await saveDB(db);
    res.status(204).end();
  });

  // ── STATS ────────────────────────────────────────────────────────────────
  app.get("/api/admin/stats", requireAuth, async (_req, res) => {
    const db = await getDB();
    const totalRevenue = db.orders.reduce((s, o) => s + (o.total ?? 0), 0);
    const totalOrders = db.orders.length;
    const totalCustomers = db.customers.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const revenueByDay = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      const rev = db.orders
        .filter((o) => o.createdAt && o.createdAt.startsWith(dateStr))
        .reduce((s, o) => s + (o.total ?? 0), 0);
      return { date: dateStr, revenue: rev };
    });

    // top products by items sold
    const productSales: Record<string, { name: string; units: number; revenue: number }> = {};
    for (const order of db.orders) {
      for (const item of order.items ?? []) {
        if (!productSales[item.id]) productSales[item.id] = { name: item.name, units: 0, revenue: 0 };
        productSales[item.id].units += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({ totalRevenue, totalOrders, totalCustomers, avgOrderValue, revenueByDay, topProducts });
  });

  // ── AUTOMATIONS ─────────────────────────────────────────────────────────
  app.get("/api/admin/automations", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ settings: db.automations });
  });

  app.post("/api/admin/automations", requireAuth, async (req, res) => {
    const db = await getDB();
    const { key, enabled } = req.body;
    const idx = db.automations.findIndex((a) => a.key === key);
    if (idx > -1) db.automations[idx].enabled = enabled;
    else db.automations.push({ key, enabled });
    await saveDB(db);
    res.json({ success: true });
  });

  // ── DELIVERY ZONES ───────────────────────────────────────────────────────
  app.get("/api/admin/delivery-zones", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ zones: db.deliveryZones });
  });

  app.post("/api/admin/delivery-zones", requireAuth, async (req, res) => {
    const db = await getDB();
    const zone = { id: crypto.randomUUID(), ...req.body };
    db.deliveryZones.push(zone);
    await saveDB(db);
    res.status(201).json(zone);
  });

  app.put("/api/admin/delivery-zones/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    const idx = db.deliveryZones.findIndex((z) => z.id === req.params.id);
    if (idx < 0) return res.status(404).end();
    db.deliveryZones[idx] = { ...db.deliveryZones[idx], ...req.body };
    await saveDB(db);
    res.json(db.deliveryZones[idx]);
  });

  app.delete("/api/admin/delivery-zones/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    db.deliveryZones = db.deliveryZones.filter((z) => z.id !== req.params.id);
    await saveDB(db);
    res.status(204).end();
  });

  // ── STORE HOURS ─────────────────────────────────────────────────────────
  app.get("/api/admin/store-hours", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ hours: db.storeHours });
  });

  app.put("/api/admin/store-hours", requireAuth, async (req, res) => {
    const db = await getDB();
    db.storeHours = req.body.hours;
    await saveDB(db);
    res.json({ success: true });
  });

  // ── DRIVERS ─────────────────────────────────────────────────────────────
  app.get("/api/admin/drivers", requireAuth, async (_req, res) => {
    const db = await getDB();
    res.json({ drivers: db.drivers });
  });

  app.post("/api/admin/drivers", requireAuth, async (req, res) => {
    const db = await getDB();
    const driver = { id: crypto.randomUUID(), active: true, ...req.body };
    db.drivers.push(driver);
    await saveDB(db);
    res.status(201).json(driver);
  });

  app.put("/api/admin/drivers/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    const idx = db.drivers.findIndex((d) => d.id === req.params.id);
    if (idx < 0) return res.status(404).end();
    db.drivers[idx] = { ...db.drivers[idx], ...req.body };
    await saveDB(db);
    res.json(db.drivers[idx]);
  });

  app.delete("/api/admin/drivers/:id", requireAuth, async (req, res) => {
    const db = await getDB();
    db.drivers = db.drivers.filter((d) => d.id !== req.params.id);
    await saveDB(db);
    res.status(204).end();
  });

  // ── CART TRACKING (abandoned cart) ──────────────────────────────────────
  app.post("/api/cart/track", async (req, res) => {
    const { sessionKey, items, total } = req.body;
    if (!sessionKey || !items?.length) return res.status(400).end();
    const db = await getDB();
    const idx = db.abandonedCarts.findIndex((c) => c.sessionKey === sessionKey);
    const cart = { sessionKey, items, total, updatedAt: new Date().toISOString() };
    if (idx > -1) db.abandonedCarts[idx] = cart;
    else db.abandonedCarts.push(cart);
    await saveDB(db);
    res.status(204).end();
  });

  // ── WELCOME EMAIL (triggered from frontend on first order) ──────────────
  app.post("/api/welcome-email", async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: "Missing fields." });
    const db = await getDB();
    await fireEmail(db, "welcome_email_customer", () => sendWelcomeEmail(email, name));
    res.json({ sent: true });
  });

  // ── VITE / STATIC ────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(distPath, "index.html"))
    );
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🌿 Bud N' Buddies server → http://localhost:${PORT}`);
    console.log(`   Admin dashboard → http://localhost:${PORT}/admin`);
    console.log(`   Resend emails: ${process.env.RESEND_API_KEY ? "✅ configured" : "⚠️  RESEND_API_KEY not set"}\n`);
  });
}

startServer();

import { Resend } from "resend";
import { isAutomationEnabled, logEmailEvent } from "./db_ops.js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const ADMIN_EMAIL = "biholanishant0@gmail.com";
const STORE_NAME = "Bud N' Buddies";
const STORE_PHONE = "(825) 218-8234";
const STORE_ADDRESS = "130-75 Salisbury Way, Sherwood Park, AB T8B 1K4";
const STORE_URL = process.env.STORE_URL ?? "https://budnbuddies.vercel.app";
const FROM = process.env.RESEND_FROM_EMAIL ?? `${STORE_NAME} <onboarding@resend.dev>`;
const TEST_EMAIL = process.env.TEST_EMAIL; // if set, all customer emails redirect here

function toAddr(addr: string): string[] {
  return [TEST_EMAIL || addr];
}

// Safely resolve customer email from order — works whether order came from DB or raw body
function customerEmail(order: any): string {
  return order.customerEmail || (order.customer as any)?.email || "";
}
function customerName(order: any): string {
  return (order.customer as any)?.name || order.customerName || "Customer";
}

function brandWrap(body: string): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>body{margin:0;padding:0;background:#f4f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#121212}.shell{max-width:600px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}.header{background:#1e4d2b;padding:32px 40px;text-align:center}.body{padding:40px}.badge{display:inline-block;background:#1e4d2b;color:#c5e1a5;font-size:11px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:24px}h2{font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;color:#1e4d2b;margin:0 0 12px}p{font-size:15px;line-height:1.6;color:#444;margin:0 0 16px}.order-box{background:#f4f1ea;border-radius:16px;padding:24px;margin:24px 0}.order-box .row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid rgba(30,77,43,.08)}.order-box .row:last-child{border-bottom:none;font-weight:900;color:#1e4d2b;font-size:16px}.order-box .label{color:#888;font-weight:600}.items-table{width:100%;border-collapse:collapse;margin:16px 0}.items-table th{text-align:left;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.15em;color:#999;padding:8px 0;border-bottom:1px solid #eee}.items-table td{font-size:14px;padding:10px 0;border-bottom:1px solid #f0f0f0}.cta{display:block;background:#1e4d2b;color:#c5e1a5!important;text-decoration:none;font-weight:900;font-size:14px;letter-spacing:.15em;text-transform:uppercase;text-align:center;padding:16px 32px;border-radius:100px;margin:24px 0}.footer{background:#f4f1ea;padding:24px 40px;text-align:center;font-size:11px;color:#aaa;font-weight:600;letter-spacing:.08em;text-transform:uppercase}.driver-box{background:#1e4d2b;border-radius:16px;padding:20px 24px;color:#c5e1a5;margin:20px 0}.driver-box p{color:#c5e1a5!important;margin:4px 0;font-size:14px}.driver-box .name{font-size:20px;font-weight:900;color:#fff!important}</style>
</head><body><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 16px"><div class="shell"><div class="header"><div style="font-size:26px;font-weight:900;color:#c5e1a5;letter-spacing:-.02em">BUD N' BUDDIES</div><div style="color:#c5e1a5;font-size:12px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;margin-top:8px">Sherwood Park's Finest Cannabis</div></div><div class="body">${body}</div><div class="footer">${STORE_ADDRESS} &nbsp;·&nbsp; ${STORE_PHONE}<br/>Open Every Day Until 2:00 AM &nbsp;·&nbsp; 19+ with Valid ID</div></div></td></tr></table></body></html>`;
}

function itemsRows(items: any[]): string {
  return `<table class="items-table"><thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead><tbody>${
    items.map(i => `<tr><td>${i.name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right;font-weight:700">$${(i.price * i.quantity).toFixed(2)}</td></tr>`).join("")
  }</tbody></table>`;
}

function totalsRows(o: any): string {
  const sub = o.subtotal ?? o.total ?? 0;
  const fee = o.deliveryFee ?? 0;
  const disc = o.discount ?? 0;
  const rows = [
    ["Subtotal", `$${sub.toFixed(2)}`],
    fee > 0 ? ["Delivery", `$${fee.toFixed(2)}`] : ["Delivery", "FREE"],
    ...(disc > 0 ? [["Discount", `−$${disc.toFixed(2)}`]] : []),
    ["Total", `$${(o.total ?? 0).toFixed(2)}`],
  ];
  return `<div class="order-box">${rows.map(([l, v]) => `<div class="row"><span class="label">${l}</span><span>${v}</span></div>`).join("")}</div>`;
}

async function fire(key: string, orderId: string | undefined, fn: () => Promise<void>) {
  if (!process.env.RESEND_API_KEY) return;
  const enabled = await isAutomationEnabled(key).catch(() => true);
  if (!enabled) return;
  try {
    await fn();
    if (orderId) await logEmailEvent(orderId, key).catch(() => {});
  } catch (err) {
    console.error(`[EMAIL ERROR] ${key}:`, err);
  }
}

// 1 — Order confirmation → customer
export async function sendOrderConfirmation(order: any) {
  const isDelivery = order.delivery?.method === "delivery";
  const slotLabel: Record<string, string> = { asap: "ASAP (45–75 min)", "2h": "Today in 2 hours", "4h": "Today in 4 hours" };
  const toEmail = customerEmail(order);
  if (!toEmail) return;
  await fire("order_confirmation_customer", order.orderId, () =>
    resend.emails.send({
      from: FROM,
      to: toAddr(toEmail),
      subject: `Order Confirmed — ${order.orderId} | ${STORE_NAME}`,
      html: brandWrap(`
        <div class="badge">Order Confirmed</div>
        <h2>Thanks, ${customerName(order).split(" ")[0]}! 🌿</h2>
        <p>Your order <strong>${order.orderId}</strong> is confirmed and we're getting it ready.</p>
        ${itemsRows(order.items)}${totalsRows(order)}
        <div class="order-box">
          <div class="row"><span class="label">Method</span><span>${isDelivery ? "🚗 Delivery" : "🏪 In-Store Pickup"}</span></div>
          ${isDelivery ? `<div class="row"><span class="label">Address</span><span>${order.delivery.street}, ${order.delivery.city}</span></div><div class="row"><span class="label">Window</span><span>${slotLabel[order.delivery.slot] ?? "ASAP"}</span></div>` : `<div class="row"><span class="label">Pickup At</span><span>${STORE_ADDRESS}</span></div>`}
        </div>
        <a class="cta" href="${STORE_URL}/order/${order.orderId}">Track Your Order →</a>
        <p style="color:#999;font-size:13px">Questions? Call us at ${STORE_PHONE}. Open every day until 2AM.</p>
      `),
    }) as Promise<any>
  );
}

// 2 — New order alert → admin
export async function sendAdminAlert(order: any) {
  const isDelivery = order.delivery?.method === "delivery";
  await fire("new_order_alert_admin", order.orderId, () =>
    resend.emails.send({
      from: FROM,
      to: [ADMIN_EMAIL],
      subject: `🛒 New Order — ${order.orderId} ($${(order.total ?? 0).toFixed(2)})`,
      html: brandWrap(`
        <div class="badge">New Order</div>
        <h2>${order.orderId}</h2>
        <div class="order-box">
          <div class="row"><span class="label">Customer</span><span>${order.customer.name}</span></div>
          <div class="row"><span class="label">Email</span><span>${order.customer.email}</span></div>
          <div class="row"><span class="label">Phone</span><span>${order.customer.phone}</span></div>
          <div class="row"><span class="label">Method</span><span>${isDelivery ? "Delivery" : "Pickup"}</span></div>
          ${isDelivery ? `<div class="row"><span class="label">Address</span><span>${order.delivery.street}, ${order.delivery.city} ${order.delivery.postal}</span></div>` : ""}
        </div>
        ${itemsRows(order.items)}${totalsRows(order)}
        <a class="cta" href="${STORE_URL}/admin">Open Admin Dashboard →</a>
      `),
    }) as Promise<any>
  );
}

// 3 — Order Preparing → customer
export async function sendPreparing(order: any) {
  const toEmail = customerEmail(order);
  if (!toEmail) return;
  await fire("order_preparing_customer", order.orderId, () =>
    resend.emails.send({
      from: FROM,
      to: toAddr(toEmail),
      subject: `👨‍🍳 Your order is being prepared — ${order.orderId}`,
      html: brandWrap(`
        <div class="badge">Being Prepared</div>
        <h2>We're preparing your order 👨‍🍳</h2>
        <p>Order <strong>${order.orderId}</strong> is now being carefully prepared. You'll get another update soon!</p>
        <a class="cta" href="${STORE_URL}/order/${order.orderId}">Track Your Order →</a>
        <p style="color:#999;font-size:13px">Thank you for your patience. Questions? Call us at ${STORE_PHONE}.</p>
      `),
    }) as Promise<any>
  );
}

// 3.5 — Dispatched → customer
export async function sendDispatched(order: any) {
  const toEmail = customerEmail(order);
  if (!toEmail) return;
  await fire("order_dispatched_customer", order.orderId, () =>
    resend.emails.send({
      from: FROM,
      to: toAddr(toEmail),
      subject: `🚗 Your order is on the way — ${order.orderId}`,
      html: brandWrap(`
        <div class="badge">On The Way</div>
        <h2>Your order is en route! 🚗</h2>
        <p>Order <strong>${order.orderId}</strong> has been picked up and is headed your way.</p>
        ${order.driverName ? `<div class="driver-box"><p style="font-size:11px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;opacity:.7;margin-bottom:4px">Your Driver</p><p class="name">${order.driverName}</p>${order.driverPhone ? `<p>${order.driverPhone}</p>` : ""}</div>` : ""}
        <a class="cta" href="${STORE_URL}/order/${order.orderId}">Track Live Status →</a>
        <p style="color:#999;font-size:13px">Please have government-issued ID ready. Must be 19+.</p>
      `),
    }) as Promise<any>
  );
}

// 4 — Delivered → customer
export async function sendDelivered(order: any) {
  const toEmail = customerEmail(order);
  if (!toEmail) return;
  await fire("order_delivered_customer", order.orderId, () =>
    resend.emails.send({
      from: FROM,
      to: toAddr(toEmail),
      subject: `✅ Delivered — ${order.orderId} | Leave Us a Review!`,
      html: brandWrap(`
        <div class="badge">Delivered</div>
        <h2>Enjoy your order! 🌿</h2>
        <p>Order <strong>${order.orderId}</strong> has been delivered. Hope you love it!</p>
        ${totalsRows(order)}
        <div style="background:#f4f1ea;border-radius:16px;padding:24px;margin:24px 0;text-align:center">
          <p style="font-weight:900;color:#1e4d2b;margin:0 0 8px">How was your experience?</p>
          <p style="font-size:13px;color:#888;margin:0 0 16px">Your review helps other customers and supports our small local business.</p>
          <a href="https://g.page/r/budnbuddies/review" style="color:#1e4d2b;font-weight:900;font-size:14px">Leave a Google Review ★</a>
        </div>
        <p style="color:#999;font-size:13px">Shop again at <a href="${STORE_URL}" style="color:#1e4d2b;font-weight:700">${STORE_URL}</a></p>
      `),
    }) as Promise<any>
  );
}

// 5 — Ready for pickup → customer
export async function sendReadyForPickup(order: any) {
  const toEmail = customerEmail(order);
  if (!toEmail) return;
  await fire("ready_for_pickup_customer", order.orderId, () =>
    resend.emails.send({
      from: FROM,
      to: toAddr(toEmail),
      subject: `🏪 Ready for Pickup — ${order.orderId}`,
      html: brandWrap(`
        <div class="badge">Ready for Pickup</div>
        <h2>Your order is ready! 🏪</h2>
        <p>Order <strong>${order.orderId}</strong> is packaged and waiting for you at the store.</p>
        <div class="order-box">
          <div class="row"><span class="label">Pickup At</span><span>${STORE_ADDRESS}</span></div>
          <div class="row"><span class="label">Hours</span><span>Open Every Day Until 2:00 AM</span></div>
          <div class="row"><span class="label">Phone</span><span>${STORE_PHONE}</span></div>
        </div>
        <p style="color:#888;font-size:13px">Please bring your <strong>government-issued ID</strong> and quote your order number at the counter.</p>
        <a class="cta" href="https://maps.google.com/?q=${encodeURIComponent(STORE_ADDRESS)}">Get Directions →</a>
      `),
    }) as Promise<any>
  );
}

// 6 — Cancelled → customer
export async function sendCancelled(order: any) {
  const toEmail = customerEmail(order);
  if (!toEmail) return;
  await fire("order_cancelled_customer", order.orderId, () =>
    resend.emails.send({
      from: FROM,
      to: toAddr(toEmail),
      subject: `Order Cancelled — ${order.orderId} | ${STORE_NAME}`,
      html: brandWrap(`
        <div class="badge" style="background:#c0392b">Order Cancelled</div>
        <h2>Your order has been cancelled</h2>
        <p>Unfortunately, order <strong>${order.orderId}</strong> has been cancelled.</p>
        <p>If you were charged, a full refund will be processed within 3–5 business days. If you have questions, call us at ${STORE_PHONE}.</p>
        <a class="cta" href="${STORE_URL}/shop">Browse Our Menu →</a>
        <p style="color:#999;font-size:13px">We're sorry for the inconvenience. We hope to serve you again soon.</p>
      `),
    }) as Promise<any>
  );
}

// 7 — Welcome → new customer
export async function sendWelcome(email: string, name: string, promoCode = "WELCOME20") {
  await fire("welcome_email_customer", undefined, () =>
    resend.emails.send({
      from: FROM,
      to: [email],
      subject: `Welcome to ${STORE_NAME} — Here's 20% Off 🌿`,
      html: brandWrap(`
        <div class="badge">Welcome to the Family</div>
        <h2>Hey ${name}! Welcome. 🌿</h2>
        <p>Thanks for joining Bud N' Buddies — Sherwood Park's most trusted cannabis store.</p>
        <div style="background:#1e4d2b;border-radius:16px;padding:32px;text-align:center;margin:24px 0">
          <p style="color:#c5e1a5;font-size:12px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;margin:0 0 8px">Your Welcome Gift</p>
          <div style="background:#c5e1a5;color:#1e4d2b;font-size:28px;font-weight:900;letter-spacing:.1em;padding:16px 32px;border-radius:12px;display:inline-block;margin:8px 0">${promoCode}</div>
          <p style="color:#c5e1a5;font-size:13px;margin:8px 0 0">20% off your first order — applied at checkout</p>
        </div>
        <a class="cta" href="${STORE_URL}/shop">Start Shopping →</a>
        <p style="color:#999;font-size:13px">Rating: 4.9/5 stars · Open every day until 2AM</p>
      `),
    }) as Promise<any>
  );
}

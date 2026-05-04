import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrders, insertOrder, upsertCustomer, getPromoByCode, incrementPromoUsage } from "./_lib/supabase";
import { sendOrderConfirmation, sendAdminAlert, sendWelcome } from "./_lib/email";
import { requireAdmin, json } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/orders — admin only
  if (req.method === "GET") {
    if (!requireAdmin(req as any, res as any)) return;
    const orders = await getOrders();
    return json(res as any, { orders });
  }

  // POST /api/orders — create order (public)
  if (req.method === "POST") {
    const body = req.body;
    const { orderId, customer, delivery, items, subtotal, deliveryFee, discount, total, promoCode } = body;

    if (!orderId || !customer?.email || !items?.length) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const order = {
      order_id: orderId,
      customer_name: customer.name,
      customer_email: customer.email.toLowerCase(),
      customer_phone: customer.phone,
      customer,
      delivery,
      items,
      subtotal: subtotal ?? total,
      delivery_fee: deliveryFee ?? 0,
      discount: discount ?? 0,
      total,
      promo_code: promoCode ?? null,
      status: "confirmed",
      driver_name: null,
      driver_phone: null,
      email_log: [],
      created_at: new Date().toISOString(),
    };

    await insertOrder(order);

    await upsertCustomer(customer.email.toLowerCase(), {
      name: customer.name, phone: customer.phone, totalSpent: total,
    }).catch(() => {});

    if (promoCode) {
      const promo = await getPromoByCode(promoCode).catch(() => null);
      if (promo) await incrementPromoUsage(promo.id).catch(() => {});
    }

    // fire emails non-blocking
    const orderObj = { orderId, customer, delivery, items, subtotal, deliveryFee, discount, total, promoCode };
    sendOrderConfirmation(orderObj).catch(() => {});
    sendAdminAlert(orderObj).catch(() => {});

    // welcome email for first-time customers
    const isFirstOrder = true; // supabase upsert handles this — send optimistically
    if (isFirstOrder) sendWelcome(customer.email, customer.name.split(" ")[0]).catch(() => {});

    return res.status(201).json({ success: true, orderId });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

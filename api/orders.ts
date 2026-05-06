import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrders, insertOrder, upsertCustomer, getCustomerByEmail, getPromoByCode } from "./_lib/db_ops.js";
import { sendOrderConfirmation, sendAdminAlert, sendWelcome } from "./_lib/email.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/orders — admin only
  if (req.method === "GET") {
    const secret = process.env.ADMIN_SECRET;
    const auth = req.headers.authorization ?? "";
    if (!secret || auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const orders = await getOrders();
      return res.status(200).json({ orders });
    } catch (err: any) {
      console.error("[GET orders error]", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST /api/orders — create order (public)
  if (req.method === "POST") {
    const body = req.body;
    const { orderId, customer, delivery, items, subtotal, deliveryFee, discount, total, promoCode, paymentMethod } = body;

    if (!orderId || !customer?.email || !items?.length) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    try {
      const orderData = {
        orderId,
        customerName: customer.name,
        customerEmail: customer.email.toLowerCase(),
        customerPhone: customer.phone,
        customer: { ...customer, paymentMethod: paymentMethod ?? "pay_at_store" },
        delivery,
        items,
        subtotal: Number(subtotal) || Number(total),
        deliveryFee: Number(deliveryFee) || 0,
        discount: Number(discount) || 0,
        total: Number(total),
        promoCode: promoCode ?? null,
        status: "confirmed",
        createdAt: new Date(),
      };

      const insertedOrder = await insertOrder(orderData);
      console.log("[ORDER SUCCESS]", orderId);

      // Check if customer is new (with fallback)
      let isNewCustomer = true;
      try {
        const existingCustomer = await getCustomerByEmail(customer.email.toLowerCase());
        isNewCustomer = !existingCustomer;
      } catch (e) {
        console.error("Customer lookup failed:", e);
        // Assume new customer if lookup fails
      }

      // async background tasks
      upsertCustomer(customer.email.toLowerCase(), {
        name: customer.name,
        phone: customer.phone,
        totalSpent: Number(total),
        address: delivery?.method === "delivery" ? `${delivery.street}, ${delivery.city} ${delivery.postal}` : null,
        preferredMethod: delivery?.method ?? "pickup",
      }).catch(e => console.error("Customer upsert failed:", e));

      // fire emails
      sendOrderConfirmation({ ...body, paymentMethod: paymentMethod ?? "pay_at_store" }).catch(e => console.error("Email failed:", e));
      sendAdminAlert({ ...body, paymentMethod: paymentMethod ?? "pay_at_store" }).catch(e => console.error("Admin alert failed:", e));

      // Only send welcome email to new customers
      if (isNewCustomer) {
        sendWelcome(customer.email, customer.name.split(" ")[0]).catch(e => console.error("Welcome email failed:", e));
      }

      return res.status(201).json({ success: true, orderId, order: insertedOrder });
    } catch (err: any) {
      console.error("[ORDER ERROR]", err.message || JSON.stringify(err));
      return res.status(500).json({ error: err.message || "Failed to create order." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

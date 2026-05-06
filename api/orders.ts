import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrders, insertOrder, upsertCustomer, getPromoByCode } from "./_lib/db_ops.js";
import { sendOrderConfirmation, sendAdminAlert, sendWelcome } from "./_lib/email.js";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "budnbuddies2026";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // GET /api/orders — admin only
  if (req.method === "GET") {
    const auth = req.headers.authorization ?? "";
    if (auth !== `Bearer ${ADMIN_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const orders = await getOrders();
      return res.status(200).json({ orders });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST /api/orders — create order (public)
  if (req.method === "POST") {
    const body = req.body;
    const { orderId, customer, delivery, items, subtotal, deliveryFee, discount, total, promoCode } = body;

    if (!orderId || !customer?.email || !items?.length) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    try {
      const orderData = {
        orderId,
        customerName: customer.name,
        customerEmail: customer.email.toLowerCase(),
        customerPhone: customer.phone,
        customer,
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

      await insertOrder(orderData);

      // async background tasks
      upsertCustomer(customer.email.toLowerCase(), {
        name: customer.name, 
        phone: customer.phone, 
        totalSpent: Number(total),
        address: delivery?.method === "delivery" ? `${delivery.street}, ${delivery.city} ${delivery.postal}` : null,
        preferredMethod: delivery?.method ?? "pickup",
      }).catch(e => console.error("Customer upsert failed:", e));

      // fire emails
      sendOrderConfirmation(body).catch(e => console.error("Email failed:", e));
      sendAdminAlert(body).catch(e => console.error("Admin alert failed:", e));
      sendWelcome(customer.email, customer.name.split(" ")[0]).catch(e => console.error("Welcome email failed:", e));

      return res.status(201).json({ success: true, orderId });
    } catch (err: any) {
      console.error("[ORDER ERROR]", err);
      return res.status(500).json({ error: "Failed to create order." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

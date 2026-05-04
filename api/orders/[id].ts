import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrderById } from "../_lib/supabase.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { id } = req.query;
  const order = await getOrderById(id as string).catch(() => null);

  if (!order) return res.status(404).json({ error: "Order not found." });

  // Normalise field names for the frontend (snake_case → camelCase)
  return res.json({
    order: {
      ...order,
      orderId: order.order_id,
      customer: order.customer ?? { name: order.customer_name, email: order.customer_email, phone: order.customer_phone },
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      discount: order.discount,
      driverName: order.driver_name,
      driverPhone: order.driver_phone,
      emailLog: order.email_log,
      createdAt: order.created_at,
      promoCode: order.promo_code,
    },
  });
}

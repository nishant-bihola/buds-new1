import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrderById, updateOrder } from "../../_lib/supabase";
import { sendDispatched, sendDelivered, sendReadyForPickup } from "../../_lib/email";
import { requireAdmin } from "../../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") return res.status(405).end();
  if (!requireAdmin(req as any, res as any)) return;

  const { id } = req.query;
  const { status, driverName, driverPhone } = req.body;

  const existing = await getOrderById(id as string).catch(() => null);
  if (!existing) return res.status(404).json({ error: "Order not found." });

  const patch: any = { status };
  if (driverName) { patch.driver_name = driverName; patch.driver_phone = driverPhone ?? null; }

  const updated = await updateOrder(id as string, patch);

  const order = {
    orderId: existing.order_id,
    customer: existing.customer ?? { name: existing.customer_name, email: existing.customer_email },
    delivery: existing.delivery,
    items: existing.items,
    subtotal: existing.subtotal,
    deliveryFee: existing.delivery_fee,
    discount: existing.discount,
    total: existing.total,
    driverName: driverName ?? existing.driver_name,
    driverPhone: driverPhone ?? existing.driver_phone,
  };

  const prev = existing.status;
  if (status === "dispatched" && prev !== "dispatched") sendDispatched(order).catch(() => {});
  if (status === "delivered" && prev !== "delivered") sendDelivered(order).catch(() => {});
  if (status === "ready_pickup" && prev !== "ready_pickup") sendReadyForPickup(order).catch(() => {});

  return res.json({ success: true, order: updated });
}

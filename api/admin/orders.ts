import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getOrders, updateOrder, getOrderById } from "../_lib/db_ops.js";
import { requireAdmin, json, cors } from "../_lib/auth.js";
import {
  sendDispatched,
  sendDelivered,
  sendReadyForPickup,
} from "../_lib/email.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    if (req.method === "GET") {
      const orders = await getOrders();
      return json(res as any, { orders });
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      const { id } = req.query;
      if (!id) return json(res as any, { error: "Missing order ID" }, 400);

      const body = req.body ?? {};
      const { status, driverName, driverPhone, ...rest } = body;

      const patch: Record<string, any> = { ...rest };
      if (status) patch.status = status;
      if (driverName !== undefined) patch.driverName = driverName;
      if (driverPhone !== undefined) patch.driverPhone = driverPhone;

      const order = await updateOrder(id as string, patch);
      if (!order) return json(res as any, { error: "Order not found" }, 404);

      // Fire status-change emails in the background
      if (status) {
        const fullOrder = await getOrderById(id as string);
        if (fullOrder) {
          const isPickup = (fullOrder.delivery as any)?.method === "pickup";
          if (status === "dispatched" && !isPickup) {
            sendDispatched({ ...fullOrder, driverName, driverPhone }).catch(console.error);
          } else if (status === "delivered") {
            sendDelivered(fullOrder).catch(console.error);
          } else if (status === "ready_pickup" && isPickup) {
            sendReadyForPickup(fullOrder).catch(console.error);
          }
        }
      }

      return json(res as any, { order });
    }

    return json(res as any, { error: "Method not allowed" }, 405);
  } catch (err: any) {
    console.error("[Admin Orders Error]", err);
    return json(res as any, { error: err.message }, 500);
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin, json, cors } from "../_lib/auth.js";
import { sendOrderConfirmation } from "../_lib/email.js";

const SAMPLE_ORDER = {
  orderId: "BNB-TEST-001",
  customerName: "Test Customer",
  customerEmail: process.env.TEST_EMAIL || "nishant15bihola@gmail.com",
  customer: {
    name: "Test Customer",
    email: process.env.TEST_EMAIL || "nishant15bihola@gmail.com",
    phone: "(825) 218-8234",
    paymentMethod: "pay_on_delivery",
  },
  delivery: { method: "delivery", street: "123 Test St", city: "Sherwood Park", postal: "T8A 0A1", slot: "asap" },
  items: [{ name: "Blue Dream 3.5g", quantity: 2, price: 29.99 }],
  subtotal: 59.98,
  deliveryFee: 5.99,
  discount: 0,
  total: 65.97,
  promoCode: null,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res as any);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (!requireAdmin(req as any, res as any)) return;

  try {
    await sendOrderConfirmation(SAMPLE_ORDER);
    return json(res as any, {
      success: true,
      message: `Test email sent to ${process.env.TEST_EMAIL || "nishant15bihola@gmail.com"}`,
    });
  } catch (err: any) {
    console.error("[test-email]", err);
    return json(res as any, { error: err.message }, 500);
  }
}

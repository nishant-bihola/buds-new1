import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getProducts } from "../_lib/db_ops.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-11-20.acacia" as any,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { items, customerName, customerEmail, customerPhone } = body ?? {};

  if (!items?.length || !customerEmail || !customerName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Re-validate prices server-side — never trust client-sent prices
  const allProducts = await getProducts(true);
  const productMap = new Map(allProducts.map((p) => [p.id, p]));

  for (const item of items) {
    if (!productMap.has(item.id)) {
      return res.status(400).json({ error: `Product not found: ${item.id}` });
    }
  }

  const lineItems = items.map((item: any) => {
    const dbProduct = productMap.get(item.id)!;
    return {
      price_data: {
        currency: "cad",
        product_data: { name: dbProduct.name },
        unit_amount: Math.round(dbProduct.price * 100),
      },
      quantity: item.quantity,
    };
  });

  const siteUrl = process.env.VITE_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://budnbuddies.vercel.app";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customerEmail,
      currency: "cad",
      success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      metadata: {
        customerName,
        customerPhone: customerPhone ?? "",
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("[Stripe Error]:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}

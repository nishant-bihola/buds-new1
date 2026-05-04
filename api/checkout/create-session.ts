import Stripe from "stripe";
import { db } from "../_lib/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-04-22.dahlia" as any });

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { items, customerName, customerEmail, customerPhone, sessionKey: cartSessionKey } = body ?? {};

  if (!items?.length || !customerEmail || !customerName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Re-validate prices server-side — never trust client-sent prices
  const productIds = items.map((i: any) => i.id);
  const { data: dbProducts } = await db
    .from("products")
    .select("id, name, price")
    .in("id", productIds);

  const productMap = new Map((dbProducts ?? []).map((p: any) => [p.id, p]));

  // Validate all items exist in DB — reject any unknown product
  for (const item of items) {
    if (!productMap.has(item.id)) {
      return res.status(400).json({ error: `Product not found: ${item.id}` });
    }
  }

  const lineItems = items.map((item: any) => {
    const dbProduct = productMap.get(item.id);
    const unitPrice = dbProduct.price;
    const productName = dbProduct.name;
    return {
      price_data: {
        currency: "cad",
        product_data: { name: productName },
        unit_amount: Math.round(unitPrice * 100),
      },
      quantity: item.quantity,
    };
  });

  const siteUrl = process.env.VITE_APP_URL ?? "https://buds-n-buddies-v2.vercel.app";

  // Save/update abandoned cart record before redirecting to Stripe
  if (cartSessionKey) {
    await db.from("abandoned_carts").upsert(
      {
        session_key: cartSessionKey,
        email: customerEmail,
        phone: customerPhone || null,
        name: customerName,
        items,
        total: items.reduce((s: number, i: any) => s + (productMap.get(i.id)?.price ?? 0) * i.quantity, 0),
        converted: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_key" }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: customerEmail,
    currency: "cad",
    success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout`,
    metadata: {
      cartSessionKey: cartSessionKey ?? "",
      customerName,
      customerPhone: customerPhone ?? "",
      shippingAddress: "",
    },
  });

  return res.json({ url: session.url });
}

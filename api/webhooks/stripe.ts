import Stripe from "stripe";
import { db } from "../_lib/supabaseAdmin";
import { sendOrderConfirmation } from "../_lib/emails";
import { sendOrderConfirmationSMS } from "../_lib/sms";

// Must disable Vercel's body parser — Stripe needs the raw bytes to verify signature
export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-04-22.dahlia" as any });

async function getRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret ?? "");
  } catch (err: any) {
    console.error("[webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: err.message });
  }

  if (event.type !== "checkout.session.completed") {
    return res.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Idempotency — skip if order already exists
  const { data: existing } = await db
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .single();

  if (existing) return res.json({ received: true });

  // Re-fetch line items from Stripe (authoritative source)
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

  const items = lineItems.data.map((li) => ({
    id: li.price?.product ?? "",
    name: li.description ?? "",
    price: (li.price?.unit_amount ?? 0) / 100,
    quantity: li.quantity ?? 1,
    image: "",
  }));

  const total = (session.amount_total ?? 0) / 100;
  const subtotal = total;
  const meta = session.metadata ?? {};
  const email = session.customer_details?.email ?? "";
  const name = meta.customerName ?? session.customer_details?.name ?? "";
  const phone = meta.customerPhone ?? session.customer_details?.phone ?? "";

  // Upsert customer
  let customerId: string | null = null;
  if (email) {
    const { data: customer } = await db
      .from("customers")
      .upsert({ email, name, phone }, { onConflict: "email" })
      .select("id")
      .single();

    if (customer) {
      customerId = customer.id;
      // Increment counters and record last order date
      try {
        const { data: c } = await db.from("customers").select("total_orders, total_spent").eq("id", customerId).single();
        if (c) {
          await db.from("customers").update({
            total_orders: (c.total_orders ?? 0) + 1,
            total_spent: (c.total_spent ?? 0) + total,
            last_order_at: new Date().toISOString(),
          }).eq("id", customerId);
        }
      } catch {}
    }
  }

  // Insert order
  const { data: order } = await db
    .from("orders")
    .insert({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      customer_id: customerId,
      customer_email: email,
      customer_name: name,
      customer_phone: phone,
      shipping_address: meta.shippingAddress ?? "",
      items,
      subtotal,
      total,
      status: "paid",
      stripe_status: session.payment_status,
    })
    .select("id")
    .single();

  // Mark abandoned cart as converted
  if (meta.cartSessionKey) {
    await db
      .from("abandoned_carts")
      .update({ converted: true })
      .eq("session_key", meta.cartSessionKey);
  }

  // Read automation settings
  const { data: automations } = await db
    .from("automation_settings")
    .select("key, enabled");

  const settings = Object.fromEntries((automations ?? []).map((a: any) => [a.key, a.enabled]));

  // Send confirmation email
  if (settings["order_confirm_email"] && email && order) {
    await sendOrderConfirmation({
      customerName: name,
      customerEmail: email,
      items,
      total,
      orderId: order.id,
    });
  }

  // Send confirmation SMS
  if (settings["order_confirm_sms"] && phone) {
    const siteUrl = process.env.VITE_APP_URL ?? "https://buds-n-buddies-v2.vercel.app";
    await sendOrderConfirmationSMS(phone, name, total);
  }

  return res.json({ received: true });
}

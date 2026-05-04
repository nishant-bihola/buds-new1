import { db } from "../_lib/supabaseAdmin";
import { sendAbandonedCartReminder } from "../_lib/emails";
import { sendAbandonedCartSMS } from "../_lib/sms";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).end();

  // Verify cron secret
  const secret = req.query?.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: carts } = await db
    .from("abandoned_carts")
    .select("*")
    .eq("converted", false)
    .eq("reminder_sent", false)
    .not("email", "is", null)
    .lt("updated_at", oneHourAgo)
    .gt("updated_at", twentyFourHoursAgo);

  if (!carts?.length) return res.json({ processed: 0 });

  const { data: automations } = await db.from("automation_settings").select("key, enabled");
  const settings = Object.fromEntries((automations ?? []).map((a: any) => [a.key, a.enabled]));
  const siteUrl = process.env.VITE_APP_URL ?? "https://buds-n-buddies-v2.vercel.app";

  let processed = 0;
  for (const cart of carts) {
    try {
      if (settings["abandoned_cart_email"] && cart.email) {
        await sendAbandonedCartReminder({
          name: cart.name ?? "Friend",
          email: cart.email,
          items: cart.items ?? [],
          total: cart.total ?? 0,
          siteUrl,
        });
      }
      if (settings["abandoned_cart_sms"] && cart.phone && cart.name) {
        await sendAbandonedCartSMS(cart.phone, cart.name, cart.total ?? 0, siteUrl);
      }
      await db
        .from("abandoned_carts")
        .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
        .eq("id", cart.id);
      processed++;
    } catch (err) {
      console.error("[cron] cart", cart.id, err);
    }
  }

  return res.json({ processed });
}

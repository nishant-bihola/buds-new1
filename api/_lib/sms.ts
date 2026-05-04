// Twilio SMS — only sends if TWILIO_* env vars are set.
// Uses plain fetch (no twilio npm package needed).

async function twilioSend(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) return; // feature disabled

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[SMS] Twilio error:", text);
    }
  } catch (err) {
    console.error("[SMS] Send failed:", err);
  }
}

export async function sendOrderConfirmationSMS(phone: string, name: string, total: number) {
  const first = name.split(" ")[0];
  await twilioSend(
    phone,
    `Hey ${first}! Your Bud N' Buddies order ($${total.toFixed(2)} CAD) is confirmed ✅ Ready for pickup at 130-75 Salisbury Way, Sherwood Park. Open till 2 AM — (825) 218-8234`
  );
}

export async function sendAbandonedCartSMS(phone: string, name: string, total: number, siteUrl: string) {
  const first = name.split(" ")[0];
  await twilioSend(
    phone,
    `Hey ${first}, you left $${total.toFixed(2)} in your Bud N' Buddies cart 🌿 Complete your order: ${siteUrl}/checkout`
  );
}

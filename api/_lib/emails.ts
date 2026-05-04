import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "Bud N' Buddies <orders@budnbuddies.ca>";

export async function sendOrderConfirmation(order: {
  customerName: string;
  customerEmail: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  orderId: string;
}) {
  const itemRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e4d2b20;color:#121212;font-size:14px">${i.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e4d2b20;text-align:center;color:#666;font-size:14px">×${i.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e4d2b20;text-align:right;color:#121212;font-weight:700;font-size:14px">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#1e4d2b;padding:40px 40px 32px;text-align:center">
      <p style="color:#c5e1a5;font-size:11px;font-weight:800;letter-spacing:0.4em;text-transform:uppercase;margin:0 0 8px">Bud N' Buddies</p>
      <h1 style="color:#f4f1ea;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;margin:0">Order Confirmed!</h1>
    </div>
    <div style="padding:40px">
      <p style="color:#121212;font-size:16px;margin:0 0 24px">Hey ${order.customerName.split(" ")[0]}, your order is in! 🌿 We're prepping it now and it'll be ready for pickup at <strong>130-75 Salisbury Way, Sherwood Park</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr>
            <th style="text-align:left;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#1e4d2b;padding-bottom:8px">Item</th>
            <th style="text-align:center;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#1e4d2b;padding-bottom:8px">Qty</th>
            <th style="text-align:right;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#1e4d2b;padding-bottom:8px">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="background:#f4f1ea;border-radius:12px;padding:16px 20px;display:flex;justify-content:space-between;margin-bottom:32px">
        <span style="font-weight:900;text-transform:uppercase;letter-spacing:0.05em;font-size:14px">Total</span>
        <span style="font-weight:900;font-size:18px;color:#1e4d2b">$${order.total.toFixed(2)} CAD</span>
      </div>
      <div style="background:#1e4d2b10;border-left:3px solid #1e4d2b;border-radius:4px;padding:16px;margin-bottom:32px">
        <p style="margin:0;font-size:13px;color:#121212"><strong>Hours:</strong> Open every day until 2 AM<br><strong>Phone:</strong> (825) 218-8234<br><strong>Order ID:</strong> <span style="font-family:monospace;font-size:12px">${order.orderId.slice(0, 8).toUpperCase()}</span></p>
      </div>
      <p style="color:#888;font-size:12px;text-align:center;margin:0">19+ with valid ID required for pickup. Questions? Reply to this email or call us.</p>
    </div>
    <div style="background:#f4f1ea;padding:20px 40px;text-align:center">
      <p style="color:#1e4d2b;font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;margin:0">Bud N' Buddies Cannabis · Sherwood Park, AB</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: [order.customerEmail],
      subject: `Order confirmed — $${order.total.toFixed(2)} CAD`,
      html,
    });
  } catch (err) {
    console.error("[EMAIL] Order confirmation failed:", err);
  }
}

export async function sendAbandonedCartReminder(cart: {
  name: string;
  email: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
  siteUrl: string;
}) {
  const itemList = cart.items
    .map((i) => `<li style="padding:6px 0;color:#121212;font-size:14px">• ${i.name} ×${i.quantity} — $${(i.price * i.quantity).toFixed(2)}</li>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:'Helvetica Neue',Arial,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#1e4d2b;padding:40px;text-align:center">
      <h1 style="color:#f4f1ea;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;margin:0">You left something behind 👀</h1>
    </div>
    <div style="padding:40px">
      <p style="color:#121212;font-size:16px;margin:0 0 24px">Hey ${cart.name.split(" ")[0]}, your cart is still waiting for you!</p>
      <ul style="list-style:none;padding:0;margin:0 0 24px;background:#f4f1ea;border-radius:12px;padding:16px 20px">
        ${itemList}
      </ul>
      <div style="text-align:center;margin-bottom:32px">
        <p style="font-size:20px;font-weight:900;color:#1e4d2b;margin:0 0 20px">Total: $${cart.total.toFixed(2)} CAD</p>
        <a href="${cart.siteUrl}/checkout" style="display:inline-block;background:#1e4d2b;color:#f4f1ea;padding:16px 40px;border-radius:100px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;font-size:13px;text-decoration:none">Complete My Order →</a>
      </div>
      <p style="color:#888;font-size:12px;text-align:center">Open every day until 2 AM · 130-75 Salisbury Way, Sherwood Park</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: [cart.email],
      subject: "Your cart is still waiting 🌿",
      html,
    });
  } catch (err) {
    console.error("[EMAIL] Abandoned cart reminder failed:", err);
  }
}

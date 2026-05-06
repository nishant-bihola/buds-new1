// This module provides automation-control helpers backed by the same
// Drizzle/Neon DB that the rest of the API uses.  It is intentionally kept
// thin so email.ts can import from here without creating a circular dep.

import { db } from "./db.js";
import { automations, orders } from "./schema.js";
import { eq } from "drizzle-orm";

export async function isAutomationEnabled(key: string): Promise<boolean> {
  try {
    const result = await db.select().from(automations).where(eq(automations.key, key));
    // If no row exists, treat as enabled so first-time deploys send emails
    return result[0]?.enabled ?? true;
  } catch {
    return true; // fail open — always send email if DB is unavailable
  }
}

export async function logEmailEvent(orderId: string, event: string): Promise<void> {
  try {
    const result = await db.select().from(orders).where(eq(orders.orderId, orderId));
    if (!result[0]) return;

    const existing = (result[0].emailLog as { event: string; sentAt: string }[]) ?? [];
    const updated = [...existing, { event, sentAt: new Date().toISOString() }];

    await db.update(orders)
      .set({ emailLog: updated })
      .where(eq(orders.orderId, orderId));
  } catch (err) {
    console.error("[logEmailEvent] Failed:", err);
  }
}

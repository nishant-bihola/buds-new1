import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "https://dummy-url.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-key";

export const supabase = createClient(url, key);

// ── typed helpers ────────────────────────────────────────────────────────

export async function getProducts(adminAll = false) {
  let q = supabase.from("products").select("*").order("sort_order", { ascending: true });
  if (!adminAll) q = q.eq("in_stock", true);
  const { data } = await q;
  return data ?? [];
}

export async function upsertProduct(product: any) {
  const { data, error } = await supabase.from("products").upsert(product).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function getOrders() {
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getOrderById(orderId: string) {
  const { data } = await supabase.from("orders").select("*").eq("order_id", orderId).single();
  return data;
}

export async function insertOrder(order: any) {
  const { data, error } = await supabase.from("orders").insert(order).select().single();
  if (error) throw error;
  return data;
}

export async function updateOrder(orderId: string, patch: any) {
  const { data, error } = await supabase.from("orders").update(patch).eq("order_id", orderId).select().single();
  if (error) throw error;
  return data;
}

export async function getCustomers() {
  const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function upsertCustomer(email: string, patch: any) {
  const { data: existing } = await supabase.from("customers").select("*").eq("email", email).single();
  if (existing) {
    await supabase.from("customers").update({
      total_orders: (existing.total_orders ?? 0) + 1,
      total_spent: (existing.total_spent ?? 0) + patch.totalSpent,
    }).eq("email", email);
  } else {
    await supabase.from("customers").insert({
      name: patch.name, email, phone: patch.phone,
      total_orders: 1, total_spent: patch.totalSpent,
      created_at: new Date().toISOString(),
    });
  }
}

export async function getPromoCodes() {
  const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getPromoByCode(code: string) {
  const { data } = await supabase.from("promo_codes").select("*").eq("code", code).eq("active", true).single();
  return data;
}

export async function incrementPromoUsage(id: string) {
  await supabase.rpc("increment_promo_usage", { promo_id: id });
}

export async function getAutomations() {
  const { data } = await supabase.from("automations").select("*");
  return data ?? [];
}

export async function isAutomationEnabled(key: string): Promise<boolean> {
  const { data } = await supabase.from("automations").select("enabled").eq("key", key).single();
  return data?.enabled ?? false;
}

export async function logEmailEvent(orderId: string, event: string) {
  const order = await getOrderById(orderId);
  if (!order) return;
  const log = order.email_log ?? [];
  log.push({ event, sentAt: new Date().toISOString() });
  await supabase.from("orders").update({ email_log: log }).eq("order_id", orderId);
}

export async function getDeliveryZones() {
  const { data } = await supabase.from("delivery_zones").select("*").order("created_at", { ascending: true });
  return data ?? [];
}

export async function getDrivers() {
  const { data } = await supabase.from("drivers").select("*").order("created_at", { ascending: true });
  return data ?? [];
}

export async function getStoreHours() {
  const { data } = await supabase.from("store_hours").select("*").order("id", { ascending: true });
  return data ?? [];
}

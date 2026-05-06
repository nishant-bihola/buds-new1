import type { VercelRequest, VercelResponse } from "@vercel/node";

// Store location — 130-75 Salisbury Way, Sherwood Park, AB
const STORE_LAT = 53.5344;
const STORE_LNG = -113.3152;

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const UA = "BudNBuddies/1.0 (budnbuddies.ca)";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ca`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const data = await res.json();
    if (data?.[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// Normalize common address shorthand so Nominatim can parse it
function normalizeStreet(street: string): string {
  return street
    .replace(/\bst\b\.?/gi, "Street")
    .replace(/\bave?\b\.?/gi, "Avenue")
    .replace(/\bblvd\b\.?/gi, "Boulevard")
    .replace(/\bdr\b\.?/gi, "Drive")
    .replace(/\bcrt?\b\.?/gi, "Court")
    .replace(/\brd\b\.?/gi, "Road")
    .replace(/\bpl\b\.?/gi, "Place")
    .replace(/\bsw\b/gi, "SW")
    .replace(/\bse\b/gi, "SE")
    .replace(/\bnw\b/gi, "NW")
    .replace(/\bne\b/gi, "NE")
    .trim();
}

function calcFee(km: number, orderTotal: number): { fee: number; label: string; zone: string } {
  if (km > 25) {
    return { fee: -1, label: "Outside delivery range (25 km+)", zone: "unavailable" };
  }

  if (km <= 5) {
    if (orderTotal >= 75) return { fee: 0, label: "FREE — order over $75", zone: "local" };
    return { fee: 5.49, label: "Flat rate — under 5 km", zone: "local" };
  }

  // 5–25km: $5.49 base + $0.55/km over 5km
  const base = 5.49 + (km - 5) * 0.55;

  let fee: number;
  let discount: string;
  if (orderTotal >= 150) { fee = base * 0.70; discount = "30% off"; }
  else if (orderTotal >= 100) { fee = base * 0.80; discount = "20% off"; }
  else if (orderTotal >= 75)  { fee = base * 0.90; discount = "10% off"; }
  else { fee = base; discount = ""; }

  const zoneLabel = km <= 15 ? "standard zone" : "extended zone";
  const label = discount ? `${discount} large order — ${zoneLabel}` : zoneLabel;

  return {
    fee: Math.round(fee * 100) / 100,
    label,
    zone: km <= 15 ? "standard" : "extended",
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { street, city = "Sherwood Park", postal, orderTotal = 0 } = req.body ?? {};

  if (!street || !postal) {
    return res.status(400).json({ error: "Street and postal required" });
  }

  const cleanPostal = postal.replace(/\s/g, "").toUpperCase();
  const cleanStreet = normalizeStreet(street);

  // Try 3 geocoding strategies in order of reliability:
  // 1. Postal code alone — most reliable in Canada (precise to ~half a block)
  // 2. Structured query (Nominatim structured params) — better than freetext
  // 3. Freetext full address — last resort

  let coords: { lat: number; lng: number } | null = null;
  let strategy = "";

  // Strategy 1: postal code only
  coords = await geocode(`${cleanPostal}, Alberta, Canada`);
  if (coords) { strategy = "postal"; }

  // Strategy 2: structured nominatim query
  if (!coords) {
    try {
      const url = `${NOMINATIM}?street=${encodeURIComponent(cleanStreet)}&city=${encodeURIComponent(city)}&postalcode=${encodeURIComponent(cleanPostal)}&country=Canada&format=json&limit=1`;
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      const d = await r.json();
      if (d?.[0]) { coords = { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) }; strategy = "structured"; }
    } catch { /* fall through */ }
  }

  // Strategy 3: normalized freetext
  if (!coords) {
    coords = await geocode(`${cleanStreet}, ${city}, ${cleanPostal}, Alberta, Canada`);
    if (coords) { strategy = "freetext"; }
  }

  if (!coords) {
    console.warn(`[delivery/quote] Geocode failed for: ${street}, ${city}, ${postal}`);
    // Can't geocode — return null so frontend shows "couldn't calculate" instead of silently using wrong rate
    return res.status(200).json({ fee: null, km: null, label: "Address not found", zone: "unknown", strategy: "failed" });
  }

  const km = haversineKm(STORE_LAT, STORE_LNG, coords.lat, coords.lng);
  const result = calcFee(km, Number(orderTotal));

  console.log(`[delivery/quote] ${cleanPostal} → ${km.toFixed(1)}km via ${strategy} → $${result.fee}`);

  return res.status(200).json({ ...result, km: Math.round(km * 10) / 10, strategy });
}

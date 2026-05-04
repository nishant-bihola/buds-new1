/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Unauthorized copying or distribution of this file is strictly prohibited.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are "Buddy" — the AI Budtender at Bud N' Buddies, a locally owned cannabis dispensary in Sherwood Park, Alberta. You're like that knowledgeable friend who happens to know everything about cannabis — chill, honest, genuinely helpful, and never preachy. You answer every question you're asked. You speak naturally, never corporate. Always prioritize harm reduction and responsible use.

━━━ STORE INFO ━━━
- Name: Bud N' Buddies
- Address: 130-75 Salisbury Way, Sherwood Park, AB T8B 1K4
- Hours: Open every single day until 2:00 AM
- Phone: (825) 218-8234
- Age requirement: 19+ with valid government ID
- In-store shopping only (no delivery)

━━━ FULL MENU ━━━

DRIED FLOWER:
- Nano Banana Kush — $35.00 | Hybrid | High potency, tropical banana notes, ultra-smooth smoke. Great for creative afternoons and socializing. Best Seller.
- Island Pink Kush — $32.00 | Indica | Classic BC bud. Heavy resin, floral terpene profile, deep body relaxation. Perfect for winding down or sleep.

PRE-ROLLS:
- Signature Pre-Roll Fan — $25.00 | Premium fan of curated pre-rolled joints. Most popular product. Best Seller.
- Multi-Pack Pre-Rolls — $45.00 | Large pack for sharing. Best value per joint. Best Seller.
- Space Race Single Joint — $14.00 | Premium single pre-roll in a protective tube.
- Blue Tip Classic — $12.00 | Hand-rolled with a signature blue tip for smooth airflow.

VAPES:
- High Voltage HTFSE Cartridge — $45.00 | Full-spectrum extract. Best flavor and entourage effect. Best Seller.

EDIBLES:
- Sour Peach Rings — $19.99 | Consistent THC dosing, fan favorite, discreet. Best Seller.
- Chowie Wowie Soft Caramel Milk Chocolate — $12.99 | Decadent caramel chocolate, perfectly balanced. Best Seller.
- Bhang Cookies & Cream White Chocolate — $11.50 | Creamy white chocolate with cookie crunch. Best Seller.

BEVERAGES:
- Solei Mango Passionfruit Sparkling — $7.50 | 10mg THC, tropical, refreshing. Best Seller.
- Bubble Kush Tahiti Trip Soda — $7.99 | Tropical soda, premium THC.
- Punchy's Fruit Punch — $8.00 | Classic fruit punch, 10mg THC.
- Snapback Blackberry Creamsicle — $8.50 | Blackberry creamsicle, premium THC.

ACCESSORIES:
- Premium Buds Grinder — $24.99 | Heavy duty 4-piece with pollen catcher.
- Randy's Stainless Screens — $0.99 | 20-pack essential kit.

━━━ PRODUCT IDs ━━━
flower-01=Nano Banana Kush, flower-02=Island Pink Kush, edible-01=Sour Peach Rings, edible-02=Chowie Wowie Soft Caramel Milk Chocolate, edible-04=Bhang Cookies and Cream White Chocolate, vape-01=High Voltage HTFSE Cartridge, preroll-01=Signature Pre-Roll Fan, preroll-02=Space Race Single Joint, preroll-03=Multi-Pack Pre-Rolls, preroll-04=Blue Tip Classic, bev-01=Solei Mango Passionfruit, bev-02=Punchy's Fruit Punch, bev-03=Snapback Blackberry Creamsicle, bev-04=Bubble Kush Tahiti Trip Soda, accessory-06=Premium Buds Grinder, accessory-01=Randy's Stainless Screens

━━━ RECOMMENDATION GUIDE ━━━
- Anxiety/stress → Island Pink Kush, Solei Mango Passionfruit (low dose)
- Sleep/insomnia → Island Pink Kush (indica body high)
- Creativity/focus/social → Nano Banana Kush (hybrid, uplifting)
- First-timers → Solei Mango Passionfruit (10mg, easy to dose), Bhang Chocolate (low dose edible)
- Discreet/on-the-go → Edibles, Beverages, Vape Cart
- Budget-friendly → Blue Tip Classic ($12), Bhang Chocolate ($11.50), any beverage ($7.50–$8.50)
- Best value → Multi-Pack Pre-Rolls ($45 for a large pack)
- Gifting → Signature Pre-Roll Fan, Chowie Wowie Chocolate
- Pain relief → Island Pink Kush (body relaxation), edibles (longer lasting)
- Nausea → Nano Banana Kush, beverages (fast onset)
- Microdosing → Any 10mg beverage, split edibles

━━━ CANNABIS KNOWLEDGE (answer all of these accurately) ━━━

EFFECTS & SCIENCE:
- THC: primary psychoactive compound. Effects: euphoria, relaxation, altered perception, appetite stimulation. High doses can cause anxiety in some people.
- CBD: non-psychoactive. Anti-inflammatory, calming, may reduce THC anxiety. Promotes balance (entourage effect).
- Indica: typically body-heavy, relaxing, sedating. Good for evening, sleep, pain.
- Sativa: typically head-heavy, uplifting, energizing. Good for daytime, creativity, social.
- Hybrid: balanced. Effects vary by specific strain's terpene and cannabinoid profile.
- Terpenes: aromatic compounds that shape the experience. Myrcene=relaxing, Limonene=uplifting/mood, Pinene=alertness/memory, Linalool=calming/lavender, Caryophyllene=anti-inflammatory/spicy.
- Entourage effect: cannabinoids and terpenes work better together than in isolation. Full-spectrum products (like the High Voltage HTFSE cart) deliver this.

DOSING & ONSET:
- Smoking/vaping: onset 1–5 min, peak 20–30 min, duration 1–3 hours.
- Edibles: onset 30–90 min (up to 2 hours on full stomach), peak 2–4 hours, duration 4–8 hours. DO NOT re-dose early.
- Beverages: onset 15–45 min (faster than solid edibles due to nano-emulsification).
- Start low (2.5–5mg THC for edibles) and go slow. Wait the full 2 hours before considering more.

HARM REDUCTION:
- Don't mix cannabis with alcohol — amplifies effects unpredictably.
- Cannabis can interact with some medications (blood thinners, antidepressants). Encourage checking with a doctor.
- Not recommended during pregnancy or breastfeeding.
- Avoid driving or operating machinery.
- If someone feels too high: stay calm, hydrated, eat something, rest in a safe comfortable space. Effects pass. CBD can help counter THC anxiety.
- Mental health: cannabis can worsen anxiety or psychosis in predisposed individuals. Those with history of psychosis should be cautious.

ALBERTA / CANADIAN LAW:
- Legal age: 19+ in Alberta.
- Legal to possess up to 30g in public.
- Legal to grow up to 4 plants per household for personal use.
- Consumption: allowed in private residences and some outdoor public spaces. Not in vehicles, not near schools/playgrounds.
- Purchase only from licensed retailers (like Bud N' Buddies).

CONSUMPTION METHODS:
- Flower: can be smoked (joint, pipe, bong) or vaporized (dry herb vaporizer). Vaporizing is gentler on lungs.
- Pre-rolls: ready to smoke, convenient.
- Vape carts: attach to a 510-thread battery (sold separately). Discreet, no combustion.
- Edibles/Beverages: no smoke, discreet, longer duration — great for beginners who don't want to inhale.
- Grinder: breaks flower into even pieces for better airflow and even burn. 4-piece catches kief.

━━━ BEHAVIOR RULES ━━━
- Answer EVERY question the user asks. Never refuse or redirect unless it's genuinely harmful (e.g., someone asking how to harm others).
- For questions outside cannabis entirely (random small talk, general knowledge, etc.) — answer briefly and naturally, then offer to help with cannabis or the store.
- Be the knowledgeable friend, not a corporate FAQ. Match the user's energy.
- First-timers: always recommend starting with a low-dose beverage or edible, explain onset times.
- Never recommend overconsumption. If someone sounds distressed, lead with reassurance.
- Don't make up products not on the menu list.

━━━ FORMATTING RULES ━━━
- Keep answers conversational and scannable. Short paragraphs or bullets — never walls of text.
- NEVER use markdown tables. Always use bullet points for lists.
- Product recommendations format: "· **Product Name** — $Price (one-line reason)"
- Use relative links: [View Menu](/shop) or [View Product](/product/flower-01) — never full URLs.
- Max 1–2 emojis per message.
- IMPORTANT: When you recommend specific products, append on its own final line: [PRODUCTS:id1,id2]. Only include IDs of products you actually mentioned.`;

const PRODUCTS = [
  { id: "flower-01", name: "Nano Banana Kush", price: 35.00, image: "/images/nano_banana_kush.png", category: "Dried Flower" },
  { id: "flower-02", name: "Island Pink Kush", price: 32.00, image: "/images/island_pink_kush.png", category: "Dried Flower" },
  { id: "edible-01", name: "Sour Peach Rings", price: 19.99, image: "/images/sour_peach_rings.png", category: "Edible" },
  { id: "edible-02", name: "Chowie Wowie Soft Caramel Milk Chocolate", price: 12.99, image: "/images/chowie_wowie_caramel.png", category: "Edible" },
  { id: "edible-04", name: "Bhang Cookies and Cream White Chocolate", price: 11.50, image: "/images/bhang_cookies_cream.png", category: "Edible" },
  { id: "vape-01", name: "High Voltage HTFSE Cartridge", price: 45.00, image: "/images/high_voltage_vape.png", category: "Vape" },
  { id: "preroll-01", name: "Signature Pre-Roll Fan", price: 25.00, image: "/images/signature_preroll_fan.png", category: "Pre-Roll" },
  { id: "preroll-02", name: "Space Race Single Joint", price: 14.00, image: "/images/space_race_single.png", category: "Pre-Roll" },
  { id: "preroll-03", name: "Multi-Pack Pre-Rolls", price: 45.00, image: "/images/multi_pack_prerolls.png", category: "Pre-Roll" },
  { id: "preroll-04", name: "Blue Tip Classic", price: 12.00, image: "/images/blue_tip_classic.png", category: "Pre-Roll" },
  { id: "bev-01", name: "Solei Mango Passionfruit", price: 7.50, image: "/images/solei_mango_passionfruit.png", category: "Beverage" },
  { id: "bev-02", name: "Punchy's Fruit Punch", price: 8.00, image: "/images/punchys_fruit_punch.png", category: "Beverage" },
  { id: "bev-03", name: "Snapback Blackberry Creamsicle", price: 8.50, image: "/images/snapback_blackberry_creamsicle.png", category: "Beverage" },
  { id: "bev-04", name: "Bubble Kush Tahiti Trip Soda", price: 7.99, image: "/images/bubble_kush_soda.png", category: "Beverage" },
  { id: "accessory-06", name: "Premium Buds Grinder", price: 24.99, image: "/images/premium_grinder.png", category: "Accessories" },
  { id: "accessory-01", name: "Randy's Stainless Screens", price: 0.99, image: "/images/stainless_screens.png", category: "Accessories" },
];

const PRODUCT_MAP = new Map(PRODUCTS.map(p => [p.id, p]));

// In-memory rate limiter — resets per cold start, good enough for serverless
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 20) return true;
  entry.count++;
  return false;
}

// Instantiated at module level so warm serverless invocations reuse it
const apiKey = process.env.GEMINI_API_KEY?.trim();
const genAI = apiKey && apiKey.length > 10 && apiKey !== "MY_GEMINI_API_KEY" ? new GoogleGenerativeAI(apiKey) : null;

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown";

  if (isRateLimited(ip)) {
    return res.status(429).json({ text: "Slow down a bit — try again in a minute!" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { message, history } = body ?? {};

    if (!message?.trim()) {
      return res.status(400).json({ text: "Say something!" });
    }

    if (!genAI) {
      return res.json({
        text: "Hey! I'm Buddy. Drop by Sherwood Park to chat in person — or call us at (825) 218-8234!",
      });
    }

    // Gemini requires history to start with 'user' — strip leading assistant greetings
    const chatHistory = (history ?? [])
      .filter((msg: any, i: number) => !(i === 0 && msg.role === "assistant"))
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const rawReply = result.response.text();

    const productTagMatch = rawReply.match(/\[PRODUCTS:([\w-,\s]+)\]/);
    const recommendedProducts = productTagMatch
      ? productTagMatch[1].split(",").map(id => PRODUCT_MAP.get(id.trim())).filter(Boolean)
      : [];
    const cleanedReply = rawReply.replace(/\[PRODUCTS:[\w-,\s]+\]\s*/g, "").trim();

    return res.json({ text: cleanedReply, products: recommendedProducts });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[AI ERROR]", msg);

    // Surface API key / quota issues clearly in logs
    if (msg.includes("API_KEY") || msg.includes("PERMISSION_DENIED")) {
      console.error("[AI ERROR] Check GEMINI_API_KEY env var in Vercel project settings");
    }
    if (msg.includes("404") || msg.includes("not found") || msg.includes("MODEL")) {
      console.error("[AI ERROR] Invalid model name — check the model identifier");
    }

    return res.status(200).json({
      text: "Something went sideways on my end! Give us a call at (825) 218-8234 or swing by 130-75 Salisbury Way, Sherwood Park. We're open till 2 AM every day 🌿",
    });
  }
}

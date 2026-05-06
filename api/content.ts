import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getConfig } from "./_lib/db_ops.js";

const SECTIONS = ["hero", "brand", "perks", "story", "about", "delivery"];

export const CONTENT_DEFAULTS = {
  hero: {
    badge: "Sherwood Park · Canada",
    headline_1: "Elevate",
    headline_2: "Your",
    headline_3: "Buds",
    subtitle: "cannabis shop focused on convenience and value. We price match within 25km and offer custom product requests, bringing in items beyond standard inventory for our members.",
    cta_shop: "Shop Now",
    cta_about: "Our Legacy",
    stat_rating: "4.9★",
    stat_hours: "2 AM",
    stat_days: "365",
  },
  brand: {
    eyebrow: "Alberta's Finest Cannabis Collective",
    headline: "Not just cannabis. An experience.",
    body: "Built around service, value, and flexibility. We price match within 25km, take special product requests, and can bring in items outside our regular inventory for members who want more than what's on the shelf.",
    perk1_title: "Local Value",
    perk1_desc: "Price matching within 25km",
    perk2_title: "Special Orders",
    perk2_desc: "Can bring in items outside our regular inventory",
    perk3_title: "Community Focused",
    perk3_desc: "We listen and adapt to what you actually want",
  },
  perks: {
    eyebrow: "Exclusive Benefits",
    headline: "The Buds Advantage.",
    item1_title: "Price Protection",
    item1_desc: "Found a more competitive rate within 25km? Our members enjoy an immediate match, ensuring unrivaled value without compromise.",
    item2_title: "Bespoke Curation",
    item2_desc: "Seeking a rare strain or specific profile? We provide private sourcing services for our most discerning members.",
    item3_title: "Elite Status",
    item3_desc: "Join our inner circle for complimentary access to private drops, member-only events, and optimized pricing.",
    item4_title: "Cultural Leader",
    item4_desc: "More than a dispensary—we are a cornerstone of the Sherwood Park community, dedicated to elevating the local standard.",
  },
  story: {
    eyebrow: "Our Roots",
    headline_1: "Rooted in",
    headline_2: "Sherwood Park.",
    body: "We don't just sell cannabis. We curate the best selection in town because we care about what our buddies are smoking. Every product tells a story of quality and transparency.",
    stat1_value: "100%",
    stat1_label: "Hand-Selected",
    stat2_value: "365",
    stat2_label: "Days Open",
    badge: "PURE CRAFT",
  },
  about: {
    headline: "Prestigious Roots",
    subtitle: "Founded on the principles of absolute quality and community leadership. Sherwood Park's premier destination for boutique cannabis—mastering the standard, daily until 2 AM.",
    stat1_value: "5,000+",
    stat1_label: "Happy Customers",
    stat2_value: "4.9★",
    stat2_label: "Google Rating",
    stat3_value: "2 AM",
    stat3_label: "Open Until",
    story_headline: "Elite Selection. Artisanal Curation.",
    story_body1: "Bud n' Buddies was established in Sherwood Park with a singular vision: to redefine the cannabis experience. We bridge the gap between boutique excellence and community accessibility.",
    story_body2: "Every offering in our collection is hand-vetted for its unique character, aroma, and effect. We reject the generic, focusing exclusively on artisanal batches and elite genetics.",
    story_body3: "Operating 365 days a year until 2 AM is our commitment to unrivaled service, ensuring our community has access to the standard they deserve, on their schedule.",
  },
  delivery: {
    heading: "Delivery Zones",
    subheading: "We deliver across Sherwood Park and surrounding areas. Larger orders always get a better rate.",
    zone1_name: "Local Zone",
    zone1_range: "Under 5 km",
    zone1_fee: "$5.49 flat",
    zone1_perk: "FREE on orders over $75",
    zone2_name: "Standard Zone",
    zone2_range: "5 – 15 km",
    zone2_fee: "From $8.00",
    zone2_perk: "Up to 20% off on $100+ orders",
    zone3_name: "Extended Zone",
    zone3_range: "15 – 25 km",
    zone3_fee: "From $11.00",
    zone3_perk: "Up to 30% off on $150+ orders",
    zone4_name: "Outside Zone",
    zone4_range: "25 km+",
    zone4_fee: "Not available",
    zone4_perk: "Please call us to arrange",
    free_threshold: "$75",
    cta: "Order Now",
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  if (req.method !== "GET") return res.status(405).end();

  const content: Record<string, any> = {};
  for (const section of SECTIONS) {
    const stored = await getConfig(`content.${section}`).catch(() => null);
    content[section] = stored ? { ...CONTENT_DEFAULTS[section as keyof typeof CONTENT_DEFAULTS], ...stored } : { ...CONTENT_DEFAULTS[section as keyof typeof CONTENT_DEFAULTS] };
  }

  return res.status(200).json({ content });
}

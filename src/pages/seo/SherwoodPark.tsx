import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Clock, Phone, Star, Leaf, Shield, Truck } from "lucide-react";

const SITE_URL = "https://buds-n-buddies-v2.vercel.app";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Bud N' Buddies Cannabis",
  "@id": `${SITE_URL}/sherwood-park-cannabis`,
  url: SITE_URL,
  telephone: "+18252188234",
  keywords: "cannabis dispensary, weed, marijuana, edibles, vapes, concentrates, Sherwood Park Alberta",
  address: {
    "@type": "PostalAddress",
    streetAddress: "130-75 Salisbury Way",
    addressLocality: "Sherwood Park",
    addressRegion: "AB",
    postalCode: "T8B 1K4",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 53.5272,
    longitude: -113.3224,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "10:00",
      closes: "23:59",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      opens: "00:00",
      closes: "02:00",
    },
  ],
  priceRange: "$$",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "120",
  },
};

export function SherwoodPark() {
  useEffect(() => {
    document.title = "Cannabis Dispensary Sherwood Park AB | Bud N' Buddies — Open Until 2 AM";

    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content",
        "Bud N' Buddies is Sherwood Park's top-rated cannabis dispensary. Premium flower, edibles, vapes & concentrates. Open every day until 2 AM. 130-75 Salisbury Way."
      );
    }

    // Canonical for this SEO page
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const createdCanonical = !canonical;
    if (createdCanonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    const prevHref = canonical!.href;
    canonical!.href = `${SITE_URL}/sherwood-park-cannabis`;

    // JSON-LD in <head>
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(JSON_LD);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      if (createdCanonical) {
        canonical?.remove();
      } else if (canonical) {
        canonical.href = prevHref;
      }
    };
  }, []);

  const features = [
    { icon: Clock, title: "Open Until 2 AM", body: "The latest cannabis hours in Sherwood Park. We're here when other dispensaries close." },
    { icon: Leaf, title: "Premium Selection", body: "Curated flower, edibles, vapes, concentrates, and accessories from top Canadian brands." },
    { icon: Shield, title: "Licensed & Compliant", body: "Fully licensed under the Alberta Gaming, Liquor and Cannabis (AGLC) framework." },
    { icon: Star, title: "Expert Budtenders", body: "Knowledgeable staff ready to guide first-timers and connoisseurs alike." },
    { icon: Truck, title: "Easy Online Pre-Order", body: "Browse our menu, add to cart, and pay securely online. Skip the wait at pickup." },
    { icon: MapPin, title: "Central Location", body: "Located in the Emerald Hills area — easy access from all across Sherwood Park." },
  ];

  const faqs = [
    {
      q: "What are your hours?",
      a: "We're open every day of the year from 10:00 AM until 2:00 AM — including holidays.",
    },
    {
      q: "Where is Bud N' Buddies located?",
      a: "We're at 130-75 Salisbury Way, Sherwood Park, AB T8B 1K4, in the Emerald Hills Shopping Centre.",
    },
    {
      q: "Can I order cannabis online in Alberta?",
      a: "Yes! You can browse our menu and pre-order online. Payment is processed securely via Stripe. Pickup is available in-store.",
    },
    {
      q: "Do I need ID to purchase cannabis?",
      a: "Yes. You must be 18+ in Alberta and present valid government-issued photo ID at pickup.",
    },
    {
      q: "What types of cannabis products do you carry?",
      a: "We carry premium flower, pre-rolls, edibles, beverages, vape cartridges, concentrates, tinctures, topicals, and accessories.",
    },
    {
      q: "How much cannabis can I legally buy?",
      a: "Adults in Alberta can purchase up to 30 grams of dried cannabis (or equivalent) per transaction.",
    },
  ];

  return (
    <div className="bg-brand-earth min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-brand-green text-brand-earth">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-brand-earth/20 text-brand-earth/80 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-6"
          >
            <MapPin size={11} /> Sherwood Park, Alberta
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6"
          >
            Best Cannabis Dispensary in Sherwood Park
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-brand-earth/70 max-w-2xl mx-auto mb-10"
          >
            Premium flower, edibles, vapes &amp; concentrates. Open every day until 2 AM.
            Expert budtenders. Easy online pre-ordering.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/shop"
              className="bg-brand-earth text-brand-green px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
            >
              Shop Online
            </Link>
            <a
              href="https://maps.google.com/?q=130-75+Salisbury+Way+Sherwood+Park+AB"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-brand-earth/40 text-brand-earth px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Get Directions
            </a>
          </motion.div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="bg-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: MapPin, label: "130-75 Salisbury Way, Sherwood Park" },
            { icon: Clock, label: "Open Every Day · 10 AM – 2 AM" },
            { icon: Phone, label: "(825) 218-8234" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-bold text-brand-dark/70">
              <Icon size={15} className="text-brand-green" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand-green text-center mb-14">
            Why Sherwood Park Chooses Bud N&apos; Buddies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-white rounded-[28px] p-8 shadow-sm">
                <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-black uppercase tracking-tight text-base mb-2">{title}</h3>
                <p className="text-brand-dark/60 text-sm font-medium leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand-green text-center mb-14">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-brand-green/10 pb-6">
                <h3 className="font-black text-base mb-2">{q}</h3>
                <p className="text-brand-dark/60 font-medium text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand-green mb-6">
            Ready to Order?
          </h2>
          <p className="text-brand-dark/60 mb-10 font-medium">
            Browse our full menu and pre-order for pickup. Secure Stripe checkout. Ready in minutes.
          </p>
          <Link
            to="/shop"
            className="bg-brand-green text-brand-earth px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl inline-block"
          >
            View Full Menu
          </Link>
        </div>
      </section>
    </div>
  );
}

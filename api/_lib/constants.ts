import type { Product } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "flower-01",
    name: "Nano Banana Kush",
    price: 35.00,
    image: "/images/nano_banana_kush.png",
    category: "Dried Flower",
    description: "Ultra-smooth, high potency, tropical banana notes. A perfectly crafted hybrid from BC's finest cultivators.",
    thc: "28%",
    isBestSeller: true
  },
  {
    id: "flower-02",
    name: "Island Pink Kush",
    price: 32.00,
    image: "/images/island_pink_kush.png",
    category: "Dried Flower",
    description: "Classic BC bud. Heavy resin, deep body relaxation, floral sweetness.",
    thc: "24%",
    isBestSeller: false
  },
  {
    id: "edible-01",
    name: "Sour Peach Rings",
    price: 19.99,
    image: "/images/sour_peach_rings.png",
    category: "Edible",
    description: "Consistent THC dosing, fan favourite. Classic sour peach candy with a kick.",
    thc: "10mg",
    isBestSeller: true
  },
  {
    id: "preroll-01",
    name: "Back Forty Pre-Roll Pack",
    price: 24.99,
    image: "/images/preroll.png",
    category: "Pre-Roll",
    description: "Ready-to-spark pre-rolls from the award-winning Back Forty farm.",
    thc: "22%",
    isBestSeller: false
  },
  {
    id: "vape-01",
    name: "Spinach Disposable Vape",
    price: 44.99,
    image: "/images/vape.png",
    category: "Vape",
    description: "Sleek, pocket-friendly disposable. Berry Creamsicle flavour. Sativa-forward uplift.",
    thc: "85%",
    isBestSeller: false
  },
  {
    id: "concentrate-01",
    name: "Dab Bods Live Resin",
    price: 54.99,
    image: "/images/concentrate.png",
    category: "Concentrate",
    description: "High-terpene live resin extract. Bold, pungent, full-spectrum experience.",
    thc: "70%",
    isBestSeller: false
  }
];

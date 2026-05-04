import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "../types";
import { INITIAL_PRODUCTS } from "../constants";
import { ProductCard } from "../components/ProductGrid";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Dried Flower", "Edible", "Vape", "Pre-Roll", "Beverage", "Accessories"];

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        // local fallback
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#060b08] min-h-screen">
      {/* ── High-End Shop Header ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-green/20 via-transparent to-transparent opacity-50" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[120px] -translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-10"
          >
            <div className="max-w-2xl">
              <span className="text-brand-light-green text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] mb-4 block">
                Premium Selection
              </span>
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-6">
                The<br />
                <span className="text-brand-light-green italic font-display normal-case tracking-normal">Collection.</span>
              </h1>
              <p className="text-white/60 text-sm sm:text-lg font-medium leading-relaxed max-w-md">
                Hand-selected craft flower and premium accessories. Every item verified for potency and purity.
              </p>
            </div>

            {/* Search Bar — Premium Style */}
            <div className="relative w-full md:max-w-sm group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="text-white/40 group-focus-within:text-brand-light-green transition-colors" size={20} />
              </div>
              <input
                type="text"
                placeholder="Search the collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-light-green/20 focus:border-brand-light-green/40 transition-all font-medium backdrop-blur-md"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <div className="sticky top-20 z-40 bg-[#060b08]/80 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-light-green text-brand-green shadow-[0_0_20px_rgba(197,225,165,0.3)]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-[40px] aspect-[4/5] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: idx % 3 * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
              <Search className="text-white/20" size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">No results found</h3>
            <p className="text-white/40 font-medium">Try adjusting your filters or search query.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="mt-8 text-brand-light-green font-black uppercase tracking-widest text-[11px] hover:underline"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}



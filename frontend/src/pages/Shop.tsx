import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, ChevronDown, X, Grid, List as ListIcon, Info } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import type { Product } from "../types";
import { ProductCard } from "../components/ProductGrid";
import { VARIANTS } from "@/lib/animations";

import { api } from "../lib/api";

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get("category") || "All";
  const sortParam = searchParams.get("sort") || "newest";
  const searchParam = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["All", "Dried Flower", "Edible", "Vape", "Pre-Roll", "Beverage", "Accessories"];
  const sortOptions = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (categoryParam !== "All") params.category = categoryParam;
      if (searchParam) params.search = searchParam;
      if (sortParam) params.sort = sortParam;

      const data = await api.products.getAll(params);
      setProducts(data.products || []);
    } catch (err) {
      console.error("API Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, searchParam, sortParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParam) {
        if (searchQuery) searchParams.set("q", searchQuery);
        else searchParams.delete("q");
        setSearchParams(searchParams);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParam, searchParams, setSearchParams]);

  const handleCategoryChange = (cat: string) => {
    if (cat === "All") searchParams.delete("category");
    else searchParams.set("category", cat);
    setSearchParams(searchParams);
    setIsFilterOpen(false);
  };

  const handleSortChange = (sort: string) => {
    searchParams.set("sort", sort);
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-[#060b08] min-h-screen text-white selection:bg-brand-light-green selection:text-brand-green overflow-x-hidden">
      {/* ── Minimalist Premium Header ───────────────────────────────────── */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-28 px-6 overflow-hidden border-b border-white/5 isolate">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-green/30 via-transparent to-transparent opacity-40" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-brand-light-green/5 blur-[140px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            variants={VARIANTS.FADE_UP}
            initial="hidden"
            animate="visible"
          >
            <span className="inline-block text-brand-light-green text-[10px] font-black uppercase tracking-[0.5em] mb-6">
              Curated Experience
            </span>
            <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-10">
              SHOP THE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light-green via-white/80 to-white/40 italic font-display normal-case tracking-normal">Menu.</span>
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* ── Sidebar Filters (Desktop) ────────────────────────────────── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-12">
              <motion.div
                variants={VARIANTS.FADE_UP}
                initial="hidden"
                animate="visible"
              >
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8">Categories</h3>
                <div className="flex flex-col gap-3">
                  {categories.map((cat, i) => (
                    <motion.button
                      key={cat}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      onClick={() => handleCategoryChange(cat)}
                      className={`text-left px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                        categoryParam === cat
                          ? "bg-brand-light-green/10 border-brand-light-green/30 text-brand-light-green shadow-xl shadow-brand-light-green/5"
                          : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* ── Toolbar ────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-xl group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-light-green transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Search premium strains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[24px] py-5 pl-16 pr-8 text-sm font-medium focus:outline-none focus:ring-8 focus:ring-brand-light-green/5 focus:border-brand-light-green/30 transition-all placeholder:text-white/10"
                  />
                </div>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden p-5 rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-xl"
                >
                  <SlidersHorizontal size={22} />
                </button>
              </div>

              <div className="flex items-center gap-8 self-end md:self-auto">
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 shadow-inner">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-white/10 text-brand-light-green" : "text-white/20 hover:text-white"}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-white/10 text-brand-light-green" : "text-white/20 hover:text-white"}`}
                  >
                    <ListIcon size={20} />
                  </button>
                </div>

                <div className="relative group min-w-[200px]">
                  <select
                    value={sortParam}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-[24px] py-5 pl-8 pr-14 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-8 focus:ring-brand-light-green/5 cursor-pointer"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-brand-green text-white font-black">{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* ── Products Grid ──────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-[40px] aspect-[4/5] animate-pulse border border-white/5" />
                  ))}
                </motion.div>
              ) : products.length > 0 ? (
                <motion.div
                  key="products"
                  className={viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                    : "flex flex-col gap-8"
                  }
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-48 text-center"
                >
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-[40px] bg-white/5 mb-10 border border-white/10">
                    <Search size={48} className="text-white/10" />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">No Strains Found.</h3>
                  <p className="text-white/30 text-lg font-medium mb-12 max-w-sm mx-auto">We couldn't find anything matching your filters or search query.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams({});
                    }}
                    className="px-10 py-5 bg-brand-light-green text-brand-green rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-light-green/10"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 35, stiffness: 350, mass: 0.8 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#060b08] border-l border-white/10 z-[210] p-10 flex flex-col"
            >
              <div className="flex items-center justify-between mb-16">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-brand-light-green">Filters</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)} 
                  className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-16 custom-scrollbar pr-2">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8">Categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-6 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest border transition-all ${
                          categoryParam === cat
                            ? "bg-brand-light-green border-brand-light-green text-brand-green shadow-xl shadow-brand-light-green/10"
                            : "border-white/5 text-white/40 bg-white/[0.02]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}



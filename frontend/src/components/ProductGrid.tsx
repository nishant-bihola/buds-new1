import { useState, useMemo } from "react";
import { motion } from "motion/react";
import type { Product } from "../types";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, Leaf, Zap, Coffee, Package, Droplets, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { OptimizedImage } from "./ui/OptimizedImage";

function CategoryIcon({ category }: { category: string }) {
  const cls = "w-12 h-12 opacity-30";
  const cat = (category || "").toLowerCase();
  if (cat.includes("flower")) return <Leaf className={cls} />;
  if (cat.includes("vape")) return <Zap className={cls} />;
  if (cat.includes("edible")) return <Coffee className={cls} />;
  if (cat.includes("pre")) return <Package className={cls} />;
  if (cat.includes("bev")) return <Droplets className={cls} />;
  return <ShoppingBag className={cls} />;
}

function ProductImage({ src, alt, category, className }: { src?: string; alt: string; category: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center text-brand-light-green ${className}`}>
        <CategoryIcon category={category} />
      </div>
    );
  }
  return <OptimizedImage src={src} alt={alt} onLoad={() => {}} onError={() => setFailed(true)} className={className} />;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  return (
    <section className="py-12 md:py-24 px-4 bg-brand-green text-brand-earth overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 sm:mb-16">
          <h2 className="text-[clamp(2.4rem,8vw,5.5rem)] font-black uppercase tracking-tighter leading-none text-brand-light-green">
            Fresh Menu
          </h2>
          <Link
            to="/shop"
            className="flex items-center gap-3 border border-brand-earth/20 hover:bg-brand-earth hover:text-brand-green px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors self-start sm:self-auto shrink-0"
          >
            View Menu
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {loading && products.length === 0
            ? Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-3xl h-[480px] sm:h-[540px] animate-pulse" />
              ))
            : products.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
}

export function ProductCard({ product, viewMode = "grid" }: { product: Product; viewMode?: "grid" | "list" }) {
  const { addToCart } = useCart();
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="group relative flex items-center gap-4 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl hover:bg-white/10 transition-all active:scale-[0.98]"
      >
        <Link to={`/product/${product.id}`} className="absolute inset-0 z-10" />
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-brand-light-green/5 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center">
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
            className="w-full h-full object-contain p-2"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight truncate">{product.name}</h3>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/30">{product.category}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <p className="text-lg sm:text-xl font-black">${product.price.toFixed(2)}</p>
          <button
            type="button"
            title="Add to cart"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
            className="relative z-20 p-2.5 sm:p-3 bg-brand-light-green text-brand-green rounded-xl hover:scale-110 active:scale-90 transition-transform shadow-lg shadow-brand-light-green/10"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "60px" }}
      transition={{ duration: 0.35 }}
      className="group relative flex flex-col pt-6 sm:pt-8 pb-6 sm:pb-8 px-5 sm:px-8 bg-[#1e4d2b] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl cursor-pointer hover:brightness-110 transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="absolute inset-0 z-30" />

      <div className="flex justify-between items-center mb-6 relative z-20">
        {product.isBestSeller ? (
          <span className="bg-brand-light-green text-brand-green px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            Best Seller
          </span>
        ) : <div />}
        <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">${product.price.toFixed(2)}</span>
      </div>

      <div className="relative h-[180px] sm:h-[220px] flex items-center justify-center mb-6">
        <div aria-hidden className="absolute w-[120px] h-[120px] bg-brand-light-green/15 rounded-full blur-[40px]" />
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          className="relative z-10 w-full h-full max-w-[180px] max-h-[180px] sm:max-w-[200px] sm:max-h-[200px] object-contain drop-shadow-2xl"
        />
      </div>

      <div className="mt-auto flex items-center justify-between relative z-20">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-brand-light-green transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{product.category}</p>
        </div>
        <button
          type="button"
          title="Add to cart"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
          className="w-12 h-12 flex items-center justify-center bg-white/10 text-white border border-white/10 rounded-2xl transition-all shadow-xl backdrop-blur-md hover:bg-brand-light-green hover:text-brand-green active:scale-90"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );
}

import { motion } from "motion/react";
import type { Product } from "../types";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { useCart } from "../context/CartContext";

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

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover="hover"
      className="group relative flex flex-col pt-6 sm:pt-10 pb-6 sm:pb-8 px-5 sm:px-8 bg-[#1e4d2b] rounded-[36px] sm:rounded-[48px] overflow-hidden shadow-2xl cursor-pointer isolate transition-transform duration-200 ease-out hover:scale-[1.02]"
    >
      {/* Vibrant gradient overlay — fades in on hover */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none rounded-[36px] sm:rounded-[48px] -z-10"
        variants={{ hover: { opacity: 1 } }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          background: "linear-gradient(135deg, #1e5c30 0%, #22c55e 60%, #16a34a 100%)",
        }}
      />

      <Link to={`/product/${product.id}`} className="absolute inset-0 z-30" aria-label={`View ${product.name}`} />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 sm:mb-10 relative z-20 pointer-events-none">
        {product.isBestSeller ? (
          <span className="bg-brand-light-green text-brand-green px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg">
            Best Seller
          </span>
        ) : (
          <div />
        )}
        <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">
          ${product.price.toFixed(2)}
        </span>
      </div>

      {/* Image */}
      <div className="relative h-[200px] sm:h-[260px] md:h-[300px] flex items-center justify-center mb-6 sm:mb-8 pointer-events-none">
        <motion.div
          aria-hidden
          className="absolute w-[160px] sm:w-[200px] h-[160px] sm:h-[200px] bg-brand-light-green/20 rounded-full blur-[60px]"
          variants={{ hover: { scale: 1.4, opacity: 0.6 } }}
          initial={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 0.6 }}
        />
        <motion.img
          src={product.image}
          alt={product.name}
          className="relative z-10 w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
          variants={{ hover: { rotate: 8, scale: 1.1, y: -15 } }}
          initial={{ rotate: 0, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>

      {/* Bottom */}
      <div className="mt-auto flex items-center justify-between relative z-20">
        <div className="flex-1 min-w-0 mr-3 pointer-events-none">
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight group-hover:text-brand-light-green transition-colors truncate">
            {product.name}
          </h3>
          <p className="text-white/30 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1 sm:mt-2">
            {product.category}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "#c5e1a5", color: "#1e4d2b" }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
          className="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center bg-white/10 text-white border border-white/10 rounded-full transition-all shadow-xl shrink-0 pointer-events-auto relative z-40 backdrop-blur-md"
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus size={20} strokeWidth={3} />
        </motion.button>
      </div>
    </motion.div>
  );
}

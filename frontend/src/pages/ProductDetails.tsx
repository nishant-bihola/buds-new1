import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Leaf, Package } from "lucide-react";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, openCart } = useCart();
  const { success } = useToast();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) setProduct(data.product);
        else {
          // fallback: fetch all and find
          return fetch("/api/products")
            .then(r => r.json())
            .then(d => setProduct((d.products as Product[])?.find(p => p.id === id) ?? null));
        }
      })
      .catch(err => console.error("Failed to fetch product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    success(`${quantity}× ${product.name} added to cart`);
    openCart();
  };

  if (loading)
    return (
      <div className="pt-32 flex items-center justify-center min-h-screen bg-brand-earth">
        <div className="w-10 h-10 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
      </div>
    );

  if (!product)
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-screen bg-brand-earth gap-6 px-4">
        <Package size={48} className="text-brand-green/20" />
        <div className="text-center">
          <p className="text-2xl font-black uppercase tracking-tighter text-brand-green mb-2">Product Not Found</p>
          <p className="text-brand-dark/40 font-medium text-sm">This product may be out of stock or removed.</p>
        </div>
        <Link to="/shop" className="bg-brand-green text-brand-earth px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
          ← Back to Menu
        </Link>
      </div>
    );

  const trust = [
    { icon: ShieldCheck, title: "Premium Selection", sub: "Hand-Curated Quality" },
    { icon: Leaf, title: "Pure Craft", sub: "Trusted Brands Only" },
  ];

  return (
    <div className="pt-24 sm:pt-28 pb-16 md:pb-24 bg-brand-earth min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-brand-green/50 hover:text-brand-green font-black uppercase tracking-widest text-[10px] sm:text-xs mb-8 sm:mb-12 group transition-colors"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
          Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14 lg:gap-20 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-square bg-white rounded-[36px] sm:rounded-[52px] overflow-hidden border border-brand-green/5 shadow-2xl p-8 sm:p-14 flex items-center justify-center relative"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" />
            {product.isBestSeller && (
              <span className="absolute top-5 sm:top-8 left-5 sm:left-8 bg-brand-green text-brand-earth px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                Best Seller
              </span>
            )}
            {product.inStock === false && (
              <span className="absolute top-5 sm:top-8 right-5 sm:right-8 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                Out of Stock
              </span>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="py-2 sm:py-6"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-brand-green/8 text-brand-green px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {product.category}
              </span>
              {product.strain && (
                <span className="bg-brand-green/5 text-brand-green/60 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {product.strain}
                </span>
              )}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className="fill-brand-green text-brand-green" />
                ))}
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-brand-green leading-none mb-4">
              {product.name}
            </h1>

            {product.brand && (
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-dark/30 mb-4">{product.brand}</p>
            )}

            <div className="text-3xl sm:text-4xl font-black text-brand-dark mb-6 tracking-tighter">
              ${(product.price || 0).toFixed(2)}
            </div>

            {/* THC/CBD badges */}
            {(product.thc || product.cbd) && (
              <div className="flex gap-3 mb-6">
                {product.thc && (
                  <div className="bg-brand-green/8 px-5 py-2 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-green/50 mb-0.5">THC</p>
                    <p className="text-sm font-black text-brand-green">{product.thc}</p>
                  </div>
                )}
                {product.cbd && (
                  <div className="bg-brand-green/8 px-5 py-2 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-green/50 mb-0.5">CBD</p>
                    <p className="text-sm font-black text-brand-green">{product.cbd}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="bg-brand-green/8 px-5 py-2 rounded-2xl">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-green/50 mb-0.5">Weight</p>
                    <p className="text-sm font-black text-brand-green">{product.weight}</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-base sm:text-lg text-brand-dark/55 leading-relaxed mb-8 font-medium">
              {product.description || "Premium hand-selected quality. Trusted craft products. Available in-store at 130-75 Salisbury Way, Sherwood Park. Open every day until 2 AM."}
            </p>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center border border-brand-green/10 rounded-full bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-brand-green font-bold text-xl hover:bg-brand-earth/60 rounded-full transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 sm:w-12 text-center font-black text-brand-green text-base">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-brand-green font-bold text-xl hover:bg-brand-earth/60 rounded-full transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.inStock === false}
                className="flex-1 flex items-center justify-center gap-3 bg-brand-green text-brand-earth py-4 sm:py-5 rounded-full text-[13px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-brand-green/20 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {product.inStock === false ? "Out of Stock" : "Add to Cart"}
                <ShoppingCart size={16} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-brand-green/8">
              {trust.map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex gap-3 items-start">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-brand-green/5 shadow-sm">
                    <Icon className="text-brand-green" size={18} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tighter text-sm mb-0.5 text-brand-dark">{title}</h4>
                    <p className="text-[10px] text-brand-dark/35 font-bold uppercase tracking-widest">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Hero } from "../components/Hero";
import { BrandStatement } from "../components/BrandStatement";
import { LogoMarquee } from "../components/LogoMarquee";
import { Intro } from "../components/Intro";
import { ProductGrid } from "../components/ProductGrid";
import { Reviews } from "../components/Reviews";
import { BestSellerFeature } from "../components/BestSellerFeature";
import { About } from "../components/About";
import { StorySection } from "../components/StorySection";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Product } from "../types";
import { INITIAL_PRODUCTS } from "../constants";

export function Home() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      if (products.length === 0) setLoading(true);
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        // Fallback already in state
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col bg-[#060b08]">
      <div className="order-1"><Hero /></div>
      <div className="order-2"><BrandStatement /></div>
      <div className="order-3"><LogoMarquee /></div>
      
      {/* Dynamic ordering for Product Menu */}
      <div className="order-4 lg:order-6">
        <ProductGrid products={products} loading={loading} />
      </div>

      <div className="order-5 lg:order-4"><StorySection /></div>
      <div className="order-6 lg:order-5"><Intro /></div>
      
      <div className="order-7"><Reviews /></div>
      <div className="order-8"><BestSellerFeature /></div>
      <div className="order-9"><About /></div>
    </div>
  );
}

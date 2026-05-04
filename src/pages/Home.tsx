import { useEffect, useState, lazy, Suspense } from "react";
import { Hero } from "../components/Hero";
import { INITIAL_PRODUCTS } from "../constants";
import type { Product } from "../types";

// Lazy load sections below the fold for lighting fast performance
const BrandStatement = lazy(() => import("../components/BrandStatement").then(m => ({ default: m.BrandStatement })));
const LogoMarquee = lazy(() => import("../components/LogoMarquee").then(m => ({ default: m.LogoMarquee })));
const Intro = lazy(() => import("../components/Intro").then(m => ({ default: m.Intro })));
const MemberPerks = lazy(() => import("../components/MemberPerks"));
const ProductGrid = lazy(() => import("../components/ProductGrid").then(m => ({ default: m.ProductGrid })));
const Reviews = lazy(() => import("../components/Reviews").then(m => ({ default: m.Reviews })));
const BestSellerFeature = lazy(() => import("../components/BestSellerFeature").then(m => ({ default: m.BestSellerFeature })));
const About = lazy(() => import("../components/About").then(m => ({ default: m.About })));
const StorySection = lazy(() => import("../components/StorySection").then(m => ({ default: m.StorySection })));

// Premium Skeleton Loader for Sections
const SectionSkeleton = () => (
  <div className="w-full h-[60vh] bg-[#060b08] animate-pulse flex items-center justify-center">
    <div className="w-24 h-[1px] bg-brand-light-green/20" />
  </div>
);

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
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col bg-[#060b08]">
      <Hero />
      
      <Suspense fallback={<SectionSkeleton />}>
        <div className="space-y-0">
          <BrandStatement />
          <LogoMarquee />
          <MemberPerks />
          
          {/* Dynamic ordering optimization */}
          <div className="flex flex-col">
            <div className="order-2 lg:order-1">
               <StorySection />
            </div>
            <div className="order-1 lg:order-2">
               <ProductGrid products={products} loading={loading} />
            </div>
            <div className="order-3">
               <Intro />
            </div>
          </div>
          
          <Reviews />
          <BestSellerFeature />
          <About />
        </div>
      </Suspense>
    </div>
  );
}

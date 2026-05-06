import { useEffect, useState, lazy, Suspense } from "react";
import { Hero } from "../components/Hero";
import type { Product } from "../types";

// Lazy load sections below the fold for lighting fast performance
const BrandStatement = lazy(() => import("../components/BrandStatement").then(m => ({ default: m.BrandStatement })));
const Intro = lazy(() => import("../components/Intro").then(m => ({ default: m.Intro })));
const MemberPerks = lazy(() => import("../components/MemberPerks"));
const ProductGrid = lazy(() => import("../components/ProductGrid").then(m => ({ default: m.ProductGrid })));
const Reviews = lazy(() => import("../components/Reviews").then(m => ({ default: m.Reviews })));
const About = lazy(() => import("../components/About").then(m => ({ default: m.About })));
const StorySection = lazy(() => import("../components/StorySection").then(m => ({ default: m.StorySection })));

// Premium Skeleton Loader for Sections
const SectionSkeleton = () => (
  <div className="w-full h-[60vh] bg-[#060b08] animate-pulse flex items-center justify-center">
    <div className="w-24 h-[1px] bg-brand-light-green/20" />
  </div>
);

import { api } from "../lib/api";

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await api.products.getAll();
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

      <div className="space-y-0">
        {/* Fresh Menu (Product Grid) right under Hero */}
        <Suspense fallback={<SectionSkeleton />}>
          <ProductGrid products={products} loading={loading} />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <BrandStatement />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <MemberPerks />
        </Suspense>

        <div className="flex flex-col">
          <div className="order-2 lg:order-1">
            <Suspense fallback={<SectionSkeleton />}>
              <StorySection />
            </Suspense>
          </div>
          <div className="order-3">
            <Suspense fallback={<SectionSkeleton />}>
              <Intro />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<SectionSkeleton />}>
          <Reviews />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <About />
        </Suspense>
      </div>
    </div>
  );
}

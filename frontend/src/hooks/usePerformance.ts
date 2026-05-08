import { useEffect } from "react";

export function usePerformance(componentName: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn(
            `[Performance] ${componentName}: ${entry.name} took ${entry.duration.toFixed(2)}ms`
          );
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["measure", "navigation"] });
      return () => observer.disconnect();
    } catch {
      // PerformanceObserver not supported
    }
  }, [componentName]);
}

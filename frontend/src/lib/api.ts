async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    "Content-Type": "application/json",
  };
  const secret = sessionStorage.getItem("admin_secret") ?? localStorage.getItem("admin_secret");
  if (secret) {
    headers["Authorization"] = `Bearer ${secret}`;
  } else {
    console.warn("[API] No admin secret found in storage");
  }

  const response = await fetch(url, { ...options, headers });

  const contentType = response.headers.get("content-type") ?? "";
  let data: any;
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`API ${response.status}: ${text.slice(0, 120)}`);
    }
    return {};
  }

  if (!response.ok) {
    const errorMsg = data?.error || `HTTP ${response.status}`;
    console.error(`[API Error] ${url}:`, errorMsg, data);
    throw new Error(errorMsg);
  }
  return data;
}


export const api = {
  get: (url: string) => fetchWithAuth(url),
  put: (url: string, body: any) => fetchWithAuth(url, { method: "PUT", body: JSON.stringify(body) }),
  post: (url: string, body: any) => fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: "DELETE" }),

  admin: {
    getOrders: () => fetchWithAuth("/api/admin/orders"),
    updateOrderStatus: (id: string, status: string, extra?: { driverName?: string; driverPhone?: string }) =>
      fetchWithAuth(`/api/admin/orders?id=${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...extra }),
      }),
    getProducts: () => fetchWithAuth("/api/admin/products"),
    createProduct: (product: any) =>
      fetchWithAuth("/api/admin/products", { method: "POST", body: JSON.stringify(product) }),
    updateProduct: (product: any) =>
      fetchWithAuth("/api/admin/products", { method: "PUT", body: JSON.stringify(product) }),
    deleteProduct: (id: string) =>
      fetchWithAuth(`/api/admin/products?id=${id}`, { method: "DELETE" }),
    getPromos: () => fetchWithAuth("/api/admin/promos"),
    createPromo: (promo: any) =>
      fetchWithAuth("/api/admin/promos", { method: "POST", body: JSON.stringify(promo) }),
    updatePromo: (promo: any) =>
      fetchWithAuth("/api/admin/promos", { method: "PUT", body: JSON.stringify(promo) }),
    deletePromo: (id: string) =>
      fetchWithAuth(`/api/admin/promos?id=${id}`, { method: "DELETE" }),
    testEmail: () => fetchWithAuth("/api/admin/test-email", { method: "POST" }),
    getContent: () => fetchWithAuth("/api/admin/content"),
    updateContent: (section: string, data: Record<string, string>) =>
      fetchWithAuth("/api/admin/content", { method: "POST", body: JSON.stringify({ section, data }) }),
    getAutomations: () => fetchWithAuth("/api/admin/automations"),
    updateAutomation: (key: string, enabled: boolean) =>
      fetchWithAuth("/api/admin/automations", { method: "POST", body: JSON.stringify({ key, enabled }) }),
    getDrivers: () => fetchWithAuth("/api/admin/drivers"),
    createDriver: (driver: { name: string; phone?: string; active?: boolean }) =>
      fetchWithAuth("/api/admin/drivers", { method: "POST", body: JSON.stringify(driver) }),
    updateDriver: (driver: { id: string; name: string; phone?: string; active?: boolean }) =>
      fetchWithAuth("/api/admin/drivers", { method: "PUT", body: JSON.stringify(driver) }),
    deleteDriver: (id: string) =>
      fetchWithAuth(`/api/admin/drivers?id=${id}`, { method: "DELETE" }),
    getStoreHours: () => fetchWithAuth("/api/admin/store-hours"),
    updateStoreHours: (hours: any[]) =>
      fetchWithAuth("/api/admin/store-hours", { method: "POST", body: JSON.stringify({ hours }) }),
    getStoreInfo: () => fetchWithAuth("/api/admin/store"),
    updateStoreInfo: (info: any) =>
      fetchWithAuth("/api/admin/store", { method: "POST", body: JSON.stringify(info) }),
    getReviews: () => fetchWithAuth("/api/admin/reviews"),
    createReview: (review: any) =>
      fetchWithAuth("/api/admin/reviews", { method: "POST", body: JSON.stringify(review) }),
    updateReview: (review: any) =>
      fetchWithAuth("/api/admin/reviews", { method: "PUT", body: JSON.stringify(review) }),
    deleteReview: (id: string) =>
      fetchWithAuth(`/api/admin/reviews?id=${id}`, { method: "DELETE" }),
    syncBarnet: (removeStale = false) =>
      fetchWithAuth("/api/barnet/sync", { method: "POST", body: JSON.stringify({ removeStale }) }),
    barnetStatus: () => fetchWithAuth("/api/barnet/status"),
    barnetPreview: (params?: { page?: number; search?: string; category?: string }) => {
      const qs = params ? "?" + new URLSearchParams(Object.entries(params).filter(([,v]) => v !== undefined).map(([k,v]) => [k, String(v)])) : "";
      return fetchWithAuth(`/api/barnet/preview${qs}`);
    },
    barnetStockAlerts: () => fetchWithAuth("/api/barnet/stock-alerts"),
    barnetAnalytics: () => fetchWithAuth("/api/barnet/analytics"),
    barnetOverrides: () => fetchWithAuth("/api/barnet/overrides"),
    barnetSetOverride: (data: { productId: string; category?: string; price?: number; isBestSeller?: boolean; hidden?: boolean; sortOrder?: number; name?: string; clear?: boolean }) =>
      fetchWithAuth("/api/barnet/override", { method: "POST", body: JSON.stringify(data) }),
    barnetSetAutoSync: (enabled: boolean, intervalHours: number) =>
      fetchWithAuth("/api/barnet/auto-sync", { method: "POST", body: JSON.stringify({ enabled, intervalHours }) }),
    barnetBulk: (action: "bestSeller" | "toggleStock" | "delete" | "hide" | "sortOrder", ids: string[], value?: boolean | number) =>
      fetchWithAuth("/api/barnet/bulk", { method: "POST", body: JSON.stringify({ action, ids, value }) }),
    barnetStockAdjust: (productId: string, inStock: boolean, reason?: string) =>
      fetchWithAuth("/api/barnet/stock-adjust", { method: "POST", body: JSON.stringify({ productId, inStock, reason }) }),
    barnetBrands: () => fetchWithAuth("/api/barnet/brands"),
    barnetCategories: () => fetchWithAuth("/api/barnet/categories"),
    barnetSetBrandMap: (from: string, to: string, clear?: boolean) =>
      fetchWithAuth("/api/barnet/brand-map", { method: "POST", body: JSON.stringify({ from, to, clear }) }),
    clearData: (target: "orders" | "products" | "customers" | "all") =>
      fetchWithAuth("/api/admin/clear", { method: "POST", body: JSON.stringify({ target }) }),
  },

  products: {
    getAll: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : "";
      return fetch(`/api/products${qs}`).then(r => r.json());
    },
    getById: (id: string) => fetch(`/api/products/${id}`).then(r => r.json()),
  },

  orders: {
    create: (order: any) =>
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      }).then(r => r.json()),
    getById: (id: string) => fetch(`/api/orders/${id}`).then(r => r.json()),
  },

  promos: {
    validate: (code: string) =>
      fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }).then(r => r.json()),
  },
};

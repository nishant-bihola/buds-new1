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

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || `HTTP ${response.status}`;
      console.error(`[API Error] ${url}:`, errorMsg, data);
      throw new Error(errorMsg);
    }
    return data;
  } catch (err: any) {
    console.error(`[API Error] ${url}:`, err.message, err);
    throw err;
  }
}


export const api = {
  get: (url: string) => fetchWithAuth(url),
  put: (url: string, body: any) => fetchWithAuth(url, { method: "PUT", body: JSON.stringify(body) }),
  post: (url: string, body: any) => fetchWithAuth(url, { method: "POST", body: JSON.stringify(body) }),
  delete: (url: string) => fetchWithAuth(url, { method: "DELETE" }),

  admin: {
    getStats: () => fetchWithAuth("/api/admin/stats"),
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
    upsertProduct: (product: any) =>
      fetchWithAuth("/api/admin/products", { method: "POST", body: JSON.stringify(product) }),
    deleteProduct: (id: string) =>
      fetchWithAuth(`/api/admin/products?id=${id}`, { method: "DELETE" }),
    getCustomers: () => fetchWithAuth("/api/admin/customers"),
    syncPOS: () => fetchWithAuth("/api/admin/sync", { method: "POST" }),
    getPromos: () => fetchWithAuth("/api/admin/promos"),
    createPromo: (promo: any) =>
      fetchWithAuth("/api/admin/promos", { method: "POST", body: JSON.stringify(promo) }),
    updatePromo: (promo: any) =>
      fetchWithAuth("/api/admin/promos", { method: "PUT", body: JSON.stringify(promo) }),
    upsertPromo: (promo: any) =>
      fetchWithAuth("/api/admin/promos", { method: "POST", body: JSON.stringify(promo) }),
    deletePromo: (id: string) =>
      fetchWithAuth(`/api/admin/promos?id=${id}`, { method: "DELETE" }),
    getConfig: (key: string) => fetchWithAuth(`/api/admin/config?key=${key}`),
    setConfig: (key: string, value: any) =>
      fetchWithAuth("/api/admin/config", { method: "POST", body: JSON.stringify({ key, value }) }),
    getAutomations: () => fetchWithAuth("/api/admin/automations"),
    updateAutomation: (key: string, enabled: boolean) =>
      fetchWithAuth("/api/admin/automations", { method: "POST", body: JSON.stringify({ key, enabled }) }),
    getInsights: () => fetchWithAuth("/api/admin/insights"),
    bulkImport: () => fetchWithAuth("/api/admin/bulk-import", { method: "POST" }),
    syncCustomers: () => fetchWithAuth("/api/admin/sync-customers", { method: "POST" }),
  },

  chat: (message: string, history?: any[]) =>
    fetchWithAuth("/api/chat", { method: "POST", body: JSON.stringify({ message, history }) }),

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

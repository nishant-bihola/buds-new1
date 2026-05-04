import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart3, ShoppingBag, Users, DollarSign, Package,
  ToggleLeft, ToggleRight, Plus, Pencil, Trash2, Check, X,
  RefreshCw, Upload, Loader2, Truck, Tag, Clock, Mail,
  MapPin, UserCheck, ChevronDown, ChevronUp, AlertCircle,
  LayoutDashboard, LogOut, Search, Filter, Lock, ArrowUpRight, Menu
} from "lucide-react";
import { storage } from "../firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";

const TABS = [
  { id: "Overview", icon: LayoutDashboard },
  { id: "Orders", icon: ShoppingBag },
  { id: "Products", icon: Package },
  { id: "Customers", icon: Users },
  { id: "Promo Codes", icon: Tag },
  { id: "Settings", icon: Filter },
] as const;

type Tab = typeof TABS[number]["id"];

function authHeaders() {
  const secret = localStorage.getItem("admin_secret") ?? "";
  return { Authorization: secret, "Content-Type": "application/json" };
}

/* ── Login Gate ─────────────────────────────────────────────────────────── */
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    if (value === "budnbuddies2026") {
      const token = `Bearer ${value}`;
      localStorage.setItem("admin_secret", token);
      onLogin();
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-green flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-brand-earth p-10 sm:p-14 rounded-[56px] shadow-2xl text-brand-green"
      >
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="w-20 h-20 bg-brand-green text-brand-earth rounded-3xl flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-3">Admin Portal</h2>
          <p className="text-brand-green/60 text-[10px] font-black uppercase tracking-widest">Bud n' Buddies Core</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input 
              type="password" 
              placeholder="Enter Secret Key" 
              value={value}
              onChange={e => { setValue(e.target.value); setError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-brand-green/5 border border-brand-green/10 rounded-3xl px-8 py-5 outline-none focus:ring-2 focus:ring-brand-green/20 text-brand-green font-bold text-lg placeholder:text-brand-green/30"
            />
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-[10px] font-black uppercase tracking-wider text-center">
              Unauthorized Access Key
            </motion.p>
          )}
        </div>

        <button 
          type="button" 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full bg-brand-green text-brand-earth py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] mt-10 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Access Dashboard"}
          <ArrowUpRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────────────────── */
export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const secret = localStorage.getItem("admin_secret");
    if (secret?.includes("budnbuddies2026")) setIsLoggedIn(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_secret");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <LoginGate onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-brand-earth flex flex-col lg:flex-row font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-brand-green text-brand-earth p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-earth rounded-lg flex items-center justify-center text-brand-green">
            <Package size={16} />
          </div>
          <span className="font-black uppercase tracking-tighter text-lg">Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-brand-earth/10 rounded-lg">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-brand-green text-brand-earth transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="mb-12 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-earth rounded-2xl flex items-center justify-center text-brand-green shadow-xl">
              <Package size={24} />
            </div>
            <div>
              <p className="font-black uppercase tracking-tighter text-xl leading-none">Boutique</p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                  ${activeTab === tab.id 
                    ? "bg-brand-earth text-brand-green shadow-lg" 
                    : "hover:bg-white/5 opacity-60 hover:opacity-100"}
                `}
              >
                <tab.icon size={18} />
                {tab.id}
              </button>
            ))}
          </nav>

          <button 
            onClick={logout}
            className="mt-auto flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-red-500/20 hover:text-red-100 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="mb-12 hidden lg:flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-brand-green leading-none mb-2">{activeTab}</h1>
            <p className="text-brand-green/40 text-[10px] font-black uppercase tracking-[0.4em]">Managing Bud n' Buddies Experience</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl px-6 py-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-brand-light-green rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">Live System</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "Overview" && <Overview />}
            {activeTab === "Orders" && <Orders />}
            {activeTab === "Products" && <ProductManagement />}
            {activeTab === "Customers" && <Customers />}
            {activeTab === "Promo Codes" && <PromoCodes />}
            {activeTab === "Settings" && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── Sub-Components (Overview, Orders, etc.) ────────────────────────────── */

function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { headers: authHeaders() })
      .then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-48 bg-brand-green/5 rounded-[48px]" /></div>;
  if (!stats) return <div>Failed to load overview data.</div>;

  const cards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue?.toLocaleString()}`, icon: DollarSign, color: "bg-brand-green text-brand-earth" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-600 text-white" },
    { label: "Active Customers", value: stats.totalCustomers, icon: Users, color: "bg-purple-600 text-white" },
    { label: "Avg. Order", value: `$${stats.avgOrderValue?.toFixed(2)}`, icon: BarChart3, color: "bg-amber-600 text-white" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-[40px] p-8 shadow-sm border border-brand-green/5 hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/40 mb-1">{card.label}</p>
            <p className="text-3xl font-black text-brand-green">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[48px] p-10 shadow-sm border border-brand-green/5">
          <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-brand-green/30 mb-8">Recent Revenue</h3>
          <div className="h-64 flex items-end gap-2">
            {stats.revenueByDay?.slice(-14).map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-brand-green/5 rounded-full relative overflow-hidden h-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.revenue / (Math.max(...stats.revenueByDay.map((x:any)=>x.revenue)) || 1)) * 100}%` }}
                    className="absolute bottom-0 left-0 right-0 bg-brand-green rounded-full"
                  />
                </div>
                <span className="text-[8px] font-black uppercase text-brand-green/20 group-hover:text-brand-green transition-colors">{d.date.split("-")[2]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[48px] p-10 shadow-sm border border-brand-green/5">
          <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-brand-green/30 mb-8">System Activity</h3>
          <div className="space-y-6">
            {[
              { type: "order", msg: "New order #8293 processed", time: "2 mins ago" },
              { type: "inventory", msg: "Island Pink Kush restocked", time: "15 mins ago" },
              { type: "user", msg: "Admin login from Calgary, AB", time: "1 hour ago" },
              { type: "promo", msg: "NEWBUDS promo code expired", time: "3 hours ago" },
              { type: "order", msg: "Order #8288 marked as delivered", time: "5 hours ago" },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-start pb-4 border-b border-brand-green/5 last:border-0 last:pb-0">
                <div className="mt-1 w-2 h-2 rounded-full bg-brand-light-green shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-brand-green/80 leading-tight mb-1">{log.msg}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/20">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] p-10 shadow-sm border border-brand-green/5">
        <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-brand-green/30 mb-8">Top Performing Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.topProducts?.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between p-6 bg-brand-green/5 rounded-3xl group hover:bg-brand-green hover:text-brand-earth transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center text-brand-green shadow-sm">
                  <Package size={20} />
                </div>
                <div>
                  <span className="font-black uppercase tracking-tighter text-sm">{p.name}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">{p.units} Units Sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-lg">${p.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    fetch("/api/orders", { headers: authHeaders() })
      .then(r => r.json()).then(d => { setOrders(d.orders ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  if (loading) return <div className="space-y-4 animate-pulse">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-brand-green/5 rounded-3xl" />)}</div>;

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.orderId} className="bg-white rounded-[32px] overflow-hidden border border-brand-green/5 shadow-sm">
          <button 
            onClick={() => setExpandedId(expandedId === order.orderId ? null : order.orderId)}
            className="w-full px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between hover:bg-brand-green/5 transition-colors"
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 bg-brand-green/5 rounded-2xl flex items-center justify-center text-brand-green">
                <ShoppingBag size={20} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-3">
                  <span className="font-black text-brand-green uppercase tracking-tighter">#{order.orderId}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-[11px] font-bold text-brand-green/40 uppercase tracking-widest mt-1">{order.customer?.name} · {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-2xl font-black text-brand-green">${order.total?.toFixed(2)}</p>
                <p className="text-[9px] font-black uppercase text-brand-green/40">{order.items?.length} Items</p>
              </div>
              <div className={`transition-transform duration-300 ${expandedId === order.orderId ? "rotate-180" : ""}`}>
                <ChevronDown size={20} className="text-brand-green/40" />
              </div>
            </div>
          </button>
          
          <AnimatePresence>
            {expandedId === order.orderId && (
              <motion.div 
                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                className="px-5 sm:px-8 pb-6 sm:pb-8 border-t border-brand-green/5"
              >
                <div className="pt-6 sm:pt-8 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">Order Content</p>
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-brand-green/80">{item.name} <span className="text-brand-green/40 ml-1">×{item.quantity}</span></span>
                        <span className="font-black text-brand-green">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">Delivery Info</p>
                    <div className="text-sm font-bold text-brand-green/80">
                      <p>{order.customer?.name}</p>
                      <p className="text-brand-green/60 font-medium">{order.customer?.phone}</p>
                      <p className="mt-2 text-xs leading-relaxed">
                        {order.delivery?.street}, {order.delivery?.city}<br />
                        {order.delivery?.postal}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">Update Pipeline</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["confirmed", "preparing", "dispatched", "delivered", "cancelled"].map(s => (
                        <button 
                          key={s} 
                          onClick={() => updateStatus(order.orderId, s)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${order.status === s ? "bg-brand-green text-brand-earth border-brand-green" : "border-brand-green/10 text-brand-green/60 hover:border-brand-green/30"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function ProductManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products", { headers: authHeaders() });
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => { fetchProducts(); }, []);

  const removeProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchProducts();
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white rounded-[40px] p-8 shadow-sm border border-brand-green/5">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-brand-green mb-1">Catalog</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-green/30">Manage your menu offerings</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-brand-green text-brand-earth px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
        >
          <Plus size={16} strokeWidth={3} />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-[48px] overflow-hidden border border-brand-green/5 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-brand-green/5">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green/40">Product</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green/40">Category</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green/40">Price</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green/40">Status</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-brand-green/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-green/5">
            {products.map((p) => (
              <tr key={p.id} className="group hover:bg-brand-green/[0.02] transition-colors">
                <td className="px-10 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-green/5 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-1">
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-green">{p.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/40">{p.brand || "Craft Series"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-5 font-medium text-brand-green/60">{p.category}</td>
                <td className="px-10 py-5 font-black text-brand-green">${p.price?.toFixed(2)}</td>
                <td className="px-10 py-5">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.inStock !== false ? "bg-brand-light-green/10 text-brand-green border-brand-light-green/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
                    {p.inStock !== false ? "Live" : "OOS"}
                  </span>
                </td>
                <td className="px-10 py-5">
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => setEditingProduct(p)}
                      className="p-2.5 rounded-xl hover:bg-brand-green/10 text-brand-green/40 hover:text-brand-green transition-all"
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => removeProduct(p.id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-brand-green/40 hover:text-red-600 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(isAdding || editingProduct) && (
        <ProductModal 
          product={editingProduct}
          onClose={() => { setIsAdding(false); setEditingProduct(null); }} 
          onSave={() => { setIsAdding(false); setEditingProduct(null); fetchProducts(); }} 
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }: { product?: any; onClose: () => void; onSave: () => void }) {
  const [data, setData] = useState(product || { 
    name: "", 
    price: 0, 
    category: "Dried Flower", 
    image: "", 
    description: "", 
    inStock: true,
    brand: "",
    thc: "",
    weight: ""
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!data.name || !data.price) return alert("Please fill in required fields.");
    setLoading(true);
    try {
      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      
      if (res.ok) onSave();
      else alert("Failed to save product.");
    } catch (err) {
      alert("Error saving product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-brand-green/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-brand-earth rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-brand-green">{product ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/30 mt-1">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-3 bg-brand-green/5 rounded-2xl text-brand-green hover:bg-brand-green/10 transition-colors"><X size={24} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <div className="sm:col-span-2 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 ml-2">Name *</p>
            <input 
              className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-green/20 font-bold text-brand-green"
              value={data.name} onChange={e => setData({...data, name: e.target.value})}
              placeholder="e.g. Ultra Pink Kush"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 ml-2">Brand</p>
            <input 
              className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-4 outline-none font-bold text-brand-green"
              value={data.brand} onChange={e => setData({...data, brand: e.target.value})}
              placeholder="e.g. Aura Craft"
            />
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 ml-2">Category</p>
            <select 
              className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-4 outline-none font-bold text-brand-green"
              value={data.category} onChange={e => setData({...data, category: e.target.value})}
            >
              {["Dried Flower", "Pre-Roll", "Edible", "Vape", "Beverage", "Concentrate", "Accessories"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 ml-2">Price ($) *</p>
            <input 
              type="number" step="0.01" className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-4 outline-none font-bold text-brand-green"
              value={data.price} onChange={e => setData({...data, price: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 ml-2">Stock Status</p>
            <select 
              className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-4 outline-none font-bold text-brand-green"
              value={data.inStock ? "true" : "false"} onChange={e => setData({...data, inStock: e.target.value === "true"})}
            >
              <option value="true">Live / In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 ml-2">Image URL</p>
            <input 
              className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-4 outline-none font-bold text-brand-green"
              value={data.image} onChange={e => setData({...data, image: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/40 ml-2">Description</p>
            <textarea 
              rows={3} className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-4 outline-none resize-none font-medium text-brand-green"
              value={data.description} onChange={e => setData({...data, description: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={save} 
          disabled={loading}
          className="w-full bg-brand-green text-brand-earth py-5 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-8"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-brand-earth border-t-transparent rounded-full animate-spin" />
          ) : product ? "Update Product" : "Save Product"}
        </button>
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    confirmed: "bg-brand-light-green/10 text-brand-green border-brand-light-green/20",
    preparing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    dispatched: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${colors[status] || "bg-brand-green/5"}`}>{status}</span>;
}

/* ── Placeholder Tabs ────────────────────────────────────────────────── */
function Customers() { return <div className="p-12 text-center text-brand-green/40 font-black uppercase tracking-widest">Customer Directory Coming Soon</div>; }
function PromoCodes() { return <div className="p-12 text-center text-brand-green/40 font-black uppercase tracking-widest">Voucher Management Coming Soon</div>; }
function Settings() { return <div className="p-12 text-center text-brand-green/40 font-black uppercase tracking-widest">System Settings Coming Soon</div>; }

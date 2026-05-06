import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import useSWR, { mutate } from "swr";
import {
  ShoppingBag, Package, Tag, Settings as SettingsIcon, History, LayoutDashboard,
  Plus, Pencil, Trash2, X, Lock, Menu, LogOut, Search, Bell,
  TrendingUp, RefreshCw, Truck, Store, ExternalLink, FileUp, FileDown,
  ToggleLeft, ToggleRight, Save, Image as ImageIcon, MapPin, Copy, Check,
  AlertTriangle, Eye, EyeOff, Upload, Home, Download, Zap,
} from "lucide-react";

import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { AuditLogs } from "../components/admin/AuditLogs";

const fetcher = (fn: () => Promise<any>) => fn();

const TABS = [
  { id: "Dashboard", icon: LayoutDashboard },
  { id: "Orders", icon: ShoppingBag },
  { id: "Inventory", icon: Package },
  { id: "Promos", icon: Tag },
  { id: "Settings", icon: SettingsIcon },
] as const;

type Tab = typeof TABS[number]["id"];

const ORDER_STATUSES = [
  { value: "confirmed", label: "Confirmed", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { value: "preparing", label: "Preparing", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { value: "dispatched", label: "Dispatched", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { value: "delivered", label: "Delivered", color: "bg-green-50 text-brand-green border-green-100" },
  { value: "ready_pickup", label: "Ready Pickup", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-50 text-red-500 border-red-100" },
];

function statusColor(status: string) {
  return ORDER_STATUSES.find(s => s.value === status)?.color ?? "bg-brand-green/5 text-brand-green/50 border-brand-green/10";
}

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: value }),
      });
      if (response.ok) {
        localStorage.setItem("admin_auth", "true");
        sessionStorage.setItem("admin_secret", value);
        success("Access Granted. Welcome.");
        onLogin();
      } else {
        setError(true);
        toastError("Invalid Access Key.");
        setTimeout(() => setError(false), 2000);
      }
    } catch {
      setError(true);
      toastError("Authentication failed.");
      setTimeout(() => setError(false), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f0c] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-brand-green/10 blur-[80px] sm:blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[40%] bg-brand-light-green/5 blur-[80px] sm:blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-[480px] bg-white rounded-[40px] sm:rounded-[48px] p-8 sm:p-14 shadow-[0_32px_80px_rgba(0,0,0,0.4)] relative z-10"
      >
        <div className="flex flex-col items-center mb-8 sm:mb-12 text-center">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-green text-brand-earth rounded-[24px] sm:rounded-[28px] flex items-center justify-center mb-6 sm:mb-8 shadow-xl shadow-brand-green/20"
          >
            <Lock size={28} className="sm:w-[32px] sm:h-[32px]" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-brand-green mb-2">Internal Access</h2>
          <p className="text-brand-green/30 text-[9px] font-black uppercase tracking-[0.5em]">Authorization Required</p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">Terminal Key</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className={`w-full bg-brand-green/5 border-2 rounded-[20px] sm:rounded-[24px] px-6 sm:px-8 py-5 sm:py-6 outline-none text-brand-green font-black text-center text-lg sm:text-xl tracking-[0.2em] transition-all ${error ? "border-red-500/50 bg-red-50/50" : "border-brand-green/10 focus:border-brand-green/30 focus:ring-8 focus:ring-brand-green/5"}`}
            />
          </div>
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-brand-green text-brand-earth py-5 sm:py-6 rounded-[20px] sm:rounded-[24px] font-black uppercase tracking-widest text-[11px] sm:text-[12px] flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-brand-green/10 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : "Authenticate"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") setIsLoggedIn(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_secret");
    setIsLoggedIn(false);
    success("Logged Out.");
  };

  if (!isLoggedIn) return <LoginGate onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-[#0f1511] flex flex-col lg:flex-row text-white font-sans selection:bg-brand-green selection:text-brand-earth overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-72 bg-[#131a15] transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-light-green rounded-2xl flex items-center justify-center text-[#131a15] font-black text-lg shadow-lg">B</div>
            <div>
              <p className="font-black uppercase tracking-tighter text-lg">Buds Admin</p>
              <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">Control Center</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeTab === tab.id
                    ? "bg-brand-light-green text-[#131a15] shadow-lg shadow-brand-light-green/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon size={16} />
                {tab.id}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="pt-8 space-y-3 border-t border-white/5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Home size={14} /> Website
            </a>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-200 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden px-4 py-4 flex items-center justify-between bg-[#131a15] border-b border-white/5 sticky top-0 z-50">
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-brand-green text-white rounded-lg">
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-tighter">{activeTab}</h1>
          <div className="w-10 h-10 bg-white/5 rounded-lg" />
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                {activeTab === "Dashboard" && <DashboardTab />}
                {activeTab === "Orders" && <OrdersTab />}
                {activeTab === "Inventory" && <InventoryTab />}
                {activeTab === "Promos" && <PromosTab />}
                {activeTab === "Settings" && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Tab ────────────────────────────────────────────────── */

function DashboardTab() {
  const { data: stats } = useSWR("admin-stats", () => api.admin.getStats(), { refreshInterval: 30000 });
  const { data: ordersData } = useSWR("admin-orders", () => api.admin.getOrders(), { refreshInterval: 15000 });

  const orders = ordersData?.orders ?? [];
  const recentOrders = orders.slice(0, 5);

  const statCards = [
    { label: "Revenue Today", value: "$0.00", icon: TrendingUp, color: "from-green-500/20 to-brand-green/20" },
    { label: "Orders Today", value: orders.length.toString(), icon: ShoppingBag, color: "from-blue-500/20 to-blue-600/20" },
    { label: "Total Products", value: "0", icon: Package, color: "from-purple-500/20 to-purple-600/20" },
    { label: "Active Promos", value: "0", icon: Tag, color: "from-amber-500/20 to-amber-600/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
        <p className="text-white/40 text-sm">Real-time overview of your business</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${card.color} border border-white/10 rounded-2xl p-6 backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-2">{card.label}</p>
                <p className="text-3xl font-black tracking-tighter">{card.value}</p>
              </div>
              <card.icon size={24} className="opacity-30" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Recent Orders</h2>
        <div className="space-y-2">
          {recentOrders.length > 0 ? (
            recentOrders.map((order: any) => (
              <div key={order.orderId} className="bg-[#1a2219] border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-[#202820] transition-colors">
                <div>
                  <p className="font-bold text-sm">#{order.orderId?.slice(0, 8)}</p>
                  <p className="text-white/50 text-xs">{(order.customer as any)?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="font-bold text-sm">${Number(order.total ?? 0).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/30 text-sm">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Orders Tab ────────────────────────────────────────────────── */

function OrdersTab() {
  const { data: ordersData, mutate: revalidateOrders } = useSWR("admin-orders", () => api.admin.getOrders(), { refreshInterval: 15000 });
  const orders = ordersData?.orders ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { success, error: toastError } = useToast();

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, status);
      success(`Order updated → ${status}`);
      revalidateOrders();
      setSelectedOrder(null);
    } catch {
      toastError("Status update failed.");
    }
  };

  const filtered = useMemo(() => orders.filter((o: any) => {
    const matchSearch = o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer as any)?.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Orders</h1>
        <p className="text-white/40 text-sm">Manage all customer orders</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "confirmed", "preparing", "dispatched", "delivered", "ready_pickup", "cancelled"].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                statusFilter === s
                  ? "bg-brand-green text-[#131a15] border-brand-green"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((order: any) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a2219] border border-white/5 rounded-2xl p-6 hover:bg-[#202820] transition-colors cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-black">#{order.orderId?.slice(0, 8)}</h3>
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm mb-1">{(order.customer as any)?.name}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1.5">
                    {(order.delivery as any)?.method === "delivery" ? (
                      <>
                        <Truck size={12} /> {(order.delivery as any)?.street}, {(order.delivery as any)?.city}
                      </>
                    ) : (
                      <>
                        <Store size={12} /> In-Store Pickup
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black">${Number(order.total ?? 0).toFixed(2)}</p>
                  <p className="text-white/40 text-xs">{(order.items as any[])?.length ?? 0} items</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20">
            <ShoppingBag size={32} className="opacity-10 mx-auto mb-4" />
            <p className="text-white/30">No orders found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={updateStatus} />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderModal({ order, onClose, onUpdateStatus }: any) {
  const isDelivery = (order.delivery as any)?.method === "delivery";
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const nextStatuses = isDelivery
    ? ["preparing", "dispatched", "delivered", "cancelled"]
    : ["preparing", "ready_pickup", "cancelled"];

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#131a15] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#131a15] border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase">#{order.orderId?.slice(0, 8)}</h2>
            <p className="text-white/40 text-xs mt-1">Order Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-3">Customer</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-sm">{(order.customer as any)?.name}</span>
                <button
                  onClick={() => copyToClipboard((order.customer as any)?.name, "name")}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {copiedField === "name" ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="opacity-40" />}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-sm">{(order.customer as any)?.email}</span>
                <button
                  onClick={() => copyToClipboard((order.customer as any)?.email, "email")}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {copiedField === "email" ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="opacity-40" />}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-sm">{(order.customer as any)?.phone}</span>
                <button
                  onClick={() => copyToClipboard((order.customer as any)?.phone, "phone")}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {copiedField === "phone" ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="opacity-40" />}
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-3">Delivery</h3>
            {isDelivery ? (
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="opacity-60">Street:</span> {(order.delivery as any)?.street}</p>
                <p className="text-sm"><span className="opacity-60">City:</span> {(order.delivery as any)?.city}</p>
                <p className="text-sm"><span className="opacity-60">Postal:</span> {(order.delivery as any)?.postal}</p>
                <p className="text-sm"><span className="opacity-60">Slot:</span> {(order.delivery as any)?.slot}</p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-sm flex items-center gap-2"><Store size={14} /> In-Store Pickup</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-3">Items</h3>
            <div className="space-y-2">
              {(order.items as any[])?.map((item, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-sm flex-1">{item.name} × {item.quantity}</span>
                  <span className="text-sm font-bold">${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Subtotal:</span>
              <span>${Number(order.subtotal ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Delivery:</span>
              <span>${Number(order.deliveryFee ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Discount:</span>
              <span>-${Number(order.discount ?? 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between font-black">
              <span>Total:</span>
              <span>${Number(order.total ?? 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Status Actions */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-3">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {nextStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => onUpdateStatus(order.orderId, status)}
                  className="px-4 py-3 bg-brand-green text-[#131a15] rounded-lg font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all"
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Inventory Tab ────────────────────────────────────────────── */

function InventoryTab() {
  const { data: productsData, mutate: revalidateProducts } = useSWR("admin-products", () => api.products.getAll(), { refreshInterval: 30000 });
  const products = productsData?.products ?? [];
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvData, setCSVData] = useState<any[]>([]);
  const { success, error: toastError } = useToast();

  const filtered = useMemo(() => {
    return products.filter((p: any) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleSave = async (product: any) => {
    try {
      if (selectedProduct?.id) {
        await api.admin.updateProduct({ ...product, id: selectedProduct.id });
        success("Product updated!");
      } else {
        const id = `product_${crypto.randomUUID()}`;
        await api.admin.createProduct({ ...product, id });
        success("Product created!");
      }
      revalidateProducts();
      setShowModal(false);
      setSelectedProduct(null);
    } catch {
      toastError("Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product?")) {
      try {
        await api.admin.deleteProduct(id);
        success("Product deleted!");
        revalidateProducts();
      } catch {
        toastError("Delete failed");
      }
    }
  };

  const handleCSVImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

      const data = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, i) => {
          obj[header] = values[i] || "";
        });
        return obj;
      });

      setCSVData(data);
      setShowCSVModal(true);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Inventory</h1>
          <p className="text-white/40 text-sm mt-1">Manage your products</p>
        </div>
        <div className="flex gap-2">
          <label className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer">
            <FileUp size={16} /> Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCSVImport(file);
              }}
              className="hidden"
            />
          </label>
          <button
            onClick={() => { setSelectedProduct(null); setShowModal(true); }}
            className="px-6 py-3 bg-brand-green text-[#131a15] rounded-lg font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1a2219] border border-white/5 rounded-lg px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((product: any) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a2219] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all"
          >
            {/* Image */}
            <div className="w-full aspect-square bg-white/5 overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={32} className="opacity-20" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-black text-sm uppercase tracking-tight">{product.name}</h3>
                <p className="text-[8px] text-white/50 uppercase tracking-widest mt-1">{product.category}</p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-lg font-black">${Number(product.price).toFixed(2)}</p>
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowModal(true);
                  }}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </div>

              <button
                onClick={() => handleDelete(product.id)}
                className="w-full px-3 py-2 bg-red-500/10 text-red-300 rounded-lg font-bold uppercase text-[8px] hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={selectedProduct}
            onClose={() => { setShowModal(false); setSelectedProduct(null); }}
            onSave={handleSave}
          />
        )}
        {showCSVModal && (
          <CSVImportModal
            data={csvData}
            onClose={() => { setShowCSVModal(false); setCSVData([]); }}
            onImport={async (products) => {
              try {
                for (const p of products) {
                  const id = `product_${crypto.randomUUID()}`;
                  await api.admin.createProduct({ ...p, id });
                }
                success(`Imported ${products.length} products!`);
                revalidateProducts();
                setShowCSVModal(false);
              } catch {
                toastError("Import failed");
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ product, onClose, onSave }: any) {
  const [formData, setFormData] = useState(product || {
    name: "",
    price: 0,
    category: "Dried Flower",
    brand: "",
    strain: "Hybrid",
    thc: "",
    cbd: "",
    weight: "",
    description: "",
    quantity: 0,
    inStock: true,
    isBestSeller: false,
    image: "",
  });
  const [imagePreview, setImagePreview] = useState(product?.image || "");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      alert("Name and price required");
      return;
    }
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#131a15] border border-white/10 rounded-2xl max-w-2xl w-full my-8"
      >
        <div className="sticky top-0 bg-[#131a15] border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase">{product ? "Edit" : "New"} Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Image Upload */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Product Image</label>
            <div className="relative">
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-white/5">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setImagePreview(""); setFormData({ ...formData, image: "" }); }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="w-full aspect-video bg-white/5 border border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-white/50">Click to upload</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                <option>Dried Flower</option>
                <option>Edible</option>
                <option>Vape</option>
                <option>Pre-Roll</option>
                <option>Beverage</option>
                <option>Accessories</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Strain</label>
              <select
                value={formData.strain}
                onChange={e => setFormData({ ...formData, strain: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                <option>Indica</option>
                <option>Sativa</option>
                <option>Hybrid</option>
                <option>CBD</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">THC %</label>
              <input
                type="text"
                value={formData.thc}
                onChange={e => setFormData({ ...formData, thc: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">CBD %</label>
              <input
                type="text"
                value={formData.cbd}
                onChange={e => setFormData({ ...formData, cbd: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <label className="text-xs font-black uppercase tracking-widest">In Stock</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
              <label className="text-xs font-black uppercase tracking-widest">Best Seller</label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#131a15] border-t border-white/5 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-brand-green text-[#131a15] rounded-lg font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CSVImportModal({ data, onClose, onImport }: any) {
  const [selected, setSelected] = useState<boolean[]>(data.map(() => true));
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageUrls({ ...imageUrls, [index]: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleImport = async () => {
    setLoading(true);
    const toImport = data
      .map((row: any, i: number) => (selected[i] ? { ...row, image: imageUrls[i] || row.image || "" } : null))
      .filter(Boolean);
    await onImport(toImport);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#131a15] border border-white/10 rounded-2xl max-w-3xl w-full my-8"
      >
        <div className="sticky top-0 bg-[#131a15] border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase">Import Products ({selected.filter(Boolean).length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {data.map((row: any, i: number) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-4">
                {/* Image Preview/Upload */}
                <div className="w-24 h-24 flex-shrink-0">
                  {imageUrls[i] || row.image ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <img src={imageUrls[i] || row.image} alt={row.name} className="w-full h-full object-cover" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" title="Click to change image">
                        <Upload size={16} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          title="Upload product image"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(i, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="w-full h-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors" title="Click to upload image">
                      <Upload size={16} className="opacity-40" />
                      <input
                        type="file"
                        accept="image/*"
                        title="Upload product image"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(i, e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      title="Select product for import"
                      checked={selected[i]}
                      onChange={(e) => setSelected(selected.map((s, j) => j === i ? e.target.checked : s))}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h3 className="font-black text-sm uppercase">{row.name || row.product_name || "Unknown"}</h3>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest">
                        {row.category || "No category"} • ${row.price || "0"}
                      </p>
                    </div>
                  </div>
                  {row.description && <p className="text-xs text-white/50">{row.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !selected.some(Boolean)}
            className="flex-1 px-4 py-3 bg-brand-green text-[#131a15] rounded-lg font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Importing..." : `Import ${selected.filter(Boolean).length}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Promos Tab ────────────────────────────────────────────── */

function PromosTab() {
  const { data: promosData, mutate: revalidatePromos } = useSWR("admin-promos", () => api.admin.getPromos(), { refreshInterval: 30000 });
  const promos = promosData?.promos ?? [];
  const [showModal, setShowModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);
  const { success, error: toastError } = useToast();

  const handleSave = async (promo: any) => {
    try {
      if (selectedPromo?.id) {
        await api.admin.updatePromo({ ...promo, id: selectedPromo.id });
        success("Promo updated!");
      } else {
        await api.admin.createPromo(promo);
        success("Promo created!");
      }
      revalidatePromos();
      setShowModal(false);
      setSelectedPromo(null);
    } catch (err: any) {
      console.error("Save failed:", err);
      toastError("Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this promo?")) {
      try {
        await api.admin.deletePromo(id);
        success("Promo deleted!");
        revalidatePromos();
      } catch {
        toastError("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Promos</h1>
          <p className="text-white/40 text-sm mt-1">Manage discount codes</p>
        </div>
        <button
          onClick={() => { setSelectedPromo(null); setShowModal(true); }}
          className="px-6 py-3 bg-brand-green text-[#131a15] rounded-lg font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Promo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((promo: any) => (
          <div key={promo.id} className="bg-[#1a2219] border border-white/5 rounded-xl p-6">
            <div className="mb-4">
              <p className="text-2xl font-black uppercase tracking-tight">{promo.code}</p>
              <p className="text-sm text-white/50 mt-2">
                {promo.discount}{promo.type === "percent" ? "%" : "$"} Off
              </p>
            </div>
            <div className="flex items-center gap-2 mb-4 text-xs text-white/40">
              {promo.active ? (
                <>
                  <Zap size={12} className="text-green-400" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={12} className="text-red-400" />
                  <span>Inactive</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedPromo(promo); setShowModal(true); }}
                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(promo.id)}
                className="px-3 py-2 bg-red-500/10 text-red-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <PromoModal
            promo={selectedPromo}
            onClose={() => { setShowModal(false); setSelectedPromo(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PromoModal({ promo, onClose, onSave }: any) {
  const [formData, setFormData] = useState(promo || { code: "", discount: 10, type: "percent", active: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.code || !formData.discount) {
      alert("Code and discount required");
      return;
    }
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#131a15] border border-white/10 rounded-2xl max-w-md w-full"
      >
        <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase">{promo ? "Edit" : "New"} Promo</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Amount</label>
              <input
                type="number"
                value={formData.discount}
                onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={e => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 cursor-pointer"
            />
            <label className="text-xs font-black uppercase tracking-widest">Active</label>
          </div>
        </div>

        <div className="border-t border-white/5 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-brand-green text-[#131a15] rounded-lg font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Settings Tab ────────────────────────────────────────────── */

function SettingsTab() {
  const [storeInfo, setStoreInfo] = useState({ name: "Buds N' Buddies", phone: "(780) 123-4567", address: "Sherwood Park, AB", email: "info@buds.local" });
  const [automations, setAutomations] = useState([
    { key: "order_confirmation_customer", label: "Order Confirmation to Customer", enabled: true },
    { key: "order_preparing", label: "Order Preparing Notification", enabled: true },
    { key: "order_ready_pickup", label: "Ready for Pickup Notification", enabled: true },
    { key: "order_dispatched", label: "Dispatched Notification", enabled: true },
    { key: "order_delivered", label: "Delivered Notification", enabled: true },
    { key: "welcome_email", label: "Welcome Email (New Customers)", enabled: true },
  ]);
  const { success } = useToast();

  const handleSaveStore = () => {
    success("Store info updated!");
  };

  const toggleAutomation = (key: string) => {
    setAutomations(automations.map(a => a.key === key ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure your store</p>
      </div>

      {/* Store Information */}
      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-black uppercase">Store Information</h2>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Store Name</label>
          <input
            type="text"
            value={storeInfo.name}
            onChange={e => setStoreInfo({ ...storeInfo, name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Phone</label>
            <input
              type="text"
              value={storeInfo.phone}
              onChange={e => setStoreInfo({ ...storeInfo, phone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Email</label>
            <input
              type="email"
              value={storeInfo.email}
              onChange={e => setStoreInfo({ ...storeInfo, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-white/50 mb-2 block">Address</label>
          <input
            type="text"
            value={storeInfo.address}
            onChange={e => setStoreInfo({ ...storeInfo, address: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50"
          />
        </div>

        <button
          onClick={handleSaveStore}
          className="px-6 py-3 bg-brand-green text-[#131a15] rounded-lg font-black uppercase text-xs tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Save size={14} /> Save Changes
        </button>
      </div>

      {/* Email Automations */}
      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-black uppercase">Email Automations</h2>

        <div className="space-y-3">
          {automations.map(auto => (
            <div key={auto.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
              <div>
                <p className="text-sm font-bold">{auto.label}</p>
              </div>
              <button
                onClick={() => toggleAutomation(auto.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${auto.enabled ? "bg-brand-green" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${auto.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6">
        <h2 className="text-lg font-black uppercase mb-4">Audit Logs</h2>
        <AuditLogs />
      </div>
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

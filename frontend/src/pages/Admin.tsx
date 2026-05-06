import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import useSWR, { mutate } from "swr";
import {
  ShoppingBag, Users, Package,
  Plus, Pencil, Trash2, X, Tag, Lock,
  Menu, LogOut, Search,
  Settings as SettingsIcon, Bell,
  TrendingUp, RefreshCw,
  Truck, Store, Calculator,
  ExternalLink, History, FileUp, FileDown,
  ToggleLeft, ToggleRight, Save, Image as ImageIcon,
  MapPin,
} from "lucide-react";

import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { AuditLogs } from "../components/admin/AuditLogs";
import { PricingTool } from "../components/admin/PricingTool";
import { CommandPalette } from "../components/admin/CommandPalette";

/* ── Types & Constants ────────────────────────────────────────────────── */

const fetcher = (fn: () => Promise<any>) => fn();

const TABS = [
  { id: "Orders", icon: ShoppingBag },
  { id: "Inventory", icon: Package },
  { id: "Promos", icon: Tag },
  { id: "Pricing", icon: Calculator },
  { id: "AuditLogs", icon: History },
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

/* ── Login Gate ─────────────────────────────────────────────────────────── */

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
        success("Access Granted. Welcome.");
        onLogin();
      } else {
        setError(true);
        toastError("Invalid Access Key.");
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
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

/* ── Main Dashboard ─────────────────────────────────────────────────────── */

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") setIsLoggedIn(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_auth");
    setIsLoggedIn(false);
    success("Logged Out.");
  };

  if (!isLoggedIn) return <LoginGate onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-[#f8f9f7] flex flex-col lg:flex-row text-brand-green font-sans selection:bg-brand-green selection:text-brand-earth overflow-hidden">

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-[55] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-64 sm:w-72 md:w-80 bg-brand-green text-brand-earth transition-transform duration-500 lg:relative lg:translate-x-0 overflow-y-auto ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col p-8 sm:p-10">
          <div className="mb-12 sm:mb-16 flex items-center gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl flex items-center justify-center text-brand-green font-black text-xl shadow-lg shadow-black/10">B</div>
            <div>
              <p className="font-black uppercase tracking-tighter text-xl sm:text-2xl leading-none">Boutique</p>
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.5em] opacity-40 mt-1.5">Platform OS</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 sm:space-y-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 sm:gap-5 px-6 sm:px-8 py-4 sm:py-5 rounded-[20px] sm:rounded-[24px] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group ${activeTab === tab.id ? "bg-white text-brand-green shadow-2xl shadow-black/20" : "opacity-40 hover:opacity-100 hover:bg-white/5"}`}
              >
                <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                {tab.id}
                {activeTab === tab.id && (
                  <motion.div layoutId="active-pill" className="absolute left-0 w-1.5 h-6 bg-brand-green rounded-r-full" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8 sm:pt-10 space-y-4">
            <div className="p-5 sm:p-6 bg-white/5 rounded-[28px] sm:rounded-[32px] border border-white/10">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-2 h-2 bg-brand-light-green rounded-full animate-pulse shadow-[0_0_8px_rgba(159,255,164,0.6)]" />
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">System Online</p>
              </div>
              <p className="text-[8px] sm:text-[9px] font-medium opacity-30 leading-relaxed uppercase tracking-widest">Sherwood Park Node 01<br />v4.2.0 Production</p>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 px-6 sm:px-8 py-4 sm:py-5 rounded-[20px] sm:rounded-[24px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <ExternalLink size={16} /> Website
            </a>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-4 px-6 sm:px-8 py-4 sm:py-5 rounded-[20px] sm:rounded-[24px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest bg-red-500/10 text-red-100 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={16} /> Terminate
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between bg-white border-b border-brand-green/5 sticky top-0 z-[50]">
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="p-2.5 sm:p-3 bg-brand-green text-brand-earth rounded-xl">
            <Menu size={18} />
          </button>
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tighter">{activeTab}</h1>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-green/5 rounded-full" />
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-6 md:p-8 lg:p-14 max-w-7xl w-full mx-auto flex-1 flex flex-col">
            <div className="mb-10 lg:mb-14 hidden lg:flex items-center justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none mb-3">{activeTab}</h1>
                <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.4em] opacity-20">Monitoring Real-time Data Stream</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white border border-brand-green/5 rounded-[24px] px-6 py-4 shadow-sm flex items-center gap-4">
                  <div className="w-2 h-2 bg-brand-light-green rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Live</span>
                  <div className="h-6 w-px bg-brand-green/10" />
                  <Bell size={18} className="opacity-20" />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 flex flex-col"
              >
                {activeTab === "Orders" && <OrdersTab />}
                {activeTab === "Inventory" && <InventoryTab />}
                {activeTab === "Promos" && <PromosTab />}
                {activeTab === "Pricing" && <PricingTool />}
                {activeTab === "AuditLogs" && <AuditLogs />}
                {activeTab === "Settings" && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelectTab={(tab) => setActiveTab(tab as Tab)} 
      />
    </div>
  );
}


/* ── Orders Tab ───────────────────────────────────────────────────────── */

function OrdersTab() {
  const { data: ordersData, error, mutate: revalidateOrders } = useSWR("admin-orders", () => api.admin.getOrders(), {
    refreshInterval: 15000, // Faster refresh for orders
  });
  
  const orders = ordersData?.orders ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { success, error: toastError } = useToast();

  const updateStatus = async (orderId: string, status: string, extra?: { driverName?: string; driverPhone?: string }) => {
    try {
      await api.admin.updateOrderStatus(orderId, status, extra);
      success(`Order ${orderId} → ${status}`);
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

  if (!ordersData && !error) return <LoadingList />;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      <div className="flex flex-col xl:flex-row gap-6 items-center bg-white rounded-[32px] p-6 sm:p-8 border border-brand-green/5 shadow-sm">
        <div className="relative flex-1 w-full xl:max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20" size={18} />
          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-16 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-green/5 transition-all"
          />
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
          {["all", "confirmed", "preparing", "dispatched", "delivered", "ready_pickup", "cancelled"].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === s ? "bg-brand-green text-brand-earth border-brand-green" : "bg-transparent border-brand-green/10 hover:border-brand-green/30"}`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((order: any, i: number) => (
          <motion.div
            key={order.orderId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 border border-brand-green/5 shadow-sm hover:shadow-[0_40px_100px_rgba(10,15,12,0.08)] transition-all group relative overflow-hidden flex flex-col lg:grid lg:grid-cols-[1.2fr_0.8fr_auto] items-stretch lg:items-center gap-6 lg:gap-10"
          >
            {/* Status Visual Guard */}
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${order.status === 'confirmed' ? 'bg-blue-500' : order.status === 'delivered' ? 'bg-brand-green' : 'bg-brand-green/10'}`} />

            {/* Column 1: Order & Identity */}
            <div className="flex items-start gap-5 sm:gap-7 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-green/[0.03] rounded-[24px] sm:rounded-[32px] flex items-center justify-center text-brand-green shrink-0 shadow-inner group-hover:bg-brand-green group-hover:text-brand-earth transition-all duration-500">
                {(order.delivery as any)?.method === "delivery" ? <Truck size={28} /> : <Store size={28} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none text-brand-green">#{order.orderId?.slice(0, 8)}</h4>
                  <span className={`px-2.5 py-1 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] border ${statusColor(order.status)}`}>
                    {order.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[13px] sm:text-[15px] font-black uppercase tracking-widest text-brand-green/90 leading-none">
                    {(order.customer as any)?.name ?? "Guest Customer"}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest leading-normal max-w-[200px] lg:max-w-none">
                    {(order.delivery as any)?.street ? (
                      <span className="flex items-start gap-1.5">
                        <MapPin size={10} className="mt-0.5 shrink-0" /> 
                        <span>{(order.delivery as any).street}, {(order.delivery as any).city}</span>
                      </span>
                    ) : "Store Pickup"}
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-bold opacity-20 uppercase tracking-[0.2em]">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {(order.delivery as any)?.method ?? "pickup"}
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Metrics */}
            <div className="flex items-center justify-between lg:justify-center gap-8 sm:gap-14 py-6 lg:py-0 border-y lg:border-y-0 lg:border-x border-brand-green/5 lg:px-10">
              <div className="text-left lg:text-center">
                <p className="text-[9px] font-black uppercase opacity-20 tracking-widest mb-1.5">Total Value</p>
                <p className="text-2xl sm:text-3xl font-black tracking-tighter text-brand-green leading-none">${Number(order.total ?? 0).toFixed(2)}</p>
              </div>
              <div className="text-right lg:text-center">
                <p className="text-[9px] font-black uppercase opacity-20 tracking-widest mb-1.5">Items</p>
                <p className="text-2xl sm:text-3xl font-black tracking-tighter text-brand-green leading-none">{(order.items as any[])?.length ?? 0}</p>
              </div>
            </div>

            {/* Column 3: Actions */}
            <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
              {(() => {
                let nextStatus = "";
                let label = "";
                const isDelivery = (order.delivery as any)?.method === "delivery";
                
                if (order.status === "confirmed" || order.status === "pending") {
                  nextStatus = "preparing"; label = "Start Preparing";
                } else if (order.status === "preparing") {
                  if (isDelivery) { nextStatus = "dispatched"; label = "Dispatch"; }
                  else { nextStatus = "ready_pickup"; label = "Ready"; }
                } else if (order.status === "dispatched") {
                  nextStatus = "delivered"; label = "Deliver";
                }

                return (
                  <div className="flex items-center gap-3 w-full">
                    {nextStatus && (
                      <button
                        type="button"
                        onClick={() => updateStatus(order.orderId, nextStatus)}
                        className="flex-1 lg:flex-none px-6 sm:px-8 py-4 sm:py-5 bg-brand-green text-brand-earth rounded-[20px] sm:rounded-[24px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 whitespace-nowrap"
                      >
                        <RefreshCw size={14} className="animate-spin-slow" /> {label}
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 lg:flex-none px-6 sm:px-8 py-4 sm:py-5 bg-brand-green/5 text-brand-green border border-brand-green/10 rounded-[20px] sm:rounded-[24px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-brand-green/10 transition-all flex items-center justify-center gap-2"
                    >
                      Manage
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => window.open(`/order/${order.orderId}`, "_blank")}
                      className="p-5 sm:p-6 bg-brand-green/5 text-brand-green rounded-[24px] sm:rounded-[32px] border border-brand-green/10 hover:bg-brand-green/10 transition-colors"
                    >
                      <ExternalLink size={20} />
                    </button>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )) : (
          <div className="py-20 sm:py-40 text-center">
            <ShoppingBag size={40} className="opacity-10 mx-auto mb-8" />
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter opacity-10">No Orders Found</h3>
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

function OrderModal({ order, onClose, onUpdateStatus }: { order: any; onClose: () => void; onUpdateStatus: (id: string, status: string, extra?: any) => void }) {
  const [driverName, setDriverName] = useState(order.driverName ?? "");
  const [driverPhone, setDriverPhone] = useState(order.driverPhone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const isDelivery = (order.delivery as any)?.method === "delivery";

  const handleStatus = async (status: string) => {
    setSubmitting(true);
    await onUpdateStatus(order.orderId, status, { driverName, driverPhone });
    setSubmitting(false);
  };

  const nextStatuses = isDelivery
    ? ["preparing", "dispatched", "delivered", "cancelled"]
    : ["preparing", "ready_pickup", "cancelled"];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-brand-green/30 backdrop-blur-xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        className="bg-white w-full max-w-xl rounded-[40px] sm:rounded-[48px] p-8 sm:p-12 shadow-[0_60px_120px_rgba(0,0,0,0.3)] relative z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">#{order.orderId?.slice(0, 8)}</h3>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${statusColor(order.status)}`}>{order.status?.replace("_", " ")}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-12 h-12 flex items-center justify-center bg-brand-green/5 rounded-2xl hover:bg-brand-green hover:text-white transition-all"><X size={22} /></button>
        </div>

        {/* Status Actions - STICKY AT TOP */}
        <div className="sticky top-[-2px] z-[30] -mx-8 sm:-mx-12 px-8 sm:px-12 py-6 bg-white border-b border-brand-green/5 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-4">Quick Status Update</p>
          <div className="grid grid-cols-2 gap-3">
            {nextStatuses.map(s => (
              <button
                key={s}
                type="button"
                disabled={submitting || order.status === s}
                onClick={() => handleStatus(s)}
                className={`py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 ${
                  s === "cancelled"
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                    : "bg-brand-green text-brand-earth hover:brightness-110 shadow-lg shadow-brand-green/10"
                }`}
              >
                {submitting ? <RefreshCw size={14} className="animate-spin mx-auto" /> : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-brand-green/[0.02] border border-brand-green/5 rounded-[28px] p-6 mb-6 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3">Customer Info</p>
          <p className="font-black text-lg">{(order.customer as any)?.name}</p>
          <p className="text-sm opacity-60">{(order.customer as any)?.email}</p>
          <p className="text-sm opacity-60">{(order.customer as any)?.phone}</p>
          {isDelivery && (
            <p className="text-sm opacity-60 pt-2 border-t border-brand-green/10 mt-2">
              📦 {(order.delivery as any)?.street}, {(order.delivery as any)?.city} {(order.delivery as any)?.postal}
            </p>
          )}
        </div>

        <div className="mb-6">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-3">Order Items</p>
          <div className="space-y-2">
            {((order.items as any[]) ?? []).map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-bold">{item.name} <span className="opacity-40">×{item.quantity}</span></span>
                <span className="font-black">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-black pt-2 border-t border-brand-green/10 mt-2">
              <span>Total</span><span>${Number(order.total ?? 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {isDelivery && (
          <div className="mb-6 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Logistics Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Driver name"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-brand-green/30 transition-all"
              />
              <input
                type="tel"
                placeholder="Driver phone"
                value={driverPhone}
                onChange={e => setDriverPhone(e.target.value)}
                className="w-full bg-brand-green/5 border border-brand-green/10 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-brand-green/30 transition-all"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ── Inventory Tab ────────────────────────────────────────────────────── */

function InventoryTab() {
  const { data: productsData, error, mutate: revalidateProducts } = useSWR("admin-inventory", () => api.admin.getProducts(), { refreshInterval: 15000 });
  const products = productsData?.products ?? [];
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { success, error: toastError, info } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    info("Establishing Barnet POS Handshake...");
    try {
      const data = await api.admin.syncPOS();
      if (data.success) { success(data.message); revalidateProducts(); }
      else toastError(data.message ?? "Sync failed.");
    } catch (err: any) {
      toastError(err.message ?? "POS Sync Interrupted.");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.admin.deleteProduct(id);
      success("Product removed.");
      revalidateProducts();
    } catch {
      toastError("Delete failed.");
    }
  };

  const handleToggleStock = async (product: any) => {
    try {
      await api.admin.upsertProduct({ ...product, inStock: !product.inStock });
      success(`${product.name} marked ${!product.inStock ? "In Stock" : "Out of Stock"}.`);
      revalidateProducts();
    } catch {
      toastError("Update failed.");
    }
  };

  const handleExport = () => {
    if (products.length === 0) return toastError("No inventory to export.");
    const headers = Object.keys(products[0]).join(",");
    const rows = products.map((p: any) => Object.values(p).map(v => `"${v}"`).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `buds_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    success("Inventory exported successfully.");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const [headers, ...rows] = text.split("\n").filter(r => r.trim());
        const headerKeys = headers.split(",").map(h => h.trim());
        
        info(`Processing ${rows.length} products...`);
        
        for (const row of rows) {
          const values = row.match(/(".*?"|[^,]+)/g)?.map(v => v.replace(/^"|"$/g, "").trim()) || [];
          const product: any = {};
          headerKeys.forEach((key, i) => { product[key] = values[i]; });
          
          if (product.id && product.name) {
            await api.admin.upsertProduct({
              ...product,
              price: Number(product.price) || 0,
              quantity: Number(product.quantity) || 0,
              inStock: product.inStock === "true" || product.inStock === true,
            });
          }
        }
        
        success("Bulk import complete.");
        revalidateProducts();
      } catch (err) {
        toastError("Import failed. Check CSV format.");
      }
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  ), [products, search]);

  const lastSync = products.length > 0 ? products.reduce((acc: any, p: any) => {
    const d = new Date(p.updatedAt || p.createdAt);
    return !acc || d > acc ? d : acc;
  }, null) : null;

  if (!productsData && !error) return <LoadingGrid />;

  return (
    <div className="space-y-8 sm:space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 sm:gap-6 bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-8 border border-brand-green/5 shadow-sm mb-10">
        {/* Search - Primary Focus */}
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-40 transition-opacity" size={20} />
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-brand-green/5 border border-brand-green/10 rounded-[22px] sm:rounded-[28px] px-16 py-4 sm:py-5 text-sm font-medium outline-none focus:ring-8 focus:ring-brand-green/5 transition-all"
          />
        </div>

        {/* Action Array */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 sm:gap-4">
          {/* Utility Box */}
          <div className="flex items-center gap-2 bg-brand-green/5 p-1.5 rounded-[24px] sm:rounded-[32px] border border-brand-green/5">
            <button
              type="button"
              onClick={handleExport}
              title="Export Inventory"
              className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-[18px] sm:rounded-[24px] text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-brand-earth transition-all shadow-sm"
            >
              <FileDown size={18} />
            </button>
            <label className="cursor-pointer w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-[18px] sm:rounded-[24px] text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-brand-earth transition-all shadow-sm">
              <FileUp size={18} />
              <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
            </label>
            <button
              type="button"
              onClick={async () => {
                setSyncing(true);
                info("Running Master Catalog migration...");
                try {
                  const res = await api.admin.bulkImport();
                  success(res.message);
                  revalidateProducts();
                } catch (err: any) {
                  toastError(err.message || "Import failed.");
                } finally {
                  setSyncing(false);
                }
              }}
              disabled={syncing}
              title="Bulk Populate"
              className="w-12 sm:w-14 h-12 sm:h-14 bg-white rounded-[18px] sm:rounded-[24px] text-brand-green flex items-center justify-center hover:bg-brand-green hover:text-brand-earth transition-all shadow-sm disabled:opacity-50"
            >
              <Package size={18} />
            </button>
          </div>

          {/* Core Actions */}
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 lg:flex-none h-[52px] sm:h-[64px] px-6 sm:px-10 bg-white border-2 border-brand-green/10 rounded-[22px] sm:rounded-[32px] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-brand-green flex items-center justify-center gap-3 hover:bg-brand-green hover:text-brand-earth hover:border-brand-green transition-all shadow-sm disabled:opacity-50 group whitespace-nowrap"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} /> 
            <span>{syncing ? "Syncing..." : "Sync Barnet POS"}</span>
          </button>

          <button
            type="button"
            onClick={() => { setEditing(null); setShowModal(true); }}
            className="w-14 sm:w-16 h-[52px] sm:h-[64px] bg-brand-green text-brand-earth rounded-[22px] sm:rounded-[32px] flex items-center justify-center shadow-xl shadow-brand-green/20 hover:brightness-110 active:scale-95 transition-all shrink-0"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
        {filtered.map((p: any, i: number) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-[28px] sm:rounded-[36px] lg:rounded-[48px] p-6 sm:p-8 lg:p-10 border border-brand-green/5 shadow-sm group hover:shadow-[0_40px_100px_rgba(10,15,12,0.1)] transition-all flex flex-col"
          >
            <div className="aspect-square bg-brand-green/[0.03] rounded-[28px] sm:rounded-[40px] mb-6 sm:mb-8 flex items-center justify-center p-8 sm:p-10 relative overflow-hidden">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <ImageIcon size={40} className="opacity-10" />
              )}
              {p.source === "barnet" && (
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-[#0070f3] text-white text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] rounded-full">POS</div>
              )}
              {p.isBestSeller && (
                <div className="absolute top-4 left-4 px-2.5 py-1 bg-brand-light-green text-brand-green text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] rounded-full">Best Seller</div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-2">
                <div className="min-w-0">
                  <h4 className="text-lg sm:text-xl font-black uppercase tracking-tighter truncate leading-none mb-1">{p.name}</h4>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase opacity-20 tracking-[0.3em]">{p.category}</p>
                </div>
                <p className="text-xl sm:text-2xl font-black tracking-tighter">${Number(p.price ?? 0).toFixed(2)}</p>
              </div>

              <div className="mt-auto pt-6 sm:pt-8 border-t border-brand-green/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleStock(p)}
                  className={`flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors ${p.inStock ? "text-brand-green" : "text-red-500"}`}
                >
                  {p.inStock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {p.inStock ? "In Stock" : "Out of Stock"}
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditing(p); setShowModal(true); }} aria-label={`Edit ${p.name}`} className="p-2.5 sm:p-3 bg-brand-green/5 rounded-2xl text-brand-green hover:bg-brand-green hover:text-white transition-all cursor-pointer"><Pencil size={14} /></button>
                  <button type="button" onClick={() => handleDelete(p.id)} aria-label={`Delete ${p.name}`} className="p-2.5 sm:p-3 bg-red-500/5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 py-20 sm:py-32 text-center">
            <Package size={40} className="opacity-10 mx-auto mb-6" />
            <p className="text-lg sm:text-xl font-black uppercase tracking-tighter opacity-10">No Products Found</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <ProductModal product={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSaved={revalidateProducts} />}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({ product, onClose, onSaved }: { product: any; onClose: () => void; onSaved: () => void }) {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: product?.id ?? `prod_${Date.now()}`,
    name: product?.name ?? "",
    price: product?.price ?? "",
    category: product?.category ?? "Dried Flower",
    description: product?.description ?? "",
    thc: product?.thc ?? "",
    cbd: product?.cbd ?? "",
    brand: product?.brand ?? "",
    weight: product?.weight ?? "",
    strain: product?.strain ?? "",
    image: product?.image ?? "",
    inStock: product?.inStock ?? true,
    isBestSeller: product?.isBestSeller ?? false,
    sortOrder: product?.sortOrder ?? 0,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: Add size limit check (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toastError("Image too large. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      set("image", base64);
      success("Image prepared for upload.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { toastError("Name and price are required."); return; }
    setSaving(true);
    try {
      await api.admin.upsertProduct({ ...form, price: Number(form.price), sortOrder: Number(form.sortOrder) });
      success(product ? "Product updated." : "Product created.");
      onSaved();
      onClose();
    } catch (err: any) {
      toastError(err.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full bg-brand-green/5 border-2 border-transparent focus:border-brand-green/20 rounded-[16px] sm:rounded-[20px] px-5 sm:px-6 py-3 sm:py-4 text-sm font-medium outline-none transition-all";
  const lbl = "text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 ml-2 mb-1 block";

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-10 overflow-y-auto custom-scrollbar">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-brand-green/30 backdrop-blur-xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-white w-full max-w-2xl rounded-[40px] sm:rounded-[48px] p-8 sm:p-12 shadow-[0_60px_120px_rgba(0,0,0,0.3)] relative z-10 my-8 sm:my-16"
      >
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">{product ? "Edit Product" : "Add Product"}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-brand-green/5 rounded-2xl hover:bg-brand-green hover:text-white transition-all"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Upload Section */}
            <div className="sm:col-span-2">
              <label className={lbl}>Product Image</label>
              <div className="flex flex-col sm:flex-row gap-6 p-6 bg-brand-green/5 rounded-[28px] border-2 border-dashed border-brand-green/10">
                <div className="w-32 h-32 bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-brand-green/5 shrink-0 shadow-sm">
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={32} className="opacity-10" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer bg-brand-green text-brand-earth px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:brightness-110 transition-all flex items-center gap-2">
                      <FileUp size={14} /> Upload from Computer
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {form.image && (
                      <button type="button" onClick={() => set("image", "")} className="bg-red-500/10 text-red-500 px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all">Clear</button>
                    )}
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-30">Or provide a direct URL below</p>
                  <input value={form.image} onChange={e => set("image", e.target.value)} className="w-full bg-white border border-brand-green/10 rounded-xl px-4 py-2 text-[10px] font-medium outline-none" placeholder="https://external-image.com/..." />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className={lbl}>Product Name *</label>
              <input required value={form.name} onChange={e => set("name", e.target.value)} className={inp} placeholder="Island Pink Kush" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Price (CAD) *</label>
              <input required type="number" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} className={inp} placeholder="29.99" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Category</label>
              <select aria-label="Category" value={form.category} onChange={e => set("category", e.target.value)} className={inp + " cursor-pointer"}>
                {["Dried Flower", "Edible", "Vape", "Pre-Roll", "Beverage", "Accessories"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={lbl}>Brand</label>
              <input value={form.brand} onChange={e => set("brand", e.target.value)} className={inp} placeholder="Organigram" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Strain</label>
              <select aria-label="Strain" value={form.strain} onChange={e => set("strain", e.target.value)} className={inp + " cursor-pointer"}>
                <option value="">—</option>
                {["Indica", "Sativa", "Hybrid", "CBD"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={lbl}>THC %</label>
              <input value={form.thc} onChange={e => set("thc", e.target.value)} className={inp} placeholder="22%" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>CBD %</label>
              <input value={form.cbd} onChange={e => set("cbd", e.target.value)} className={inp} placeholder="1%" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Weight</label>
              <input value={form.weight} onChange={e => set("weight", e.target.value)} className={inp} placeholder="3.5g" />
            </div>
            <div className="space-y-1">
              <label className={lbl}>Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)} className={inp} placeholder="0" />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className={lbl}>Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} className={inp + " resize-none"} placeholder="Product description..." />
            </div>
          </div>
          <div className="flex gap-6 py-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.inStock} onChange={e => set("inStock", e.target.checked)} className="w-5 h-5 accent-brand-green" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">In Stock</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isBestSeller} onChange={e => set("isBestSeller", e.target.checked)} className="w-5 h-5 accent-brand-green" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">Best Seller</span>
            </label>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-brand-green text-brand-earth py-5 sm:py-6 rounded-[20px] sm:rounded-[24px] font-black uppercase tracking-widest text-[12px] sm:text-[13px] flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-brand-green/10 disabled:opacity-50">
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {product ? "Save Changes" : "Create Product"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}


/* ── Promos Tab ───────────────────────────────────────────────────────── */

function PromosTab() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { success, error: toastError } = useToast();

  const load = useCallback(async () => {
    try {
      const data = await api.admin.getPromos();
      setPromos(data.promos ?? []);
    } catch (err) {
      console.error("Failed to load promos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      id: editing?.id,
      code: String(fd.get("code")).toUpperCase(),
      discount: fd.get("discount"),
      type: fd.get("type"),
      active: fd.get("active") === "on",
      maxUses: fd.get("maxUses") ? Number(fd.get("maxUses")) : null,
    };
    try {
      await api.admin.upsertPromo(data);
      success("Promo saved.");
      setShowModal(false);
      setEditing(null);
      load();
    } catch {
      toastError("Save failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo? This cannot be undone.")) return;
    try {
      await api.admin.deletePromo(id);
      success("Promo deleted.");
      load();
    } catch {
      toastError("Delete failed.");
    }
  };

  if (loading) return <LoadingList />;

  return (
    <div className="space-y-10 lg:space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 border border-brand-green/5 shadow-sm gap-6 sm:gap-8">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Promotions</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-20 mt-2">{promos.length} Active Campaigns</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-brand-green text-brand-earth rounded-[20px] sm:rounded-[24px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-brand-green/20 hover:brightness-110 transition-all"
        >
          <Plus size={20} /> New Promo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
        {promos.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[28px] sm:rounded-[36px] lg:rounded-[48px] p-6 sm:p-8 lg:p-12 border border-brand-green/5 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-8 sm:mb-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-green/5 rounded-[20px] sm:rounded-[24px] flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-500">
                <Tag size={24} className="sm:w-[28px] sm:h-[28px]" />
              </div>
              <div className={`px-4 sm:px-5 py-2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] border ${p.active ? "bg-green-50 text-brand-green border-green-100" : "bg-red-50 text-red-500 border-red-100"}`}>
                {p.active ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="space-y-1 mb-8">
              <h4 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none">{p.code}</h4>
              <p className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.4em] opacity-30">
                {p.discount}{p.type === "percent" ? "% off" : "$ off"}
              </p>
              {p.maxUses && (
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-20">
                  {p.usageCount ?? 0} / {p.maxUses} uses
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <button type="button" onClick={() => { setEditing(p); setShowModal(true); }} className="flex-1 py-4 sm:py-5 bg-brand-green/5 rounded-[16px] sm:rounded-[20px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-brand-green hover:text-brand-earth transition-all">Edit</button>
              <button type="button" onClick={() => handleDelete(p.id)} aria-label={`Delete ${p.name}`} className="p-4 sm:p-5 bg-red-500/5 text-red-500 rounded-[16px] sm:rounded-[20px] hover:bg-red-500 hover:text-white transition-all cursor-pointer"><Trash2 size={18} /></button>
            </div>
          </motion.div>
        ))}
        {promos.length === 0 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 py-20 sm:py-32 text-center">
            <Tag size={40} className="opacity-10 mx-auto mb-6" />
            <p className="text-lg sm:text-xl font-black uppercase tracking-tighter opacity-10">No Promo Codes Yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-brand-green/30 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white w-full max-w-[520px] rounded-[40px] sm:rounded-[56px] p-8 sm:p-14 shadow-[0_60px_120px_rgba(0,0,0,0.3)] relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">{editing ? "Edit Promo" : "New Promo"}</h3>
                <button type="button" onClick={() => setShowModal(false)} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-brand-green/5 rounded-2xl hover:bg-brand-green hover:text-white transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 ml-3 block">Code</label>
                  <input name="code" defaultValue={editing?.code} required className="w-full bg-brand-green/5 border-2 border-transparent focus:border-brand-green/20 rounded-[16px] sm:rounded-[20px] px-6 py-4 font-black uppercase tracking-tighter text-xl outline-none transition-all" placeholder="SUMMER25" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 ml-3 block">Discount</label>
                    <input name="discount" type="number" step="0.01" defaultValue={editing?.discount} required className="w-full bg-brand-green/5 border-2 border-transparent focus:border-brand-green/20 rounded-[16px] sm:rounded-[20px] px-6 py-4 font-black text-xl outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 ml-3 block">Type</label>
                    <select name="type" defaultValue={editing?.type ?? "percent"} className="w-full appearance-none bg-brand-green/5 border-2 border-transparent focus:border-brand-green/20 rounded-[16px] sm:rounded-[20px] px-6 py-4 font-black uppercase tracking-widest text-[10px] sm:text-[11px] outline-none cursor-pointer">
                      <option value="percent">Percent %</option>
                      <option value="fixed">Fixed $</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 ml-3 block">Max Uses (optional)</label>
                  <input name="maxUses" type="number" defaultValue={editing?.maxUses ?? ""} className="w-full bg-brand-green/5 border-2 border-transparent focus:border-brand-green/20 rounded-[16px] sm:rounded-[20px] px-6 py-4 font-medium outline-none transition-all" placeholder="Unlimited" />
                </div>
                <div className="flex items-center gap-4 py-3 px-4 bg-brand-green/5 rounded-[16px] sm:rounded-2xl">
                  <input type="checkbox" name="active" id="promo-active" defaultChecked={editing ? editing.active : true} className="w-5 h-5 accent-brand-green cursor-pointer" />
                  <label htmlFor="promo-active" className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest cursor-pointer">Active</label>
                </div>
                <button type="submit" className="w-full bg-brand-green text-brand-earth py-5 sm:py-6 rounded-[20px] sm:rounded-[24px] font-black uppercase tracking-widest text-[12px] sm:text-[13px] hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-brand-green/10">
                  {editing ? "Save Changes" : "Create Promo"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Settings Tab ─────────────────────────────────────────────────────── */

function SettingsTab() {
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [storeInfo, setStoreInfo] = useState({
    name: "Bud N' Buddies",
    phone: "(825) 218-8234",
    address: "130-75 Salisbury Way, Sherwood Park, AB T8B 1K4",
    adminEmail: "biholanishant0@gmail.com",
  });
  const [emailAutomations, setEmailAutomations] = useState<any[]>([]);

  useEffect(() => {
    // Load store info
    api.admin.getConfig("store_info")
      .then(res => { if (res.value) setStoreInfo(res.value); })
      .catch(console.error);

    // Load automations
    api.admin.getAutomations()
      .then(res => {
        if (res.automations?.length) {
          setEmailAutomations(res.automations);
        } else {
          // Fallback defaults if none in DB
          setEmailAutomations([
            { key: "order_confirmation_customer", label: "Order Confirmation → Customer", enabled: true },
            { key: "new_order_alert_admin", label: "New Order Alert → Admin", enabled: true },
            { key: "order_dispatched_customer", label: "Order Dispatched → Customer", enabled: true },
            { key: "order_delivered_customer", label: "Order Delivered → Customer", enabled: true },
            { key: "ready_for_pickup_customer", label: "Ready for Pickup → Customer", enabled: true },
            { key: "welcome_email_customer", label: "Welcome Email → New Customer", enabled: true },
          ]);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.admin.setConfig("store_info", storeInfo);
      success("Store settings persisted.");
    } catch {
      toastError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAutomation = async (key: string, currentLabel: string) => {
    const target = emailAutomations.find(a => a.key === key);
    const newEnabled = !target?.enabled;
    
    // Optimistic update
    setEmailAutomations(prev => prev.map(a => a.key === key ? { ...a, enabled: newEnabled } : a));
    
    try {
      await api.admin.updateAutomation(key, newEnabled);
      success(`${target?.label || currentLabel} → ${newEnabled ? "Enabled" : "Disabled"}`);
    } catch {
      toastError("Automation update failed.");
      // Rollback
      setEmailAutomations(prev => prev.map(a => a.key === key ? { ...a, enabled: !newEnabled } : a));
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-20 max-w-3xl">
      {/* Store Info */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-brand-green/5 shadow-sm">
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-6 sm:mb-8">Store Information</h3>
        <form onSubmit={handleSaveStore} className="space-y-4 sm:space-y-5">
          {[
            { label: "Store Name", key: "name" as const, type: "text" },
            { label: "Phone", key: "phone" as const, type: "tel" },
            { label: "Address", key: "address" as const, type: "text" },
            { label: "Admin Email", key: "adminEmail" as const, type: "email" },
          ].map(({ label, key, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-40 ml-2 block">{label}</label>
              <input
                type={type}
                aria-label={label}
                value={storeInfo[key]}
                onChange={e => setStoreInfo(s => ({ ...s, [key]: e.target.value }))}
                className="w-full bg-brand-green/5 border-2 border-transparent focus:border-brand-green/20 rounded-[16px] sm:rounded-[20px] px-5 sm:px-6 py-3 sm:py-4 text-sm font-medium outline-none transition-all"
              />
            </div>
          ))}
          <button type="submit" disabled={saving} className="flex items-center gap-3 bg-brand-green text-brand-earth px-6 sm:px-8 py-3.5 sm:py-4 rounded-[16px] sm:rounded-[20px] font-black uppercase tracking-widest text-[10px] sm:text-[11px] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-green/10 disabled:opacity-50">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Save Settings
          </button>
        </form>
      </div>

      {/* Email Automations */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-brand-green/5 shadow-sm">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Bell size={20} className="opacity-40" />
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter">Email Automations</h3>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {emailAutomations.map(a => (
            <div key={a.key} className="flex items-center justify-between py-4 sm:py-5 border-b border-brand-green/5 last:border-0">
              <div className="min-w-0 mr-4">
                <p className="text-xs sm:text-sm font-black uppercase tracking-tight truncate">{a.label}</p>
                <p className="text-[8px] sm:text-[9px] font-mono opacity-20 mt-0.5">{a.key}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleAutomation(a.key, a.label)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[12px] sm:rounded-[16px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${a.enabled ? "bg-brand-green/10 text-brand-green border-brand-green/20" : "bg-red-500/5 text-red-500 border-red-500/20"}`}
              >
                {a.enabled ? <ToggleRight size={14} className="sm:w-[16px] sm:h-[16px]" /> : <ToggleLeft size={14} className="sm:w-[16px] sm:h-[16px]" />}
                {a.enabled ? "On" : "Off"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-brand-green/5 shadow-sm">
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-6 sm:mb-8">System</h3>
        <div className="space-y-3 sm:space-y-4">
          {[
            { label: "Backend", value: "Neon PostgreSQL + Drizzle ORM" },
            { label: "Emails", value: "Resend (6 workflows)" },
            { label: "POS Integration", value: "Barnet API" },
            { label: "Hosting", value: "Vercel (Serverless)" },
            { label: "Version", value: "v4.2.0 Production" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 sm:py-3 border-b border-brand-green/5 last:border-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-30">{label}</span>
              <span className="text-xs sm:text-sm font-black">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-100 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10">
        <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter text-red-500 mb-4 sm:mb-6">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-black text-xs sm:text-sm uppercase text-red-500">Logout All Sessions</p>
            <p className="text-[10px] sm:text-xs text-red-400 font-medium mt-1">Clears admin auth from this browser</p>
          </div>
          <button
            type="button"
            onClick={() => { localStorage.removeItem("admin_auth"); window.location.reload(); }}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-[12px] sm:rounded-[16px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
          >
            Terminate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeletons ────────────────────────────────────────────────────────── */

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 sm:h-48 bg-white rounded-[32px] sm:rounded-[40px] border border-brand-green/5" />
      ))}
      <div className="lg:col-span-12 h-64 sm:h-96 bg-white rounded-[36px] sm:rounded-[48px] border border-brand-green/5 mt-6 sm:mt-8" />
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse">
      <div className="h-20 sm:h-24 bg-white rounded-[24px] sm:rounded-[32px] border border-brand-green/5" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-24 sm:h-28 bg-white rounded-[24px] sm:rounded-[32px] border border-brand-green/5" />
      ))}
    </div>
  );
}

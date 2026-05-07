import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import useSWR from "swr";
import {
  LayoutDashboard, ShoppingBag, Package, Tag, Settings as Gear,
  LogOut, Menu, X, Search, Plus, Pencil, Trash2, Upload,
  Truck, Store, Copy, Check, Lock, RefreshCw, Home, FileUp,
  DollarSign, ToggleLeft, ToggleRight, FileText, Users, ChevronDown,
} from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const TABS = ["Dashboard", "Orders", "Inventory", "Promos", "Drivers", "Content", "Settings"] as const;
type Tab = typeof TABS[number];

const STATUS_META: Record<string, { label: string; cls: string; pulse?: boolean }> = {
  pending:      { label: "Pending",       cls: "bg-red-500/15 text-red-400 border-red-500/20", pulse: true },
  confirmed:    { label: "Confirmed",     cls: "bg-blue-500/15 text-blue-300 border-blue-500/20" },
  preparing:    { label: "Preparing",     cls: "bg-amber-500/15 text-amber-300 border-amber-500/20" },
  dispatched:   { label: "Dispatched",    cls: "bg-indigo-500/15 text-indigo-300 border-indigo-500/20" },
  delivered:    { label: "Delivered",     cls: "bg-green-500/15 text-green-300 border-green-500/20" },
  ready_pickup: { label: "Ready Pickup",  cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  picked_up:    { label: "Picked Up",     cls: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
  cancelled:    { label: "Cancelled",     cls: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const CATEGORIES = ["Dried Flower", "Pre-Roll", "Edible", "Vape", "Beverage", "Accessories", "Extract"];
const STRAINS    = ["Indica", "Sativa", "Hybrid", "CBD", "None"];

function statusBadge(status: string) {
  const m = STATUS_META[status] ?? { label: status, cls: "bg-white/5 text-white/40 border-white/10" };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${m.cls} ${m.pulse ? "animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]" : ""}`}>
      {m.label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Shared UI atoms
───────────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-brand-light-green/50 transition-colors";

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls} {...props} />;
}

/* Custom Dropdown to replace problematic native selects */
function Dropdown({ label, value, options, onChange }: {
  label?: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-[#1a2219] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white flex items-center justify-between hover:border-brand-light-green/40 hover:bg-[#222b21] transition-all text-left"
      >
        <span className="truncate">{value || "Select..."}</span>
        <ChevronDown size={14} className={`shrink-0 opacity-40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[400]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute left-0 right-0 top-full mt-2 z-[401] bg-[#1a2219] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
            >
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-brand-light-green hover:text-[#111815] ${
                    opt === value ? "bg-brand-light-green/10 text-brand-light-green font-bold" : "text-white/70"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputCls} resize-none custom-scrollbar`} rows={3} {...props} />;
}

function Modal({ title, onClose, footer, children }: {
  title: string; onClose: () => void;
  footer?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.98 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        className="bg-[#111815] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="text-base font-black uppercase tracking-widest">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-7 space-y-5 custom-scrollbar">{children}</div>
        {footer && <div className="px-6 py-5 border-t border-white/5 flex flex-col sm:flex-row gap-3">{footer}</div>}
      </motion.div>
    </div>
  );
}

function Btn({ variant = "primary", loading, children, ...props }: {
  variant?: "primary" | "ghost" | "danger"; loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = {
    primary: "bg-brand-light-green text-[#111815] hover:brightness-110",
    ghost:   "bg-white/5 border border-white/10 hover:bg-white/10",
    danger:  "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  }[variant];
  return (
    <button
      type="button"
      className={`flex-1 px-4 py-2.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2 ${cls}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <RefreshCw size={14} className="animate-spin" /> : children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Login Gate
───────────────────────────────────────────────────────────── */
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { error: toastErr } = useToast();

  const submit = async () => {
    if (!value.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: value }),
      });
      if (res.ok) {
        sessionStorage.setItem("admin_secret", value);
        localStorage.setItem("admin_secret", value);
        localStorage.setItem("admin_auth", "true");
        onLogin();
      } else {
        setShake(true);
        toastErr("Invalid key.");
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      toastErr("Network error.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f0b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#111815] border border-white/10 rounded-3xl p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-light-green rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-brand-light-green/20">
            <Lock size={22} className="text-[#111815]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Admin Access</h1>
          <p className="text-white/30 text-xs mt-1">Enter your access key to continue</p>
        </div>

        <motion.div animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}>
          <input
            type="password"
            placeholder="Access key"
            value={value}
            autoFocus
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-sm tracking-widest font-bold focus:outline-none focus:border-brand-light-green/50 mb-4 transition-colors"
          />
        </motion.div>

        <Btn onClick={submit} loading={loading}>Authenticate</Btn>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Dashboard Tab
───────────────────────────────────────────────────────────── */
function DashboardTab() {
  const { data: ordersData } = useSWR("admin-orders", api.admin.getOrders, { refreshInterval: 15000 });
  const { data: productsData } = useSWR("admin-products", api.admin.getProducts, { refreshInterval: 60000 });
  const { data: promosData } = useSWR("admin-promos", api.admin.getPromos, { refreshInterval: 60000 });

  const orders   = ordersData?.orders   ?? [];
  const products = productsData?.products ?? [];
  const promos   = promosData?.promos   ?? [];

  const todayOrders   = orders.filter((o: any) => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue  = todayOrders.reduce((s: number, o: any) => s + Number(o.total ?? 0), 0);
  const activePromos  = promos.filter((p: any) => p.active).length;

  const kpis = [
    { icon: DollarSign, label: "Revenue Today",   value: `$${todayRevenue.toFixed(2)}`, color: "from-green-500/10" },
    { icon: ShoppingBag, label: "Orders Today",   value: todayOrders.length, color: "from-blue-500/10" },
    { icon: Package,     label: "Total Products", value: products.length, color: "from-purple-500/10" },
    { icon: Tag,         label: "Active Promos",  value: activePromos, color: "from-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Dashboard</h1>
        <p className="text-white/30 text-sm mt-1">Live overview · auto-refreshes every 15s</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${k.color} to-transparent border border-white/5 rounded-2xl p-6 flex flex-col items-center sm:items-start text-center sm:text-left`}>
            <k.icon size={20} className="opacity-30 mb-4" />
            <p className="text-4xl font-black tracking-tighter">{k.value}</p>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">{k.label}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-black uppercase tracking-tight mb-3">Recent Orders</h2>
        {orders.length === 0
          ? <p className="text-white/20 text-sm">No orders yet.</p>
          : <div className="space-y-2">
              {orders.slice(0, 8).map((o: any) => (
                <div key={o.orderId} className="flex items-center justify-between bg-[#1a2219] border border-white/5 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-bold">{o.orderId}</p>
                    <p className="text-white/40 text-xs">{(o.customer as any)?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(o.status)}
                    <p className="text-sm font-black">${Number(o.total ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Orders Tab
───────────────────────────────────────────────────────────── */
function OrdersTab() {
  const { data, mutate } = useSWR("admin-orders", api.admin.getOrders, { refreshInterval: 15000 });
  const orders = data?.orders ?? [];
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [selected, setSelected]   = useState<any>(null);
  const { success, error: err }   = useToast();

  const filtered = useMemo(() => {
    return orders
      .filter((o: any) => {
        const q = search.toLowerCase();
        const matchQ = !q || o.orderId?.toLowerCase().includes(q)
          || (o.customer as any)?.name?.toLowerCase().includes(q)
          || (o.customer as any)?.email?.toLowerCase().includes(q);
        const matchF = filter === "all" || o.status === filter;
        return matchQ && matchF;
      })
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, filter]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, status);
      success(`Status → ${status}`);
      mutate();
      setSelected(null);
    } catch (e: any) {
      err(e.message || "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black uppercase tracking-tighter">Orders</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input type="text" placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#1a2219] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-light-green/40" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["all", ...Object.keys(STATUS_META)].map(s => (
            <button key={s} type="button" onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all
                ${filter === s ? "bg-brand-light-green text-[#111815] border-brand-light-green" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
              {s === "all" ? "All" : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0
        ? <div className="text-center py-24 text-white/20"><ShoppingBag size={36} className="mx-auto mb-3 opacity-30" /><p>No orders found</p></div>
        : <div className="space-y-2">
            {filtered.map((o: any) => (
              <div key={o.orderId} onClick={() => setSelected(o)}
                className="bg-[#1a2219] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-brand-light-green/30 cursor-pointer transition-all hover:bg-[#20291f] group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-black text-sm tracking-tight">{o.orderId}</span>
                    {statusBadge(o.status)}
                    {/* Fulfillment Badge */}
                    {(o.delivery as any)?.method === "delivery" ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest shadow-sm shadow-orange-500/5">
                        <Truck size={12} /> Delivery
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest shadow-sm shadow-purple-500/5">
                        <Store size={12} /> Pickup
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs font-medium">{(o.customer as any)?.name} · <span className="opacity-50">{(o.customer as any)?.email}</span></p>
                  {(o.delivery as any)?.method === "delivery" && (
                    <p className="text-white/30 text-[10px] mt-1.5 flex items-center gap-1.5 font-mono">
                      <Truck size={12} className="opacity-40" /> {(o.delivery as any)?.street}, {(o.delivery as any)?.city}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-6">
                  <p className="font-black text-2xl tracking-tighter text-white group-hover:text-brand-light-green transition-colors">${Number(o.total ?? 0).toFixed(2)}</p>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-0.5">{(o.items as any[])?.length ?? 0} items</p>
                </div>
              </div>
            ))}
          </div>
      }

      <AnimatePresence>
        {selected && <OrderModal order={selected} onClose={() => setSelected(null)} onUpdateStatus={updateStatus} />}
      </AnimatePresence>
    </div>
  );
}

function OrderModal({ order, onClose, onUpdateStatus }: any) {
  const isDelivery  = (order.delivery as any)?.method === "delivery";
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const { data: driversData } = useSWR("admin-drivers", api.admin.getDrivers);
  const drivers: any[] = driversData?.drivers ?? [];
  const copy = (v: string, k: string) => { navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(null), 1500); };

  const FLOW_DELIVERY = ["confirmed", "preparing", "dispatched", "delivered"];
  const FLOW_PICKUP   = ["confirmed", "preparing", "ready_pickup", "picked_up"];
  const flow = isDelivery ? FLOW_DELIVERY : FLOW_PICKUP;
  const currentIdx = flow.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < flow.length - 1 ? flow[currentIdx + 1] : null;
  const isFinal = ["delivered", "picked_up", "cancelled"].includes(order.status);
  const needsDriver = nextStatus === "dispatched" && isDelivery;

  const advance = async (status: string) => {
    setLoading(status);
    const extra = status === "dispatched" && driverName ? { driverName, driverPhone } : undefined;
    await onUpdateStatus(order.orderId, status, extra);
    setLoading(null);
  };

  return (
    <Modal title={order.orderId} onClose={onClose}
      footer={
        isFinal
          ? <Btn variant="ghost" onClick={onClose}>Close</Btn>
          : <>
              {nextStatus && (
                <Btn loading={loading === nextStatus} onClick={() => advance(nextStatus)}>
                  → {nextStatus.replace("_", " ")}
                </Btn>
              )}
              <Btn variant="danger" loading={loading === "cancelled"} onClick={() => advance("cancelled")}>
                Cancel Order
              </Btn>
            </>
      }
    >
      {/* Status flow */}
      <div className="flex items-center gap-2 flex-wrap">
        {flow.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
              s === order.status
                ? (STATUS_META[s]?.cls ?? "bg-white/10 text-white border-white/20")
                : i < currentIdx
                  ? "bg-white/5 text-white/20 border-white/5 line-through"
                  : "bg-white/5 text-white/20 border-white/5"
            }`}>{STATUS_META[s]?.label ?? s}</span>
            {i < flow.length - 1 && <span className="text-white/20 text-xs">→</span>}
          </div>
        ))}
        {order.status === "cancelled" && (
          <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-red-500/15 text-red-400 border-red-500/20">Cancelled</span>
        )}
      </div>

      {/* Customer */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Customer</p>
        {[
          ["Name",  (order.customer as any)?.name],
          ["Email", (order.customer as any)?.email],
          ["Phone", (order.customer as any)?.phone],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
            <div><span className="text-white/30 text-xs">{k}: </span><span className="text-sm">{v}</span></div>
            <button type="button" onClick={() => copy(v ?? "", k!)} className="p-1 rounded hover:bg-white/10">
              {copied === k ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="opacity-30" />}
            </button>
          </div>
        ))}
      </div>

      {/* Delivery */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Delivery</p>
        {isDelivery ? (
          <div className="bg-white/5 rounded-lg p-3 text-sm space-y-1">
            <p><span className="text-white/40">Street:</span> {(order.delivery as any)?.street}</p>
            <p><span className="text-white/40">City:</span> {(order.delivery as any)?.city} {(order.delivery as any)?.postal}</p>
            <p><span className="text-white/40">Slot:</span> {(order.delivery as any)?.slot}</p>
          </div>
        ) : (
          <div className="bg-white/5 rounded-lg p-3 text-sm flex items-center gap-2 text-white/60">
            <Store size={14} /> In-Store Pickup
          </div>
        )}
      </div>

      {/* Driver Assignment — shown when next step is "dispatched" */}
      {needsDriver && (
        <div className="bg-brand-light-green/5 border border-brand-light-green/20 rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-light-green/70">Assign Driver (optional)</p>
          {drivers.length > 0 && (
            <Dropdown
              label="Select a driver"
              value={driverName}
              options={["— Select a driver —", ...drivers.filter((d: any) => d.active).map((d: any) => d.name)]}
              onChange={val => {
                const name = val === "— Select a driver —" ? "" : val;
                const d = drivers.find((d: any) => d.name === name);
                setDriverName(name);
                setDriverPhone(d?.phone ?? "");
              }}
            />
          )}
          <Input placeholder="Driver name" value={driverName} onChange={e => setDriverName(e.target.value)} />
          <Input placeholder="Driver phone (optional)" value={driverPhone} onChange={e => setDriverPhone(e.target.value)} />
        </div>
      )}

      {/* Items */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Items</p>
        <div className="space-y-1.5">
          {(order.items as any[])?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white/5 rounded-lg p-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-white/50"><span>Subtotal</span><span>${Number(order.subtotal ?? 0).toFixed(2)}</span></div>
        <div className="flex justify-between text-white/50"><span>Delivery fee</span><span>${Number(order.deliveryFee ?? 0).toFixed(2)}</span></div>
        {Number(order.discount) > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-${Number(order.discount).toFixed(2)}</span></div>}
        <div className="flex justify-between font-black border-t border-white/10 pt-1.5 mt-1"><span>Total</span><span>${Number(order.total ?? 0).toFixed(2)}</span></div>
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Inventory Tab
───────────────────────────────────────────────────────────── */
function InventoryTab() {
  const { data, mutate } = useSWR("admin-products", api.admin.getProducts, { refreshInterval: 60000 });
  const products = data?.products ?? [];
  const [search, setSearch]         = useState("");
  const [editing, setEditing]       = useState<any>(null);
  const [showForm, setShowForm]     = useState(false);
  const [showCSV, setShowCSV]       = useState(false);
  const [csvRows, setCSVRows]       = useState<any[]>([]);
  const { success, error: err }     = useToast();

  const filtered = useMemo(() =>
    products.filter((p: any) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    ), [products, search]);

  const saveProduct = async (data: any) => {
    try {
      if (editing?.id) {
        await api.admin.updateProduct({ ...data, id: editing.id });
        success("Product updated!");
      } else {
        await api.admin.createProduct({ ...data, id: `prod_${Date.now()}` });
        success("Product created!");
      }
      mutate();
      setShowForm(false);
      setEditing(null);
    } catch (e: any) {
      err(e.message || "Save failed");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.admin.deleteProduct(id);
      success("Deleted");
      mutate();
    } catch (e: any) { err(e.message || "Delete failed"); }
  };

  const importCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const lines = (e.target?.result as string).split("\n").filter(l => l.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim());
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
      }).filter(r => r.name);
      setCSVRows(rows);
      setShowCSV(true);
    };
    reader.readAsText(file);
  };

  const bulkImport = async (rows: any[]) => {
    let count = 0;
    for (const row of rows) {
      try {
        await api.admin.createProduct({
          id: `prod_${Date.now()}_${count}`,
          name: row.name || row.product_name,
          price: Number(row.price) || 0,
          category: row.category || "Dried Flower",
          brand: row.brand || "",
          strain: row.strain || "",
          thc: row.thc || "",
          cbd: row.cbd || "",
          weight: row.weight || "",
          description: row.description || "",
          image: row.image || row.image_url || "",
          inStock: row.in_stock !== "false",
          quantity: Number(row.quantity) || 0,
          isBestSeller: row.is_best_seller === "true",
          sortOrder: Number(row.sort_order) || 0,
        });
        count++;
      } catch { /* skip bad rows */ }
    }
    success(`Imported ${count} products`);
    mutate();
    setShowCSV(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Inventory</h1>
        <div className="flex gap-2">
          <label className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer">
            <FileUp size={14} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importCSV(f); e.target.value = ""; }} />
          </label>
          <button type="button" onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2.5 bg-brand-light-green text-[#111815] rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
        <input type="text" placeholder="Search by name or category…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1a2219] border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand-light-green/40" />
      </div>

      {filtered.length === 0
        ? <div className="text-center py-24 text-white/20"><Package size={36} className="mx-auto mb-3 opacity-30" /><p>No products found</p></div>
        : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p: any) => (
              <div key={p.id} className="bg-[#1a2219] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group">
                <div className="aspect-square bg-white/5 overflow-hidden relative">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center text-white/10"><Package size={28} /></div>
                  }
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-black text-xs uppercase tracking-tight truncate">{p.name}</p>
                  <p className="text-white/30 text-[9px] uppercase tracking-widest">{p.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-black text-sm">${Number(p.price).toFixed(2)}</p>
                    <div className="flex gap-1">
                      <button type="button" title="Edit product" onClick={() => { setEditing(p); setShowForm(true); }}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Pencil size={12} /></button>
                      <button type="button" title="Delete product" onClick={() => deleteProduct(p.id)}
                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      <AnimatePresence>
        {showForm && (
          <ProductForm product={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={saveProduct} />
        )}
        {showCSV && (
          <CSVPreview rows={csvRows} onClose={() => setShowCSV(false)} onImport={bulkImport} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({ product, onClose, onSave }: { product?: any; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: "", price: 0, category: "Dried Flower", brand: "", strain: "Hybrid",
    thc: "", cbd: "", weight: "", description: "", image: "", quantity: 0,
    inStock: true, isBestSeller: false, sortOrder: 0,
    ...(product ?? {}),
  });
  const [preview, setPreview] = useState(product?.image ?? "");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: any) => setForm((f: typeof form) => ({ ...f, [k]: v }));

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert("Max 3 MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => { const b64 = ev.target?.result as string; setPreview(b64); set("image", b64); };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!form.name.trim()) { alert("Name required"); return; }
    if (!form.price) { alert("Price required"); return; }
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <Modal title={isEdit ? "Edit Product" : "New Product"} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn loading={loading} onClick={submit}>Save</Btn></>}>

      {/* Image */}
      <Field label="Product Image">
        <label className="block cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
          {preview
            ? <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
            : <div className="w-full aspect-video bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/8 transition-colors">
                <Upload size={20} className="opacity-30" />
                <p className="text-xs text-white/30">Click to upload (max 3 MB)</p>
              </div>
          }
        </label>
        <Input className={`${inputCls} mt-2`} placeholder="Or paste an image URL…" value={form.image.startsWith("data:") ? "" : form.image}
          onChange={e => { set("image", e.target.value); setPreview(e.target.value); }} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><Input placeholder="Product name" value={form.name} onChange={e => set("name", e.target.value)} /></Field>
        <Field label="Price ($)"><Input type="number" placeholder="0.00" value={form.price || ""} onChange={e => set("price", Number(e.target.value))} /></Field>
        <Dropdown label="Category" value={form.category} options={CATEGORIES} onChange={v => set("category", v)} />
        <Dropdown label="Strain" value={form.strain} options={STRAINS} onChange={v => set("strain", v)} />
        <Field label="Brand"><Input placeholder="Brand name" value={form.brand} onChange={e => set("brand", e.target.value)} /></Field>
        <Field label="Weight"><Input placeholder="e.g. 3.5g" value={form.weight} onChange={e => set("weight", e.target.value)} /></Field>
        <Field label="THC %"><Input placeholder="e.g. 24%" value={form.thc} onChange={e => set("thc", e.target.value)} /></Field>
        <Field label="CBD %"><Input placeholder="e.g. 1%" value={form.cbd} onChange={e => set("cbd", e.target.value)} /></Field>
        <Field label="Qty in Stock"><Input type="number" value={form.quantity || 0} onChange={e => set("quantity", Number(e.target.value))} /></Field>
        <Field label="Sort Order"><Input type="number" value={form.sortOrder || 0} onChange={e => set("sortOrder", Number(e.target.value))} /></Field>
      </div>

      <Field label="Description">
        <Textarea placeholder="Product description…" value={form.description} onChange={e => set("description", e.target.value)} />
      </Field>

      <div className="flex gap-4">
        {[["inStock", "In Stock"], ["isBestSeller", "Best Seller"]].map(([k, label]) => (
          <button key={k} type="button" onClick={() => set(k, !form[k as keyof typeof form])}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
            {form[k as keyof typeof form]
              ? <ToggleRight size={20} className="text-brand-light-green" />
              : <ToggleLeft size={20} className="text-white/20" />}
            {label}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function CSVPreview({ rows, onClose, onImport }: { rows: any[]; onClose: () => void; onImport: (r: any[]) => Promise<void> }) {
  const [sel, setSel]   = useState<boolean[]>(rows.map(() => true));
  const [imgs, setImgs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const upload = (i: number, file: File) => {
    const r = new FileReader();
    r.onload = e => setImgs(prev => ({ ...prev, [i]: e.target?.result as string }));
    r.readAsDataURL(file);
  };

  const submit = async () => {
    setLoading(true);
    const selected = rows.filter((_, i) => sel[i]).map((r, i) => ({ ...r, image: imgs[i] || r.image || r.image_url || "" }));
    await onImport(selected);
    setLoading(false);
  };

  return (
    <Modal title={`Import ${sel.filter(Boolean).length} / ${rows.length} products`} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn loading={loading} onClick={submit} disabled={!sel.some(Boolean)}>Import</Btn></>}>
      <p className="text-white/40 text-xs">Review rows, attach images if needed, uncheck rows to skip.</p>
      {rows.map((row, i) => (
        <div key={i} className={`flex gap-3 p-3 rounded-xl border transition-all ${sel[i] ? "bg-white/5 border-white/10" : "bg-transparent border-white/5 opacity-40"}`}>
          <label className="w-14 h-14 shrink-0 bg-white/5 rounded-lg overflow-hidden cursor-pointer flex items-center justify-center hover:bg-white/10 transition-colors">
            {imgs[i] || row.image
              ? <img src={imgs[i] || row.image} alt="" className="w-full h-full object-cover" />
              : <Upload size={14} className="opacity-30" />
            }
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(i, e.target.files[0])} />
          </label>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{row.name || row.product_name || "Unnamed"}</p>
            <p className="text-white/40 text-xs">{row.category} · ${row.price} · {row.strain}</p>
            {row.description && <p className="text-white/30 text-xs truncate mt-0.5">{row.description}</p>}
          </div>
          <input type="checkbox" title="Include in import" checked={sel[i]} onChange={e => setSel(prev => prev.map((v, j) => j === i ? e.target.checked : v))}
            className="w-4 h-4 cursor-pointer mt-1 shrink-0" />
        </div>
      ))}
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   Promos Tab
───────────────────────────────────────────────────────────── */
function PromosTab() {
  const { data, mutate } = useSWR("admin-promos", api.admin.getPromos, { refreshInterval: 60000 });
  const promos = data?.promos ?? [];
  const [editing, setEditing]   = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const { success, error: err } = useToast();

  const savePromo = async (form: any) => {
    try {
      if (editing?.id) {
        await api.admin.updatePromo({ ...form, id: editing.id });
        success("Promo updated!");
      } else {
        await api.admin.createPromo({ ...form, id: `promo_${Date.now()}` });
        success("Promo created!");
      }
      mutate();
      setShowForm(false);
      setEditing(null);
    } catch (e: any) {
      err(e.message || "Save failed");
    }
  };

  const deletePromo = async (id: string) => {
    if (!confirm("Delete this promo?")) return;
    try {
      await api.admin.deletePromo(id);
      success("Deleted");
      mutate();
    } catch (e: any) { err(e.message || "Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Promos</h1>
        <button type="button" onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2.5 bg-brand-light-green text-[#111815] rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
          <Plus size={14} /> New Promo
        </button>
      </div>

      {promos.length === 0
        ? <div className="text-center py-24 text-white/20"><Tag size={36} className="mx-auto mb-3 opacity-30" /><p>No promos yet</p></div>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {promos.map((p: any) => (
              <div key={p.id} className="bg-[#1a2219] border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-black text-xl tracking-tighter">{p.code}</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      {p.type === "percent" ? `${p.discount}% off` : `$${p.discount} off`}
                      {p.maxUses ? ` · max ${p.maxUses} uses` : ""}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${p.active ? "bg-green-500/15 text-green-300 border-green-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditing(p); setShowForm(true); }}
                    className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5">
                    <Pencil size={11} /> Edit
                  </button>
                  <button type="button" title="Delete promo" onClick={() => deletePromo(p.id)}
                    className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-black uppercase tracking-widest transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
      }

      <AnimatePresence>
        {showForm && <PromoForm promo={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSave={savePromo} />}
      </AnimatePresence>
    </div>
  );
}

function PromoForm({ promo, onClose, onSave }: { promo?: any; onClose: () => void; onSave: (d: any) => Promise<void> }) {
  const isEdit = !!promo?.id;
  const initial = {
    code: promo?.code ?? "",
    discount: promo?.discount ?? 10,
    type: promo?.type ?? "percent",
    active: promo?.active ?? true,
    maxUses: promo?.maxUses ?? "",
  };
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: any) => setForm((f: typeof initial) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.code.trim()) { alert("Code required"); return; }
    if (!form.discount)    { alert("Discount required"); return; }
    setLoading(true);
    await onSave({ ...form, code: form.code.toUpperCase(), discount: Number(form.discount), maxUses: form.maxUses ? Number(form.maxUses) : null });
    setLoading(false);
  };

  return (
    <Modal title={isEdit ? "Edit Promo" : "New Promo"} onClose={onClose}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn loading={loading} onClick={submit}>Save</Btn></>}>
      <Field label="Promo Code">
        <Input placeholder="e.g. SUMMER20" value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Discount Amount">
          <Input type="number" value={form.discount} onChange={e => set("discount", e.target.value)} />
        </Field>
        <Field label="Type">
          <Select value={form.type} onChange={e => set("type", e.target.value)}>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed ($)</option>
          </Select>
        </Field>
        <Field label="Max Uses (optional)">
          <Input type="number" placeholder="Unlimited" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} />
        </Field>
      </div>
      <button type="button" onClick={() => set("active", !form.active)}
        className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
        {form.active ? <ToggleRight size={22} className="text-brand-light-green" /> : <ToggleLeft size={22} className="text-white/20" />}
        {form.active ? "Active" : "Inactive"}
      </button>
    </Modal>
  );
}

function TestEmailBtn() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const send = async () => {
    setState("sending");
    try {
      await api.admin.testEmail();
      setState("ok");
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("err");
      setTimeout(() => setState("idle"), 3000);
    }
  };
  const label = { idle: "Send Test Email", sending: "Sending…", ok: "Email Sent ✓", err: "Failed ✗" }[state];
  const cls   = { idle: "bg-white/5 border-white/10 hover:bg-white/10", sending: "bg-white/5 border-white/10 opacity-50", ok: "bg-green-500/10 border-green-500/20 text-green-300", err: "bg-red-500/10 border-red-500/20 text-red-300" }[state];
  return (
    <button type="button" onClick={send} disabled={state === "sending"}
      className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${cls}`}>
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Content Tab
───────────────────────────────────────────────────────────── */
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  brand: "Brand Statement",
  perks: "Member Perks",
  story: "Story Section",
  about: "About Page",
  delivery: "Delivery Zones",
  reviews: "Reviews",
};

const FIELD_LABELS: Record<string, string> = {
  badge: "Badge Text", headline_1: "Headline Word 1", headline_2: "Headline Word 2", headline_3: "Headline Word 3",
  subtitle: "Subtitle", cta_shop: "Shop Button", cta_about: "About Link",
  stat_rating: "Stat: Rating", stat_hours: "Stat: Hours", stat_days: "Stat: Days",
  eyebrow: "Eyebrow Label", headline: "Headline", body: "Body Text",
  perk1_title: "Perk 1 Title", perk1_desc: "Perk 1 Description",
  perk2_title: "Perk 2 Title", perk2_desc: "Perk 2 Description",
  perk3_title: "Perk 3 Title", perk3_desc: "Perk 3 Description",
  item1_title: "Card 1 Title", item1_desc: "Card 1 Description",
  item2_title: "Card 2 Title", item2_desc: "Card 2 Description",
  item3_title: "Card 3 Title", item3_desc: "Card 3 Description",
  item4_title: "Card 4 Title", item4_desc: "Card 4 Description",
  stat1_value: "Stat 1 Value", stat1_label: "Stat 1 Label",
  stat2_value: "Stat 2 Value", stat2_label: "Stat 2 Label",
  stat3_value: "Stat 3 Value", stat3_label: "Stat 3 Label",
  story_headline: "Story Headline", story_body1: "Story Paragraph 1",
  story_body2: "Story Paragraph 2", story_body3: "Story Paragraph 3",
  heading: "Section Heading", subheading: "Subheading",
  zone1_name: "Zone 1 Name", zone1_range: "Zone 1 Range", zone1_fee: "Zone 1 Fee", zone1_perk: "Zone 1 Perk",
  zone2_name: "Zone 2 Name", zone2_range: "Zone 2 Range", zone2_fee: "Zone 2 Fee", zone2_perk: "Zone 2 Perk",
  zone3_name: "Zone 3 Name", zone3_range: "Zone 3 Range", zone3_fee: "Zone 3 Fee", zone3_perk: "Zone 3 Perk",
  zone4_name: "Zone 4 Name", zone4_range: "Zone 4 Range", zone4_fee: "Zone 4 Fee", zone4_perk: "Zone 4 Perk",
  free_threshold: "Free Delivery Threshold", cta: "CTA Button Text",
};

const LONG_FIELDS = new Set(["subtitle", "body", "item1_desc", "item2_desc", "item3_desc", "item4_desc",
  "perk1_desc", "perk2_desc", "perk3_desc", "story_body1", "story_body2", "story_body3", "subheading"]);

function ContentTab() {
  const { data, mutate } = useSWR("admin-content", api.admin.getContent, { revalidateOnFocus: false });
  const [activeSection, setActiveSection] = useState("hero");
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const { success, error: err } = useToast();

  const sectionData = data?.content?.[activeSection] ?? {};
  const draft = drafts[activeSection] ?? sectionData;

  const setField = (field: string, value: string) =>
    setDrafts(prev => ({ ...prev, [activeSection]: { ...(prev[activeSection] ?? sectionData), [field]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.updateContent(activeSection, draft);
      success("Saved — changes are live");
      mutate();
      setDrafts(prev => { const next = { ...prev }; delete next[activeSection]; return next; });
    } catch (e: any) {
      err(e.message || "Save failed");
    }
    setSaving(false);
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(sectionData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Content</h1>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-1.5">
          <span>View Site</span>
        </a>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.keys(SECTION_LABELS).map(s => (
          <button key={s} type="button" onClick={() => setActiveSection(s)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
              ${activeSection === s ? "bg-brand-light-green text-[#111815] border-brand-light-green" : "bg-white/5 border-white/10 text-white/50 hover:text-white"}`}>
            {SECTION_LABELS[s]}
          </button>
        ))}
      </div>

      {activeSection === "reviews"
        ? <ReviewsPanel />
        : (
          <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-black uppercase tracking-tight">{SECTION_LABELS[activeSection]}</h2>
              {isDirty && <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg">Unsaved changes</span>}
            </div>

            {Object.entries(draft).map(([field, value]) => (
              <Field key={field} label={FIELD_LABELS[field] ?? field}>
                {LONG_FIELDS.has(field)
                  ? <Textarea value={String(value)} onChange={e => setField(field, e.target.value)} rows={3} />
                  : <Input value={String(value)} onChange={e => setField(field, e.target.value)} />
                }
              </Field>
            ))}

            <div className="flex gap-3 pt-2">
              <Btn loading={saving} onClick={save} disabled={!isDirty}>
                {saving ? "Saving…" : isDirty ? "Save Changes" : "Up to Date"}
              </Btn>
              {isDirty && (
                <Btn variant="ghost" onClick={() => setDrafts(prev => { const next = { ...prev }; delete next[activeSection]; return next; })}>
                  Discard
                </Btn>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
}

function ReviewsPanel() {
  const { data, mutate } = useSWR("admin-reviews", api.admin.getReviews);
  const reviews: any[] = data?.reviews ?? [];
  const { success, error: toastErr } = useToast();
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", blurb: "", quote: "", active: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function openAdd() { setForm({ name: "", blurb: "", quote: "", active: true }); setEditing(null); setModal("add"); }
  function openEdit(r: any) { setForm({ name: r.name, blurb: r.blurb, quote: r.quote, active: r.active ?? true }); setEditing(r); setModal("edit"); }

  async function save() {
    if (!form.name.trim() || !form.quote.trim()) return toastErr("Name and quote are required.");
    setSaving(true);
    try {
      if (modal === "edit" && editing) {
        await api.admin.updateReview({ id: editing.id, ...form });
        success("Review updated.");
      } else {
        await api.admin.createReview(form);
        success("Review added.");
      }
      await mutate();
      setModal(null);
    } catch { toastErr("Failed to save review."); }
    setSaving(false);
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      await api.admin.deleteReview(id);
      success("Review removed.");
      await mutate();
    } catch { toastErr("Failed to delete."); }
    setDeleting(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-xs">Manage customer reviews shown on the homepage.</p>
        <button type="button" onClick={openAdd}
          className="flex items-center gap-2 bg-brand-light-green text-[#111815] px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
          <Plus size={13} /> Add Review
        </button>
      </div>
      <div className="space-y-2">
        {reviews.map((r: any) => (
          <div key={r.id} className="flex items-start gap-3 bg-[#1a2219] border border-white/5 rounded-xl p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-sm">{r.name}</p>
                <span className="text-[9px] font-black uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded">{r.blurb}</span>
                {!r.active && <span className="text-[9px] font-black uppercase tracking-wider text-red-400/60 bg-red-500/10 px-2 py-0.5 rounded">Hidden</span>}
              </div>
              <p className="text-white/40 text-xs italic truncate">"{r.quote}"</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" aria-label="Edit review" onClick={() => openEdit(r)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Pencil size={13} /></button>
              <button type="button" aria-label="Delete review" onClick={() => remove(r.id)} disabled={deleting === r.id}
                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors disabled:opacity-40">
                {deleting === r.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {modal && (
          <Modal title={modal === "edit" ? "Edit Review" : "Add Review"} onClose={() => setModal(null)}
            footer={<><Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn><Btn onClick={save} loading={saving}>Save</Btn></>}>
            <Field label="Customer Name"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></Field>
            <Field label="Headline (e.g. EXCELLENT SERVICE)"><Input value={form.blurb} onChange={e => setForm(f => ({ ...f, blurb: e.target.value.toUpperCase() }))} placeholder="SHORT HEADLINE" /></Field>
            <Field label="Review Text"><Textarea value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} rows={4} placeholder="Customer's review..." /></Field>
            <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
              {form.active ? <ToggleRight size={22} className="text-brand-light-green" /> : <ToggleLeft size={22} className="text-white/20" />}
              {form.active ? "Visible on site" : "Hidden"}
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Settings Tab
───────────────────────────────────────────────────────────── */
function SettingsTab() {
  const { data: autoData, mutate: mutateAuto } = useSWR("admin-automations", api.admin.getAutomations, { refreshInterval: 60000 });
  const { data: storeData, mutate: mutateStore } = useSWR("admin-store-info", api.admin.getStoreInfo);
  const { data: hoursData, mutate: mutateHours } = useSWR("admin-store-hours", api.admin.getStoreHours);
  const automations = autoData?.automations ?? [];
  const { success, error: err } = useToast();

  const defaultToggles = [
    { key: "order_confirmation_customer", label: "Order Confirmation (Customer)" },
    { key: "new_order_alert_admin",        label: "New Order Alert (Admin)" },
    { key: "welcome_email_customer",       label: "Welcome Email (New Customers)" },
    { key: "order_preparing_customer",     label: "Preparing Notification" },
    { key: "order_dispatched_customer",    label: "Dispatched Notification" },
    { key: "order_delivered_customer",     label: "Delivered Notification" },
    { key: "ready_for_pickup_customer",    label: "Ready for Pickup" },
    { key: "order_cancelled_customer",     label: "Cancellation Notification" },
  ];

  const getEnabled = (key: string) => {
    const found = automations.find((a: any) => a.key === key);
    return found ? found.enabled : true;
  };

  const toggle = async (key: string, current: boolean) => {
    try {
      await api.admin.updateAutomation(key, !current);
      success(`${!current ? "Enabled" : "Disabled"}`);
      mutateAuto();
    } catch (e: any) { err(e.message || "Failed"); }
  };

  // Store info form
  const storeDefaults = {
    name: "Bud N' Buddies", address: "130-75 Salisbury Way, Sherwood Park, AB T8B 1K4",
    addressShort: "130-75 Salisbury Way, Sherwood Park, AB", phone: "(825) 218-8234",
    phoneDial: "+18252188234", hours: "Open Every Day · Until 2:00 AM",
    hoursShort: "Open Until 2AM",
    googleMapsUrl: "https://maps.google.com/?q=130-75+Salisbury+Way+Sherwood+Park+AB",
    instagram: "", twitter: "", facebook: "", email: "",
  };
  const [storeForm, setStoreForm] = useState<Record<string, string> | null>(null);
  const [savingStore, setSavingStore] = useState(false);
  const currentStore = storeData?.store ?? storeDefaults;
  const storeDraft = storeForm ?? currentStore;

  const saveStore = async () => {
    setSavingStore(true);
    try {
      await api.admin.updateStoreInfo(storeDraft);
      success("Store info saved.");
      mutateStore();
      setStoreForm(null);
    } catch (e: any) { err(e.message || "Save failed"); }
    setSavingStore(false);
  };

  // Store hours form
  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const defaultHours = DAY_NAMES.map((day, i) => ({ id: i, day, open: "10:00", close: "02:00", closed: false }));
  const [hoursForm, setHoursForm] = useState<any[] | null>(null);
  const [savingHours, setSavingHours] = useState(false);
  const currentHours: any[] = hoursData?.hours?.length ? hoursData.hours : defaultHours;
  const hoursDraft = hoursForm ?? currentHours;

  const saveHours = async () => {
    setSavingHours(true);
    try {
      await api.admin.updateStoreHours(hoursDraft);
      success("Store hours saved.");
      mutateHours();
      setHoursForm(null);
    } catch (e: any) { err(e.message || "Save failed"); }
    setSavingHours(false);
  };

  const setHourField = (id: number, field: string, value: any) =>
    setHoursForm(prev => (prev ?? currentHours).map(h => h.id === id ? { ...h, [field]: value } : h));

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-4xl font-black uppercase tracking-tighter">Settings</h1>

      {/* Store Info */}
      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="font-black uppercase tracking-tight mb-1">Store Information</h2>
        <p className="text-white/30 text-xs mb-4">This info appears in emails, the navbar, footer, and order tracking.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "name", label: "Store Name" },
            { key: "phone", label: "Phone (display)" },
            { key: "phoneDial", label: "Phone (dial, e.g. +18001234567)" },
            { key: "email", label: "Support Email" },
            { key: "address", label: "Full Address" },
            { key: "addressShort", label: "Short Address" },
            { key: "hours", label: "Hours (full)" },
            { key: "hoursShort", label: "Hours (short)" },
            { key: "googleMapsUrl", label: "Google Maps URL" },
            { key: "instagram", label: "Instagram URL" },
            { key: "twitter", label: "Twitter/X URL" },
            { key: "facebook", label: "Facebook URL" },
          ].map(({ key, label }) => (
            <Field key={key} label={label}>
              <Input
                value={(storeDraft as any)[key] ?? ""}
                onChange={e => setStoreForm(f => ({ ...(f ?? currentStore), [key]: e.target.value }))}
              />
            </Field>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <Btn loading={savingStore} onClick={saveStore}>Save Store Info</Btn>
          {storeForm && <Btn variant="ghost" onClick={() => setStoreForm(null)}>Discard</Btn>}
        </div>
      </div>

      {/* Store Hours */}
      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6 space-y-3">
        <h2 className="font-black uppercase tracking-tight mb-1">Store Hours</h2>
        <p className="text-white/30 text-xs mb-4">Set open/close times for each day. Toggle "Closed" to mark a day as closed.</p>
        {hoursDraft.map((h: any) => (
          <div key={h.id} className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-black uppercase tracking-widest text-white/40 w-24 shrink-0">{h.day}</span>
            <Input
              type="time" value={h.open ?? "10:00"}
              onChange={e => setHourField(h.id, "open", e.target.value)}
              className="w-32"
              disabled={h.closed}
            />
            <span className="text-white/20 text-xs">to</span>
            <Input
              type="time" value={h.close ?? "02:00"}
              onChange={e => setHourField(h.id, "close", e.target.value)}
              className="w-32"
              disabled={h.closed}
            />
            <button type="button"
              onClick={() => setHourField(h.id, "closed", !h.closed)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
              {h.closed ? <ToggleLeft size={18} className="text-white/20" /> : <ToggleRight size={18} className="text-brand-light-green" />}
              {h.closed ? "Closed" : "Open"}
            </button>
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <Btn loading={savingHours} onClick={saveHours}>Save Hours</Btn>
          {hoursForm && <Btn variant="ghost" onClick={() => setHoursForm(null)}>Discard</Btn>}
        </div>
      </div>

      {/* Email Automations */}
      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6">
        <h2 className="font-black uppercase tracking-tight mb-5">Email Automations</h2>
        <div className="space-y-3">
          {defaultToggles.map(({ key, label }) => {
            const on = getEnabled(key);
            return (
              <div key={key} className="flex items-center justify-between">
                <p className="text-sm text-white/70">{label}</p>
                <button type="button" onClick={() => toggle(key, on)} className="transition-colors">
                  {on
                    ? <ToggleRight size={26} className="text-brand-light-green" />
                    : <ToggleLeft  size={26} className="text-white/20" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#1a2219] border border-white/5 rounded-2xl p-6">
        <h2 className="font-black uppercase tracking-tight mb-1">Tools</h2>
        <div className="flex gap-2 flex-wrap mt-4">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
            <Home size={13} /> View Live Site
          </a>
          <TestEmailBtn />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Drivers Tab
───────────────────────────────────────────────────────────── */
function DriversTab() {
  const { data, mutate } = useSWR("admin-drivers", api.admin.getDrivers, { refreshInterval: 30000 });
  const drivers: any[] = data?.drivers ?? [];
  const { success, error: toastErr } = useToast();

  const [modal, setModal] = useState<null | "add" | "edit">(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", active: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function openAdd() {
    setForm({ name: "", phone: "", active: true });
    setEditing(null);
    setModal("add");
  }

  function openEdit(d: any) {
    setForm({ name: d.name, phone: d.phone ?? "", active: d.active ?? true });
    setEditing(d);
    setModal("edit");
  }

  async function save() {
    if (!form.name.trim()) return toastErr("Driver name is required.");
    setSaving(true);
    try {
      if (modal === "edit" && editing) {
        await api.admin.updateDriver({ id: editing.id, ...form });
        success("Driver updated.");
      } else {
        await api.admin.createDriver(form);
        success("Driver added.");
      }
      await mutate();
      setModal(null);
    } catch (err: any) {
      console.error("[DRIVER_SAVE_ERROR]", err);
      toastErr(err.message || "Failed to save driver.");
    }
    setSaving(false);
  }

  async function remove(id: string) {
    setDeleting(id);
    try {
      await api.admin.deleteDriver(id);
      success("Driver removed.");
      await mutate();
    } catch { toastErr("Failed to delete driver."); }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Drivers</h1>
          <p className="text-white/30 text-sm mt-1">Manage delivery drivers</p>
        </div>
        <button type="button" onClick={openAdd}
          className="flex items-center gap-2 bg-brand-light-green text-[#111815] px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
          <Plus size={14} /> Add Driver
        </button>
      </div>

      {drivers.length === 0
        ? <div className="text-white/20 text-sm text-center py-16">No drivers yet. Add one above.</div>
        : <div className="space-y-2">
            {drivers.map((d: any) => (
              <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#1a2219] border border-white/5 rounded-2xl p-5 gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${d.active ? "bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.4)]" : "bg-white/10"}`} />
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">{d.name}</p>
                    <p className="text-white/40 text-xs font-mono">{d.phone || "No phone"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    d.active ? "bg-green-500/10 text-green-300 border-green-500/20" : "bg-white/5 text-white/30 border-white/10"
                  }`}>{d.active ? "Active" : "Inactive"}</span>
                  <div className="flex items-center gap-1.5">
                    <button type="button" title="Edit" onClick={() => openEdit(d)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><Pencil size={15} /></button>
                    <button type="button" title="Delete" onClick={() => remove(d.id)} disabled={deleting === d.id}
                      className="p-2.5 bg-red-500/5 text-red-400/60 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all disabled:opacity-40">
                      {deleting === d.id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }

      <AnimatePresence>
        {modal && (
          <Modal
            title={modal === "edit" ? "Edit Driver" : "Add Driver"}
            onClose={() => setModal(null)}
            footer={
              <>
                <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
                <Btn onClick={save} loading={saving}>Save</Btn>
              </>
            }
          >
            <Field label="Name">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Driver name" />
            </Field>
            <Field label="Phone (optional)">
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (780) 000-0000" />
            </Field>
            <Dropdown
              label="Status"
              value={form.active ? "Active" : "Inactive"}
              options={["Active", "Inactive"]}
              onChange={v => setForm(f => ({ ...f, active: v === "Active" }))}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Root Admin Layout
───────────────────────────────────────────────────────────── */
const NAV = [
  { id: "Dashboard", icon: LayoutDashboard },
  { id: "Orders",    icon: ShoppingBag },
  { id: "Inventory", icon: Package },
  { id: "Promos",    icon: Tag },
  { id: "Drivers",   icon: Users },
  { id: "Content",   icon: FileText },
  { id: "Settings",  icon: Gear },
] as const;

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab]           = useState<Tab>("Dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const { success }             = useToast();

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") setLoggedIn(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_secret");
    sessionStorage.removeItem("admin_secret");
    setLoggedIn(false);
    success("Logged out");
  };

  if (!loggedIn) return <LoginGate onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-[#0d1210] text-white font-sans flex flex-col lg:flex-row overflow-hidden selection:bg-brand-light-green selection:text-[#111815]">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sideOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 lg:hidden" onClick={() => setSideOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-[#111815] border-r border-white/5 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${sideOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-light-green rounded-xl flex items-center justify-center text-[#111815] font-black text-base shadow-lg shadow-brand-light-green/20">B</div>
            <div>
              <p className="font-black text-sm uppercase tracking-tight">Buds Admin</p>
              <p className="text-[9px] text-white/25 uppercase tracking-[0.3em]">Control Center</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(n => (
            <button key={n.id} type="button"
              onClick={() => { setTab(n.id as Tab); setSideOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                tab === n.id
                  ? "bg-brand-light-green text-[#111815] shadow-md shadow-brand-light-green/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}>
              <n.icon size={15} />
              {n.id}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/5 space-y-2">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Home size={14} /> View Site
          </a>
          <button type="button" onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-40 bg-[#111815] border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button type="button" title="Open menu" onClick={() => setSideOpen(true)} className="p-2 bg-brand-light-green text-[#111815] rounded-lg">
            <Menu size={16} />
          </button>
          <p className="font-black text-sm uppercase tracking-tight">{tab}</p>
          <div className="w-8" />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}>
                {tab === "Dashboard" && <DashboardTab />}
                {tab === "Orders"    && <OrdersTab />}
                {tab === "Inventory" && <InventoryTab />}
                {tab === "Promos"    && <PromosTab />}
                {tab === "Drivers"   && <DriversTab />}
                {tab === "Content"   && <ContentTab />}
                {tab === "Settings"  && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

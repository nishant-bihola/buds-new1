import React from "react";
import { motion } from "motion/react";
import useSWR from "swr";
import { 
  TrendingUp, ShoppingBag, Users, Package, 
  AlertTriangle, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, Truck
} from "lucide-react";
import { api } from "../../lib/api";

export function OverviewTab() {
  const { data: stats } = useSWR("admin-stats", () => api.get("/admin/stats"));
  const { data: products } = useSWR("admin-products", () => api.get("/admin/products"));
  const { data: specialOrders } = useSWR("admin-special-orders", () => api.get("/admin/special-orders"));

  const lowStock = products?.products?.filter((p: any) => p.quantity < 5) || [];
  const pendingRequests = specialOrders?.orders?.filter((o: any) => o.status === "requested") || [];

  const cards = [
    { label: "Total Revenue", value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "Total Orders", value: stats?.totalOrders || "0", icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "Total Customers", value: stats?.totalCustomers || "0", icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Active Products", value: products?.products?.length || "0", icon: Package, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] shadow-sm border border-brand-green/5 flex flex-col gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/30 mb-1">{card.label}</p>
              <h3 className="text-3xl font-black tracking-tighter text-brand-green">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Monthly Performance */}
        <div className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tight text-brand-green">Monthly Performance</h3>
          <div className="bg-white rounded-[32px] p-8 border border-brand-green/5 shadow-sm">
            <div className="flex items-end justify-between gap-4 h-48">
              {stats?.monthlyRevenue?.map((m: any, i: number) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full bg-brand-green/5 rounded-t-xl relative group">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${(m.revenue / Math.max(...stats.monthlyRevenue.map((r: any) => r.revenue))) * 100}%` }}
                      className="w-full bg-brand-green rounded-t-xl group-hover:brightness-110 transition-all"
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-brand-green text-white px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${m.revenue.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-green/30 whitespace-nowrap">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tight text-brand-green">Category Distribution</h3>
          <div className="bg-white rounded-[32px] p-8 border border-brand-green/5 shadow-sm space-y-4">
            {stats?.categoryStats?.map((c: any) => (
              <div key={c.category} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-brand-green">{c.category}</span>
                  <span className="text-brand-green/40">{c.count} items</span>
                </div>
                <div className="h-2 w-full bg-brand-green/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.count / products?.products?.length) * 100}%` }}
                    className="h-full bg-brand-green rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Low Stock Alerts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight text-brand-green flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Low Stock Alerts
            </h3>
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black">
              {lowStock.length} Items
            </span>
          </div>
          <div className="bg-white rounded-[32px] border border-brand-green/5 overflow-hidden">
            <div className="divide-y divide-brand-green/5">
              {lowStock.slice(0, 5).map((p: any) => (
                <div key={p.id} className="p-5 flex items-center justify-between hover:bg-brand-green/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-green/5 flex items-center justify-center overflow-hidden">
                      {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="opacity-20" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-brand-green leading-none mb-1">{p.name}</p>
                      <p className="text-[10px] font-medium text-brand-green/40 uppercase tracking-widest">{p.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[13px] font-black ${p.quantity === 0 ? "text-red-500" : "text-amber-500"}`}>
                      {p.quantity} left
                    </p>
                  </div>
                </div>
              ))}
              {lowStock.length === 0 && (
                <div className="p-10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-brand-green/20">
                  Inventory levels healthy
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Special Order Engine */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight text-brand-green flex items-center gap-2">
              <Truck className="text-blue-500" size={20} />
              Custom Requests
            </h3>
            <div className="flex gap-2">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {stats?.specialOrderConversion?.rate?.toFixed(1)}% Conv.
              </span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">
                {pendingRequests.length} New
              </span>
            </div>
          </div>
          <div className="bg-white rounded-[32px] border border-brand-green/5 overflow-hidden">
            <div className="divide-y divide-brand-green/5">
              {pendingRequests.slice(0, 5).map((o: any) => (
                <div key={o.id} className="p-5 flex items-center justify-between hover:bg-brand-green/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-brand-green leading-none mb-1">{o.productDetails.name}</p>
                      <p className="text-[10px] font-medium text-brand-green/40 uppercase tracking-widest">{o.customerId || "Guest"}</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
                    Process
                  </button>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <div className="p-10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-brand-green/20">
                  No pending custom orders
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

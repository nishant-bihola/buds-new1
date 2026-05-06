import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import useSWR, { mutate } from "swr";
import { 
  Package, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, MoreHorizontal, User, Calendar
} from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

const STAGES = [
  { id: "requested", label: "Requested", icon: AlertCircle, color: "text-amber-500 bg-amber-500/10" },
  { id: "approved", label: "Approved", icon: CheckCircle2, color: "text-blue-500 bg-blue-500/10" },
  { id: "ordered", label: "Ordered", icon: Package, color: "text-indigo-500 bg-indigo-500/10" },
  { id: "arrived", label: "Arrived", icon: Clock, color: "text-purple-500 bg-purple-500/10" },
  { id: "completed", label: "Completed", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" }
];

export function SpecialOrders() {
  const { data, error } = useSWR("admin-special-orders", () => api.get("/admin/special-orders"));
  const { success, error: toastError } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const orders = data?.orders || [];

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/admin/special-orders`, { id, status: newStatus });
      await mutate("admin-special-orders");
      success("Order status updated.");
    } catch (err) {
      toastError("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-brand-green">Custom Requests</h2>
          <p className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest mt-1">Special Sourcing Pipeline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {STAGES.map(stage => (
          <div key={stage.id} className="space-y-4">
            <div className={`flex items-center gap-2 p-3 rounded-2xl ${stage.color}`}>
              <stage.icon size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">{stage.label}</span>
              <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                {orders.filter((o: any) => o.status === stage.id).length}
              </span>
            </div>

            <div className="space-y-3 min-h-[500px] bg-brand-green/5 rounded-3xl p-3">
              <AnimatePresence mode="popLayout">
                {orders
                  .filter((o: any) => o.status === stage.id)
                  .map((order: any) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-brand-green/5 group hover:border-brand-green/20 transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-[13px] font-black text-brand-green leading-tight">
                          {order.productDetails.name}
                        </h4>
                        <div className="text-[9px] text-brand-green/30 font-black uppercase tracking-tighter">
                          #{order.id.slice(0, 4)}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-[10px] text-brand-green/60">
                          <User size={12} />
                          <span>{order.customerId || "Guest Member"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-brand-green/60">
                          <Calendar size={12} />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-auto">
                        {stage.id !== "completed" && (
                          <button
                            onClick={() => handleStatusChange(order.id, STAGES[STAGES.findIndex(s => s.id === stage.id) + 1].id)}
                            disabled={updatingId === order.id}
                            className="flex-1 bg-brand-green text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-1"
                          >
                            Next Step
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2, Clock, Truck, Package, Store, MapPin,
  Phone, ArrowLeft, RefreshCw, Mail, User,
} from "lucide-react";
import type { Order, OrderStatus } from "../types";
import { useStore } from "../context/StoreContext";

const STATUS_STEPS: { key: OrderStatus; label: string; sub: string }[] = [
  { key: "confirmed", label: "Confirmed", sub: "Order received & verified" },
  { key: "preparing", label: "Preparing", sub: "Getting your products ready" },
  { key: "dispatched", label: "On the Way", sub: "Driver picked up your order" },
  { key: "delivered", label: "Delivered", sub: "Enjoy your order!" },
];

const PICKUP_STEPS: { key: OrderStatus; label: string; sub: string }[] = [
  { key: "confirmed", label: "Confirmed", sub: "Order received & verified" },
  { key: "preparing", label: "Preparing", sub: "Packaging your order" },
  { key: "ready_pickup", label: "Ready", sub: "Come pick it up!" },
];

const STATUS_ORDER_DELIVERY: OrderStatus[] = ["confirmed", "preparing", "dispatched", "delivered"];
const STATUS_ORDER_PICKUP: OrderStatus[] = ["confirmed", "preparing", "ready_pickup"];

const STATUS_ICONS: Record<string, React.ElementType> = {
  confirmed: CheckCircle2,
  preparing: Package,
  dispatched: Truck,
  delivered: CheckCircle2,
  ready_pickup: Store,
  pending: Clock,
  cancelled: Clock,
};

function getStepIndex(status: OrderStatus, isPickup: boolean): number {
  const arr = isPickup ? STATUS_ORDER_PICKUP : STATUS_ORDER_DELIVERY;
  const idx = arr.indexOf(status);
  return idx === -1 ? 0 : idx;
}

function StatusTimeline({ order }: { order: Order }) {
  const isPickup = order.delivery.method === "pickup";
  const steps = isPickup ? PICKUP_STEPS : STATUS_STEPS;
  const currentIdx = getStepIndex(order.status, isPickup);

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-brand-green/10" />
      <motion.div
        className="absolute left-5 top-5 w-0.5 bg-brand-green origin-top"
        initial={{ height: 0 }}
        animate={{ height: `${(currentIdx / Math.max(steps.length - 1, 1)) * 100}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="space-y-6 relative">
        {steps.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          const Icon = STATUS_ICONS[step.key] ?? CheckCircle2;
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 pl-0"
            >
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                done
                  ? "bg-brand-green text-brand-earth shadow-lg shadow-brand-green/30"
                  : "bg-white border-2 border-brand-green/15 text-brand-dark/25"
              }`}>
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-brand-green/20"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <Icon size={15} />
              </div>
              <div className="pt-1.5">
                <p className={`font-black uppercase tracking-tight text-sm ${done ? "text-brand-green" : "text-brand-dark/25"}`}>
                  {step.label}
                </p>
                <p className={`text-xs font-medium mt-0.5 ${done ? "text-brand-dark/50" : "text-brand-dark/20"}`}>
                  {step.sub}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const store = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) { setError(true); return; }
      const data = await res.json();
      setOrder(data.order);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // poll every 30s
    const interval = setInterval(() => fetchOrder(true), 30_000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-brand-earth flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-brand-earth flex flex-col items-center justify-center gap-6 px-4">
        <Package size={48} className="text-brand-green/20" />
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-brand-green mb-2">Order Not Found</h1>
          <p className="text-brand-dark/50 font-medium">Check your order number or contact us.</p>
        </div>
        <Link to="/" className="bg-brand-green text-brand-earth px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
          Back to Home
        </Link>
      </div>
    );
  }

  const isPickup = order.delivery.method === "pickup";
  const isDelivered = order.status === "delivered";
  const isReadyPickup = order.status === "ready_pickup";
  const isCancelled = order.status === "cancelled";

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    dispatched: "On the Way",
    delivered: "Delivered",
    ready_pickup: "Ready for Pickup",
    cancelled: "Cancelled",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600",
    confirmed: "bg-brand-green/10 text-brand-green",
    preparing: "bg-blue-50 text-blue-600",
    dispatched: "bg-indigo-50 text-indigo-600",
    delivered: "bg-brand-green/10 text-brand-green",
    ready_pickup: "bg-emerald-50 text-emerald-600",
    cancelled: "bg-red-50 text-red-500",
  };

  return (
    <div className="pt-24 sm:pt-32 pb-16 bg-brand-earth min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-brand-dark/40 hover:text-brand-green transition-colors font-bold text-xs uppercase tracking-widest mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark/30 mb-1">Order Tracking</p>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand-green leading-none">{order.orderId}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${statusColors[order.status] ?? "bg-brand-green/10 text-brand-green"}`}>
              {statusLabels[order.status] ?? order.status}
            </span>
            <button
              type="button"
              onClick={() => fetchOrder(true)}
              aria-label="Refresh status"
              className={`text-brand-dark/30 hover:text-brand-green transition-all ${refreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Delivered / Ready hero banner */}
        <AnimatePresence>
          {(isDelivered || isReadyPickup) && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-green rounded-[24px] p-6 flex items-center gap-4 mb-6 text-brand-earth"
            >
              <CheckCircle2 size={32} className="shrink-0 text-brand-light-green" />
              <div>
                <p className="font-black uppercase tracking-tight text-lg">
                  {isDelivered ? "Delivered!" : "Ready for Pickup!"}
                </p>
                <p className="text-brand-earth/60 text-sm font-medium">
                  {isDelivered ? "Enjoy your order. Thank you for choosing Bud N' Buddies!" : `Come grab your order at ${order.delivery.method === "pickup" ? "the store" : ""}`}
                </p>
              </div>
            </motion.div>
          )}
          {isCancelled && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 rounded-[24px] p-6 mb-6 text-red-600"
            >
              <p className="font-black uppercase tracking-tight">Order Cancelled</p>
              <p className="text-sm font-medium text-red-400 mt-1">Contact us at {" "}<a href={`tel:${store.phoneDial}`} className="underline">{store.phone}</a> for assistance.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-5">
          {/* Status Timeline */}
          {!isCancelled && (
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-brand-green/5 shadow-sm">
              <h2 className="font-black uppercase tracking-tight text-sm text-brand-green mb-6">Order Status</h2>
              <StatusTimeline order={order} />
            </div>
          )}

          {/* Driver Info */}
          {order.status === "dispatched" && order.driverName && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-green rounded-[24px] p-6 sm:p-8 text-brand-earth"
            >
              <div className="flex items-center gap-2 mb-4">
                <Truck size={16} className="text-brand-light-green" />
                <h2 className="font-black uppercase tracking-tight text-sm text-brand-light-green">Your Driver</h2>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-earth/20 rounded-full flex items-center justify-center">
                    <User size={20} className="text-brand-earth" />
                  </div>
                  <div>
                    <p className="font-black text-xl">{order.driverName}</p>
                    {order.driverPhone && (
                      <p className="text-brand-earth/60 text-sm font-medium">{order.driverPhone}</p>
                    )}
                  </div>
                </div>
                {order.driverPhone && (
                  <a
                    href={`tel:${order.driverPhone.replace(/\D/g, "")}`}
                    className="w-10 h-10 bg-brand-earth/15 rounded-full flex items-center justify-center hover:bg-brand-earth/25 transition-colors"
                    aria-label="Call driver"
                  >
                    <Phone size={16} className="text-brand-earth" />
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Delivery details */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-brand-green/5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              {isPickup ? <Store size={15} className="text-brand-green" /> : <MapPin size={15} className="text-brand-green" />}
              <h2 className="font-black uppercase tracking-tight text-sm text-brand-green">
                {isPickup ? "Pickup Details" : "Delivery Details"}
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              {isPickup ? (
                <>
                  <p className="text-brand-dark/60 font-medium">{store.address}</p>
                  <p className="text-brand-dark/40 text-xs font-bold uppercase tracking-widest">{store.hours}</p>
                  <a
                    href={store.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    <MapPin size={12} /> Get Directions
                  </a>
                </>
              ) : (
                <>
                  <p className="text-brand-dark/60 font-medium">
                    {order.delivery.street}, {order.delivery.city} {order.delivery.postal}
                  </p>
                  {order.delivery.slot && (
                    <div className="flex items-center gap-2 text-brand-dark/40 text-xs font-bold uppercase tracking-widest">
                      <Clock size={11} />
                      {order.delivery.slot === "asap" ? "ASAP · Est. 45–75 min" :
                       order.delivery.slot === "2h" ? "Today in 2 hours" : "Today in 4 hours"}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-brand-green/5 shadow-sm">
            <h2 className="font-black uppercase tracking-tight text-sm text-brand-green mb-5">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={`${item.id}-${item.name}`} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-brand-dark">{item.name}</span>
                    <span className="text-brand-dark/40 font-medium ml-2">×{item.quantity}</span>
                  </div>
                  <span className="font-black text-brand-green">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-green/10 mt-4 pt-4 space-y-1.5 text-sm">
              {(order.subtotal !== order.total || order.deliveryFee > 0 || order.discount > 0) && (
                <>
                  <div className="flex justify-between text-brand-dark/50 font-medium">
                    <span>Subtotal</span><span>${order.subtotal?.toFixed(2)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between text-brand-dark/50 font-medium">
                      <span>Delivery</span><span>${order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {(order.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-brand-green font-bold">
                      <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                      <span>−${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between font-black text-brand-green text-base pt-1">
                <span>Total</span><span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Email log */}
          {order.emailLog && order.emailLog.length > 0 && (
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-brand-green/5 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Mail size={15} className="text-brand-green" />
                <h2 className="font-black uppercase tracking-tight text-sm text-brand-green">Email Updates Sent</h2>
              </div>
              <div className="space-y-2">
                {order.emailLog.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-dark/60 capitalize">{entry.event.replace(/_/g, " ")}</span>
                    <span className="text-brand-dark/30 font-medium">
                      {new Date(entry.sentAt).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support */}
          <div className="bg-brand-earth border border-brand-green/10 rounded-[24px] p-6 flex items-center justify-between">
            <div>
              <p className="font-black uppercase tracking-tight text-sm text-brand-green mb-1">Need Help?</p>
              <p className="text-brand-dark/50 text-xs font-medium">Call us — open every day until 2AM</p>
            </div>
            <a
              href={`tel:${store.phoneDial}`}
              className="flex items-center gap-2 bg-brand-green text-brand-earth px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity"
            >
              <Phone size={12} /> Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import type { ToastMessage } from "../types";

interface ToastContextType {
  toast: (message: string, type?: ToastMessage["type"], duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: "bg-brand-green text-brand-earth",
  error: "bg-red-600 text-white",
  info: "bg-brand-dark text-white",
  warning: "bg-amber-500 text-white",
};

function ToastItem({ t, onDismiss }: { t: ToastMessage; onDismiss: (id: string) => void }) {
  const Icon = ICONS[t.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto ${STYLES[t.type]}`}
    >
      <Icon size={16} className="shrink-0 opacity-90" />
      <span className="text-sm font-bold flex-1 leading-snug">{t.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(t.id)}
        className="opacity-60 hover:opacity-100 transition-opacity ml-1 shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastMessage["type"] = "info", duration = 3500) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const ctx: ToastContextType = {
    toast: add,
    success: (m) => add(m, "success"),
    error: (m) => add(m, "error"),
    info: (m) => add(m, "info"),
    warning: (m) => add(m, "warning"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-sm"
      >
        <AnimatePresence mode="sync">
          {toasts.map((t) => (
            <ToastItem key={t.id} t={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

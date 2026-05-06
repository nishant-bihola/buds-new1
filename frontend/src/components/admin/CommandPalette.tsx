import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Package, ShoppingBag, Users, X } from "lucide-react";
import { api } from "../../lib/api";

export function CommandPalette({ isOpen, onClose, onSelectTab }: { isOpen: boolean; onClose: () => void; onSelectTab: (tab: any) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ type: string; id: string; name: string; icon: any }[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null; // Handle toggle if needed externally, but here we just listen for open
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query) return setResults([]);
    // Simulate search logic or call backend
    const performSearch = async () => {
      // In a real app, this would be a single search endpoint
      setResults([
        { type: "Product", id: "p1", name: `Product: ${query}`, icon: Package },
        { type: "Order", id: "o1", name: `Order #${query.slice(0, 4)}`, icon: ShoppingBag },
        { type: "Member", id: "m1", name: `Member: ${query}`, icon: Users },
      ]);
    };
    const timer = setTimeout(performSearch, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0f0c]/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white rounded-[32px] shadow-[0_32px_120px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-brand-green/5 flex items-center gap-4">
              <Search className="text-brand-green/30" size={24} />
              <input
                autoFocus
                type="text"
                placeholder="Search everywhere... (Products, Orders, Members)"
                className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-brand-green placeholder:text-brand-green/20"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button onClick={onClose} className="p-2 hover:bg-brand-green/5 rounded-full transition-colors">
                <X size={20} className="text-brand-green/30" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
              {results.length > 0 ? (
                results.map((res, i) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-brand-green/5 transition-colors text-left group"
                    onClick={() => {
                      if (res.type === "Product") onSelectTab("Inventory");
                      if (res.type === "Order") onSelectTab("Orders");
                      if (res.type === "Member") onSelectTab("Customers");
                      onClose();
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-green/5 flex items-center justify-center text-brand-green/40 group-hover:bg-brand-green group-hover:text-white transition-all">
                      <res.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-black text-brand-green">{res.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/20">{res.type}</p>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-green/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      Jump to →
                    </div>
                  </button>
                ))
              ) : query ? (
                <div className="py-12 text-center">
                  <p className="text-[11px] font-black uppercase tracking-widest text-brand-green/20">No matching records found</p>
                </div>
              ) : (
                <div className="py-8 px-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-green/20 mb-4 ml-2">Quick Navigation</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Orders", "Inventory", "Customers", "SpecialOrders"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => { onSelectTab(tab); onClose(); }}
                        className="p-4 rounded-2xl bg-brand-green/5 text-[11px] font-black uppercase tracking-widest text-brand-green hover:bg-brand-green hover:text-white transition-all text-center"
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-brand-green/[0.02] border-t border-brand-green/5 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <kbd className="bg-white border border-brand-green/10 px-1.5 py-0.5 rounded text-[9px] font-black text-brand-green/40 shadow-sm">ESC</kbd>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-green/20">Close</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="bg-white border border-brand-green/10 px-1.5 py-0.5 rounded text-[9px] font-black text-brand-green/40 shadow-sm">↵</kbd>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-green/20">Select</span>
                </div>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-brand-green/10">Bud n' Buddies Command Terminal</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

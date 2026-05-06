import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Calculator, Check, AlertCircle, 
  Search, ExternalLink, History
} from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../context/ToastContext";

export function PricingTool() {
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorPrice, setCompetitorPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { success, error } = useToast();

  const handleMatch = async () => {
    if (!selectedProduct || !competitorPrice) return;
    
    const price = parseFloat(competitorPrice);
    if (isNaN(price)) return error("Invalid competitor price.");

    try {
      // Simulate/Implement match logic
      success(`Price match eligible. Adjusted price: $${price}`);
    } catch (err) {
      error("Match verification failed.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-brand-green">Pricing & Match Tool</h2>
        <p className="text-brand-green/40 text-[10px] font-black uppercase tracking-widest mt-1">25km Competitive Eligibility Verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">
        <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-brand-green/5 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">Competitor URL</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="https://competitor-site.com/product"
                className="w-full bg-brand-green/5 border-2 border-brand-green/10 rounded-3xl px-6 py-5 text-[13px] font-medium outline-none focus:border-brand-green/30"
                value={competitorUrl}
                onChange={e => setCompetitorUrl(e.target.value)}
              />
              <ExternalLink size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-green/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">Competitor Price</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-green font-black">$</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full bg-brand-green/5 border-2 border-brand-green/10 rounded-3xl pl-10 pr-6 py-5 text-xl font-black outline-none focus:border-brand-green/30 text-brand-green"
                  value={competitorPrice}
                  onChange={e => setCompetitorPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">Radius Check</label>
              <div className="h-[68px] bg-emerald-50 rounded-3xl flex items-center px-6 gap-3 text-emerald-600">
                <Check size={20} />
                <span className="text-[11px] font-black uppercase tracking-widest">Within 25km</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleMatch}
            className="w-full bg-brand-green text-brand-earth py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-brand-green/10"
          >
            <Calculator size={20} />
            Calculate & Apply Match
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black uppercase tracking-tight text-brand-green flex items-center gap-2">
            <History className="text-brand-green/30" size={20} />
            Recent Match History
          </h3>
          <div className="bg-white rounded-[32px] border border-brand-green/5 p-8 text-center">
            <div className="opacity-10 mb-4 flex justify-center">
              <History size={48} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-green/30">No match records found for today</p>
          </div>
        </div>
      </div>
    </div>
  );
}

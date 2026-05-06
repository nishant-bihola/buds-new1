
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Loader2, Bot } from "lucide-react";
import { api } from "../lib/api";

export function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "model"; parts: { text: string }[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage("");
    setHistory(prev => [...prev, { role: "user", parts: [{ text: userMsg }] }]);
    setLoading(true);

    try {
      const data = await api.chat(userMsg, history);
      setHistory(prev => [...prev, { role: "model", parts: [{ text: data.text }] }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: "model", parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later!" }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[90vw] sm:w-[400px] h-[550px] bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-brand-green/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-brand-green p-6 text-brand-earth flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tighter leading-none">Chat with Bud</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mt-1">Expert AI Budtender</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-brand-green/5 custom-scrollbar">
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <Sparkles size={40} className="mb-4 text-brand-green" />
                  <p className="text-sm font-bold uppercase tracking-widest text-brand-green">Ask me anything about our flower, delivery, or membership!</p>
                </div>
              )}
              {history.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-4 rounded-[24px] text-sm font-medium ${
                    msg.role === "user" 
                      ? "bg-brand-green text-brand-earth rounded-tr-none" 
                      : "bg-white border border-brand-green/10 text-brand-green rounded-tl-none shadow-sm"
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-brand-green/10 p-4 rounded-[24px] rounded-tl-none shadow-sm flex gap-2">
                    <Loader2 size={16} className="animate-spin text-brand-green" />
                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Bud is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-brand-green/10 flex gap-2">
              <input
                type="text"
                placeholder="Ask about sleep, energy, or our menu..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="flex-1 bg-brand-green/5 border border-transparent focus:border-brand-green/20 rounded-2xl px-5 py-3 text-sm font-medium outline-none transition-all"
              />
              <button 
                type="submit" 
                disabled={!message.trim() || loading}
                className="w-12 h-12 bg-brand-green text-brand-earth rounded-2xl flex items-center justify-center hover:brightness-110 disabled:opacity-30 transition-all"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-green text-brand-earth rounded-[24px] flex items-center justify-center shadow-2xl shadow-brand-green/30 border-4 border-white relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? <X key="x" size={28} /> : <MessageSquare key="msg" size={28} />}
        </AnimatePresence>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-light-green text-brand-green text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce group-hover:animate-none">1</span>
      </motion.button>
    </div>
  );
}

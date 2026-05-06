import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, MapPin, Phone, Mail, CheckCircle2, Loader2 } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const contactItems = [
    {
      icon: MapPin,
      title: "Our Greenhouse",
      lines: ["130-75 Salisbury Way", "Sherwood Park, AB T8B 1K4"],
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: ["hello@budnbuddies.ca", "support@budnbuddies.ca"],
    },
    {
      icon: Phone,
      title: "Call Buddy",
      lines: ["(825) 218-8234"],
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formState === "error") setFormState("idle");
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg("Please fill in all required fields.");
      setFormState("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMsg("Please enter a valid email address.");
      setFormState("error");
      return;
    }

    setFormState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
      setFormState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      setErrorMsg("Something went wrong. Please call us at (825) 218-8234.");
      setFormState("error");
    }
  };

  return (
    <div className="pt-24 sm:pt-32 pb-16 md:pb-24 bg-brand-earth min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Info */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-brand-green leading-[0.9] mb-8 md:mb-12"
            >
              Let's <br /> Connect.
            </motion.h1>

            <div className="space-y-6 md:space-y-10">
              {contactItems.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex gap-4 sm:gap-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-green text-brand-earth rounded-[18px] sm:rounded-[24px] flex items-center justify-center shrink-0">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter mb-1 sm:mb-2">
                      {title}
                    </h3>
                    <p className="text-brand-dark/60 text-base sm:text-lg leading-relaxed">
                      {lines.map((line, i) => (
                        <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
                      ))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 sm:p-10 md:p-12 rounded-[40px] sm:rounded-[60px] shadow-2xl border border-brand-green/5"
          >
            <AnimatePresence mode="wait">
              {formState === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  className="flex flex-col items-center justify-center text-center py-10 gap-6"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 size={36} className="text-brand-earth" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-brand-green mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-brand-dark/60 font-medium leading-relaxed">
                      We'll get back to you within 24 hours. Come visit us in the meantime — open till 2 AM!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormState("idle")}
                    className="text-[11px] font-black uppercase tracking-widest text-brand-green/40 hover:text-brand-green transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-brand-green mb-6 sm:mb-8">
                    Send a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label htmlFor="contact-name" className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-brand-earth/50 border border-brand-green/10 rounded-full px-5 py-3.5 sm:py-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all font-medium text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-brand-earth/50 border border-brand-green/10 rounded-full px-5 py-3.5 sm:py-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all font-medium text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-subject" className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        placeholder="How can we help?"
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full bg-brand-earth/50 border border-brand-green/10 rounded-full px-5 py-3.5 sm:py-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all font-medium text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-widest text-brand-green/40 ml-4">
                        Message <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        placeholder="Tell us everything..."
                        value={form.message}
                        onChange={handleChange}
                        required
                        className="w-full bg-brand-earth/50 border border-brand-green/10 rounded-[24px] sm:rounded-[32px] px-5 py-4 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all font-medium resize-none text-sm"
                      />
                    </div>

                    <AnimatePresence>
                      {formState === "error" && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-500 text-sm font-bold px-4"
                        >
                          {errorMsg}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={formState === "loading"}
                      className="w-full flex items-center justify-center gap-3 bg-brand-green text-brand-earth py-4 sm:py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-60 disabled:scale-100 cursor-pointer"
                    >
                      {formState === "loading" ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

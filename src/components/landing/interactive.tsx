"use client";
import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { Star, X, Menu, ArrowUp } from "lucide-react";

export function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#1e1b4b]/95 backdrop-blur-md shadow-lg py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex items-center justify-between">
          <a href="#" className="text-[18px] font-bold tracking-tight text-white">✦ Indigo</a>
          <div className="hidden md:flex items-center gap-6 text-[14px] text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signup" className="hidden md:inline-flex px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[13px] font-medium hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none">
              Start free
            </Link>
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-white p-1" aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[#1e1b4b] flex flex-col p-6">
          <div className="flex items-center justify-between mb-10">
            <span className="text-[18px] font-bold text-white">✦ Indigo</span>
            <button onClick={() => setMobileOpen(false)} className="text-white p-1" aria-label="Close menu"><X size={22} /></button>
          </div>
          <div className="flex flex-col gap-5 text-[20px] font-medium text-white">
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
          </div>
          <div className="mt-auto">
            <Link href="/auth/signup" className="block text-center py-3.5 rounded-full bg-white text-[#1e1b4b] text-[15px] font-medium" onClick={() => setMobileOpen(false)}>
              Start free →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export function EmailForm({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Enter your email to get started"); inputRef.current?.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("That doesn't look like a valid email"); inputRef.current?.focus(); return; }
    setSubmitted(true);
    // In production, redirect to signup with email prefilled
    window.location.href = `/auth/signup?email=${encodeURIComponent(email)}`;
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white text-[14px]">
        <span className="text-emerald-300">✓</span> Redirecting to signup...
      </div>
    );
  }

  const isHero = variant === "hero";
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[420px]" noValidate>
      <div className="relative">
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          placeholder="you@store.com.np"
          aria-label="Email address"
          aria-describedby={error ? `${variant}-error` : undefined}
          aria-invalid={!!error}
          className={`w-full px-5 py-4 pr-[130px] rounded-full text-[14px] text-[#1a1a1a] placeholder:text-[#999] focus-visible:ring-2 focus-visible:outline-none transition-all ${isHero ? "bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] focus-visible:ring-indigo-300" : "bg-white focus-visible:ring-white/50"} ${error ? "ring-2 ring-red-400" : ""}`}
        />
        <button type="submit" className="btn-press absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-[#222] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none">
          Start free
        </button>
      </div>
      {error && <p id={`${variant}-error`} className="mt-2 text-[12px] text-red-300 pl-5" role="alert">{error}</p>}
      <p className="mt-2 text-[11px] text-white/50 pl-5">Free forever · No credit card required</p>
    </form>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 size-10 rounded-full bg-[#4338ca] text-white shadow-lg flex items-center justify-center hover:bg-[#3730a3] transition-colors focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

export function HowItWorks() {
  const steps = [
    { num: "1", title: "Sign up free", desc: "Enter your email. No credit card, no commitment." },
    { num: "2", title: "Add products", desc: "Upload photos, set prices. Takes 30 seconds per product." },
    { num: "3", title: "Connect eSewa", desc: "Paste your merchant ID. Payments flow instantly." },
    { num: "4", title: "Share your link", desc: "Your store is live. Send it on Facebook, WhatsApp, anywhere." },
  ];
  return (
    <section className="py-20 px-6 md:px-10 bg-[#f9fafb]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[34px] md:text-[46px] font-semibold leading-[108%] tracking-[-0.04em] mb-3">How It Works</h2>
          <p className="text-[15px] text-[#6d6d6d]">Four steps. Two minutes. Your store is live.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map(s => (
            <div key={s.num} className="text-center md:text-left">
              <div className="inline-flex items-center justify-center size-10 rounded-full bg-[#4338ca] text-white text-[15px] font-semibold mb-3">{s.num}</div>
              <h3 className="text-[16px] font-semibold mb-1">{s.title}</h3>
              <p className="text-[13px] text-[#6d6d6d] leading-[155%]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

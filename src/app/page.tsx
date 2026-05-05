import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe, CreditCard, Truck, BarChart3 } from "lucide-react";
import { WebGLWrapper } from "@/components/landing/torch/webgl-wrapper";
import { ScrollReveal } from "@/components/landing/torch/scroll-reveal";

export const metadata: Metadata = {
  title: "Indigo — Launch Your Online Store in Nepal | E-Commerce Platform",
  description: "Launch your online store in minutes. Accept eSewa, Khalti payments. Ship via Pathao. Built for 12,000+ Nepali businesses.",
  keywords: ["ecommerce Nepal", "online store Nepal", "eSewa payment gateway", "Khalti integration", "sell online Nepal"],
  openGraph: { title: "Indigo — Launch Your Online Store in Nepal", description: "The all-in-one e-commerce platform built for Nepal.", type: "website" },
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-[#121212] text-white"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Google Font */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-[12px] bg-[#121212]/80 border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-[24px] h-[48px] flex items-center justify-between">
          <Link href="/" className="text-[#FFD600] font-extrabold text-[14px] tracking-tight">INDIGO</Link>
          <div className="hidden md:flex items-center gap-[24px]">
            <a href="#features" className="text-[12px] uppercase tracking-[0.1em] text-white/60 hover:text-white transition-colors duration-150">Features</a>
            <a href="#pricing" className="text-[12px] uppercase tracking-[0.1em] text-white/60 hover:text-white transition-colors duration-150">Pricing</a>
          </div>
          <Link href="/auth/signup" className="px-[16px] py-[8px] rounded-[4px] bg-[#FFD600] text-[#121212] text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150">
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero — Gradient border shell + inset WebGL */}
      <section className="pt-[80px] px-[24px] pb-[24px]">
        <div className="max-w-[1200px] mx-auto">
          {/* Gradient border shell wrapper */}
          <div className="p-[1px] rounded-[16px]" style={{ background: "linear-gradient(to right bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05), rgba(0,0,0,0))" }}>
            <div className="relative rounded-[15px] bg-[#121212] overflow-hidden" style={{ padding: "32px" }}>
              {/* Inset 3D accent */}
              <div className="absolute inset-0 z-0">
                <WebGLWrapper />
              </div>
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center py-[60px]">
                <p className="text-[12px] uppercase tracking-[0.1em] text-[#FFD600] mb-[8px]">E-Commerce Platform for Nepal</p>
                <h1 className="text-[60px] font-extrabold leading-[60px] tracking-[-0.025em] mb-[16px]">
                  Your store,<br /><span className="text-[#FFD600]">live in minutes.</span>
                </h1>
                <p className="text-[12px] uppercase tracking-[0.1em] text-white/60 max-w-[400px] mb-[24px]">
                  Accept eSewa & Khalti. Ship via Pathao. No code required. Built for 12,000+ Nepali businesses.
                </p>
                <Link href="/auth/signup" className="inline-flex items-center gap-[8px] px-[24px] py-[12px] rounded-[4px] bg-[#FFD600] text-[#121212] text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150 shadow-[0_0_30px_rgba(255,214,0,0.2)]">
                  Launch Your Store <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — Light cards on dark bg, grid layout */}
      <section id="features" className="px-[24px] py-[24px]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <p className="text-[12px] uppercase tracking-[0.1em] text-[#FFD600] mb-[4px]">Capabilities</p>
            <h2 className="text-[60px] font-extrabold leading-[60px] tracking-[-0.025em] mb-[24px]">Everything<br />you need.</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[4px]">
            {FEATURES.map((f) => (
              <ScrollReveal key={f.title}>
                {/* Card: light #F4F4F4 bg, 12px radius, 32px padding */}
                <div className="rounded-[12px] p-[32px] h-full" style={{ backgroundColor: "#F4F4F4", boxShadow: "rgba(0,0,0,0.25) 0px 25px 50px -12px" }}>
                  <div className="w-[32px] h-[32px] rounded-[8px] bg-[#121212] flex items-center justify-center mb-[8px]">
                    <f.icon size={16} className="text-[#FFD600]" />
                  </div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#121212] mb-[4px]">{f.title}</h3>
                  <p className="text-[12px] leading-[16px] tracking-[0.1em] text-[#121212]/60">{f.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="px-[24px] py-[24px]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="p-[1px] rounded-[16px]" style={{ background: "linear-gradient(to right bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05), rgba(0,0,0,0))" }}>
              <div className="rounded-[15px] bg-[#121212] p-[32px] grid grid-cols-2 md:grid-cols-4 gap-[4px]">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-[60px] font-extrabold leading-[60px] tracking-[-0.025em] text-[#FFD600]">{s.value}</div>
                    <div className="text-[12px] uppercase tracking-[0.1em] text-white/40 mt-[4px]">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing — Light cards */}
      <section id="pricing" className="px-[24px] py-[24px]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <p className="text-[12px] uppercase tracking-[0.1em] text-[#FFD600] mb-[4px]">Pricing</p>
            <h2 className="text-[60px] font-extrabold leading-[60px] tracking-[-0.025em] mb-[24px]">Start free.</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[4px]">
            {PLANS.map((plan) => (
              <ScrollReveal key={plan.name}>
                <div
                  className="rounded-[12px] p-[32px] h-full flex flex-col"
                  style={{
                    backgroundColor: plan.featured ? "#FFD600" : "#F4F4F4",
                    boxShadow: "rgba(0,0,0,0.25) 0px 25px 50px -12px",
                  }}
                >
                  <p className="text-[12px] uppercase tracking-[0.1em] text-[#121212]/60 mb-[4px]">{plan.name}</p>
                  <div className="text-[60px] font-extrabold leading-[60px] tracking-[-0.025em] text-[#121212] mb-[8px]">{plan.price}</div>
                  <p className="text-[12px] tracking-[0.1em] text-[#121212]/60 mb-[16px]">{plan.period}</p>
                  <ul className="space-y-[4px] mb-[24px] flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="text-[12px] leading-[16px] tracking-[0.1em] text-[#121212]/80">• {feat}</li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className="block text-center px-[16px] py-[8px] rounded-[4px] bg-[#121212] text-[#FFD600] text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#121212]/90 transition-colors duration-150">
                    Get Started
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-[24px] py-[24px]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="p-[1px] rounded-[16px]" style={{ background: "linear-gradient(to right bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05), rgba(0,0,0,0))" }}>
              <div className="rounded-[15px] bg-[#121212] p-[32px] text-center">
                <h2 className="text-[60px] font-extrabold leading-[60px] tracking-[-0.025em] mb-[8px]">
                  Ready<span className="text-[#FFD600]">?</span>
                </h2>
                <p className="text-[12px] uppercase tracking-[0.1em] text-white/60 mb-[24px]">Join 12,000+ Nepali businesses. No credit card required.</p>
                <Link href="/auth/signup" className="inline-flex items-center gap-[8px] px-[24px] py-[12px] rounded-[4px] bg-[#FFD600] text-[#121212] text-[12px] font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150 shadow-[0_0_30px_rgba(255,214,0,0.2)]">
                  Start Free Today <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-[24px] py-[24px] border-t border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <span className="text-[#FFD600] font-extrabold text-[14px]">INDIGO</span>
          <div className="flex items-center gap-[16px] text-[12px] uppercase tracking-[0.1em] text-white/40">
            <Link href="/legal/privacy" className="hover:text-white/70 transition-colors duration-150">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white/70 transition-colors duration-150">Terms</Link>
          </div>
          <span className="text-[12px] text-white/30">2026</span>
        </div>
      </footer>
    </div>
  );
}

// --- Data ---

const FEATURES = [
  { icon: CreditCard, title: "Nepal Payments", description: "eSewa, Khalti, FonePay and international cards via Stripe." },
  { icon: Truck, title: "Pathao Delivery", description: "Auto-calculate rates, print labels, track packages." },
  { icon: Globe, title: "Custom Storefront", description: "Drag-and-drop page builder. Custom domains. Mobile-first." },
  { icon: Zap, title: "Launch in Minutes", description: "Sign up, add products, connect payments. You're live." },
  { icon: Shield, title: "Secure & Reliable", description: "Bank-grade security. 99.9% uptime. Your data, your control." },
  { icon: BarChart3, title: "Growth Analytics", description: "Revenue charts, customer insights, inventory alerts." },
];

const STATS = [
  { value: "12K+", label: "Stores" },
  { value: "50Cr", label: "GMV" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s", label: "Load" },
];

const PLANS = [
  { name: "Free", price: "₨0", period: "Forever", featured: false, features: ["25 products", "eSewa + COD", "Indigo subdomain", "Basic analytics"] },
  { name: "Growth", price: "₨2K", period: "/month", featured: true, features: ["Unlimited products", "All payments", "Custom domain", "Advanced analytics", "Discount codes"] },
  { name: "Pro", price: "₨6K", period: "/month", featured: false, features: ["Everything in Growth", "Multi-staff", "API access", "WhatsApp alerts", "Priority support"] },
];

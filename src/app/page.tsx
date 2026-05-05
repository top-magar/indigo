import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Terminal, Shield, Globe, CreditCard, Truck, BarChart3, ChevronRight } from "lucide-react";
import { WebGLWrapper } from "@/components/landing/torch/webgl-wrapper";
import { ScrollReveal } from "@/components/landing/torch/scroll-reveal";

export const metadata: Metadata = {
  title: "Indigo — Launch Your Online Store in Nepal | E-Commerce Platform",
  description: "Launch your online store in minutes. Accept eSewa, Khalti payments. Ship via Pathao. Built for 12,000+ Nepali businesses.",
  openGraph: { title: "Indigo — Launch Your Online Store in Nepal", description: "The all-in-one e-commerce platform built for Nepal.", type: "website" },
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased" style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&display=swap" />

      {/* Grid background */}
      <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-[1100px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[13px] font-bold tracking-tight">indigo</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-white/40">
            <a href="#features" className="hover:text-white transition-colors">features</a>
            <a href="#pricing" className="hover:text-white transition-colors">pricing</a>
            <a href="https://github.com/top-magar/indigo" className="hover:text-white transition-colors">github</a>
          </div>
          <Link href="/auth/signup" className="px-3 py-1.5 rounded bg-white text-[#0a0a0a] text-[11px] font-medium hover:bg-white/90 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-12">
        {/* WebGL accent — top right */}
        <div className="absolute top-[10%] right-0 w-[500px] h-[500px] opacity-60 hidden lg:block">
          <WebGLWrapper />
        </div>

        <div className="relative z-10 max-w-[1100px] mx-auto px-6 py-32">
          {/* Status line */}
          <div className="flex items-center gap-2 mb-8">
            <div className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-emerald-400/80 uppercase tracking-wider">Systems operational</span>
            <span className="text-[11px] text-white/20 ml-2">v2.4.1</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(32px,6vw,64px)] font-extrabold leading-[0.95] tracking-[-0.03em] max-w-[700px] mb-6">
            The commerce<br/>
            infrastructure<br/>
            for <span className="text-emerald-400">Nepal.</span>
          </h1>

          {/* Sub */}
          <p className="text-[14px] text-white/40 max-w-[440px] leading-relaxed mb-10">
            Accept eSewa, Khalti, Stripe. Ship via Pathao. Visual storefront builder. Multi-tenant from day one. Deploy in minutes, not months.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 mb-16">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-white text-[#0a0a0a] text-[12px] font-medium hover:bg-white/90 transition-colors">
              Start building <ArrowRight size={13} />
            </Link>
            <Link href="#features" className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-white/[0.1] text-[12px] text-white/60 hover:text-white hover:border-white/20 transition-colors">
              See features
            </Link>
          </div>

          {/* Terminal block */}
          <div className="max-w-[480px] rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.06]">
              <div className="size-2 rounded-full bg-white/10" />
              <div className="size-2 rounded-full bg-white/10" />
              <div className="size-2 rounded-full bg-white/10" />
              <span className="ml-2 text-[10px] text-white/20">terminal</span>
            </div>
            <div className="p-4 text-[12px] leading-relaxed">
              <p className="text-white/30">$ npx create-indigo-store</p>
              <p className="text-emerald-400/70 mt-1">✓ Store created: dhaka-threads.indigo.shop</p>
              <p className="text-emerald-400/70">✓ eSewa connected</p>
              <p className="text-emerald-400/70">✓ 3 products imported</p>
              <p className="text-white/30 mt-2">$ <span className="animate-pulse">_</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.06] py-12 relative z-10">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-[28px] font-extrabold tracking-tight text-white">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/30 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-[1100px] mx-auto px-6">
          <ScrollReveal>
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={14} className="text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider text-white/40">Core modules</span>
            </div>
            <h2 className="text-[32px] font-extrabold tracking-[-0.02em] mb-12">Built for production.</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-lg overflow-hidden">
            {FEATURES.map(f => (
              <ScrollReveal key={f.title}>
                <div className="bg-[#0a0a0a] p-6 h-full hover:bg-white/[0.02] transition-colors duration-150">
                  <f.icon size={18} className="text-emerald-400 mb-3" />
                  <h3 className="text-[13px] font-bold mb-1.5">{f.title}</h3>
                  <p className="text-[12px] text-white/35 leading-relaxed">{f.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Code block section */}
      <section className="py-24 border-t border-white/[0.06] relative z-10">
        <div className="max-w-[1100px] mx-auto px-6">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-emerald-400/60 mb-3 block">Developer experience</span>
                <h2 className="text-[28px] font-extrabold tracking-[-0.02em] mb-4">API-first.<br/>Type-safe.<br/>Multi-tenant.</h2>
                <p className="text-[13px] text-white/35 leading-relaxed mb-6">Every query is tenant-scoped. Every action is type-checked. Every mutation is audited. Built on Next.js 16, Drizzle ORM, and Supabase.</p>
                <Link href="/auth/signup" className="inline-flex items-center gap-1 text-[12px] text-emerald-400 hover:text-emerald-300 transition-colors">
                  Read the docs <ChevronRight size={12} />
                </Link>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <div className="flex items-center px-3 py-2 border-b border-white/[0.06] text-[10px] text-white/20">
                  src/app/dashboard/products/actions.ts
                </div>
                <pre className="p-4 text-[11px] leading-relaxed overflow-x-auto"><code className="text-white/50">{`"use server";

export async function createProduct(fd: FormData) {
  const user = await requireTenantUser();
  
  return withTenant(user.tenantId, async (tx) => {
    const product = await tx.insert(products)
      .values({ 
        tenantId: user.tenantId,
        name: fd.get("name"),
        price: fd.get("price"),
      })
      .returning();
    
    revalidatePath("/dashboard/products");
    return { success: true, product };
  });
}`}</code></pre>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-white/[0.06] relative z-10">
        <div className="max-w-[900px] mx-auto px-6">
          <ScrollReveal>
            <span className="text-[11px] uppercase tracking-wider text-emerald-400/60 mb-3 block">Pricing</span>
            <h2 className="text-[32px] font-extrabold tracking-[-0.02em] mb-12">Start free. Scale when ready.</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-lg overflow-hidden">
            {PLANS.map(plan => (
              <ScrollReveal key={plan.name}>
                <div className={`p-6 h-full flex flex-col ${plan.featured ? "bg-emerald-400/[0.04]" : "bg-[#0a0a0a]"}`}>
                  {plan.featured && <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold mb-2">Popular</span>}
                  <p className="text-[11px] text-white/40 uppercase tracking-wider">{plan.name}</p>
                  <div className="text-[32px] font-extrabold tracking-tight mt-1 mb-1">{plan.price}</div>
                  <p className="text-[11px] text-white/25 mb-6">{plan.period}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map(feat => (
                      <li key={feat} className="flex items-start gap-2 text-[11px] text-white/45">
                        <Check size={11} className="text-emerald-400 mt-[2px] shrink-0" />{feat}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`block text-center py-2 rounded text-[11px] font-medium transition-colors ${plan.featured ? "bg-emerald-400 text-[#0a0a0a] hover:bg-emerald-300" : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white"}`}>
                    Get Started
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/[0.06] text-center relative z-10">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-wider text-white/20 mb-4">Ready to ship?</p>
          <h2 className="text-[32px] font-extrabold tracking-[-0.02em] mb-6">Build your store tonight.</h2>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded bg-white text-[#0a0a0a] text-[12px] font-medium hover:bg-white/90 transition-colors">
            Start free <ArrowRight size={13} />
          </Link>
          <p className="text-[11px] text-white/20 mt-4">No credit card · Free forever tier · Deploy in 2 minutes</p>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6 relative z-10">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-bold">indigo</span>
          </div>
          <div className="flex gap-4 text-[10px] text-white/20">
            <Link href="/legal/privacy" className="hover:text-white/40 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white/40 transition-colors">Terms</Link>
            <a href="https://github.com/top-magar/indigo" className="hover:text-white/40 transition-colors">GitHub</a>
          </div>
          <span className="text-[10px] text-white/15">© 2026</span>
        </div>
      </footer>
    </div>
  );
}

const STATS = [
  { value: "12,000+", label: "Active stores" },
  { value: "₨50Cr+", label: "GMV processed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<2s", label: "Avg load time" },
];

const FEATURES = [
  { icon: CreditCard, title: "Nepal Payments", description: "eSewa, Khalti, FonePay, Stripe. One integration, all providers." },
  { icon: Truck, title: "Pathao Shipping", description: "Auto-rates, label printing, real-time tracking. Built in." },
  { icon: Globe, title: "Visual Builder", description: "Drag-and-drop storefront editor. Custom domains. SSR." },
  { icon: Terminal, title: "API-First", description: "Server actions, REST routes, webhooks. Type-safe end to end." },
  { icon: Shield, title: "Multi-Tenant", description: "Row-level security. Tenant isolation on every query. Zero leakage." },
  { icon: BarChart3, title: "Analytics", description: "Revenue, orders, customers, inventory. Real-time dashboard." },
];

const PLANS = [
  { name: "Free", price: "₨0", period: "Forever", featured: false, features: ["25 products", "eSewa + COD", "Indigo subdomain", "Basic analytics"] },
  { name: "Growth", price: "₨2K", period: "/month", featured: true, features: ["Unlimited products", "All payments", "Custom domain", "Advanced analytics", "Discount codes", "Priority support"] },
  { name: "Pro", price: "₨6K", period: "/month", featured: false, features: ["Everything in Growth", "Multi-staff", "API access", "WhatsApp alerts", "Dedicated manager"] },
];

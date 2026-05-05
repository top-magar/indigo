import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, Truck, Globe, Zap, Shield, BarChart3, Check, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/torch/scroll-reveal";

export const metadata: Metadata = {
  title: "Indigo — The Commerce Infrastructure for Nepal",
  description: "Launch your online store in minutes. Accept eSewa, Khalti, Stripe. Ship via Pathao. Built for 12,000+ Nepali businesses.",
  openGraph: { title: "Indigo — The Commerce Infrastructure for Nepal", description: "Accept local payments. Ship anywhere. Grow your business.", type: "website" },
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#1a1a1a] antialiased overflow-x-hidden">
      {/* Soft rainbow gradient blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] pointer-events-none z-0 rounded-full opacity-40" style={{ background: "radial-gradient(circle, #fde68a 0%, transparent 70%)" }} />
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] pointer-events-none z-0 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #c4b5fd 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-10%] left-[30%] w-[600px] h-[600px] pointer-events-none z-0 rounded-full opacity-25" style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }} />
      <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] pointer-events-none z-0 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #fca5a5 0%, transparent 70%)" }} />

      {/* ═══ NAV — floating pill ═══ */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max">
        <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-orange-500" />
            <span className="text-[14px] font-semibold tracking-tight text-[#1a1a1a]">indigo</span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-[13px] text-[#1a1a1a]/50">
            <a href="#features" className="hover:text-[#1a1a1a] transition-colors duration-200">Features</a>
            <a href="#pricing" className="hover:text-[#1a1a1a] transition-colors duration-200">Pricing</a>
            <a href="#faq" className="hover:text-[#1a1a1a] transition-colors duration-200">FAQ</a>
          </div>
          <Link href="/auth/signup" className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a1a] text-[#1a1a1a] text-[13px] font-medium hover:bg-[#333] active:scale-[0.98] transition-all duration-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative z-10 pt-36 pb-24 px-6">
        <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-center">
          {/* Left — text */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 mb-8">
              <div className="size-1.5 rounded-full bg-orange-500" />
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-orange-700">12,000+ stores live</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(40px,6vw,68px)] font-bold leading-[0.95] tracking-[-0.03em] mb-6 text-[#1a1a1a]">
              Commerce<br/>infrastructure<br/>for{" "}
              <span className="bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 to-violet-500 bg-clip-text text-transparent">Nepal.</span>
            </h1>

            {/* Sub */}
            <p className="text-[16px] text-[#1a1a1a]/50 max-w-[440px] leading-[1.7] mb-10">
              Accept eSewa, Khalti, Stripe. Ship via Pathao. Visual storefront builder. Multi-tenant from day one.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link href="/auth/signup" className="group flex items-center gap-2 pl-6 pr-2 py-2.5 rounded-full bg-[#1a1a1a] text-[#1a1a1a] text-[14px] font-medium hover:bg-[#333] active:scale-[0.98] transition-all duration-200">
                Start building
                <span className="flex items-center justify-center size-7 rounded-full bg-black/5 group-hover:translate-x-0.5 transition-transform duration-200">
                  <ArrowRight size={14} />
                </span>
              </Link>
              <Link href="#features" className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#1a1a1a]/10 text-[14px] text-[#1a1a1a]/60 hover:border-[#1a1a1a]/20 hover:text-[#1a1a1a] transition-all duration-200">
                See how it works
              </Link>
            </div>
          </div>

          {/* Right — terminal */}
          <div className="p-[1px] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)]" style={{ background: "linear-gradient(135deg, #fde68a, #c4b5fd, #a7f3d0)" }}>
            <div className="rounded-[calc(1rem-1px)] bg-white overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-black/[0.04]">
                <div className="size-[7px] rounded-full bg-rose-400" />
                <div className="size-[7px] rounded-full bg-amber-400" />
                <div className="size-[7px] rounded-full bg-emerald-400" />
                <span className="ml-3 font-mono text-[11px] text-[#1a1a1a]/30">terminal</span>
              </div>
              <div className="p-5 font-mono text-[13px] leading-[1.8] text-left">
                <p className="text-[#1a1a1a]/40">$ npx create-indigo-store</p>
                <p className="text-emerald-600 mt-1">✓ Store created → dhaka-threads.indigo.shop</p>
                <p className="text-violet-600">✓ eSewa payment connected</p>
                <p className="text-amber-600">✓ 3 products imported from CSV</p>
                <p className="text-rose-600">✓ Storefront live</p>
                <p className="text-[#1a1a1a]/40 mt-3">$ <span className="inline-block w-[7px] h-[14px] bg-[#1a1a1a]/30 animate-pulse" /></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="relative z-10 py-12 border-y border-black/[0.04]">
        <div className="max-w-[1120px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-[28px] font-semibold tracking-tight">{s.value}</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/30 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES — 1px gap grid ═══ */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-[1120px] mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 mb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-violet-700">Core modules</span>
              </div>
              <h2 className="text-[clamp(28px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em]">Built for production.</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden bg-black/[0.03]">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title}>
                <div className={`bg-white p-8 h-full hover:bg-[#FAFAFA] transition-colors duration-200 ${i === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}>
                  <div className={`flex items-center justify-center size-10 rounded-xl mb-4 ${f.color.split(" ")[1]}`}>
                    <f.icon size={18} strokeWidth={1.5} className={f.color.split(" ")[0]} />
                  </div>
                  <h3 className={`font-semibold tracking-[-0.01em] mb-2 ${i === 0 ? "text-[24px]" : "text-[18px]"}`}>{f.title}</h3>
                  <p className={`text-[#1a1a1a]/40 leading-[1.6] ${i === 0 ? "text-[16px] max-w-[400px]" : "text-[14px]"}`}>{f.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CODE SECTION ═══ */}
      <section className="relative z-10 py-24 px-6 border-t border-black/[0.04]">
        <div className="max-w-[1120px] mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] bg-black/[0.02] mb-4">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/50">Developer experience</span>
                </div>
                <h2 className="text-[clamp(28px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em] mb-4">
                  API-first.<br/>Type-safe.<br/>Multi-tenant.
                </h2>
                <p className="text-[16px] text-[#1a1a1a]/40 leading-[1.6] mb-6 max-w-[400px]">
                  Every query is tenant-scoped. Every action is type-checked. Every mutation is audited. Built on Next.js 16, Drizzle ORM, and Supabase.
                </p>
                <Link href="/auth/signup" className="inline-flex items-center gap-1.5 text-[14px] text-violet-600 hover:text-violet-600 transition-colors duration-200">
                  Read the docs <ChevronRight size={14} />
                </Link>
              </div>
              {/* Code block — double bezel */}
              <div className="p-[1px] rounded-2xl" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)" }}>
                <div className="rounded-[calc(1rem-1px)] bg-[#FAFAFA] overflow-hidden">
                  <div className="flex items-center px-4 py-2.5 border-b border-black/[0.06]">
                    <span className="font-mono text-[11px] text-[#1a1a1a]/20">src/app/dashboard/products/actions.ts</span>
                  </div>
                  <pre className="p-5 font-mono text-[13px] leading-[1.7] overflow-x-auto"><code className="text-[#1a1a1a]/50">{CODE_SAMPLE}</code></pre>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="relative z-10 py-24 px-6 border-t border-black/[0.04]">
        <div className="max-w-[960px] mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.08] bg-black/[0.02] mb-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/50">Pricing</span>
              </div>
              <h2 className="text-[clamp(28px,4vw,44px)] font-semibold leading-[1.1] tracking-[-0.02em]">Start free. Scale when ready.</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <ScrollReveal key={plan.name}>
                <div className={`relative rounded-2xl p-8 h-full flex flex-col ${plan.featured ? "" : "bg-[#FAFAFA] border border-black/[0.06]"}`}>
                  {plan.featured && (
                    <>
                      {/* Double bezel for featured */}
                      <div className="absolute inset-0 rounded-2xl p-[1px]" style={{ background: "linear-gradient(to bottom, rgba(16,185,129,0.3), transparent)" }}>
                        <div className="w-full h-full rounded-[calc(1rem-1px)] bg-[#FAFAFA]" />
                      </div>
                      <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-[#1a1a1a]/[0.1] border border-violet-200">
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-violet-600">Popular</span>
                      </div>
                    </>
                  )}
                  <div className="relative z-10 flex flex-col h-full">
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#1a1a1a]/30">{plan.name}</p>
                    <div className="text-[36px] font-semibold tracking-tight mt-2 mb-1">{plan.price}</div>
                    <p className="text-[13px] text-[#1a1a1a]/30 mb-6">{plan.period}</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(feat => (
                        <li key={feat} className="flex items-start gap-2.5 text-[14px] text-[#1a1a1a]/50">
                          <Check size={14} strokeWidth={2} className="text-emerald-500 mt-[3px] shrink-0" />{feat}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup" className={`block text-center py-3 rounded-full text-[14px] font-medium active:scale-[0.98] transition-all duration-200 ${plan.featured ? "bg-[#1a1a1a] text-[#1a1a1a] hover:bg-[#333]" : "border border-black/[0.08] text-[#1a1a1a]/60 hover:border-black/[0.15] hover:text-[#1a1a1a]"}`}>
                      Get Started
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="relative z-10 py-24 px-6 border-t border-black/[0.04]">
        <div className="max-w-[640px] mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-[clamp(28px,4vw,36px)] font-semibold tracking-[-0.02em]">Questions</h2>
            </div>
          </ScrollReveal>
          <div className="space-y-2">
            {FAQS.map(faq => (
              <ScrollReveal key={faq.q}>
                <details className="group rounded-xl border border-black/[0.06] bg-[#FAFAFA] open:border-violet-200 transition-colors duration-200">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-[15px] font-medium list-none">
                    {faq.q}
                    <span className="text-[#1a1a1a]/20 group-open:rotate-45 transition-transform duration-200 text-[18px]">+</span>
                  </summary>
                  <p className="px-6 pb-5 text-[14px] text-[#1a1a1a]/40 leading-[1.6]">{faq.a}</p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative z-10 py-24 px-6 border-t border-black/[0.04]">
        <div className="max-w-[1120px] mx-auto">
          <ScrollReveal>
            <div className="p-[1px] rounded-3xl" style={{ background: "linear-gradient(to bottom, rgba(251,113,133,0.3), rgba(251,191,36,0.2), rgba(139,92,246,0.3))" }}>
              <div className="rounded-[calc(1.5rem-1px)] bg-[#FAFAFA] py-20 px-8 text-center" style={{ boxShadow: "0 0 80px rgba(0,0,0,0.02)" }}>
                <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em] mb-4">Build your store tonight.</h2>
                <p className="text-[16px] text-[#1a1a1a]/40 mb-8 max-w-[400px] mx-auto">Join 12,000+ Nepali businesses. Free forever tier. Deploy in 2 minutes.</p>
                <Link href="/auth/signup" className="group inline-flex items-center gap-2 pl-6 pr-2 py-3 rounded-full bg-[#1a1a1a] text-[#1a1a1a] text-[14px] font-medium hover:bg-[#333] active:scale-[0.98] transition-all duration-200">
                  Start free today
                  <span className="flex items-center justify-center size-8 rounded-full bg-black/10 group-hover:translate-x-0.5 transition-transform duration-200">
                    <ArrowRight size={15} />
                  </span>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 py-8 px-6 border-t border-black/[0.04]">
        <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-[#1a1a1a]" />
            <span className="text-[14px] font-semibold tracking-tight">indigo</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-[#1a1a1a]/25">
            <Link href="/legal/privacy" className="hover:text-[#1a1a1a]/50 transition-colors duration-200">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-[#1a1a1a]/50 transition-colors duration-200">Terms</Link>
            <a href="https://github.com/top-magar/indigo" className="hover:text-[#1a1a1a]/50 transition-colors duration-200">GitHub</a>
          </div>
          <span className="text-[12px] text-[#1a1a1a]/15">© 2026 Indigo</span>
        </div>
      </footer>
    </div>
  );
}

// --- Data ---

const CODE_SAMPLE = `"use server";

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
}`;

const STATS = [
  { value: "12,000+", label: "Active stores" },
  { value: "₨ 50Cr+", label: "GMV processed" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 2s", label: "Avg load time" },
];

const FEATURES = [
  { icon: CreditCard, title: "Nepal Payments", description: "eSewa, Khalti, FonePay, and international cards via Stripe. One integration, all providers.", color: "text-rose-500 bg-rose-50" },
  { icon: Truck, title: "Pathao Shipping", description: "Auto-calculate rates, print labels, real-time tracking. Integrated from day one.", color: "text-amber-500 bg-amber-50" },
  { icon: Globe, title: "Visual Storefront", description: "Drag-and-drop page builder. Custom domains. Server-rendered for speed.", color: "text-emerald-500 bg-emerald-50" },
  { icon: Zap, title: "Launch in Minutes", description: "Sign up, add products, connect payments. Your store is live. No code required.", color: "text-sky-500 bg-sky-50" },
  { icon: Shield, title: "Multi-Tenant Security", description: "Row-level security on every query. Tenant isolation enforced at the database level.", color: "text-violet-500 bg-violet-50" },
  { icon: BarChart3, title: "Growth Analytics", description: "Revenue, orders, customers, inventory. Real-time dashboard with actionable insights.", color: "text-fuchsia-500 bg-fuchsia-50" },
];

const PLANS = [
  { name: "Free", price: "₨ 0", period: "Forever · no credit card", featured: false, features: ["25 products", "eSewa + COD payments", "Indigo subdomain", "Basic analytics", "Email support"] },
  { name: "Growth", price: "₨ 2,000", period: "per month", featured: true, features: ["Unlimited products", "All payment methods", "Custom domain + SSL", "Advanced analytics", "Discount codes", "Priority support"] },
  { name: "Pro", price: "₨ 6,000", period: "per month", featured: false, features: ["Everything in Growth", "Multi-staff accounts", "API access", "WhatsApp notifications", "Dedicated account manager"] },
];

const FAQS = [
  { q: "Do I need technical knowledge?", a: "No. Indigo is designed for non-technical users. If you can use Facebook, you can run a store on Indigo." },
  { q: "How do I accept payments?", a: "Connect your eSewa or Khalti merchant account in settings. Takes 2 minutes. We also support COD and international cards via Stripe." },
  { q: "Can I use my own domain?", a: "Yes. On the Growth plan and above, connect any custom domain with free SSL certificate." },
  { q: "Is there a transaction fee?", a: "Indigo charges zero transaction fees. You only pay the payment gateway's standard processing fee (eSewa: 1.5%, Khalti: 2%)." },
  { q: "Can I migrate from another platform?", a: "Yes. We support CSV import for products and customers. Our team helps with migration for free." },
];

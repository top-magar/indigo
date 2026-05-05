import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, Truck, Globe, Zap, Shield, BarChart3, ChevronRight, Star } from "lucide-react";
import { ScrollReveal } from "@/components/landing/torch/scroll-reveal";

export const metadata: Metadata = {
  title: "Indigo — Accept eSewa in 2 Minutes. Your Store is Live.",
  description: "The e-commerce platform built for Nepal. Accept eSewa, Khalti, Stripe. Ship via Pathao. 12,000+ stores trust Indigo. Start free today.",
  openGraph: { title: "Indigo — E-Commerce Infrastructure for Nepal", description: "Accept eSewa in 2 minutes. Your store is live.", type: "website" },
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div className="antialiased overflow-x-hidden">
      {/* ═══════════════════════════════════════════
          DARK HERO SECTION — technical credibility
          ═══════════════════════════════════════════ */}
      <div className="bg-[#050505] text-white relative">
        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 70%)" }} />

        {/* Nav */}
        <nav className="relative z-20 max-w-[1120px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-[15px] font-semibold tracking-tight">indigo</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-white/50">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-150">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors duration-150">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-[13px] text-white/50 hover:text-white transition-colors duration-150">Log in</Link>
            <Link href="/auth/signup" className="px-4 py-2 rounded-full bg-emerald-500 text-[#050505] text-[13px] font-medium hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150">
              Start free
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 max-w-[1120px] mx-auto px-6 pt-20 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-emerald-500/80 mb-5">E-commerce infrastructure for Nepal</p>
              <h1 className="text-[clamp(36px,5.5vw,60px)] font-bold leading-[1] tracking-[-0.03em] mb-5">
                Accept eSewa in<br/>2 minutes. Your<br/>store is <span className="text-emerald-400">live.</span>
              </h1>
              <p className="text-[16px] text-white/45 leading-[1.7] max-w-[420px] mb-8">
                The platform that makes selling online in Nepal actually work. Payments, shipping, storefront — all connected. No code required.
              </p>
              <div className="flex items-center gap-3 mb-10">
                <Link href="/auth/signup" className="group inline-flex items-center gap-2 pl-5 pr-2 py-2.5 rounded-full bg-emerald-500 text-[#050505] text-[14px] font-medium hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150">
                  Launch your store
                  <span className="flex items-center justify-center size-7 rounded-full bg-black/10 group-hover:translate-x-0.5 transition-transform duration-150"><ArrowRight size={14} /></span>
                </Link>
                <Link href="#how" className="px-5 py-2.5 rounded-full border border-white/10 text-[14px] text-white/60 hover:border-white/20 hover:text-white transition-all duration-150">
                  How it works
                </Link>
              </div>
              {/* Payment logos */}
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-white/30 uppercase tracking-wider">Accepts</span>
                <div className="flex items-center gap-3 text-[12px] font-medium text-white/60">
                  <span className="px-2.5 py-1 rounded bg-white/[0.06]">eSewa</span>
                  <span className="px-2.5 py-1 rounded bg-white/[0.06]">Khalti</span>
                  <span className="px-2.5 py-1 rounded bg-white/[0.06]">Stripe</span>
                  <span className="px-2.5 py-1 rounded bg-white/[0.06]">COD</span>
                </div>
              </div>
            </div>

            {/* Right — terminal */}
            <div className="p-[1px] rounded-xl" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))" }}>
              <div className="rounded-[11px] bg-[#0c0c0c] overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.05]">
                  <div className="size-[7px] rounded-full bg-[#ff5f57]" />
                  <div className="size-[7px] rounded-full bg-[#febc2e]" />
                  <div className="size-[7px] rounded-full bg-[#28c840]" />
                  <span className="ml-3 font-mono text-[10px] text-white/20">~/my-store</span>
                </div>
                <div className="p-5 font-mono text-[12px] leading-[2]">
                  <p className="text-white/30">$ indigo init --store &quot;Dhaka Threads&quot;</p>
                  <p className="text-emerald-400">✓ Store created at dhaka-threads.indigo.shop</p>
                  <p className="text-emerald-400">✓ eSewa merchant account linked</p>
                  <p className="text-emerald-400">✓ Pathao shipping enabled (Kathmandu Valley)</p>
                  <p className="text-emerald-400">✓ 12 products imported from CSV</p>
                  <p className="text-emerald-400">✓ Storefront live — accepting orders now</p>
                  <p className="text-white/30 mt-2">$ <span className="inline-block w-[6px] h-[13px] bg-emerald-400/70 animate-pulse" /></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          LIGHT BODY — merchant warmth & trust
          ═══════════════════════════════════════════ */}
      <div className="bg-white text-[#1a1a1a]">

        {/* Stats bar */}
        <section className="border-b border-black/[0.05] py-10">
          <div className="max-w-[1120px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-[26px] font-bold tracking-tight text-[#1a1a1a]">{s.value}</div>
                <div className="text-[12px] text-[#1a1a1a]/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20 px-6">
          <div className="max-w-[1120px] mx-auto">
            <ScrollReveal>
              <p className="text-[12px] font-medium uppercase tracking-wider text-emerald-600 mb-2">How it works</p>
              <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-[-0.02em] mb-12">Three steps. Two minutes. Done.</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => (
                <ScrollReveal key={step.title}>
                  <div className="relative">
                    <div className="text-[48px] font-bold text-black/[0.04] absolute -top-2 -left-1">{i + 1}</div>
                    <div className="relative pt-8">
                      <h3 className="text-[17px] font-semibold mb-2">{step.title}</h3>
                      <p className="text-[14px] text-[#1a1a1a]/50 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6 bg-[#FAFAFA]">
          <div className="max-w-[1120px] mx-auto">
            <ScrollReveal>
              <p className="text-[12px] font-medium uppercase tracking-wider text-emerald-600 mb-2">Features</p>
              <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-[-0.02em] mb-12">Everything you need. Nothing you don&apos;t.</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(f => (
                <ScrollReveal key={f.title}>
                  <div className="bg-white rounded-xl p-6 border border-black/[0.04] hover:border-black/[0.08] hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-150">
                    <div className={`inline-flex items-center justify-center size-9 rounded-lg mb-3 ${f.bg}`}>
                      <f.icon size={17} strokeWidth={1.5} className={f.color} />
                    </div>
                    <h3 className="text-[15px] font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-[13px] text-[#1a1a1a]/45 leading-relaxed">{f.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 px-6">
          <div className="max-w-[640px] mx-auto text-center">
            <ScrollReveal>
              <div className="flex items-center justify-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
              </div>
              <blockquote className="text-[18px] font-medium leading-[1.6] tracking-[-0.01em] mb-4">
                &ldquo;We moved from Instagram DMs to Indigo in one afternoon. Our Dashain sales were 4x last year because customers could actually pay with eSewa directly.&rdquo;
              </blockquote>
              <p className="text-[13px] text-[#1a1a1a]/40">Srijana Maharjan · Founder, Dhaka Threads · Patan</p>
            </ScrollReveal>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-6 bg-[#FAFAFA]">
          <div className="max-w-[960px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-12">
                <p className="text-[12px] font-medium uppercase tracking-wider text-emerald-600 mb-2">Pricing</p>
                <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-[-0.02em]">Start free. Upgrade when you&apos;re ready.</h2>
                <p className="text-[14px] text-[#1a1a1a]/45 mt-2">No credit card required. No transaction fees from Indigo.</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map(plan => (
                <ScrollReveal key={plan.name}>
                  <div className={`rounded-xl p-7 h-full flex flex-col ${plan.featured ? "bg-[#050505] text-white ring-1 ring-emerald-500/20" : "bg-white border border-black/[0.06]"}`}>
                    {plan.featured && <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400 mb-2">Most popular</span>}
                    <p className={`text-[13px] font-medium ${plan.featured ? "text-white/60" : "text-[#1a1a1a]/50"}`}>{plan.name}</p>
                    <div className="flex items-baseline gap-1 mt-1 mb-1">
                      <span className="text-[32px] font-bold tracking-tight">{plan.price}</span>
                      {plan.period && <span className={`text-[13px] ${plan.featured ? "text-white/40" : "text-[#1a1a1a]/30"}`}>{plan.period}</span>}
                    </div>
                    <p className={`text-[13px] mb-5 ${plan.featured ? "text-white/40" : "text-[#1a1a1a]/40"}`}>{plan.desc}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map(feat => (
                        <li key={feat} className={`flex items-start gap-2 text-[13px] ${plan.featured ? "text-white/70" : "text-[#1a1a1a]/60"}`}>
                          <Check size={14} strokeWidth={2.5} className={`mt-[2px] shrink-0 ${plan.featured ? "text-emerald-400" : "text-emerald-500"}`} />{feat}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/signup" className={`block text-center py-2.5 rounded-full text-[13px] font-medium active:scale-[0.98] transition-all duration-150 ${plan.featured ? "bg-emerald-500 text-[#050505] hover:bg-emerald-400" : "bg-[#1a1a1a] text-white hover:bg-[#333]"}`}>
                      Get started
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-6">
          <div className="max-w-[640px] mx-auto">
            <ScrollReveal>
              <h2 className="text-[clamp(26px,4vw,36px)] font-bold tracking-[-0.02em] text-center mb-10">Common questions</h2>
            </ScrollReveal>
            <div className="space-y-2">
              {FAQS.map(faq => (
                <ScrollReveal key={faq.q}>
                  <details className="group rounded-lg border border-black/[0.06] open:border-emerald-500/30 transition-colors duration-150">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-[14px] font-medium list-none select-none">
                      {faq.q}
                      <span className="text-[#1a1a1a]/20 group-open:rotate-45 transition-transform duration-150 text-lg leading-none">+</span>
                    </summary>
                    <p className="px-5 pb-4 text-[13px] text-[#1a1a1a]/50 leading-relaxed">{faq.a}</p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-[#050505] text-white text-center">
          <ScrollReveal>
            <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-[-0.02em] mb-3">Ready to sell?</h2>
            <p className="text-[15px] text-white/45 mb-8 max-w-[380px] mx-auto">Join 12,000+ Nepali businesses. Free forever. Live in 2 minutes.</p>
            <Link href="/auth/signup" className="group inline-flex items-center gap-2 pl-6 pr-2 py-3 rounded-full bg-emerald-500 text-[#050505] text-[14px] font-medium hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150">
              Start free today
              <span className="flex items-center justify-center size-8 rounded-full bg-black/10 group-hover:translate-x-0.5 transition-transform duration-150"><ArrowRight size={15} /></span>
            </Link>
          </ScrollReveal>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-black/[0.05]">
          <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-[14px] font-semibold tracking-tight">indigo</span>
            </div>
            <div className="flex items-center gap-5 text-[12px] text-[#1a1a1a]/30">
              <Link href="/legal/privacy" className="hover:text-[#1a1a1a]/60 transition-colors">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-[#1a1a1a]/60 transition-colors">Terms</Link>
              <a href="mailto:hello@indigo.com.np" className="hover:text-[#1a1a1a]/60 transition-colors">Contact</a>
            </div>
            <span className="text-[11px] text-[#1a1a1a]/20">© 2026 Indigo. Built in Nepal.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- Data ---

const STATS = [
  { value: "12,000+", label: "Active stores" },
  { value: "₨ 50 Cr+", label: "GMV processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2 min", label: "Time to launch" },
];

const STEPS = [
  { title: "Sign up & name your store", description: "Pick a name, choose your .indigo.shop subdomain. Takes 30 seconds." },
  { title: "Connect eSewa or Khalti", description: "Paste your merchant ID. We verify instantly. Start accepting payments today." },
  { title: "Add products & go live", description: "Upload from CSV or add manually. Your storefront is live and accepting orders." },
];

const FEATURES = [
  { icon: CreditCard, title: "Nepal Payments", description: "eSewa, Khalti, FonePay, and Stripe. One dashboard for all providers.", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Truck, title: "Pathao Shipping", description: "Auto-calculate rates for Kathmandu Valley. Print labels. Track deliveries.", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Globe, title: "Visual Storefront", description: "Drag-and-drop page builder. Custom domain. Mobile-first. No code.", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Zap, title: "Instant Setup", description: "Sign up to first sale in under 5 minutes. CSV import for bulk products.", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: Shield, title: "Secure & Isolated", description: "Your data is yours. Bank-grade encryption. Multi-tenant isolation.", color: "text-rose-600", bg: "bg-rose-50" },
  { icon: BarChart3, title: "Growth Dashboard", description: "Revenue, orders, customers, inventory alerts. Know your numbers.", color: "text-teal-600", bg: "bg-teal-50" },
];

const PLANS = [
  { name: "Free", price: "₨ 0", period: "/forever", desc: "For getting started", featured: false, features: ["25 products", "eSewa + COD", "Indigo subdomain", "Basic analytics", "Email support"] },
  { name: "Growth", price: "₨ 2,000", period: "/mo", desc: "For growing businesses", featured: true, features: ["Unlimited products", "All payment methods", "Custom domain + SSL", "Advanced analytics", "Discount codes", "Priority support"] },
  { name: "Pro", price: "₨ 6,000", period: "/mo", desc: "For serious sellers", featured: false, features: ["Everything in Growth", "Multi-staff accounts", "API access", "WhatsApp notifications", "Dedicated manager"] },
];

const FAQS = [
  { q: "Do I need technical knowledge?", a: "No. If you can use Facebook, you can run a store on Indigo. No coding, no design skills needed." },
  { q: "How fast can I start accepting payments?", a: "Under 2 minutes. Connect your eSewa or Khalti merchant account, and you're live. We verify instantly." },
  { q: "What does Indigo charge?", a: "Zero transaction fees from us. You only pay the payment gateway's standard rate (eSewa: 1.5%, Khalti: 2%). Plans start at free forever." },
  { q: "Can I use my own domain?", a: "Yes. On Growth plan and above, connect any .com.np or custom domain with free SSL certificate." },
  { q: "Can I migrate from Instagram/Facebook selling?", a: "Yes. Import your product catalog via CSV. We also help migrate your customer list for free." },
];

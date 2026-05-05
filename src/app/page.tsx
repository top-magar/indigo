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
          HERO — warm gradient, vibrant, appealing
          ═══════════════════════════════════════════ */}
      <div className="relative min-h-[90vh] flex flex-col overflow-hidden animate-[gradientShift_8s_ease_infinite]" style={{ backgroundSize: "200% 200%", backgroundImage: "linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c, #667eea)" }}>
        {/* Soft overlay shapes */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white/10 blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-300/10 blur-[60px]" />

        {/* Nav */}
        <nav className="relative z-20 max-w-[1120px] mx-auto w-full px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2.5 rounded-full bg-white" />
            <span className="text-[16px] font-bold tracking-tight text-white">indigo</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-white/70">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-150">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors duration-150">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-[13px] text-white/70 hover:text-white transition-colors duration-150">Log in</Link>
            <Link href="/auth/signup" className="px-4 py-2 rounded-full bg-white text-[#1a1a1a] text-[13px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/10">
              Start free
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-[1120px] mx-auto px-6 w-full text-center py-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-8">
              <span className="size-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[12px] font-medium text-white">12,000+ stores already selling</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(38px,6vw,64px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white mb-5 max-w-[700px] mx-auto">
              Your online store in Nepal,{" "}
              <span className="underline decoration-yellow-300 decoration-4 underline-offset-4">ready today.</span>
            </h1>

            {/* Sub */}
            <p className="text-[17px] text-white/80 max-w-[500px] mx-auto leading-[1.7] mb-10">
              Accept eSewa & Khalti. Ship via Pathao. Beautiful storefront. Zero coding. Start selling in 2 minutes.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Link href="/auth/signup" className="group inline-flex items-center gap-2 pl-6 pr-2.5 py-3 rounded-full bg-white text-[#1a1a1a] text-[15px] font-semibold hover:bg-white/95 active:scale-[0.98] transition-all duration-150 shadow-xl shadow-black/10">
                Launch your store
                <span className="flex items-center justify-center size-8 rounded-full bg-[#1a1a1a]/5 group-hover:bg-[#1a1a1a]/10 group-hover:translate-x-0.5 transition-all duration-150"><ArrowRight size={15} /></span>
              </Link>
              <Link href="#how" className="px-6 py-3 rounded-full border-2 border-white/30 text-[15px] font-medium text-white hover:bg-white/10 hover:border-white/50 transition-all duration-150">
                See how it works
              </Link>
            </div>

            {/* Payment badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap mb-14">
              {["eSewa", "Khalti", "Stripe", "COD", "Pathao"].map(name => (
                <span key={name} className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[12px] font-medium text-white">{name}</span>
              ))}
            </div>

            {/* Product mockup — browser frame with real screenshot */}
            <div className="max-w-[680px] mx-auto">
              <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-white/10">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1a1a]/80 backdrop-blur-sm">
                  <div className="size-[8px] rounded-full bg-[#ff5f57]" />
                  <div className="size-[8px] rounded-full bg-[#febc2e]" />
                  <div className="size-[8px] rounded-full bg-[#28c840]" />
                  <div className="ml-3 flex-1 h-5 rounded bg-white/10 flex items-center px-2">
                    <span className="text-[10px] text-white/40">indigo.com.np/dashboard</span>
                  </div>
                </div>
                {/* Actual screenshot */}
                <img src="/dashboard-preview.png" alt="Indigo dashboard showing orders, revenue, and products" className="w-full h-auto block" />
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="flex -space-x-2">
                {["bg-rose-400", "bg-violet-400", "bg-emerald-400", "bg-amber-400"].map((c, i) => (
                  <div key={i} className={`size-7 rounded-full ${c} border-2 border-white/30 flex items-center justify-center text-[9px] font-bold text-white`}>
                    {["S", "B", "A", "R"][i]}
                  </div>
                ))}
              </div>
              <div className="text-[12px] text-white/80">
                <span className="font-semibold">★ 4.8/5</span>
                <span className="text-white/50 ml-1">from 200+ merchants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative z-10">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full h-auto block" preserveAspectRatio="none">
            <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          LIGHT BODY — merchant warmth & trust
          ═══════════════════════════════════════════ */}
      <div className="bg-white text-[#1a1a1a]">

        {/* Stats bar */}
        <section className="py-8 bg-gradient-to-b from-white to-[#f8f7ff]">
          <div className="max-w-[1120px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-[30px] font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-[12px] text-[#1a1a1a]/40 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-16 px-6 bg-[#f8f7ff]">
          <div className="max-w-[1120px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[11px] font-semibold uppercase tracking-wider mb-3">How it works</span>
                <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-[-0.02em]">Three steps. Two minutes. Done.</h2>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <ScrollReveal key={step.title}>
                  <div className="relative bg-white rounded-2xl p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_40px_rgba(102,126,234,0.1)] transition-shadow duration-300">
                    <div className="inline-flex items-center justify-center size-10 rounded-xl mb-4 font-extrabold text-[18px] text-white" style={{ background: ["linear-gradient(135deg, #667eea, #764ba2)", "linear-gradient(135deg, #f093fb, #f5576c)", "linear-gradient(135deg, #f5576c, #fbb03b)"][i] }}>
                      {i + 1}
                    </div>
                    <h3 className="text-[17px] font-bold mb-2">{step.title}</h3>
                    <p className="text-[14px] text-[#1a1a1a]/50 leading-relaxed">{step.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 px-6">
          <div className="max-w-[1120px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-8">
                <span className="inline-block px-3 py-1 rounded-full bg-fuchsia-100 text-fuchsia-700 text-[11px] font-semibold uppercase tracking-wider mb-3">Features</span>
                <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-[-0.02em]">Everything you need. Nothing you don&apos;t.</h2>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(f => (
                <ScrollReveal key={f.title}>
                  <div className="group bg-white rounded-2xl p-7 border border-black/[0.04] hover:border-transparent hover:shadow-[0_8px_40px_rgba(102,126,234,0.1)] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-y-1/2 translate-x-1/2" style={{ background: f.glow }} />
                    <div className={`relative inline-flex items-center justify-center size-11 rounded-xl mb-4 ${f.bg}`}>
                      <f.icon size={20} strokeWidth={1.5} className={f.color} />
                    </div>
                    <h3 className="relative text-[16px] font-bold mb-2">{f.title}</h3>
                    <p className="relative text-[14px] text-[#1a1a1a]/45 leading-relaxed">{f.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-12 px-6">
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
        <section id="pricing" className="py-16 px-6">
          <div className="max-w-[960px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-8">
                <p className="text-[12px] font-medium uppercase tracking-wider text-violet-600 mb-2">Pricing</p>
                <h2 className="text-[clamp(26px,4vw,40px)] font-bold tracking-[-0.02em]">Start free. Upgrade when you&apos;re ready.</h2>
                <p className="text-[14px] text-[#1a1a1a]/45 mt-2">No credit card required. No transaction fees from Indigo.</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map(plan => (
                <ScrollReveal key={plan.name}>
                  <div className={`rounded-xl p-7 h-full flex flex-col ${plan.featured ? "text-white ring-2 ring-white/20 shadow-xl" : "bg-white border border-black/[0.06]"}`} style={plan.featured ? { background: "linear-gradient(135deg, #667eea, #764ba2)" } : undefined}>
                    {plan.featured && <span className="text-[10px] font-medium uppercase tracking-wider text-white/80 mb-2">Most popular</span>}
                    <p className={`text-[13px] font-medium ${plan.featured ? "text-white/70" : "text-[#1a1a1a]/50"}`}>{plan.name}</p>
                    <div className="flex items-baseline gap-1 mt-1 mb-1">
                      <span className="text-[32px] font-bold tracking-tight">{plan.price}</span>
                      {plan.period && <span className={`text-[13px] ${plan.featured ? "text-white/40" : "text-[#1a1a1a]/30"}`}>{plan.period}</span>}
                    </div>
                    <p className={`text-[13px] mb-5 ${plan.featured ? "text-white/40" : "text-[#1a1a1a]/40"}`}>{plan.desc}</p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map(feat => (
                        <li key={feat} className={`flex items-start gap-2 text-[13px] ${plan.featured ? "text-white/70" : "text-[#1a1a1a]/60"}`}>
                          <Check size={14} strokeWidth={2.5} className={`mt-[2px] shrink-0 ${plan.featured ? "text-white/80" : "text-violet-500"}`} />{feat}
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
        <section id="faq" className="py-12 px-6">
          <div className="max-w-[640px] mx-auto">
            <ScrollReveal>
              <h2 className="text-[clamp(26px,4vw,36px)] font-bold tracking-[-0.02em] text-center mb-10">Common questions</h2>
            </ScrollReveal>
            <div className="space-y-2">
              {FAQS.map(faq => (
                <ScrollReveal key={faq.q}>
                  <details className="group rounded-lg border border-black/[0.06] open:border-violet-400/30 transition-colors duration-150">
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
        <section className="py-16 px-6 text-center text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" }}>
          <div className="absolute inset-0 bg-black/5" />
          <ScrollReveal>
            <div className="relative z-10">
              <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-[-0.02em] mb-3">Ready to sell?</h2>
              <p className="text-[15px] text-white/80 mb-8 max-w-[380px] mx-auto">Join 12,000+ Nepali businesses. Free forever. Live in 2 minutes.</p>
              <Link href="/auth/signup" className="group inline-flex items-center gap-2 pl-6 pr-2.5 py-3 rounded-full bg-white text-[#1a1a1a] text-[15px] font-semibold hover:bg-white/95 active:scale-[0.98] transition-all duration-150 shadow-xl shadow-black/10">
                Start free today
                <span className="flex items-center justify-center size-8 rounded-full bg-[#1a1a1a]/5 group-hover:translate-x-0.5 transition-transform duration-150"><ArrowRight size={15} /></span>
              </Link>
            </div>
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

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}} />
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
  { icon: CreditCard, title: "Nepal Payments", description: "eSewa, Khalti, FonePay, and Stripe. One dashboard for all providers.", color: "text-emerald-600", bg: "bg-emerald-50", glow: "radial-gradient(circle,rgba(16,185,129,0.12),transparent)" },
  { icon: Truck, title: "Pathao Shipping", description: "Auto-calculate rates for Kathmandu Valley. Print labels. Track deliveries.", color: "text-blue-600", bg: "bg-blue-50", glow: "radial-gradient(circle,rgba(59,130,246,0.12),transparent)" },
  { icon: Globe, title: "Visual Storefront", description: "Drag-and-drop page builder. Custom domain. Mobile-first. No code.", color: "text-violet-600", bg: "bg-violet-50", glow: "radial-gradient(circle,rgba(139,92,246,0.12),transparent)" },
  { icon: Zap, title: "Instant Setup", description: "Sign up to first sale in under 5 minutes. CSV import for bulk products.", color: "text-amber-600", bg: "bg-amber-50", glow: "radial-gradient(circle,rgba(245,158,11,0.12),transparent)" },
  { icon: Shield, title: "Secure & Isolated", description: "Your data is yours. Bank-grade encryption. Multi-tenant isolation.", color: "text-rose-600", bg: "bg-rose-50", glow: "radial-gradient(circle,rgba(244,63,94,0.12),transparent)" },
  { icon: BarChart3, title: "Growth Dashboard", description: "Revenue, orders, customers, inventory alerts. Know your numbers.", color: "text-teal-600", bg: "bg-teal-50", glow: "radial-gradient(circle,rgba(20,184,166,0.12),transparent)" },
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

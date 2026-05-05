import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Check, Zap, Shield, Globe, CreditCard, Truck, BarChart3 } from "lucide-react";

const ParticleField = dynamic(
  () => import("@/components/landing/torch/particle-field").then(m => ({ default: m.ParticleField })),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Indigo — Launch Your Online Store in Nepal | E-Commerce Platform",
  description: "Launch your online store in minutes. Accept eSewa, Khalti payments. Ship via Pathao. Built for 12,000+ Nepali businesses. Start free today.",
  keywords: ["ecommerce Nepal", "online store Nepal", "eSewa payment gateway", "Khalti integration", "sell online Nepal"],
  openGraph: { title: "Indigo — Launch Your Online Store in Nepal", description: "The all-in-one e-commerce platform built for Nepal.", type: "website" },
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Indigo",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "AggregateOffer", priceCurrency: "NPR", lowPrice: "0", highPrice: "6000", offerCount: "3" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white font-mono selection:bg-[#FFD600] selection:text-[#121212]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 backdrop-blur-[12px] bg-[#121212]/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[#FFD600] font-extrabold text-lg tracking-tight">INDIGO</Link>
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.1em] text-white/70">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors duration-150">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors duration-150">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-xs uppercase tracking-[0.1em] text-white/70 hover:text-white transition-colors duration-150">Login</Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#FFD600] text-[#121212] text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150">
              Start Free <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        <ParticleField />
        {/* Glass card */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-block mb-6 px-3 py-1 rounded-full border border-[#FFD600]/30 bg-[#FFD600]/5 text-[#FFD600] text-[10px] uppercase tracking-[0.15em] font-medium">
            Built for Nepal · 12,000+ Stores
          </div>
          <h1 className="text-[clamp(36px,8vw,60px)] font-extrabold leading-[1] tracking-[-0.025em] mb-6">
            Your store,<br />
            <span className="text-[#FFD600]">live in minutes.</span>
          </h1>
          <p className="text-sm text-white/60 max-w-md mx-auto mb-10 leading-relaxed tracking-[0.02em]">
            The e-commerce platform that speaks Nepali. Accept eSewa & Khalti. Ship via Pathao. No code required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-[4px] bg-[#FFD600] text-[#121212] text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150 shadow-[0_0_30px_rgba(255,214,0,0.2)]">
              Launch Your Store <ArrowRight className="size-3.5" />
            </Link>
            <Link href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-[4px] border border-white/20 text-xs uppercase tracking-[0.1em] text-white/80 hover:border-white/40 hover:text-white transition-colors duration-150">
              See How It Works
            </Link>
          </div>
        </div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#121212] to-transparent" />
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFD600] mb-3">Capabilities</p>
            <h2 className="text-[clamp(28px,5vw,48px)] font-extrabold tracking-[-0.025em]">Everything you need to sell online</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="group relative p-6 rounded-[12px] border border-white/10 bg-white/[0.02] backdrop-blur-[4px] hover:border-[#FFD600]/30 hover:bg-white/[0.04] transition-all duration-150">
                <div className="size-10 rounded-[8px] bg-[#FFD600]/10 flex items-center justify-center mb-4 group-hover:bg-[#FFD600]/20 transition-colors duration-150">
                  <f.icon className="size-5 text-[#FFD600]" />
                </div>
                <h3 className="text-sm font-bold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-extrabold text-[#FFD600] tracking-tight">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFD600] mb-3">Pricing</p>
            <h2 className="text-[clamp(28px,5vw,48px)] font-extrabold tracking-[-0.025em]">Start free, scale when ready</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative p-8 rounded-[12px] border ${plan.featured ? "border-[#FFD600]/50 bg-[#FFD600]/[0.03]" : "border-white/10 bg-white/[0.02]"}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FFD600] text-[#121212] text-[9px] font-bold uppercase tracking-[0.1em]">Popular</div>
                )}
                <h3 className="text-sm font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="text-xs text-white/40">{plan.period}</span>}
                </div>
                <p className="text-xs text-white/50 mb-6">{plan.description}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/70">
                      <Check className="size-3.5 text-[#FFD600] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center px-4 py-2.5 rounded-[4px] text-xs font-bold uppercase tracking-[0.1em] transition-colors duration-150 ${plan.featured ? "bg-[#FFD600] text-[#121212] hover:bg-[#FFD600]/90" : "border border-white/20 text-white/80 hover:border-white/40"}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFD600] mb-3">FAQ</p>
            <h2 className="text-[clamp(28px,5vw,36px)] font-extrabold tracking-[-0.025em]">Common questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group p-4 rounded-[8px] border border-white/10 bg-white/[0.02] open:border-[#FFD600]/20">
                <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-white/30 group-open:rotate-45 transition-transform duration-150 text-lg">+</span>
                </summary>
                <p className="mt-3 text-xs text-white/50 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[clamp(28px,5vw,48px)] font-extrabold tracking-[-0.025em] mb-4">
            Ready to sell<span className="text-[#FFD600]">?</span>
          </h2>
          <p className="text-sm text-white/50 mb-8 max-w-md mx-auto">Join 12,000+ Nepali businesses already growing with Indigo. No credit card required.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-8 py-4 rounded-[4px] bg-[#FFD600] text-[#121212] text-xs font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150 shadow-[0_0_30px_rgba(255,214,0,0.2)]">
            Start Free Today <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[#FFD600] font-extrabold text-lg tracking-tight">INDIGO</div>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.1em] text-white/40">
            <Link href="/legal/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <a href="mailto:hello@indigo.com.np" className="hover:text-white/70 transition-colors">Contact</a>
          </div>
          <p className="text-[10px] text-white/30">© 2026 Indigo. Built for Nepal.</p>
        </div>
      </footer>
    </div>
  );
}

// --- Data ---

const FEATURES = [
  { icon: CreditCard, title: "Nepal Payments", description: "Accept eSewa, Khalti, FonePay and international cards via Stripe. All in one dashboard." },
  { icon: Truck, title: "Pathao Delivery", description: "Integrated shipping with Pathao. Auto-calculate rates, print labels, track packages." },
  { icon: Globe, title: "Custom Storefront", description: "Drag-and-drop page builder. Custom domains. Mobile-first themes that convert." },
  { icon: Zap, title: "Launch in Minutes", description: "No code required. Sign up, add products, connect payments. You're live." },
  { icon: Shield, title: "Secure & Reliable", description: "Bank-grade security. 99.9% uptime. Your data stays in your control." },
  { icon: BarChart3, title: "Growth Analytics", description: "Revenue charts, customer insights, inventory alerts. Know your numbers." },
];

const STATS = [
  { value: "12,000+", label: "Active Stores" },
  { value: "₨ 50Cr+", label: "GMV Processed" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2s", label: "Page Load" },
];

const PLANS = [
  {
    name: "Free",
    price: "₨ 0",
    period: "/forever",
    description: "Perfect for getting started",
    featured: false,
    features: ["25 products", "eSewa + COD", "Indigo subdomain", "Basic analytics", "Email support"],
  },
  {
    name: "Growth",
    price: "₨ 2,000",
    period: "/month",
    description: "For growing businesses",
    featured: true,
    features: ["Unlimited products", "All payment methods", "Custom domain", "Advanced analytics", "Priority support", "Discount codes"],
  },
  {
    name: "Pro",
    price: "₨ 6,000",
    period: "/month",
    description: "For serious sellers",
    featured: false,
    features: ["Everything in Growth", "Multi-staff accounts", "API access", "WhatsApp notifications", "Dedicated account manager"],
  },
];

const FAQS = [
  { q: "Do I need technical knowledge?", a: "No. Indigo is designed for non-technical users. If you can use Facebook, you can run a store on Indigo." },
  { q: "How do I accept payments?", a: "Connect your eSewa or Khalti merchant account in settings. We also support COD and international cards via Stripe." },
  { q: "Can I use my own domain?", a: "Yes. On the Growth plan and above, you can connect any custom domain with free SSL." },
  { q: "Is there a transaction fee?", a: "Indigo charges no transaction fees. You only pay the payment gateway's standard processing fee." },
  { q: "Can I migrate from another platform?", a: "Yes. We support CSV import for products and customers. Our team can help with migration." },
];

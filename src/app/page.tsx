import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, Truck, Globe, Zap, Shield, BarChart3, Star, Users, Layers, TrendingUp } from "lucide-react";
import { ScrollReveal } from "@/components/landing/torch/scroll-reveal";
import "./landing.css";

export const metadata: Metadata = {
  title: "Indigo — Nepal's E-Commerce Platform | Accept eSewa in 2 Minutes",
  description: "Launch your online store in Nepal. Accept eSewa, Khalti, Stripe. Ship via Pathao. 12,000+ stores trust Indigo.",
  openGraph: { title: "Indigo — Nepal's E-Commerce Platform", description: "Accept eSewa in 2 minutes. Your store is live." },
  alternates: { canonical: "/" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]" style={{ fontFamily: "'Archivo', sans-serif" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap" />

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf1ff] to-white">
        {/* Nav */}
        <nav className="relative z-20 max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 py-5 flex items-center justify-between">
          <span className="text-[18px] font-bold tracking-tight">indigo</span>
          <div className="hidden md:flex items-center gap-6 text-[14px] text-[#3d3d3d]">
            <a href="#features" className="hover:text-[#0454ff] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#0454ff] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#0454ff] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-[14px] text-[#6d6d6d] hover:text-[#1a1a1a] transition-colors">Log in</Link>
            <Link href="/auth/signup" className="px-5 py-2.5 rounded-full bg-[#0454ff] text-white text-[14px] font-medium hover:bg-[#0340cc] transition-colors">Get Started</Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 lg:px-20 pt-10 md:pt-16 lg:pt-[84px] pb-1 text-center">
          <div className="flex flex-col items-center gap-6">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0454ff] text-white text-[13px] font-normal">
              <Zap size={14} /> Nepal&apos;s #1 E-Commerce Platform
            </span>
            {/* H1 */}
            <h1 className="text-[36px] md:text-[48px] lg:text-[64px] font-semibold leading-[110%] tracking-[-0.04em] max-w-[800px]">
              Launch Your Online Store in Nepal Today.
            </h1>
            {/* Description */}
            <p className="text-[16px] text-[#6d6d6d] leading-[140%] tracking-[-0.2px] max-w-[630px] w-full md:w-[70%] lg:w-[44%]">
              Accept eSewa, Khalti & Stripe payments. Ship via Pathao. Beautiful storefront builder. No code required. Live in 2 minutes.
            </p>
            {/* CTA form */}
            <div className="relative w-full max-w-[360px]">
              <input type="email" placeholder="Enter your email" className="w-full px-4 py-3.5 pr-[130px] rounded-full border border-[#eaeaea] bg-white text-[14px] outline-none focus:border-[#0454ff] transition-colors" />
              <Link href="/auth/signup" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full bg-[#0454ff] text-white text-[13px] font-medium hover:bg-[#0340cc] transition-colors">
                Get started
              </Link>
            </div>
          </div>
          {/* Dashboard image */}
          <div className="mt-12 flex justify-center">
            <img src="/dashboard-preview.png" alt="Indigo merchant dashboard" className="w-full max-w-[1440px] rounded-t-xl shadow-[0_20px_60px_rgba(0,0,0,0.1)]" style={{ aspectRatio: "2.057" }} />
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <section className="py-14 px-5 md:px-10 lg:px-[140px]">
        <div className="max-w-[1440px] mx-auto text-center">
          <p className="text-[16px] md:text-[18px] font-medium text-[#3d3d3d] tracking-[-0.2px] mb-10">
            Join 12,000+ Businesses Who Sell on Indigo
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-[marquee_20s_linear_infinite] gap-[86px] opacity-40">
              {[...Array(2)].map((_, set) => (
                <div key={set} className="flex shrink-0 gap-[86px]">
                  {["eSewa", "Khalti", "Pathao", "Stripe", "FonePay", "Daraz", "eSewa", "Khalti", "Pathao", "Stripe"].map((name, i) => (
                    <span key={`${set}-${i}`} className="text-[16px] font-semibold text-[#3d3d3d] tracking-tight whitespace-nowrap">{name}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — 2×2 grid ═══ */}
      <section id="features" className="py-16 px-5 md:px-10 lg:px-20">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-16">
          <ScrollReveal><SectionHeading tag="FEATURES" title="Smarter Tools to Grow Your Store" description="Everything you need to sell online in Nepal — payments, shipping, analytics, and more." /></ScrollReveal>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <ScrollReveal key={f.title}>
                <div className="rounded-xl border border-[#eaeaea] bg-white p-6 lg:p-8 h-full hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-shadow">
                  <div className={`inline-flex items-center justify-center size-10 rounded-lg mb-4 ${f.bg}`}>
                    <f.icon size={20} strokeWidth={1.5} className={f.color} />
                  </div>
                  <h3 className="text-[20px] md:text-[24px] font-semibold tracking-[-0.04em] leading-[110%] mb-2">{f.title}</h3>
                  <p className="text-[14px] md:text-[16px] text-[#6d6d6d] leading-[140%] tracking-[-0.2px]">{f.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-16 px-5 md:px-10 lg:px-20">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-16">
          <ScrollReveal><SectionHeading tag="PRICING PLANS" title="Flexible Pricing for Every Stage" description="Start free. Upgrade as you grow. No transaction fees from Indigo." /></ScrollReveal>
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <ScrollReveal key={plan.name}>
                <div className={`rounded-xl p-6 lg:p-8 h-full flex flex-col ${plan.featured ? "bg-[#0454ff] text-white" : "border border-[#eaeaea] bg-white"}`}>
                  <p className={`text-[14px] font-normal mb-1 ${plan.featured ? "text-white/70" : "text-[#6d6d6d]"}`}>{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-[36px] md:text-[48px] font-semibold tracking-[-0.02em] leading-[110%]">₨{plan.price}</span>
                    <span className={`text-[14px] ${plan.featured ? "text-white/60" : "text-[#6d6d6d]"}`}>/mo</span>
                  </div>
                  <p className={`text-[14px] mb-6 ${plan.featured ? "text-white/70" : "text-[#6d6d6d]"}`}>{plan.desc}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map(feat => (
                      <li key={feat} className={`flex items-start gap-2 text-[14px] ${plan.featured ? "text-white/90" : "text-[#3d3d3d]"}`}>
                        <Check size={16} strokeWidth={2} className={`mt-0.5 shrink-0 ${plan.featured ? "text-white" : "text-[#0454ff]"}`} />{feat}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`block text-center py-3 rounded-full text-[14px] font-medium transition-colors ${plan.featured ? "bg-white text-[#0454ff] hover:bg-white/90" : "bg-[#0454ff] text-white hover:bg-[#0340cc]"}`}>
                    Get Started <ArrowRight size={14} className="inline ml-1" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS — 3×2 grid ═══ */}
      <section className="py-16 px-5 md:px-10 lg:px-20">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-16">
          <ScrollReveal><SectionHeading tag="BENEFITS" title="Why 12,000+ Merchants Choose Indigo" description="The advantages that make selling online in Nepal actually work." /></ScrollReveal>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <ScrollReveal key={b.title}>
                <div className="rounded-xl border border-[#eaeaea] bg-[#f5f6f8] p-6 h-full">
                  <h3 className="text-[18px] font-semibold tracking-[-0.02em] mb-2">{b.title}</h3>
                  <p className="text-[14px] text-[#6d6d6d] leading-[140%]">{b.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS — 3 column ═══ */}
      <section className="py-16 px-5 md:px-10 lg:px-20">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center gap-16">
          <ScrollReveal><SectionHeading tag="TESTIMONIALS" title="Trusted by Merchants Across Nepal" description="Real stories from real businesses growing with Indigo." /></ScrollReveal>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={i}>
                <div className={`rounded-xl p-6 ${t.featured ? (t.bg === "dark" ? "bg-black text-white" : "bg-[#0454ff] text-white") : "border border-[#eaeaea] bg-white"}`}>
                  <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} size={14} className={t.featured ? "text-white fill-white" : "text-amber-400 fill-amber-400"} />)}</div>
                  <p className={`text-[14px] leading-[160%] mb-4 ${t.featured ? "text-white/90" : "text-[#3d3d3d]"}`}>&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className={`text-[14px] font-semibold ${t.featured ? "text-white" : "text-[#1a1a1a]"}`}>{t.name}</p>
                    <p className={`text-[12px] ${t.featured ? "text-white/60" : "text-[#6d6d6d]"}`}>{t.role}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ — split layout ═══ */}
      <section id="faq" className="py-16 px-5 md:px-10 lg:px-20">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-[120px]">
          {/* Left */}
          <div className="lg:w-[33%] shrink-0">
            <ScrollReveal>
              <span className="inline-block px-3 py-1.5 rounded-full bg-[#eaf1ff] text-[#0454ff] text-[13px] font-medium mb-4">FAQ</span>
              <h2 className="text-[36px] md:text-[48px] lg:text-[56px] font-semibold leading-[110%] tracking-[-0.04em] mb-4">Your Questions Answered</h2>
              <p className="text-[16px] text-[#6d6d6d] leading-[140%]">Find clear answers about Indigo&apos;s platform, pricing, and features.</p>
            </ScrollReveal>
          </div>
          {/* Right — accordion */}
          <div className="flex-1 space-y-3">
            {FAQS.map(faq => (
              <ScrollReveal key={faq.q}>
                <details className="group border border-[#eaeaea] rounded-xl open:border-[#0454ff]/30 transition-colors">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-[15px] font-medium list-none select-none">
                    {faq.q}
                    <span className="text-[#6d6d6d] group-open:rotate-45 transition-transform text-lg">+</span>
                  </summary>
                  <p className="px-5 pb-4 text-[14px] text-[#6d6d6d] leading-[160%]">{faq.a}</p>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 px-5 md:px-10 lg:px-20">
        <div className="max-w-[1280px] mx-auto rounded-2xl bg-[#0454ff] text-white text-center py-16 md:py-[120px] px-6">
          <ScrollReveal>
            <h2 className="text-[36px] md:text-[48px] lg:text-[56px] font-semibold leading-[110%] tracking-[-0.04em] mb-4">Ready to Start Selling?</h2>
            <p className="text-[16px] text-white/70 leading-[140%] max-w-[500px] mx-auto mb-8">Join 12,000+ Nepali businesses. Free forever tier. Accept eSewa in 2 minutes.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0454ff] text-[15px] font-medium hover:bg-white/90 transition-colors">
              Get Started Free <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 px-5 md:px-10 lg:px-20 border-t border-[#eaeaea]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[16px] font-bold tracking-tight">indigo</span>
          <div className="flex items-center gap-5 text-[13px] text-[#6d6d6d]">
            <Link href="/legal/privacy" className="hover:text-[#1a1a1a] transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-[#1a1a1a] transition-colors">Terms</Link>
            <a href="mailto:hello@indigo.com.np" className="hover:text-[#1a1a1a] transition-colors">Contact</a>
          </div>
          <span className="text-[12px] text-[#6d6d6d]">© 2026 Indigo. Built in Nepal.</span>
        </div>
      </footer>
    </div>
  );
}

// ═══ Section Heading Component ═══
function SectionHeading({ tag, title, description }: { tag: string; title: string; description: string }) {
  return (
    <div className="text-center max-w-[700px]">
      <span className="inline-block px-3 py-1.5 rounded-full bg-[#eaf1ff] text-[#0454ff] text-[13px] font-medium mb-4">{tag}</span>
      <h2 className="text-[36px] md:text-[48px] lg:text-[56px] font-semibold leading-[110%] tracking-[-0.04em] mb-3">{title}</h2>
      <p className="text-[16px] text-[#6d6d6d] leading-[140%] tracking-[-0.2px]">{description}</p>
    </div>
  );
}

// ═══ Data ═══
const FEATURES = [
  { icon: BarChart3, title: "Advanced Analytics Dashboard", description: "Track revenue, orders, customers, and inventory in real-time with smart visualizations and performance metrics.", color: "text-[#0454ff]", bg: "bg-[#eaf1ff]" },
  { icon: CreditCard, title: "Nepal Payment Integration", description: "Accept eSewa, Khalti, FonePay, and Stripe from a single dashboard. Connected in 2 minutes.", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Globe, title: "Visual Storefront Builder", description: "Drag-and-drop page builder with custom domains, mobile-first themes, and server-side rendering.", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Truck, title: "Pathao Shipping Integration", description: "Auto-calculate rates for Kathmandu Valley. Print labels. Track deliveries. All built in.", color: "text-amber-600", bg: "bg-amber-50" },
];

const PLANS = [
  { name: "Free Plan", price: "0", desc: "Perfect for getting started", featured: false, features: ["25 products", "eSewa + COD", "Indigo subdomain", "Basic analytics", "Email support"] },
  { name: "Growth Plan", price: "2,000", desc: "For growing businesses", featured: true, features: ["Unlimited products", "All payment methods", "Custom domain + SSL", "Advanced analytics", "Discount codes", "Priority support"] },
  { name: "Pro Plan", price: "6,000", desc: "For serious sellers", featured: false, features: ["Everything in Growth", "Multi-staff accounts", "API access", "WhatsApp notifications", "Dedicated manager"] },
];

const BENEFITS = [
  { title: "Accept payments in 2 minutes", description: "Connect eSewa or Khalti instantly. No paperwork, no waiting. Start receiving money today." },
  { title: "Ship anywhere in Nepal", description: "Pathao integration with auto-rates, label printing, and real-time tracking for Kathmandu Valley." },
  { title: "No technical skills needed", description: "If you can use Facebook, you can run a store on Indigo. Visual builder, no code required." },
  { title: "Multi-tenant & secure", description: "Your data is isolated. Bank-grade encryption. Row-level security on every query." },
  { title: "Grow with analytics", description: "Revenue charts, customer insights, inventory alerts. Know your numbers and make better decisions." },
  { title: "Free forever tier", description: "Start with 25 products, eSewa payments, and your own subdomain. Upgrade only when you're ready." },
];

const TESTIMONIALS = [
  { quote: "We moved from Instagram DMs to Indigo in one afternoon. Our Dashain sales were 4x last year because customers could pay with eSewa directly.", name: "Srijana Maharjan", role: "Founder, Dhaka Threads · Patan", featured: true, bg: "dark" },
  { quote: "Setting up took less than 5 minutes. I connected Khalti and had my first order within the hour.", name: "Bikash Tamang", role: "Owner, Himalayan Spices · Kathmandu", featured: false, bg: "" },
  { quote: "The analytics dashboard alone is worth it. I finally know which products are actually making money.", name: "Anita Gurung", role: "Founder, Anita's Boutique · Pokhara", featured: false, bg: "" },
  { quote: "Indigo is what Shopify should be for Nepal. Local payments, local shipping, local support. Everything just works.", name: "Rajesh Shrestha", role: "CEO, TechMart Nepal · Lalitpur", featured: true, bg: "blue" },
  { quote: "Customer support responded in 10 minutes when I had an issue with Pathao integration. Incredible.", name: "Priya Adhikari", role: "Manager, Priya Collections · Bhaktapur", featured: false, bg: "" },
  { quote: "We process 200+ orders per week now. The bulk import and inventory alerts save us hours every day.", name: "Manish Karki", role: "Operations, Fresh Valley Grocery", featured: false, bg: "" },
];

const FAQS = [
  { q: "What is Indigo and who is it for?", a: "Indigo is Nepal's e-commerce platform for merchants who want to sell online. Whether you sell clothing, food, electronics, or handicrafts — if you want to accept payments and ship products in Nepal, Indigo is built for you." },
  { q: "Do I need technical experience?", a: "Not at all. Indigo is built for non-technical users. If you can use Facebook, you can run a store. Our visual builder requires zero coding." },
  { q: "How fast can I start accepting payments?", a: "Under 2 minutes. Connect your eSewa or Khalti merchant account in settings, and you're live. We verify instantly." },
  { q: "Is my data secure?", a: "Absolutely. We use bank-grade encryption, multi-tenant isolation, and row-level security. Your data is completely separated from other merchants." },
  { q: "What does Indigo charge?", a: "Zero transaction fees from Indigo. You only pay the payment gateway's standard rate (eSewa: 1.5%, Khalti: 2%). Plans start at free forever." },
  { q: "Can I migrate from Instagram/Facebook selling?", a: "Yes. Import your product catalog via CSV. We also help migrate your customer list for free." },
];

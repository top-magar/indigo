import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronUp, Star, Zap, Lightbulb, CreditCard, Globe, Truck, Shield, BarChart3, Users } from "lucide-react";
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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0454ff] via-[#2d7aff] to-[#7ab4ff]">
        {/* Decorative brackets */}
        <div className="absolute top-[18%] left-[7%] w-[50px] h-[110px] border-l-2 border-t-2 border-b-2 border-white/15 rounded-l-md hidden lg:block" />
        <div className="absolute top-[18%] right-[7%] w-[50px] h-[110px] border-r-2 border-t-2 border-b-2 border-white/15 rounded-r-md hidden lg:block" />
        <div className="absolute bottom-[35%] left-[4%] w-[35px] h-[70px] border-l-2 border-t-2 border-b-2 border-white/8 rounded-l-md hidden lg:block" />
        <div className="absolute bottom-[35%] right-[4%] w-[35px] h-[70px] border-r-2 border-t-2 border-b-2 border-white/8 rounded-r-md hidden lg:block" />

        {/* Nav */}
        <nav className="relative z-20 max-w-[1200px] mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <span className="text-[18px] font-bold tracking-tight text-white">✦ Indigo</span>
          <button className="text-white" aria-label="Menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </nav>

        {/* Content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 pt-12 md:pt-20 pb-0 text-center">
          <div className="hero-badge flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm text-white text-[13px] font-medium">
              <Star size={13} className="fill-white" /> Nepal&apos;s #1 E-Commerce Platform
            </span>
          </div>
          <h1 className="hero-title text-[34px] md:text-[52px] lg:text-[66px] font-semibold leading-[105%] tracking-[-0.04em] text-white max-w-[780px] mx-auto mb-5">
            If You Can Post on Facebook, You Can Run a Store.
          </h1>
          <p className="hero-desc text-[15px] md:text-[17px] text-white/75 leading-[155%] max-w-[540px] mx-auto mb-8">
            Accept eSewa &amp; Khalti. Ship via Pathao. Build your storefront visually. Live in 2 minutes. Made for Nepal.
          </p>
          <div className="hero-form flex justify-center mb-14">
            <div className="relative w-full max-w-[420px]">
              <input type="email" placeholder="you@store.com.np" aria-label="Email address" className="w-full px-5 py-4 pr-[140px] rounded-full bg-white text-[14px] text-[#1a1a1a] placeholder:text-[#999] shadow-[0_4px_20px_rgba(0,0,0,0.1)] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none" />
              <Link href="/auth/signup" className="btn-press absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-[#222] transition-colors">
                Start free
              </Link>
            </div>
          </div>
          <div className="hero-dashboard relative mx-auto max-w-[960px]">
            <img src="/dashboard-preview.png" alt="Indigo merchant dashboard" className="w-full rounded-t-xl shadow-[0_-5px_60px_rgba(0,0,0,0.25)]" style={{ aspectRatio: "2.057" }} />
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <section className="py-12 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-[15px] md:text-[17px] font-medium text-[#1a1a1a] tracking-[-0.2px] mb-8">
            Works with the tools you already use
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-[marquee_25s_linear_infinite] gap-[86px] opacity-30">
              {[...Array(2)].map((_, set) => (
                <div key={set} className="flex shrink-0 gap-[86px]">
                  {["eSewa", "Khalti", "Pathao", "Stripe", "FonePay", "Daraz", "eSewa", "Khalti"].map((name, i) => (
                    <span key={`${set}-${i}`} className="text-[18px] font-semibold text-[#1a1a1a] tracking-tight whitespace-nowrap">{name}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading tag="FEATURES" title="Everything You Need to Sell Online" description="Payments, shipping, storefront, analytics — built for Nepali merchants." />
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`card-hover rounded-2xl overflow-hidden ${i < 2 ? "bg-[#1a1a1a] text-white" : "bg-[#f5f6f8] text-[#1a1a1a]"}`}>
                <div className={`relative w-full h-[220px] md:h-[280px] flex items-center justify-center ${i < 2 ? "feature-img-placeholder" : ""}`}>
                  <div className={`size-14 rounded-2xl flex items-center justify-center ${i < 2 ? "bg-white/10 border border-white/10" : "bg-white shadow-sm border border-[#eaeaea]"}`}>
                    <f.icon size={26} strokeWidth={1.5} className={i < 2 ? "text-white/80" : "text-[#0454ff]"} />
                  </div>
                </div>
                <div className="px-7 pb-7 pt-2">
                  <h3 className="text-[20px] md:text-[22px] font-semibold tracking-[-0.03em] leading-[125%] mb-2">{f.title}</h3>
                  <p className={`text-[14px] leading-[155%] ${i < 2 ? "text-white/70" : "text-[#6d6d6d]"}`}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading tag="PRICING" title="Start Free, Grow When Ready" description="No transaction fees from Indigo. You only pay the payment gateway's standard rate." />
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRICING_PLANS.map(plan => (
              <div key={plan.name} className="card-hover rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
                <div className="h-[5px] bg-gradient-to-r from-[#0454ff] to-[#7e5bff]" />
                <div className="p-7 md:p-8">
                  <p className="text-[13px] text-[#6d6d6d] font-medium uppercase tracking-wide mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[42px] md:text-[50px] font-semibold tracking-[-0.03em]">₨{plan.price}</span>
                    <span className="text-[14px] text-[#6d6d6d]">/mo</span>
                  </div>
                  <p className="text-[14px] text-[#6d6d6d] mb-6">{plan.desc}</p>
                  <Link href="/auth/signup" className="btn-press block text-center py-3.5 rounded-full bg-black text-white text-[14px] font-medium hover:bg-[#222] transition-colors mb-7">
                    Start selling
                  </Link>
                  <ul className="space-y-3.5">
                    {plan.features.map(feat => (
                      <li key={feat} className="flex items-center gap-3 text-[14px] text-[#3d3d3d]">
                        <span className="flex items-center justify-center size-[22px] rounded-full bg-[#0454ff] shrink-0">
                          <Check size={12} strokeWidth={3} className="text-white" />
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading tag="WHY INDIGO" title="Built for How Nepal Sells" description="Not another global tool localized as an afterthought. Built here, for here." />
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(b => (
              <div key={b.title} className="card-hover rounded-2xl border border-[#eaeaea] bg-white p-6">
                <div className={`size-11 rounded-full flex items-center justify-center mb-4 ${b.iconBg}`}>
                  <b.icon size={18} className={b.iconColor} />
                </div>
                <h3 className="text-[17px] font-semibold tracking-[-0.02em] mb-1.5">{b.title}</h3>
                <p className="text-[13px] text-[#6d6d6d] leading-[155%]">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading tag="MERCHANTS" title="Real Stores, Real Results" description="Hear from merchants who moved from Instagram DMs to a proper online store." />
          {/* Large featured card */}
          <div className="w-full rounded-2xl bg-black text-white p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-6 right-10 text-[100px] leading-none text-white/[0.06] font-serif select-none hidden md:block">&ldquo;</div>
            <div className="flex gap-0.5 mb-5">
              {[...Array(4)].map((_, i) => <Star key={i} size={16} className="fill-white text-white" />)}
              <Star size={16} className="text-white/25" />
            </div>
            <p className="text-[16px] md:text-[18px] leading-[165%] text-white/85 max-w-[580px] mb-8">
              &ldquo;We moved from Instagram DMs to Indigo in one afternoon. Our Dashain sales were 4x last year because customers could pay with eSewa directly instead of bank transfers. Setup took maybe 5 minutes.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-[13px] font-semibold">SM</div>
              <div>
                <p className="text-[14px] font-semibold text-white">Srijana Maharjan</p>
                <p className="text-[12px] text-white/70">Dhaka Threads · Patan</p>
              </div>
            </div>
          </div>
          {/* Smaller cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
            {SMALL_TESTIMONIALS.map(t => (
              <div key={t.name} className="card-hover rounded-2xl border border-[#eaeaea] bg-white p-6">
                <p className="text-[14px] text-[#3d3d3d] leading-[165%] mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-[#f5f6f8] border border-[#eaeaea]" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">{t.name}</p>
                    <p className="text-[11px] text-[#6d6d6d]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="divide-y divide-[#eaeaea] border-t border-[#eaeaea]">
            {FAQS.map(faq => (
              <details key={faq.q} className="group">
                <summary className="flex items-center justify-between py-5 md:py-6 cursor-pointer text-[16px] md:text-[18px] font-medium list-none select-none hover:text-[#0454ff] transition-colors">
                  {faq.q}
                  <ChevronUp size={20} className="text-[#999] group-open:rotate-180 transition-transform duration-200 shrink-0 ml-4" />
                </summary>
                <p className="pb-5 text-[14px] md:text-[15px] text-[#6d6d6d] leading-[165%] max-w-[680px]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-black py-20 md:py-28 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-[18%] left-[5%] w-[45px] h-[90px] border-l-2 border-t-2 border-b-2 border-white/8 rounded-l-md hidden lg:block" />
        <div className="absolute top-[18%] right-[5%] w-[45px] h-[90px] border-r-2 border-t-2 border-b-2 border-white/8 rounded-r-md hidden lg:block" />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-[13px] font-medium">
              <Star size={13} className="fill-white" /> Nepal&apos;s #1 E-Commerce Platform
            </span>
          </div>
          <h2 className="text-[34px] md:text-[48px] lg:text-[56px] font-semibold leading-[105%] tracking-[-0.04em] text-white max-w-[680px] mx-auto mb-4">
            Your Store Could Be Live in 2 Minutes.
          </h2>
          <p className="text-[15px] text-white/70 leading-[155%] max-w-[480px] mx-auto mb-8">
            Free forever. No credit card. Accept eSewa from day one.
          </p>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[420px]">
              <input type="email" placeholder="you@store.com.np" aria-label="Email address" className="w-full px-5 py-4 pr-[140px] rounded-full bg-white text-[14px] text-[#1a1a1a] placeholder:text-[#999] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none" />
              <Link href="/auth/signup" className="btn-press absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-[#222] transition-colors border border-white/10">
                Start free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-black py-12 px-6 md:px-10 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <span className="text-[16px] font-bold text-white mb-3 block">✦ Indigo</span>
              <p className="text-[12px] text-white/60 leading-[165%]">Nepal&apos;s e-commerce platform for modern merchants.</p>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-3">Product</p>
              <ul className="space-y-2 text-[13px] text-white/60">
                <li><a href="#features" className="hover:text-white/80 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a></li>
                <li><Link href="/auth/signup" className="hover:text-white/80 transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-3">Company</p>
              <ul className="space-y-2 text-[13px] text-white/60">
                <li><a href="#" className="hover:text-white/80 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white/80 transition-colors">Blog</a></li>
                <li><a href="mailto:hello@indigo.com.np" className="hover:text-white/80 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2 text-[13px] text-white/60">
                <li><Link href="/legal/privacy" className="hover:text-white/80 transition-colors">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white/80 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-white/50">© 2026 Indigo. Built in Nepal.</span>
            <span className="text-[11px] text-white/50">All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ tag, title, description }: { tag: string; title: string; description: string }) {
  return (
    <div className="text-center max-w-[680px]">
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0454ff] mb-3">
        <Star size={13} className="text-[#0454ff]" /> {tag}
      </span>
      <h2 className="text-[34px] md:text-[46px] lg:text-[54px] font-semibold leading-[108%] tracking-[-0.04em] mb-3">{title}</h2>
      <p className="text-[15px] text-[#6d6d6d] leading-[155%]">{description}</p>
    </div>
  );
}

// ═══ Data ═══
const FEATURES = [
  { icon: CreditCard, title: "Accept eSewa & Khalti Instantly", description: "Connect Nepal's top payment methods in 2 minutes. No paperwork, no waiting period. Start receiving money today." },
  { icon: Globe, title: "Visual Storefront Builder", description: "Drag-and-drop page builder with custom domains, mobile-first themes, and live preview. No coding required." },
  { icon: BarChart3, title: "Orders & Inventory Dashboard", description: "Track every order from placement to delivery. Low-stock alerts, revenue charts, and customer insights in real-time." },
  { icon: Truck, title: "Pathao Shipping Built In", description: "Auto-calculate delivery rates for Kathmandu Valley. Print labels, track packages, notify customers — all from one place." },
];

const PRICING_PLANS = [
  { name: "Free Forever", price: "0", desc: "Start selling today — no credit card needed", features: ["25 products", "Unlimited orders", "eSewa + Cash on Delivery", "Indigo subdomain", "Basic analytics", "Email support"] },
  { name: "Growth", price: "2,000", desc: "For stores ready to scale", features: ["Unlimited products", "All payment methods", "Custom domain + SSL", "Advanced analytics", "Discount codes & coupons", "Priority WhatsApp support"] },
];

const BENEFITS: { icon: typeof Lightbulb; title: string; description: string; iconBg: string; iconColor: string }[] = [
  { icon: Lightbulb, title: "Live in 2 minutes", description: "Connect eSewa, add your first product, and share your store link. That fast.", iconBg: "bg-[#eaf1ff]", iconColor: "text-[#0454ff]" },
  { icon: Truck, title: "Ship across Nepal", description: "Pathao integration with auto-rates for Kathmandu Valley. Print labels in one click.", iconBg: "bg-[#fff8e1]", iconColor: "text-[#f59e0b]" },
  { icon: Shield, title: "No tech skills needed", description: "If you can post on Facebook, you can run a store on Indigo. Visual builder, zero code.", iconBg: "bg-[#e8f5e9]", iconColor: "text-[#22c55e]" },
  { icon: BarChart3, title: "Know your numbers", description: "See which products sell, which don't. Revenue trends, customer insights, inventory alerts.", iconBg: "bg-[#fce4ec]", iconColor: "text-[#ef4444]" },
  { icon: Users, title: "Your data, isolated", description: "Bank-grade encryption. Row-level security. Your store data is completely separated from others.", iconBg: "bg-[#f3e5f5]", iconColor: "text-[#a855f7]" },
  { icon: Zap, title: "Zero platform fees", description: "We don't take a cut of your sales. You only pay the payment gateway's standard rate.", iconBg: "bg-[#e0f7fa]", iconColor: "text-[#06b6d4]" },
];

const SMALL_TESTIMONIALS = [
  { quote: "I moved from Instagram DMs to Indigo in one afternoon. My Dashain sales were 4x last year.", name: "Srijana M.", role: "Dhaka Threads, Patan" },
  { quote: "Connected Khalti and had my first order within the hour. No joke.", name: "Bikash T.", role: "Himalayan Spices, Kathmandu" },
  { quote: "The inventory alerts alone save me hours. I finally know what's actually selling.", name: "Anita G.", role: "Anita's Boutique, Pokhara" },
];

const FAQS = [
  { q: "How fast can I start selling?", a: "Under 2 minutes. Add your first product, connect eSewa in settings, and share your store link. You're live." },
  { q: "Do I need technical experience?", a: "Not at all. If you can use Facebook, you can run a store. Our visual builder requires zero coding." },
  { q: "What does Indigo charge?", a: "Zero platform fees. You only pay the payment gateway's standard rate (eSewa: 1.5%, Khalti: 2%). The free tier is free forever." },
  { q: "Can I use my own domain?", a: "Yes. On the Growth plan, connect any custom domain with free SSL. Your store, your brand." },
];

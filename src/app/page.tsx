import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronUp, Star, Zap, Lightbulb, TrendingUp, Shield, BarChart3, Users } from "lucide-react";
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

      {/* ═══ HERO — Blue gradient bg, white text ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0454ff] via-[#2d7aff] to-[#7ab4ff]">
        {/* Decorative bracket elements */}
        <div className="absolute top-[20%] left-[8%] w-[60px] h-[120px] border-l-2 border-t-2 border-b-2 border-white/20 rounded-l-lg" />
        <div className="absolute top-[20%] right-[8%] w-[60px] h-[120px] border-r-2 border-t-2 border-b-2 border-white/20 rounded-r-lg" />
        <div className="absolute bottom-[30%] left-[5%] w-[40px] h-[80px] border-l-2 border-t-2 border-b-2 border-white/10 rounded-l-lg" />
        <div className="absolute bottom-[30%] right-[5%] w-[40px] h-[80px] border-r-2 border-t-2 border-b-2 border-white/10 rounded-r-lg" />

        {/* Nav */}
        <nav className="relative z-20 max-w-[1200px] mx-auto px-5 md:px-10 py-5 flex items-center justify-between">
          <span className="text-[18px] font-bold tracking-tight text-white">✦ Indigo</span>
          <button className="text-white">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 md:px-10 pt-12 md:pt-20 pb-0 text-center">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-white text-[13px] font-medium">
              <Star size={14} className="fill-white" /> Nepal&apos;s #1 E-Commerce Platform
            </span>
          </div>
          {/* H1 */}
          <h1 className="text-[36px] md:text-[52px] lg:text-[68px] font-semibold leading-[105%] tracking-[-0.04em] text-white max-w-[800px] mx-auto mb-6">
            Launch Your Online Store in Nepal Today.
          </h1>
          {/* Description */}
          <p className="text-[15px] md:text-[17px] text-white/80 leading-[150%] max-w-[560px] mx-auto mb-8">
            Accept eSewa, Khalti & Stripe payments. Ship via Pathao. Beautiful storefront builder. No code required. Live in 2 minutes.
          </p>
          {/* CTA form — white input with black button */}
          <div className="flex justify-center mb-16">
            <div className="relative w-full max-w-[420px]">
              <input type="email" placeholder="Enter your Email" className="w-full px-5 py-4 pr-[140px] rounded-full bg-white text-[14px] text-[#1a1a1a] outline-none placeholder:text-[#999]" />
              <Link href="/auth/signup" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-[#333] transition-colors">
                Get started
              </Link>
            </div>
          </div>
          {/* Dashboard image — overlaps into next section */}
          <div className="relative mx-auto max-w-[1000px]">
            <img src="/dashboard-preview.png" alt="Indigo merchant dashboard" className="w-full rounded-t-xl shadow-[0_-10px_60px_rgba(0,0,0,0.2)]" style={{ aspectRatio: "2.057" }} />
          </div>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <section className="py-14 px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto text-center">
          <p className="text-[16px] md:text-[18px] font-medium text-[#1a1a1a] tracking-[-0.2px] mb-10">
            Join 12,000+ Businesses Who Sell on Indigo
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-[marquee_20s_linear_infinite] gap-[86px] opacity-40">
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

      {/* ═══ FEATURES — 2×2 grid, tall cards with images ═══ */}
      <section id="features" className="py-16 px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading icon={<Star size={14} className="text-[#0454ff]" />} tag="FEATURES" title="Smarter Tools to Grow Your Store" description="Everything you need to sell online in Nepal — payments, shipping, analytics, and more." />
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`rounded-2xl overflow-hidden ${i < 2 ? "bg-[#1a1a1a] text-white" : "bg-[#f5f6f8] text-[#1a1a1a]"}`}>
                {/* Image placeholder area */}
                <div className={`w-full h-[240px] md:h-[300px] ${i < 2 ? "bg-gradient-to-br from-[#2a2a2a] to-[#111]" : "bg-gradient-to-br from-[#e8ecf4] to-[#f5f6f8]"} flex items-center justify-center`}>
                  <div className={`size-16 rounded-2xl flex items-center justify-center ${i < 2 ? "bg-white/10" : "bg-white shadow-sm"}`}>
                    <f.icon size={28} className={i < 2 ? "text-white/70" : "text-[#0454ff]"} />
                  </div>
                </div>
                {/* Text at bottom */}
                <div className="p-6 md:p-8">
                  <h3 className="text-[20px] md:text-[24px] font-semibold tracking-[-0.03em] leading-[120%] mb-2">{f.title}</h3>
                  <p className={`text-[14px] md:text-[15px] leading-[150%] ${i < 2 ? "text-white/60" : "text-[#6d6d6d]"}`}>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING — 2 column, gradient strip at top ═══ */}
      <section id="pricing" className="py-16 px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading icon={<Star size={14} className="text-[#0454ff]" />} tag="PRICING" title="Simple, Transparent Pricing" description="Start free. Upgrade as you grow. No transaction fees from Indigo." />
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING_PLANS.map(plan => (
              <div key={plan.name} className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
                {/* Gradient strip at top */}
                <div className="h-[6px] bg-gradient-to-r from-[#0454ff] to-[#7e5bff]" />
                <div className="p-6 md:p-8">
                  <p className="text-[14px] text-[#6d6d6d] mb-1">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[40px] md:text-[48px] font-semibold tracking-[-0.03em]">₨{plan.price}</span>
                    <span className="text-[14px] text-[#6d6d6d]">/mo</span>
                  </div>
                  <p className="text-[14px] text-[#6d6d6d] mb-6">{plan.desc}</p>
                  <Link href="/auth/signup" className="block text-center py-3 rounded-full bg-black text-white text-[14px] font-medium hover:bg-[#333] transition-colors mb-6">
                    Get started
                  </Link>
                  <ul className="space-y-3">
                    {plan.features.map(feat => (
                      <li key={feat} className="flex items-center gap-3 text-[14px] text-[#3d3d3d]">
                        <span className="flex items-center justify-center size-5 rounded-full bg-[#0454ff] shrink-0">
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

      {/* ═══ BENEFITS — 3×2 grid, colored circle icons ═══ */}
      <section className="py-16 px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading icon={<Star size={14} className="text-[#0454ff]" />} tag="BENEFITS" title="The Powerful Advantages Your Team Gets" description="Unlock key benefits that boost your team's productivity and performance." />
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="rounded-2xl border border-[#eaeaea] bg-white p-6">
                <div className={`size-12 rounded-full flex items-center justify-center mb-4 ${b.iconBg}`}>
                  <b.icon size={20} className={b.iconColor} />
                </div>
                <h3 className="text-[18px] font-semibold tracking-[-0.02em] mb-2">{b.title}</h3>
                <p className="text-[14px] text-[#6d6d6d] leading-[150%]">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS — large black card + smaller white cards ═══ */}
      <section className="py-16 px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <SectionHeading icon={<Star size={14} className="text-[#0454ff]" />} tag="TESTIMONIALS" title="Trusted by Teams Worldwide" description="Join thousands of teams globally who rely on our solutions to collaborate, grow, and succeed." />
          {/* Large featured card */}
          <div className="w-full rounded-2xl bg-black text-white p-8 md:p-12">
            <div className="flex gap-1 mb-6">
              {[...Array(4)].map((_, i) => <Star key={i} size={18} className="fill-white text-white" />)}
              <Star size={18} className="text-white/30" />
            </div>
            <p className="text-[16px] md:text-[18px] leading-[160%] text-white/90 max-w-[600px] mb-8">
              &ldquo;This platform transformed the way our team manages customers and opportunities. Within only three months of consistent use, we achieved a remarkable 35% increase in sales, driven by smarter workflows, better communication, and improved tracking.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white/20" />
              <div>
                <p className="text-[14px] font-semibold text-white">Srijana Maharjan</p>
                <p className="text-[12px] text-white/50">Founder, Dhaka Threads</p>
              </div>
            </div>
            {/* Large quote mark */}
            <div className="absolute top-8 right-12 text-[80px] text-white/10 font-serif hidden md:block">&ldquo;</div>
          </div>
          {/* Smaller cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {SMALL_TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl border border-[#eaeaea] bg-white p-6">
                <p className="text-[14px] text-[#3d3d3d] leading-[160%] mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-[#f5f6f8]" />
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

      {/* ═══ FAQ — full-width, border-bottom dividers, chevron up ═══ */}
      <section id="faq" className="py-16 px-5 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="divide-y divide-[#eaeaea]">
            {FAQS.map(faq => (
              <details key={faq.q} className="group">
                <summary className="flex items-center justify-between py-6 cursor-pointer text-[16px] md:text-[18px] font-medium list-none select-none">
                  {faq.q}
                  <ChevronUp size={20} className="text-[#6d6d6d] group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <p className="pb-6 text-[14px] md:text-[15px] text-[#6d6d6d] leading-[160%] max-w-[700px]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — Black background ═══ */}
      <section className="bg-black py-20 md:py-28 px-5 md:px-10 relative overflow-hidden">
        {/* Decorative bracket elements */}
        <div className="absolute top-[20%] left-[6%] w-[50px] h-[100px] border-l-2 border-t-2 border-b-2 border-white/10 rounded-l-lg" />
        <div className="absolute top-[20%] right-[6%] w-[50px] h-[100px] border-r-2 border-t-2 border-b-2 border-white/10 rounded-r-lg" />

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-[13px] font-medium">
              <Star size={14} className="fill-white" /> Nepal&apos;s #1 E-Commerce Platform
            </span>
          </div>
          <h2 className="text-[36px] md:text-[48px] lg:text-[56px] font-semibold leading-[105%] tracking-[-0.04em] text-white max-w-[700px] mx-auto mb-4">
            Build Stronger Relationships. Close More Deals.
          </h2>
          <p className="text-[15px] text-white/60 leading-[150%] max-w-[500px] mx-auto mb-8">
            Join 12,000+ Nepali businesses. Free forever tier. Accept eSewa in 2 minutes.
          </p>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[420px]">
              <input type="email" placeholder="Enter your Email" className="w-full px-5 py-4 pr-[140px] rounded-full bg-white text-[14px] text-[#1a1a1a] outline-none placeholder:text-[#999]" />
              <Link href="/auth/signup" className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-[#333] transition-colors">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER — Black bg, white text, multi-column ═══ */}
      <footer className="bg-black py-12 px-5 md:px-10 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <span className="text-[16px] font-bold text-white mb-4 block">✦ Indigo</span>
              <p className="text-[13px] text-white/50 leading-[160%]">Nepal&apos;s e-commerce platform for modern merchants.</p>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white mb-3">Product</p>
              <ul className="space-y-2 text-[13px] text-white/50">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white mb-3">Company</p>
              <ul className="space-y-2 text-[13px] text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="mailto:hello@indigo.com.np" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white mb-3">Legal</p>
              <ul className="space-y-2 text-[13px] text-white/50">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[12px] text-white/40">© 2026 Indigo. Built in Nepal.</span>
            <span className="text-[12px] text-white/40">All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ icon, tag, title, description }: { icon: React.ReactNode; tag: string; title: string; description: string }) {
  return (
    <div className="text-center max-w-[700px]">
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0454ff] mb-4">
        {icon} {tag}
      </span>
      <h2 className="text-[36px] md:text-[48px] lg:text-[56px] font-semibold leading-[105%] tracking-[-0.04em] mb-3">{title}</h2>
      <p className="text-[15px] text-[#6d6d6d] leading-[150%]">{description}</p>
    </div>
  );
}

// ═══ Data ═══
const FEATURES = [
  { icon: BarChart3, title: "Advanced Analytics Dashboard", description: "Turn raw data into clear insights with real-time reports, smart visualizations, and performance metrics." },
  { icon: Users, title: "Streamlined Relationship Organization", description: "Simplify how you manage connections with streamlined relationship organization — effortlessly." },
  { icon: Zap, title: "Smart and Effortless Data Analysis", description: "Experience smart and effortless data analysis with advanced AI tools that simplify insights, visualize patterns." },
  { icon: Shield, title: "Intelligent Automated Task Planner", description: "Boost efficiency with an intelligent automated task planner — effortlessly schedule, prioritize and manage." },
];

const PRICING_PLANS = [
  { name: "Starter Plan", price: "0", desc: "Perfect for getting started", features: ["Up to 1000 contacts", "Unlimited storage", "Advance analytics", "Enhanced analytics tools", "Custom branding options", "Dedicated account support"] },
  { name: "Growth Plan", price: "2,000", desc: "For growing businesses", features: ["Up to 500 contacts", "Up to 200 GB Storage", "Advance analytics", "Advanced reporting features", "Customizable dashboards", "AI-driven insights"] },
];

const BENEFITS: { icon: typeof Lightbulb; title: string; description: string; iconBg: string; iconColor: string }[] = [
  { icon: Lightbulb, title: "Accept payments in 2 minutes", description: "Connect eSewa or Khalti instantly. No paperwork, no waiting.", iconBg: "bg-[#eaf1ff]", iconColor: "text-[#0454ff]" },
  { icon: TrendingUp, title: "Ship anywhere in Nepal", description: "Pathao integration with auto-rates, label printing, and real-time tracking.", iconBg: "bg-[#fff8e1]", iconColor: "text-[#f59e0b]" },
  { icon: Shield, title: "No technical skills needed", description: "If you can use Facebook, you can run a store on Indigo.", iconBg: "bg-[#e8f5e9]", iconColor: "text-[#22c55e]" },
  { icon: BarChart3, title: "Multi-tenant & secure", description: "Your data is isolated. Bank-grade encryption. Row-level security.", iconBg: "bg-[#fce4ec]", iconColor: "text-[#ef4444]" },
  { icon: Users, title: "Grow with analytics", description: "Revenue charts, customer insights, inventory alerts.", iconBg: "bg-[#f3e5f5]", iconColor: "text-[#a855f7]" },
  { icon: Zap, title: "Free forever tier", description: "Start with 25 products, eSewa payments, and your own subdomain.", iconBg: "bg-[#e0f7fa]", iconColor: "text-[#06b6d4]" },
];

const SMALL_TESTIMONIALS = [
  { quote: "Within just 60 seconds, our complete system was set up and ready for immediate use.", name: "Bikash Tamang", role: "Systems Administrator" },
  { quote: "The analytics dashboard alone is worth it. I finally know which products are actually making money.", name: "Anita Gurung", role: "Founder, Anita's Boutique" },
  { quote: "Customer support responded in 10 minutes when I had an issue. Incredible service.", name: "Priya Adhikari", role: "Manager, Priya Collections" },
];

const FAQS = [
  { q: "Is my data secure on Indigo?", a: "Absolutely. We use bank-grade encryption, multi-tenant isolation, and row-level security. Your data is completely separated from other merchants." },
  { q: "Does Indigo support team collaboration?", a: "Yes. Invite staff members with role-based access. Owners, admins, and staff each see only what they need." },
  { q: "What kind of support do you offer?", a: "Email support on free tier, priority support on Growth, and a dedicated account manager on Pro. Average response time: 10 minutes." },
  { q: "Can I migrate my data from another platform?", a: "Yes. Import your product catalog via CSV. We also help migrate your customer list for free." },
];

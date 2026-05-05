import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronUp, Star, Zap, Lightbulb, TrendingUp, Shield, BarChart3, Users } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
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
            Launch Your Online Store in Nepal Today.
          </h1>
          <p className="hero-desc text-[15px] md:text-[17px] text-white/75 leading-[155%] max-w-[540px] mx-auto mb-8">
            Accept eSewa, Khalti & Stripe payments. Ship via Pathao. Beautiful storefront builder. No code required.
          </p>
          <div className="hero-form flex justify-center mb-14">
            <div className="relative w-full max-w-[420px]">
              <input type="email" placeholder="Enter your Email" className="w-full px-5 py-4 pr-[140px] rounded-full bg-white text-[14px] text-[#1a1a1a] outline-none placeholder:text-[#999] shadow-[0_4px_20px_rgba(0,0,0,0.1)]" />
              <Link href="/auth/signup" className="btn-press absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-[#222] transition-colors">
                Get started
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
            Join 12,000+ Businesses Who Sell on Indigo
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
          <Reveal><SectionHeading tag="FEATURES" title="Smarter Tools to Grow Your Store" description="Everything you need to sell online in Nepal — payments, shipping, analytics, and more." /></Reveal>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <div className={`card-hover rounded-2xl overflow-hidden h-full ${i < 2 ? "bg-[#1a1a1a] text-white" : "bg-[#f5f6f8] text-[#1a1a1a]"}`}>
                  <div className={`relative w-full h-[220px] md:h-[280px] flex items-center justify-center ${i < 2 ? "feature-img-placeholder" : ""}`}>
                    <div className={`size-14 rounded-2xl flex items-center justify-center ${i < 2 ? "bg-white/10 border border-white/10" : "bg-white shadow-sm border border-[#eaeaea]"}`}>
                      <f.icon size={26} strokeWidth={1.5} className={i < 2 ? "text-white/80" : "text-[#0454ff]"} />
                    </div>
                  </div>
                  <div className="px-7 pb-7 pt-2">
                    <h3 className="text-[20px] md:text-[22px] font-semibold tracking-[-0.03em] leading-[125%] mb-2">{f.title}</h3>
                    <p className={`text-[14px] leading-[155%] ${i < 2 ? "text-white/55" : "text-[#6d6d6d]"}`}>{f.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <Reveal><SectionHeading tag="PRICING" title="Simple, Transparent Pricing" description="Start free. Upgrade as you grow. No transaction fees from Indigo." /></Reveal>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            {PRICING_PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 120}>
                <div className="card-hover rounded-2xl border border-[#eaeaea] bg-white overflow-hidden h-full">
                  <div className="h-[5px] bg-gradient-to-r from-[#0454ff] to-[#7e5bff]" />
                  <div className="p-7 md:p-8">
                    <p className="text-[13px] text-[#6d6d6d] font-medium uppercase tracking-wide mb-1">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-[42px] md:text-[50px] font-semibold tracking-[-0.03em]">₨{plan.price}</span>
                      <span className="text-[14px] text-[#6d6d6d]">/mo</span>
                    </div>
                    <p className="text-[14px] text-[#6d6d6d] mb-6">{plan.desc}</p>
                    <Link href="/auth/signup" className="btn-press block text-center py-3.5 rounded-full bg-black text-white text-[14px] font-medium hover:bg-[#222] transition-colors mb-7">
                      Get started
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BENEFITS ═══ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <Reveal><SectionHeading tag="BENEFITS" title="The Powerful Advantages Your Team Gets" description="Unlock key benefits that boost your team's productivity and performance." /></Reveal>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 80}>
                <div className="card-hover rounded-2xl border border-[#eaeaea] bg-white p-6 h-full">
                  <div className={`size-11 rounded-full flex items-center justify-center mb-4 ${b.iconBg}`}>
                    <b.icon size={18} className={b.iconColor} />
                  </div>
                  <h3 className="text-[17px] font-semibold tracking-[-0.02em] mb-1.5">{b.title}</h3>
                  <p className="text-[13px] text-[#6d6d6d] leading-[155%]">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-14">
          <Reveal><SectionHeading tag="TESTIMONIALS" title="Trusted by Teams Worldwide" description="Join thousands of teams globally who rely on our solutions to collaborate, grow, and succeed." /></Reveal>
          {/* Large featured card */}
          <Reveal>
            <div className="w-full rounded-2xl bg-black text-white p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-6 right-10 text-[100px] leading-none text-white/[0.06] font-serif select-none hidden md:block">"</div>
              <div className="flex gap-0.5 mb-5">
                {[...Array(4)].map((_, i) => <Star key={i} size={16} className="fill-white text-white" />)}
                <Star size={16} className="text-white/25" />
              </div>
              <p className="text-[16px] md:text-[18px] leading-[165%] text-white/85 max-w-[580px] mb-8">
                &ldquo;This platform transformed the way our team manages customers and opportunities. Within only three months of consistent use, we achieved a remarkable 35% increase in sales, driven by smarter workflows, better communication, and improved tracking.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10" />
                <div>
                  <p className="text-[14px] font-semibold text-white">Srijana Maharjan</p>
                  <p className="text-[12px] text-white/45">Founder, Dhaka Threads</p>
                </div>
              </div>
            </div>
          </Reveal>
          {/* Smaller cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
            {SMALL_TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="card-hover rounded-2xl border border-[#eaeaea] bg-white p-6 h-full">
                  <p className="text-[14px] text-[#3d3d3d] leading-[165%] mb-5">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#f5f6f8] border border-[#eaeaea]" />
                    <div>
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">{t.name}</p>
                      <p className="text-[11px] text-[#6d6d6d]">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-20 px-6 md:px-10">
        <Reveal>
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
        </Reveal>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-black py-20 md:py-28 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute top-[18%] left-[5%] w-[45px] h-[90px] border-l-2 border-t-2 border-b-2 border-white/8 rounded-l-md hidden lg:block" />
        <div className="absolute top-[18%] right-[5%] w-[45px] h-[90px] border-r-2 border-t-2 border-b-2 border-white/8 rounded-r-md hidden lg:block" />
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <Reveal>
            <div className="flex justify-center mb-5">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-white text-[13px] font-medium">
                <Star size={13} className="fill-white" /> Nepal&apos;s #1 E-Commerce Platform
              </span>
            </div>
            <h2 className="text-[34px] md:text-[48px] lg:text-[56px] font-semibold leading-[105%] tracking-[-0.04em] text-white max-w-[680px] mx-auto mb-4">
              Build Stronger Relationships. Close More Deals.
            </h2>
            <p className="text-[15px] text-white/55 leading-[155%] max-w-[480px] mx-auto mb-8">
              Join 12,000+ Nepali businesses. Free forever tier. Accept eSewa in 2 minutes.
            </p>
            <div className="flex justify-center">
              <div className="relative w-full max-w-[420px]">
                <input type="email" placeholder="Enter your Email" className="w-full px-5 py-4 pr-[140px] rounded-full bg-white text-[14px] text-[#1a1a1a] outline-none placeholder:text-[#999]" />
                <Link href="/auth/signup" className="btn-press absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium hover:bg-[#222] transition-colors border border-white/10">
                  Get started
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-black py-12 px-6 md:px-10 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <span className="text-[16px] font-bold text-white mb-3 block">✦ Indigo</span>
              <p className="text-[12px] text-white/40 leading-[165%]">Nepal&apos;s e-commerce platform for modern merchants.</p>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-3">Product</p>
              <ul className="space-y-2 text-[13px] text-white/40">
                <li><a href="#features" className="hover:text-white/80 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white/80 transition-colors">Pricing</a></li>
                <li><Link href="/auth/signup" className="hover:text-white/80 transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-3">Company</p>
              <ul className="space-y-2 text-[13px] text-white/40">
                <li><a href="#" className="hover:text-white/80 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white/80 transition-colors">Blog</a></li>
                <li><a href="mailto:hello@indigo.com.np" className="hover:text-white/80 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/70 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2 text-[13px] text-white/40">
                <li><Link href="/legal/privacy" className="hover:text-white/80 transition-colors">Privacy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white/80 transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-white/30">© 2026 Indigo. Built in Nepal.</span>
            <span className="text-[11px] text-white/30">All rights reserved.</span>
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
  { icon: BarChart3, title: "Advanced Analytics Dashboard", description: "Turn raw data into clear insights with real-time reports, smart visualizations, and performance metrics." },
  { icon: Users, title: "Streamlined Relationship Organization", description: "Simplify how you manage connections with streamlined relationship organization — effortlessly." },
  { icon: Zap, title: "Smart and Effortless Data Analysis", description: "Experience smart and effortless data analysis with advanced AI tools that simplify insights and visualize patterns." },
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

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Zap, Shield, Globe, CreditCard, Truck, BarChart3 } from "lucide-react";
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
    <div className="min-h-screen bg-[#2047E6] text-white overflow-x-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap" />

      {/* ═══ HERO: Broadcast Composition ═══ */}
      <section className="relative h-screen w-full overflow-hidden">

        {/* Scrolling ticker — top edge */}
        <div className="absolute top-0 inset-x-0 z-30 overflow-hidden border-b border-[#FFD600]/20 bg-[#2047E6]/90 backdrop-blur-sm">
          <div className="animate-[ticker_40s_linear_infinite] whitespace-nowrap py-[6px] text-[11px] uppercase tracking-[0.15em] text-[#FFD600]/80">
            BEST WORK HAPPENS WHEN NO ONE IS WATCHING. THIS IS A BROADCAST FROM THE OTHER SIDE OF DONE. WE DON&apos;T SHIP FAST — WE SHIP WARM. NOTHING HERE WAS MADE FOR THE TIMELINE. EVERY PIXEL EARNED ITS PLACE. &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; BEST WORK HAPPENS WHEN NO ONE IS WATCHING. THIS IS A BROADCAST FROM THE OTHER SIDE OF DONE. WE DON&apos;T SHIP FAST — WE SHIP WARM.
          </div>
        </div>

        {/* Left edge — broadcast labels */}
        <div className="absolute left-[20px] top-[60px] bottom-[40px] z-20 flex flex-col justify-between text-[10px] uppercase tracking-[0.15em] text-[#FFD600]/50">
          <span>NT.001</span>
          <span>FREQ.027</span>
          <span>TX.014</span>
          <span>N.052</span>
          <span>LOG.054</span>
          <span>CH.5</span>
          <span>POS.1</span>
        </div>

        {/* Top-left: Logo + signal info */}
        <div className="absolute top-[50px] left-[80px] z-20 flex items-start gap-[12px]">
          <div className="size-[48px] rounded-full border border-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="size-5 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-6.5-1.4 1.4M6.9 17.1l-1.4 1.4m0-11 1.4 1.4m10.2 10.2 1.4 1.4"/></svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">INDIGO</p>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Signal Decay &gt; 0.184925</p>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.1em]">Forged in Consensus</p>
            <p className="text-[12px] text-[#FFD600] mt-[4px] font-bold">955.200 &gt;&gt;&gt; NN9SF90X</p>
          </div>
        </div>

        {/* Center: Crosshair + coordinates */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative size-[200px]">
            {/* Crosshair lines */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#FFD600]/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#FFD600]/30" />
            {/* Circle */}
            <div className="absolute inset-[20px] rounded-full border border-white/10" />
            <div className="absolute inset-[40px] rounded-full border border-white/5" />
          </div>
        </div>

        {/* Center-right: Coordinate badge */}
        <div className="absolute top-[45%] left-[55%] z-20 flex items-center gap-[8px] px-[16px] py-[8px] rounded-full bg-[#121212]/80 border border-white/10 backdrop-blur-sm">
          <div className="size-[20px] rounded-[4px] bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 16 16" className="size-3 text-white/60" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-white">99.0204</p>
            <p className="text-[9px] text-white/40 uppercase tracking-[0.1em]">ZZ.&gt;&gt;KK ZD.24</p>
          </div>
          <div className="size-[24px] rounded-full bg-white flex items-center justify-center ml-[8px]">
            <div className="size-[8px] rounded-full bg-[#121212]" />
          </div>
        </div>

        {/* Left-center: Dark terminal card */}
        <div className="absolute top-[42%] left-[100px] z-20 w-[320px] rounded-[8px] bg-[#121212] border border-white/10 p-[16px]">
          <div className="flex items-center justify-between mb-[8px]">
            <div className="flex gap-[4px]"><div className="w-[20px] h-[3px] rounded bg-white/30" /><div className="w-[8px] h-[3px] rounded bg-white/10" /></div>
            <div className="flex gap-[4px] text-white/30"><span className="text-[8px]">•••</span></div>
          </div>
          <p className="text-[12px] text-[#FFD600] font-bold uppercase tracking-[0.05em]">AETHER &gt;&gt;&gt;&gt;&gt; PRISM</p>
          <p className="text-[12px] text-white/80 uppercase tracking-[0.05em]">SOFT MACHINE</p>
          <p className="text-[12px] text-white/80 uppercase tracking-[0.05em]">NOTHING WORKS UNTIL IT</p>
          <p className="text-[12px] text-white/80 uppercase tracking-[0.05em]">DOES</p>
          <div className="flex items-center justify-between mt-[8px]">
            <p className="text-[14px] font-extrabold text-white">N — INDIGO</p>
            <div className="flex gap-[12px] text-[10px] text-white/40 uppercase">
              <span>S204</span><span>NN.605</span><span>NN.607</span>
            </div>
          </div>
        </div>

        {/* Top-right: Frequency list */}
        <div className="absolute top-[60px] right-[40px] z-20 text-right">
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/70">FREQ.003 <span className="text-[#FFD600]">SLOW BURN</span></p>
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/70">FREQ.015 <span className="text-[#FFD600]">WARM STATIC</span></p>
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/70">FREQ.027 <span className="text-[#FFD600]">SWEET STATIC</span></p>
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/70">FREQ.039 <span className="text-[#FFD600]">BRIGHT WOUND</span></p>
        </div>

        {/* Right: Orange accent card */}
        <div className="absolute top-[35%] right-[80px] z-20">
          <div className="w-[120px] h-[180px] rounded-[12px] bg-[#FFB366] flex flex-col items-center justify-center gap-[8px]">
            <div className="size-[60px] rounded-full bg-[#FF4400] flex items-center justify-center">
              <div className="size-[24px] rounded-full border-[3px] border-[#121212]" />
            </div>
            <div className="bg-[#121212]/20 px-[8px] py-[4px] rounded-[4px]">
              <p className="text-[9px] text-[#121212] font-bold uppercase leading-tight">N-INDIGO<br/>N-INDIGO<br/>N-INDIGO</p>
            </div>
          </div>
        </div>

        {/* Top-right: Holographic tilted card */}
        <div className="absolute top-[100px] right-[160px] z-15 w-[200px] h-[80px] rounded-[8px] rotate-[-8deg]" style={{ background: "linear-gradient(135deg, rgba(200,220,255,0.6), rgba(255,200,255,0.3), rgba(200,255,220,0.4))", backdropFilter: "blur(4px)" }}>
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40px] font-extrabold text-[#121212]/30 italic">N</p>
        </div>

        {/* Bottom-right: Wireframe 3D sphere */}
        <div className="absolute bottom-[40px] right-[100px] z-20 w-[350px] h-[300px]">
          <WebGLWrapper />
        </div>

        {/* Bottom-right: Frosted glass card with text */}
        <div className="absolute bottom-[60px] left-[40%] z-20 w-[400px] rounded-[12px] bg-white/10 backdrop-blur-[12px] border border-white/20 p-[24px]">
          <p className="text-[11px] uppercase tracking-[0.1em] text-[#FFD600]/80 leading-relaxed">
            N-INDIGO BROADCAST QUIET<br/>
            FIRE VE.001 INCL. 389<br/>
            NIGHTS SIZE STILL HERE<br/>
            REGULAR SINGLE WEIGHT<br/>
            HALF LIGHT FONT /&gt; D: SLOW
          </p>
        </div>

        {/* Bottom-left: Red/orange phone-like element */}
        <div className="absolute bottom-[80px] left-[40px] z-20 w-[80px] h-[160px] rounded-[12px] bg-[#FF4400] flex flex-col items-center justify-between py-[16px]">
          <div className="w-[8px] h-[20px] bg-white/80 rounded-full" />
          <div className="size-[40px] rounded-full bg-[#121212] flex items-center justify-center">
            <div className="size-[16px] rounded-full bg-[#FF4400]" />
          </div>
        </div>

        {/* Bottom-left label */}
        <div className="absolute bottom-[20px] left-[20px] z-20">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFD600]/50">H.-1 DEEP NOON</p>
        </div>

        {/* CTA overlay — bottom center */}
        <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-30">
          <Link href="/auth/signup" className="inline-flex items-center gap-[8px] px-[24px] py-[12px] rounded-full bg-[#FFD600] text-[#121212] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150 shadow-[0_0_40px_rgba(255,214,0,0.3)]">
            Launch Your Store <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══ FEATURES: Dark cards grid ═══ */}
      <section id="features" className="px-[24px] py-[80px] bg-[#121212]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFD600] mb-[4px]">Capabilities</p>
            <h2 className="text-[48px] font-extrabold leading-[48px] tracking-[-0.025em] text-white mb-[32px]">Everything<br/>you need.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[4px]">
            {FEATURES.map((f) => (
              <ScrollReveal key={f.title}>
                <div className="rounded-[12px] p-[32px] h-full bg-white/[0.03] border border-white/[0.08] hover:border-[#FFD600]/20 transition-colors duration-150">
                  <div className="size-[32px] rounded-[8px] bg-[#FFD600]/10 flex items-center justify-center mb-[12px]">
                    <f.icon size={16} className="text-[#FFD600]" />
                  </div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-white mb-[4px]">{f.title}</h3>
                  <p className="text-[11px] leading-[16px] tracking-[0.05em] text-white/50">{f.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="px-[24px] py-[80px] bg-[#2047E6]">
        <div className="max-w-[1000px] mx-auto">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFD600] mb-[4px]">Pricing</p>
            <h2 className="text-[48px] font-extrabold leading-[48px] tracking-[-0.025em] text-white mb-[32px]">Start free.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[4px]">
            {PLANS.map((plan) => (
              <ScrollReveal key={plan.name}>
                <div className={`rounded-[12px] p-[32px] h-full flex flex-col ${plan.featured ? "bg-[#FFD600] text-[#121212]" : "bg-[#121212] text-white border border-white/[0.08]"}`}>
                  <p className={`text-[10px] uppercase tracking-[0.15em] mb-[4px] ${plan.featured ? "text-[#121212]/60" : "text-white/40"}`}>{plan.name}</p>
                  <div className="text-[48px] font-extrabold leading-[48px] tracking-[-0.025em] mb-[8px]">{plan.price}</div>
                  <p className={`text-[11px] tracking-[0.1em] mb-[24px] ${plan.featured ? "text-[#121212]/60" : "text-white/40"}`}>{plan.period}</p>
                  <ul className="space-y-[6px] mb-[24px] flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className={`flex items-start gap-[6px] text-[11px] tracking-[0.05em] ${plan.featured ? "text-[#121212]/80" : "text-white/60"}`}>
                        <Check size={12} className={`mt-[2px] shrink-0 ${plan.featured ? "text-[#121212]" : "text-[#FFD600]"}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/signup" className={`block text-center px-[16px] py-[10px] rounded-[4px] text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-150 ${plan.featured ? "bg-[#121212] text-[#FFD600] hover:bg-[#121212]/90" : "bg-[#FFD600] text-[#121212] hover:bg-[#FFD600]/90"}`}>
                    Get Started
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="px-[24px] py-[80px] bg-[#121212] text-center">
        <ScrollReveal>
          <h2 className="text-[48px] font-extrabold leading-[48px] tracking-[-0.025em] text-white mb-[8px]">Ready<span className="text-[#FFD600]">?</span></h2>
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/50 mb-[24px]">Join 12,000+ Nepali businesses. No credit card required.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-[8px] px-[24px] py-[12px] rounded-[4px] bg-[#FFD600] text-[#121212] text-[11px] font-bold uppercase tracking-[0.1em] hover:bg-[#FFD600]/90 transition-colors duration-150 shadow-[0_0_30px_rgba(255,214,0,0.3)]">
            Start Free Today <ArrowRight size={14} />
          </Link>
        </ScrollReveal>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="px-[24px] py-[24px] bg-[#121212] border-t border-white/[0.05]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between text-[10px] uppercase tracking-[0.15em] text-white/30">
          <span className="text-[#FFD600] font-bold text-[12px]">INDIGO</span>
          <div className="flex gap-[16px]">
            <Link href="/legal/privacy" className="hover:text-white/60 transition-colors duration-150">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white/60 transition-colors duration-150">Terms</Link>
          </div>
          <span>2026</span>
        </div>
      </footer>

      {/* Ticker animation */}
      <style dangerouslySetInnerHTML={{ __html: `@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }` }} />
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

const PLANS = [
  { name: "Free", price: "₨0", period: "Forever", featured: false, features: ["25 products", "eSewa + COD", "Indigo subdomain", "Basic analytics"] },
  { name: "Growth", price: "₨2K", period: "/month", featured: true, features: ["Unlimited products", "All payments", "Custom domain", "Advanced analytics", "Discount codes"] },
  { name: "Pro", price: "₨6K", period: "/month", featured: false, features: ["Everything in Growth", "Multi-staff", "API access", "WhatsApp alerts", "Priority support"] },
];

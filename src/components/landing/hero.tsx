"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GridPattern,
  BlueprintCornerTicks,
  TechnicalAnnotation,
} from "./blueprint-primitives";

/* ─── MediaStack: Storefront mock (rear layer) ─── */
function StorefrontMock() {
  return (
    <div className="rounded-lg bg-[#141414] border border-white/8 overflow-hidden">
      <div className="aspect-[4/3] bg-gradient-to-br from-white/8 via-white/3 to-transparent flex items-center justify-center">
        <div className="w-14 h-14 rounded-xl bg-white/8 border border-white/8 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white/40">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 6l-2 2M13 6l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-3 w-3/4 rounded bg-white/12" />
        <div className="h-2.5 w-1/2 rounded bg-white/8" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-12 rounded bg-white/25" />
          <div className="h-7 rounded-full bg-white text-[10px] font-mono font-medium text-black px-3 flex items-center">
            Add to cart
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MediaStack: Dashboard mock (front layer) ─── */
function DashboardMock() {
  const bars = [40, 65, 30, 80, 55, 70, 90, 60, 75, 45, 85, 65];
  return (
    <div className="rounded-lg bg-[#141414] border border-white/8 overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
        <span className="w-2.5 h-2.5 rounded-full bg-white/12" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/12" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/12" />
        <span className="ml-4 font-mono text-[10px] uppercase tracking-widest text-white/30">
          dashboard.indigo.co
        </span>
      </div>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-24 sm:w-32 border-r border-white/8 p-3 space-y-2 hidden sm:block">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2.5 rounded ${i === 0 ? "bg-white/20" : "bg-white/8"}`}
            />
          ))}
        </div>
        {/* Main panel */}
        <div className="flex-1 p-4 md:p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-2.5 w-24 rounded bg-white/12" />
              <div className="h-6 w-16 rounded bg-white/30" />
            </div>
            <div className="h-7 rounded-full bg-white font-mono text-[10px] font-medium text-black px-3 flex items-center">
              + Add product
            </div>
          </div>
          {/* Chart */}
          <div className="group/dashboard flex items-end gap-1.5 h-20 md:h-28">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-white/15 group-hover/dashboard:bg-white/30 transition-colors"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          {/* Rows */}
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-2.5 w-24 rounded bg-white/8" />
                <div className="h-2.5 w-10 rounded bg-white/15" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Hero Section ═══ */
export function Hero() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard?.writeText("npx create-indigo-app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="hero"
      className="relative bg-background text-foreground overflow-hidden"
    >
      {/* ─── Background layers ─── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Blueprint grid (primary structural layer) */}
        <GridPattern opacity={0.04} className="text-foreground" />

        {/* Diagonal blue light streaks */}
        <div
          className="absolute w-[600px] h-[1200px] opacity-20 blur-3xl"
          style={{
            background: "linear-gradient(135deg, transparent, #007fae 40%, transparent 60%)",
            top: "-20%",
            right: "10%",
            transform: "rotate(-15deg)",
          }}
        />
        <div
          className="absolute w-[400px] h-[800px] opacity-10 blur-3xl"
          style={{
            background: "linear-gradient(135deg, transparent, #007fae 50%, transparent)",
            top: "10%",
            right: "30%",
            transform: "rotate(-20deg)",
          }}
        />

        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay opacity-20 mix-blend-overlay" />

        {/* Fade into next section */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* ─── Technical measurement: vertical line connecting copy to visual ─── */}
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-px h-32 opacity-30" style={{ background: "var(--border)" }} />

      {/* ─── Hero content ─── */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-24 lg:pt-32 pb-10 lg:pb-16 grid lg:grid-cols-12 gap-12 lg:gap-0 items-center">
        {/* Copy column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* System annotation above headline */}
          <TechnicalAnnotation
            label="SYSTEM"
            value="/ 01"
            accent
            className="hero-fade"
          />

          {/* Headline */}
          <h1
            className="hero-fade font-payload-h1 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] leading-[0.95] tracking-tight text-balance"
            style={{ animationDelay: "0.1s" }}
          >
            The platform to build the modern store.
          </h1>

          {/* Subheadline */}
          <p
            className="hero-fade max-w-md text-lg text-muted-foreground"
            style={{ animationDelay: "0.25s" }}
          >
            Launch a premium e-commerce storefront with zero code, unlimited
            scale, and every tool built in.
          </p>

          {/* CTAs */}
          <div
            className="hero-fade flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            style={{ animationDelay: "0.35s" }}
          >
            <Link href="/signup" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto h-12 rounded-lg px-7 text-base font-medium group">
                Start selling
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/api/contact" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12 rounded-lg px-7 text-base"
              >
                Get a demo
              </Button>
            </Link>
          </div>

          {/* Terminal command */}
          <div
            className="hero-fade flex items-center gap-3"
            style={{ animationDelay: "0.5s" }}
          >
            <button
              onClick={copyCommand}
              aria-label={copied ? "Copied create-indigo-app command" : "Copy create-indigo-app command to clipboard"}
              aria-live="polite"
              className="inline-flex items-center gap-2 font-mono text-[13px] text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span className="text-foreground/30">$</span> npx create-indigo-app
              {copied ? (
                <Check size={13} className="text-[#007fae]" />
              ) : (
                <Copy
                  size={13}
                  className="text-foreground/30 group-hover:text-foreground/60 transition-colors"
                />
              )}
            </button>
          </div>
        </div>

        {/* Visual column — MediaStack with blueprint framing */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] sm:aspect-[16/11] max-w-lg sm:max-w-none mx-auto w-full lg:-ml-10">
            {/* Blueprint corner ticks around the media stack container */}
            <div className="absolute -inset-4 sm:-inset-6 pointer-events-none">
              <BlueprintCornerTicks color="rgba(0,127,174,0.4)" size={14} />
            </div>

            {/* Technical annotation above the media stack */}
            <TechnicalAnnotation
              label="STORE ENGINE"
              value="/ ACTIVE"
              accent
              className="absolute -top-6 left-0 z-20"
            />

            {/* Technical annotation below the media stack */}
            <TechnicalAnnotation
              label="LIVE PREVIEW"
              className="absolute -bottom-6 right-0 z-20"
            />

            {/* Rear screenshot — storefront with faint engineering pattern */}
            <div
              className="absolute bottom-0 left-0 w-[56%] z-0 hero-fade"
              style={{ animationDelay: "0.7s", animationDuration: "1.2s" }}
            >
              <div className="relative">
                <div className="glass-frame rounded-xl p-2">
                  <StorefrontMock />
                </div>
                {/* Faint engineering hatch on rear mock */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-[0.06]">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="bp-hatch-hero" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="12" stroke="white" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#bp-hatch-hero)" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Front screenshot — dashboard with corner ticks */}
            <div
              className="absolute top-0 right-0 w-[80%] z-10 hero-fade"
              style={{ animationDelay: "0.4s", animationDuration: "1.0s" }}
            >
              <div className="relative">
                <div className="glass-frame rounded-xl p-2">
                  <DashboardMock />
                </div>
                {/* Corner ticks on the primary dashboard mockup */}
                <div className="absolute -inset-2 pointer-events-none">
                  <BlueprintCornerTicks color="rgba(0,127,174,0.6)" size={10} corners={["tl", "tr", "bl", "br"]} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

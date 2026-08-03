"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [ref, isVisible] = useInView<HTMLDivElement>();

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <span className="block font-payload-h6 text-muted-foreground mb-6">
            Pricing
          </span>
          <h2 className="font-payload-h2 text-foreground">
            Simple, transparent <br />
            <span className="text-muted-foreground">pricing</span>
          </h2>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-4 mb-12">
          <span
            className={`font-payload-body transition-colors ${
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
            id="pricing-period-monthly"
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isAnnual}
            aria-labelledby="pricing-period-monthly pricing-period-annual"
            onClick={() => setIsAnnual(!isAnnual)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setIsAnnual(!isAnnual);
              }
            }}
            className="w-12 h-6 bg-border rounded-full p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              aria-hidden="true"
              className={`block w-4 h-4 bg-foreground rounded-full transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`font-payload-body transition-colors flex items-center gap-2 ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
            id="pricing-period-annual"
          >
            Annual
            <span className="bg-foreground text-background text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          </span>
        </div>

        {/* Pricing cards */}
        <div
          ref={ref}
          className="grid md:grid-cols-3 gap-px bg-border border border-border"
        >
          {/* Starter */}
          <div
            className={cn(
              "bg-background p-8 lg:p-10 flex flex-col transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
            )}
            style={{ transitionDelay: "0ms" }}
          >
            <h3 className="font-payload-h3 mb-2">Starter</h3>
            <p className="font-payload-body text-muted-foreground mb-6 h-10">
              Perfect for new merchants testing the waters.
            </p>
            <div className="mb-8">
              <span className="font-payload-h1 text-4xl">$0</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <Link href="/signup" className="w-full">
              <Button variant="outline" className="w-full rounded-lg mb-8 h-12">
                Get Started
              </Button>
            </Link>
            <ul className="space-y-3 text-sm mt-auto">
              {[
                "Up to 100 products",
                "1 store",
                "Community support",
                "Basic analytics",
                "SSL included",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-muted-foreground" />
                  <span className="font-payload-body text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Growth */}
          <div
            className={cn(
              "bg-background p-8 lg:p-10 flex flex-col relative md:-my-4 border-2 border-foreground z-10 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
            )}
            style={{ transitionDelay: "100ms" }}
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-foreground text-background font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full">
              Popular
            </div>
            <h3 className="font-payload-h3 mb-2">Growth</h3>
            <p className="font-payload-body text-muted-foreground mb-6 h-10">
              For scaling businesses that need more power.
            </p>
            <div className="mb-8">
              <span className="font-payload-h1 text-4xl">
                ${isAnnual ? "24" : "29"}
              </span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <Link href="/signup" className="w-full">
              <Button className="w-full rounded-lg mb-8 h-12">
                Start Free Trial
              </Button>
            </Link>
            <ul className="space-y-3 text-sm mt-auto">
              {[
                "Unlimited products",
                "3 stores",
                "Priority support",
                "Advanced analytics",
                "Custom domain",
                "Team collaboration",
                "API access",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4" />
                  <span className="font-payload-body">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise */}
          <div
            className={cn(
              "bg-background p-8 lg:p-10 flex flex-col transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
            )}
            style={{ transitionDelay: "200ms" }}
          >
            <h3 className="font-payload-h3 mb-2">Enterprise</h3>
            <p className="font-payload-body text-muted-foreground mb-6 h-10">
              Custom solutions for high-volume brands.
            </p>
            <div className="mb-8">
              <span className="font-payload-h1 text-4xl">Custom</span>
            </div>
            <Link href="/api/contact" className="w-full">
              <Button variant="outline" className="w-full rounded-lg mb-8 h-12">
                Contact Sales
              </Button>
            </Link>
            <ul className="space-y-3 text-sm mt-auto">
              {[
                "Everything in Growth",
                "Unlimited stores",
                "24/7 dedicated support",
                "Custom integrations",
                "SLA guarantee",
                "On-premise option",
                "Security audit",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-muted-foreground" />
                  <span className="font-payload-body text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12 font-payload-body">
          All plans include secure hosting, unmetered bandwidth, and zero setup
          fees.
        </p>
      </div>
    </section>
  );
}

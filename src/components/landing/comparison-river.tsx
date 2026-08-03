"use client";

import { Check, X, Store, CreditCard, Zap, Paintbrush, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import {
  GridPattern,
  BlueprintCornerTicks,
  TechnicalAnnotation,
} from "./blueprint-primitives";

const points = [
  {
    icon: Store,
    label: "Store Management",
    traditional: "Single store per account, complex multi-site setup",
    indigo: "Unlimited storefronts from one unified dashboard",
  },
  {
    icon: CreditCard,
    label: "Payment Integrations",
    traditional: "Struggle with local gateway plugins and APIs",
    indigo: "Native support for global and local payment providers",
  },
  {
    icon: Zap,
    label: "Performance",
    traditional: "Bloated themes requiring constant optimization",
    indigo: "Lightning-fast edge delivery built-in automatically",
  },
  {
    icon: Paintbrush,
    label: "Customization",
    traditional: "Rigid templates or messy custom code hacks",
    indigo: "Component-driven design system with full code access",
  },
  {
    icon: Tag,
    label: "Pricing",
    traditional: "Hidden transaction fees and expensive app ecosystem",
    indigo: "Transparent flat pricing, essential features included",
  },
];

export function ComparisonRiver() {
  const [ref, isVisible] = useInView<HTMLDivElement>();

  return (
    <section className="relative py-24 lg:py-32 bg-background border-t border-border overflow-hidden">
      {/* Engineering grid background */}
      <div className="absolute inset-0 pointer-events-none text-foreground">
        <GridPattern opacity={0.03} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16">
          <TechnicalAnnotation
            label="COMPARISON"
            value="/ MATRIX"
            accent
            className="block mb-6"
          />
          <span className="block font-payload-h6 text-muted-foreground mb-6">
            Why Indigo
          </span>
          <h2 className="font-payload-h2 text-foreground max-w-2xl">
            The old way vs the{" "}
            <span className="text-[#007fae]">new way</span>
          </h2>
        </div>

        {/* Comparison grid with blueprint framing */}
        <div className="relative">
          {/* Corner ticks around the comparison table */}
          <div className="absolute -inset-3 pointer-events-none hidden md:block">
            <BlueprintCornerTicks color="rgba(0,127,174,0.3)" size={14} />
          </div>

          <div ref={ref} className="border border-border overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-1 md:grid-cols-12 bg-secondary/50">
              <div className="md:col-span-4 p-5 border-b md:border-b-0 md:border-r border-border">
                <TechnicalAnnotation label="FEATURE" />
              </div>
              <div className="md:col-span-4 p-5 border-b md:border-b-0 md:border-r border-border">
                <TechnicalAnnotation label="TRADITIONAL" />
              </div>
              <div className="md:col-span-4 p-5">
                <TechnicalAnnotation label="INDIGO" accent />
              </div>
            </div>

            {/* Comparison rows */}
            {points.map((point, i) => {
              const Icon = point.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-12 transition-all duration-500",
                    i < points.length - 1 && "border-b border-border",
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3",
                    i % 2 === 0 ? "bg-background" : "bg-secondary/30",
                  )}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  {/* Category */}
                  <div className="md:col-span-4 p-5 flex items-center gap-3 border-b md:border-b-0 md:border-r border-border">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-payload-body font-medium text-foreground">
                      {point.label}
                    </span>
                  </div>

                  {/* Traditional */}
                  <div className="md:col-span-4 p-5 flex items-center gap-3 border-b md:border-b-0 md:border-r border-border">
                    <div className="flex-shrink-0 p-1 rounded-full bg-[#ff876f]/10">
                      <X className="w-3.5 h-3.5 text-[#ff876f]" />
                    </div>
                    <p className="font-payload-body text-muted-foreground">
                      {point.traditional}
                    </p>
                  </div>

                  {/* Indigo */}
                  <div className="md:col-span-4 p-5 flex items-center gap-3 relative">
                    {/* Active column indicator */}
                    <span className="absolute left-0 top-0 bottom-0 w-px bg-[#007fae] opacity-30" />
                    <div className="flex-shrink-0 p-1 rounded-full bg-[#007fae]/10">
                      <Check className="w-3.5 h-3.5 text-[#007fae]" />
                    </div>
                    <p className="font-payload-body text-foreground font-medium">
                      {point.indigo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

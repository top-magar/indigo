"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { GridPattern, TechnicalAnnotation } from "./blueprint-primitives";

const metrics = [
  { value: "12,000+", label: "Stores", annotation: "ACTIVE" },
  { value: "$2.4B", label: "GMV Processed", annotation: "VOLUME" },
  { value: "99.99%", label: "Uptime", annotation: "SLA" },
  { value: "150+", label: "Countries", annotation: "REGIONS" },
];

export function SocialProof() {
  const [ref, isVisible] = useInView<HTMLDivElement>();

  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 pointer-events-none text-foreground">
        <GridPattern opacity={0.03} />
      </div>

      {/* Technical top border band */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-border" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <TechnicalAnnotation
          label="GLOBAL METRICS"
          value="/ 2026"
          accent
          className="block mb-8"
        />

        <span className="block font-payload-h6 text-muted-foreground mb-12">
          Trusted by merchants worldwide
        </span>

        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 relative"
        >
          {/* Vertical measurement dividers */}
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/4 w-px bg-border opacity-50" />
          <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-px bg-border opacity-50" />
          <div className="hidden lg:block absolute top-0 bottom-0 left-3/4 w-px bg-border opacity-50" />

          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={cn(
                "flex flex-col space-y-2 px-4 py-6 transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5",
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <TechnicalAnnotation label={metric.annotation} />
              <div className="font-payload-h2 text-foreground mt-2">
                {metric.value}
              </div>
              <div className="font-payload-body text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

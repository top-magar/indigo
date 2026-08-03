"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { TechnicalAnnotation } from "./blueprint-primitives";

const performanceMetrics = [
  { label: "Avg TTFB", value: "42ms", annotation: "LATENCY" },
  { label: "API Uptime", value: "99.99%", annotation: "SLA" },
  { label: "P95 Latency", value: "180ms", annotation: "RESPONSE" },
  { label: "CDN Edges", value: "320+", annotation: "NETWORK" },
];

export function Metrics() {
  const [ref, isVisible] = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-background py-16 md:py-24 overflow-hidden relative">
      {/* Technical borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      {/* Registration ticks on borders */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-border bg-background" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 border border-border bg-background" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center md:text-left relative"
        >
          {/* Vertical measurement dividers */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/4 w-px bg-border opacity-40" />
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-border opacity-40" />
          <div className="hidden md:block absolute top-0 bottom-0 left-3/4 w-px bg-border opacity-40" />

          {performanceMetrics.map((metric, i) => (
            <div
              key={metric.label}
              className={cn(
                "flex flex-col gap-2 px-4 transition-all duration-500",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5",
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <TechnicalAnnotation label={metric.annotation} accent={i === 0} />
              <div className={cn(
                "font-payload-h2 text-foreground mt-1",
                i === 0 && "text-[#007fae]",
              )}>
                {metric.value}
              </div>
              <div className="font-payload-h6 text-muted-foreground">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

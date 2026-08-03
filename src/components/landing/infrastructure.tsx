"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import {
  GridPattern,
  BlueprintCornerTicks,
  TechnicalAnnotation,
} from "./blueprint-primitives";

const infraCards = [
  {
    num: "01",
    title: "Edge Network",
    description: "200+ global PoPs for sub-50ms response times ensuring your storefront loads instantly anywhere.",
    status: "ACTIVE",
    size: "large",
  },
  {
    num: "02",
    title: "Auto-scaling",
    description: "Handle 100x traffic spikes during flash sales without sweating over server provisioning.",
    status: "READY",
    size: "small",
  },
  {
    num: "03",
    title: "99.99% Uptime",
    description: "SLA-backed reliability for mission-critical stores. We don't go down so your revenue doesn't stop.",
    status: "MONITORED",
    size: "small",
  },
  {
    num: "04",
    title: "Zero Code",
    description: "Drag-and-drop your way to a highly converting storefront. Complete design freedom without writing a single line of code.",
    status: "BUILT-IN",
    size: "large",
  },
];

export function Infrastructure() {
  const [sectionRef, isVisible] = useInView<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-b border-border bg-background overflow-hidden"
    >
      {/* Blueprint grid background */}
      <div className="absolute inset-0 pointer-events-none text-foreground">
        <GridPattern opacity={0.035} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <TechnicalAnnotation
            label="INFRASTRUCTURE"
            value="/ NETWORK"
            accent
            className="block mb-6"
          />
          <span className="block font-payload-h6 text-muted-foreground mb-6">
            Infrastructure
          </span>
          <h2 className="font-payload-h2 text-foreground mb-8">
            Built for
            <br />
            <span className="text-muted-foreground">scale</span>
          </h2>
          <p className="font-payload-body-lg text-muted-foreground max-w-2xl mb-16">
            Our globally distributed edge network brings your storefront closer
            to your customers, delivering unparalleled speed and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 w-full">
          {/* Corner ticks around the infrastructure system */}
          <div className="relative">
            <div className="absolute -inset-2 pointer-events-none hidden md:block">
              <BlueprintCornerTicks color="rgba(0,127,174,0.4)" size={12} />
            </div>

            {infraCards.map((card, i) => (
              <div
                key={card.num}
                className={cn(
                  "rounded-xl border border-border bg-secondary/50 p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative group transition-all duration-500",
                  card.size === "large" ? "md:col-span-4" : "md:col-span-2",
                  i < 2 ? "mb-4 md:mb-0" : "",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5",
                )}
                style={{ transitionDelay: `${150 + i * 150}ms` }}
              >
                {/* Network status indicator — blue for active */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      card.status === "ACTIVE" ? "bg-[#007fae]" : "bg-muted-foreground/40",
                    )}
                  />
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    {card.status}
                  </span>
                </div>

                <div
                  className={cn(
                    "relative z-10",
                    card.size === "large" ? "mt-24 md:mt-40" : "mt-32",
                  )}
                >
                  <div className="font-mono text-xs text-muted-foreground/60 mb-4 tracking-widest">
                    {card.num}
                  </div>
                  <h3 className="font-payload-h3 text-foreground mb-3">
                    {card.title}
                  </h3>
                  <p
                    className={cn(
                      "text-muted-foreground",
                      card.size === "large" ? "font-payload-body-lg" : "font-payload-body",
                    )}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

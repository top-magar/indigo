"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";
import { GridPattern, TechnicalAnnotation, MeasurementLine } from "./blueprint-primitives";

const steps = [
  {
    num: "01",
    title: "Design your storefront",
    description:
      "Use the visual page builder to create pixel-perfect pages without writing any code.",
  },
  {
    num: "02",
    title: "Add your products",
    description:
      "Import or create your catalog with variants, pricing, and media in minutes.",
  },
  {
    num: "03",
    title: "Start selling",
    description:
      "Go live with payments, shipping, and analytics built in and ready to scale.",
  },
];

export function HowItWorks() {
  const [ref, isVisible] = useInView<HTMLDivElement>();

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 bg-background">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 pointer-events-none text-foreground">
        <GridPattern opacity={0.03} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col space-y-16">
          <div className="space-y-6 max-w-3xl">
            <TechnicalAnnotation label="WORKFLOW" value="/ 3 STEPS" className="block mb-4" />
            <span className="block font-payload-h6 text-muted-foreground">
              How it works
            </span>
            <h2 className="font-payload-h2 text-foreground">
              From idea to <br />
              <span className="text-muted-foreground">live store</span>
            </h2>
          </div>

          <div
            ref={ref}
            className="grid lg:grid-cols-3 gap-px bg-border border border-border"
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "bg-background p-10 lg:p-12 flex flex-col space-y-12 transition-all duration-500 relative",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5",
                )}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Blueprint step marker with measurement line */}
                <div className="flex items-center gap-4">
                  <div className="font-mono text-sm text-[#007fae] font-medium">
                    {step.num}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block flex-1 h-px bg-border opacity-50" />
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="font-payload-h3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="font-payload-body text-muted-foreground">
                    {step.description}
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

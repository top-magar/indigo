"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

const features = [
  {
    title: "Visual Page Builder",
    description: "Drag-and-drop editor with 50+ blocks. No coding required.",
  },
  {
    title: "Multi-Tenant Architecture",
    description:
      "Each store is isolated and independent for maximum security and performance.",
  },
  {
    title: "Payment Processing",
    description:
      "eSewa, Khalti, Stripe, and 10+ gateways supported out of the box.",
  },
  {
    title: "Inventory Management",
    description: "Real-time stock tracking across channels and locations.",
  },
  {
    title: "Analytics Dashboard",
    description:
      "Revenue, orders, and customer insights to grow your business.",
  },
  {
    title: "Custom Domains",
    description: "Your brand, your domain, your identity. Fully customizable.",
  },
];

export function BentoGrid() {
  const [ref, isVisible] = useInView<HTMLDivElement>();

  return (
    <section id="features" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col space-y-16">
          {/* Header — Payload style */}
          <div className="space-y-6 max-w-3xl">
            <span className="block font-payload-h6 text-muted-foreground">
              Features
            </span>
            <h2 className="font-payload-h2 text-foreground">
              Everything you need <br />
              <span className="text-muted-foreground">
                to sell online
              </span>
            </h2>
          </div>

          {/* Feature grid — Payload clean style */}
          <div
            ref={ref}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "bg-background p-8 lg:p-10 hover:bg-secondary/50 transition-all duration-500 group",
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5",
                )}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="flex flex-col space-y-4 h-full justify-between">
                  <h3 className="font-payload-h3 text-foreground group-hover:translate-x-1 transition-transform duration-300">
                    {feature.title}
                  </h3>
                  <p className="font-payload-body text-muted-foreground">
                    {feature.description}
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

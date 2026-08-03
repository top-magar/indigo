"use client";

import { useInView } from "@/hooks/use-in-view";

const topRow = [
  { name: "eSewa", category: "Payments" },
  { name: "Khalti", category: "Payments" },
  { name: "Stripe", category: "Payments" },
  { name: "Nabil Bank", category: "Banking" },
  { name: "Pathao", category: "Delivery" },
  { name: "Nepal Post", category: "Shipping" },
];

const bottomRow = [
  { name: "Google Analytics", category: "Analytics" },
  { name: "Mailchimp", category: "Marketing" },
  { name: "Slack", category: "Communication" },
  { name: "GitHub", category: "Development" },
  { name: "Figma", category: "Design" },
  { name: "Supabase", category: "Database" },
];

export function IntegrationsMarquee() {
  const [sectionRef, isVisible] = useInView<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      id="integrations"
      className="py-24 lg:py-32 border-b border-border overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <div
          className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <span className="block font-payload-h6 text-muted-foreground mb-6">
            Integrations
          </span>
          <h2 className="font-payload-h2 text-foreground max-w-2xl">
            Works with everything you already use
          </h2>
        </div>
      </div>

      <div className="relative flex flex-col gap-4 w-full">
        {/* Top Marquee */}
        <div className="flex w-[200%] marquee gap-4">
          {[...topRow, ...topRow].map((integration, i) => (
            <div
              key={`top-${integration.name}-${i}`}
              className="px-6 py-5 border border-border bg-background flex flex-col min-w-[240px] hover:bg-secondary/50 transition-colors hover-lift rounded-lg"
            >
              <div className="font-payload-h3 text-foreground mb-1">
                {integration.name}
              </div>
              <div className="font-payload-h6 text-muted-foreground">
                {integration.category}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Marquee */}
        <div className="flex w-[200%] marquee-reverse gap-4">
          {[...bottomRow, ...bottomRow].map((integration, i) => (
            <div
              key={`bottom-${integration.name}-${i}`}
              className="px-6 py-5 border border-border bg-background flex flex-col min-w-[240px] hover:bg-secondary/50 transition-colors hover-lift rounded-lg"
            >
              <div className="font-payload-h3 text-foreground mb-1">
                {integration.name}
              </div>
              <div className="font-payload-h6 text-muted-foreground">
                {integration.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

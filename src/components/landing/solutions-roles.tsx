"use client";

import { cn } from "@/lib/utils";
import { Rocket, Code2, Paintbrush, Building2 } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const roles = [
  {
    icon: Rocket,
    title: "Founders",
    description:
      "Launch your store in a weekend, not a quarter. Start selling faster with pre-built templates and blocks.",
  },
  {
    icon: Code2,
    title: "Developers",
    description:
      "API-first with webhooks, SDKs, and extensible blocks. Build custom integrations and storefronts with ease.",
  },
  {
    icon: Paintbrush,
    title: "Designers",
    description:
      "Visual builder with full CSS control and custom themes. Create pixel-perfect storefronts that match your brand.",
  },
  {
    icon: Building2,
    title: "Enterprise",
    description:
      "Multi-store management, team roles, and SLA guarantees. Scale your operations securely with enterprise-grade tools.",
  },
];

export function SolutionsRoles() {
  const [ref, isVisible] = useInView<HTMLDivElement>();

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col space-y-16">
          <div className="space-y-6 max-w-3xl">
            <span className="block font-payload-h6 text-muted-foreground">
              Built for
            </span>
            <h2 className="font-payload-h2 text-foreground">
              Designed for <br />
              <span className="text-muted-foreground">
                modern commerce
              </span>
            </h2>
          </div>

          <div
            ref={ref}
            className="flex flex-col border-t border-border"
          >
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-12 gap-6 py-10 md:py-14 border-b border-border group transition-all duration-500",
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-5",
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="md:col-span-2 flex items-start">
                    <div className="p-3 rounded-lg bg-secondary text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="md:col-span-4 flex items-center">
                    <h3 className="font-payload-h3 text-foreground">
                      {role.title}
                    </h3>
                  </div>
                  <div className="md:col-span-6 flex items-center">
                    <p className="font-payload-body text-muted-foreground">
                      {role.description}
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

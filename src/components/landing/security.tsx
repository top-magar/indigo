"use client";

import { useInView } from "@/hooks/use-in-view";

const features = [
  {
    title: "Tenant Isolation",
    description:
      "Strict logical separation of merchant data ensures your customer information is siloed and completely secure.",
  },
  {
    title: "End-to-End Encryption",
    description:
      "Data is encrypted in transit using TLS 1.3 and at rest with AES-256 bit encryption keys.",
  },
  {
    title: "SOC 2 Compliant",
    description:
      "Audited annually by independent third parties to guarantee the highest standards of security and privacy.",
  },
  {
    title: "PCI DSS Level 1",
    description:
      "Fully compliant with global payment card industry standards to safely process millions of transactions.",
  },
];

export function Security() {
  const [sectionRef, isVisible] = useInView<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <span className="block font-payload-h6 text-muted-foreground mb-6">
            Security
          </span>
          <h2 className="font-payload-h2 text-foreground mb-12">
            Bank-grade
            <br />
            <span className="text-muted-foreground">security</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-border">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`p-8 border-b border-r border-border transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <h3 className="font-payload-h3 text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="font-payload-body text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

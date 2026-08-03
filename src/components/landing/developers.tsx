"use client";

import { useInView } from "@/hooks/use-in-view";

export function Developers() {
  const [sectionRef, isVisible] = useInView<HTMLElement>();

  const codeSnippet = `
import { Indigo } from '@indigo/sdk';

const client = new Indigo({
  apiKey: process.env.INDIGO_SECRET_KEY,
});

// Create a new product programmatically
const product = await client.products.create({
  name: 'Indigo Tote Bag',
  price: 19900, // in cents
  currency: 'USD',
  inventory: 50,
  variants: ['Red', 'Blue', 'Tactile'],
});

console.log('Product created:', product.id);
`.trim();

  const features = [
    {
      title: "REST API",
      description:
        "Full programmatic access to your store's data with intuitive, predictable endpoints.",
    },
    {
      title: "Webhooks",
      description:
        "React to events in real-time. Automatically trigger workflows when orders are placed or inventory drops.",
    },
    {
      title: "Custom Blocks",
      description:
        "Build custom UI components for your storefront using React 19 and Tailwind CSS 4.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-16 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
        >
          <div>
            <span className="block font-payload-h6 text-muted-foreground mb-6">
              Developers
            </span>
            <h2 className="font-payload-h2 text-foreground mb-10">
              Built for
              <br />
              <span className="text-muted-foreground">developers</span>
            </h2>

            <div className="flex flex-col gap-8 mt-12">
              {features.map((feature, i) => (
                <div key={i} className="border-t border-border pt-5">
                  <h3 className="font-payload-h3 text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-payload-body text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-secondary transform translate-x-3 translate-y-3 rounded-xl border border-border transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"></div>
            <div className="relative bg-foreground text-background p-6 rounded-xl border border-border h-full flex flex-col">
              <div className="flex gap-2 mb-5 border-b border-background/20 pb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-background/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-background/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-background/20"></div>
              </div>
              <pre className="font-mono text-sm leading-relaxed overflow-x-auto text-primary-foreground">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

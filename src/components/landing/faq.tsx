"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "How long does it take to launch a store?",
    answer:
      "With our quick-start templates, you can launch a basic store in under an hour. Custom designs and large product catalogs may take a few days to set up properly.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes, all premium plans allow you to connect your custom domain. We also provide a free indigo.store subdomain for all accounts.",
  },
  {
    question: "What payment gateways do you support?",
    answer:
      "We support major global gateways like Stripe and PayPal, as well as local Nepali gateways including eSewa, Khalti, and IME Pay out of the box.",
  },
  {
    question: "Is there a transaction fee?",
    answer:
      "We do not charge any additional transaction fees on our Growth and Enterprise plans. The Starter plan has a small 2% fee per transaction. Standard payment gateway fees still apply.",
  },
  {
    question: "Can I migrate from Shopify or WooCommerce?",
    answer:
      "Absolutely. We offer a one-click migration tool for both Shopify and WooCommerce that imports your products, customers, and order history seamlessly.",
  },
  {
    question: "Do you offer a free plan?",
    answer:
      "Our Starter plan is completely free and allows you to test the platform with up to 100 products. You only upgrade when you need advanced features.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-8">
        <div className="lg:col-span-5">
          <span className="block font-payload-h6 text-muted-foreground mb-6">
            FAQ
          </span>
          <h2 className="font-payload-h2 text-foreground sticky top-32">
            Common <br />
            <span className="text-muted-foreground">questions</span>
          </h2>
        </div>

        <div className="lg:col-span-7">
          <div className="border-t border-border">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border">
                <button
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <h3 className="font-payload-h3 text-foreground pr-8">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0 text-muted-foreground">
                    {openIndex === i ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === i
                      ? "max-h-96 pb-5 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-payload-body text-muted-foreground pr-10">
                    {faq.answer}
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

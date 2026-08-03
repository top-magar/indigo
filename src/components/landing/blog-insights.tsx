"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const articles = [
  {
    category: "Strategy",
    title: "Optimizing checkout flows for high conversion rates",
    excerpt:
      "Learn how reducing friction in your checkout process can dramatically improve your bottom line and reduce cart abandonment.",
    date: "Jul 18, 2026",
    href: "/blog/optimizing-checkout-flows",
  },
  {
    category: "Platform",
    title: "Announcing native integration with local payment gateways",
    excerpt:
      "We've partnered with top local payment providers to offer seamless, one-click checkout experiences for your regional customers.",
    date: "Jul 02, 2026",
    href: "/blog/native-payment-gateways",
  },
  {
    category: "Growth",
    title: "How to build a multi-channel retail strategy",
    excerpt:
      "Discover the tools and techniques needed to sync inventory across physical stores, online shops, and social media marketplaces.",
    date: "Jun 14, 2026",
    href: "/blog/multi-channel-retail",
  },
];

export function BlogInsights() {
  return (
    <section className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="block font-payload-h6 text-muted-foreground mb-6">
              Insights
            </span>
            <h2 className="font-payload-h2 text-foreground">
              From the <br />
              <span className="text-muted-foreground">blog</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="flex items-center gap-2 font-payload-body text-muted-foreground hover:text-foreground transition-colors pb-2"
          >
            View all articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {articles.map((article, i) => (
            <Link
              key={i}
              href={article.href}
              className="bg-background p-8 lg:p-10 flex flex-col group hover:bg-secondary/50 transition-colors rounded-none"
            >
              <div className="flex justify-between items-center mb-10">
                <span className="font-payload-h6 text-muted-foreground border border-border rounded-full px-3 py-1">
                  {article.category}
                </span>
                <span className="font-payload-body text-muted-foreground text-sm">
                  {article.date}
                </span>
              </div>

              <h3 className="font-payload-h3 mb-3 group-hover:text-muted-foreground transition-colors">
                {article.title}
              </h3>

              <p className="font-payload-body text-muted-foreground mb-10 flex-grow">
                {article.excerpt}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <span className="font-payload-body text-sm">
                  Read article
                </span>
                <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all">
                  <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

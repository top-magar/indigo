"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ModularPattern, TechnicalAnnotation } from "./blueprint-primitives";

const socials: { name: string; href: string }[] = [
  { name: "Twitter", href: "https://twitter.com/indigo" },
  { name: "GitHub", href: "https://github.com/indigo" },
  { name: "LinkedIn", href: "https://linkedin.com/company/indigo" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border pt-20 pb-10 bg-background text-foreground overflow-hidden">
      {/* Subtle blueprint pattern */}
      <div className="absolute inset-0 pointer-events-none text-foreground">
        <ModularPattern opacity={0.03} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-20">
          <div className="md:col-span-2 flex flex-col">
            <div className="font-payload-h3 mb-4">Indigo</div>
            <p className="font-payload-body text-muted-foreground max-w-xs mb-8">
              The multi-tenant e-commerce platform built for scale, speed, and
              beautiful storefronts.
            </p>
            <div className="flex gap-4 mt-auto">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center font-payload-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.name}
                  <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <TechnicalAnnotation label="PRODUCT" className="mb-2" />
            {[
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
              { label: "Integrations", href: "/#integrations" },
              { label: "Changelog", href: "/blog" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-payload-body text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <TechnicalAnnotation label="DEVELOPERS" className="mb-2" />
            {[
              { label: "Documentation", href: "/blog" },
              { label: "API Reference", href: "/blog" },
              { label: "Status", href: "/blog" },
              { label: "GitHub", href: "https://github.com/indigo", external: true },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-payload-body text-muted-foreground hover:text-foreground transition-colors"
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <TechnicalAnnotation label="COMPANY" className="mb-2" />
            {[
              { label: "About", href: "/blog" },
              { label: "Blog", href: "/blog" },
              { label: "Careers", href: "/blog", badge: "Hiring" },
              { label: "Contact", href: "/api/contact" },
            ].map((link) => (
              <div key={link.label} className="flex items-center gap-2">
                <Link
                  href={link.href}
                  className="font-payload-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
                {link.badge && (
                  <span className="bg-secondary text-muted-foreground text-[10px] uppercase font-mono tracking-wider rounded-full px-2 py-0.5">
                    {link.badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <TechnicalAnnotation label="LEGAL" className="mb-2" />
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "DPA"].map(
              (label) => (
                <Link
                  key={label}
                  href="/blog"
                  className="font-payload-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ),
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-border font-payload-body text-muted-foreground gap-4">
          <div>&copy; 2026 Indigo. All rights reserved.</div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#007fae]"></div>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

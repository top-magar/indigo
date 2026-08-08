"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
      { label: "Changelog", href: "/coming-soon" },
      { label: "Roadmap", href: "/coming-soon" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/coming-soon" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/coming-soon" },
      { label: "Customers", href: "#testimonials" },
      { label: "Contact", href: "/coming-soon" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/coming-soon" },
      { label: "API Reference", href: "/coming-soon" },
      { label: "Help Center", href: "/coming-soon" },
      { label: "Community", href: "/coming-soon" },
      { label: "Status", href: "/coming-soon" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/coming-soon" },
      { label: "Terms", href: "/coming-soon" },
      { label: "Security", href: "/coming-soon" },
      { label: "Cookies", href: "/coming-soon" },
      { label: "GDPR", href: "/coming-soon" },
    ],
  },
];

export function Footer() {
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "err", text: "Please enter a valid email address." });
      return;
    }
    event.currentTarget.reset();
    setMessage({ type: "ok", text: "Thanks — we will be in touch." });
  };

  return (
    <footer className="lv2-footer">
      <div className="lv2-container lv2-footer__grid">
        <div className="lv2-footer__brand">
          <Link href="/" className="lv2-brand">
            <span className="lv2-brand__mark" aria-hidden>
              ▸
            </span>
            Indigo
          </Link>
          <p>
            Commerce platform for Nepal with a visual storefront editor, structured catalog, and live analytics.
          </p>

          <form onSubmit={handleSubmit} className="lv2-newsletter" aria-label="Newsletter signup">
            <label className="sr-only" htmlFor="footer-newsletter">
              Email address
            </label>
            <input
              id="footer-newsletter"
              name="email"
              type="email"
              required
              placeholder="you@brand.com"
            />
            <button type="submit" className="lv2-btn lv2-btn--primary lv2-btn--sm">Subscribe</button>
          </form>
          {message ? (
            <div
              role="status"
              className={`lv2-newsletter__msg ${message.type === "ok" ? "lv2-newsletter__msg--ok" : "lv2-newsletter__msg--err"}`}
            >
              {message.text}
            </div>
          ) : null}
        </div>

        {columns.map((column) => (
          <div className="lv2-footer__col" key={column.title}>
            <h4>{column.title}</h4>
            {column.links.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="lv2-container lv2-footer__base">
        <span>© {new Date().getFullYear()} Indigo</span>
        <span className="lv2-footer__status">
          <span className="lv2-dot" aria-hidden /> All systems operational
        </span>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}

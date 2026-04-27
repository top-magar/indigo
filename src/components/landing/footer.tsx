/**
 * Footer — Rich multi-column footer with social links & newsletter (Shopify-inspired).
 */

"use client";

import Link from "next/link";
import { useState } from "react";

const links = {
    Product: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Solutions", href: "/#solutions" },
        { label: "Integrations", href: "/#features" },
        { label: "What's New", href: "/blog" },
    ],
    Resources: [
        { label: "Blog", href: "/blog" },
        { label: "Help Center", href: "/help" },
        { label: "API Docs", href: "/docs" },
        { label: "Community", href: "/community" },
        { label: "FAQ", href: "/#faq" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "mailto:hello@indigo.com.np" },
        { label: "Partners", href: "/partners" },
    ],
    Legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
    ],
};

const socials = [
    { label: "Facebook", href: "https://facebook.com/indigo", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
    { label: "Instagram", href: "https://instagram.com/indigo", icon: "M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 11a3 3 0 110-6 3 3 0 010 6zm3.5-6.5a1 1 0 110-2 1 1 0 010 2z" },
    { label: "X", href: "https://x.com/indigo", icon: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z" },
    { label: "YouTube", href: "https://youtube.com/@indigo", icon: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" },
];

export function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    return (
        <footer className="border-t border-border/50 bg-muted/20">
            <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
                <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Brand + newsletter */}
                    <div className="col-span-2 md:col-span-6 lg:col-span-4">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center text-xs font-semibold">I</span>
                            <span className="text-lg font-semibold text-foreground tracking-tight">Indigo</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                            E-commerce infrastructure for Nepal. Making it possible for anyone to sell online — from Kathmandu to Jumla.
                        </p>

                        {/* Newsletter */}
                        <div className="mt-6">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3">
                                Stay updated
                            </p>
                            {subscribed ? (
                                <p className="text-sm text-success">Thanks! You&apos;re subscribed ✓</p>
                            ) : (
                                <form
                                    onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com…"
                                        className="h-9 px-3 rounded-lg border border-border/50 bg-background text-sm text-foreground placeholder:text-muted-foreground/50 flex-1 min-w-0 focus:outline-none focus:border-foreground/30 transition-colors"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors shrink-0"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Social links */}
                        <div className="flex gap-3 mt-6">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d={s.icon} /></svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(links).map(([title, items]) => (
                        <div key={title} className="col-span-1 lg:col-span-2">
                            <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-5">
                                {title}
                            </h4>
                            <ul className="space-y-3">
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground/50">
                        © 2026 Indigo · Made in Nepal 🇳🇵
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
                        <span>NPR (रू)</span>
                        <span>·</span>
                        <span>English</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

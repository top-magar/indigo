/**
 * Features — Aceternity StickyScrollReveal for immersive feature showcase.
 * Each feature gets full breathing room as user scrolls (Cursor/Fermion pattern).
 */

"use client";

import { motion } from "framer-motion";
import { StickyScroll } from "@/components/ui/aceternity/sticky-scroll-reveal";
import { Wallet, Truck, BarChart3, Smartphone, Globe } from "lucide-react";

const icons = [Wallet, Truck, BarChart3, Smartphone, Globe];
const colors = ["emerald", "blue", "purple", "amber", "indigo"];

const content = [
    {
        title: "Accept every payment method in Nepal",
        description:
            "eSewa, Khalti, IME Pay, ConnectIPS, and international Visa/Mastercard. Money hits your account same day.",
        content: (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 p-6">
                <div className="space-y-3 w-full max-w-xs">
                    {["eSewa — Rs 23,400", "Khalti — Rs 18,200", "Card — Rs 5,600"].map((t) => (
                        <div key={t} className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-sm text-white/70">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        title: "Ship anywhere with one click",
        description:
            "Pathao integration with auto labels, real-time tracking, and SMS notifications. From Kathmandu to Biratnagar.",
        content: (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-900/40 p-6">
                <div className="space-y-3 w-full max-w-xs">
                    {["Shipped — 42", "In transit — 18", "Delivered — 156"].map((t) => (
                        <div key={t} className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-sm text-white/70">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        title: "See what sells in real time",
        description:
            "Revenue, orders, conversion rates, top products — all in one dashboard. Make decisions with data.",
        content: (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-900/40 p-6">
                <div className="space-y-3 w-full max-w-xs">
                    {["Revenue — Rs 47,200 ↑12%", "Orders — 84 ↑8%", "Conversion — 3.2% ↑0.4%"].map((t) => (
                        <div key={t} className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                            <div className="w-2 h-2 rounded-full bg-purple-400" />
                            <span className="text-sm text-white/70">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        title: "Run your store from your phone",
        description:
            "Manage orders, check analytics, and respond to customers while you're sourcing products.",
        content: (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 p-6">
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                    {["New orders: 12", "Messages: 5", "Low stock: 3", "Reviews: 8"].map((t) => (
                        <div key={t} className="rounded-lg bg-white/5 border border-white/10 px-3 py-3 text-center">
                            <span className="text-sm text-white/70">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        title: "Sell beyond Nepal",
        description:
            "Multi-currency support with international Visa & Mastercard. Reach customers from India to Dubai.",
        content: (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-900/40 p-6">
                <div className="space-y-3 w-full max-w-xs">
                    {["NPR — Rs 2.1M", "USD — $1,240", "INR — ₹48,000"].map((t) => (
                        <div key={t} className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                            <span className="text-sm text-white/70">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 sm:py-32 bg-background scroll-mt-28">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Features</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Everything you need to sell online
                    </h2>
                </motion.div>

                <StickyScroll content={content} />
            </div>
        </section>
    );
}

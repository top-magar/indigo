/**
 * Features — Tabbed showcase with Framer Motion transitions.
 */

"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet, Truck, BarChart3, Smartphone, Globe, type LucideIcon,
} from "lucide-react";

interface Feature {
    icon: LucideIcon;
    tab: string;
    title: string;
    description: string;
    preview: { label: string; value: string; change?: string }[];
    barHeights: number[];
    color: string;
}

const features: Feature[] = [
    {
        icon: Wallet, tab: "Payments",
        title: "Accept every payment method in Nepal",
        description: "All major Nepal payment methods — digital wallets, bank transfers, and international cards. Money hits your account same day.",
        preview: [
            { label: "eSewa", value: "Rs 23,400", change: "+18%" },
            { label: "Khalti", value: "Rs 18,200", change: "+12%" },
            { label: "Card", value: "Rs 5,600", change: "+7%" },
        ],
        barHeights: [40, 65, 35, 80, 55, 70, 45, 90, 60, 75, 50, 85],
        color: "bg-success/100",
    },
    {
        icon: Truck, tab: "Shipping",
        title: "Ship anywhere with one click",
        description: "Pathao integration with auto labels, real-time tracking, and SMS notifications. From Kathmandu to Biratnagar.",
        preview: [
            { label: "Shipped", value: "42", change: "+6" },
            { label: "In transit", value: "18" },
            { label: "Delivered", value: "156", change: "+23" },
        ],
        barHeights: [30, 50, 70, 45, 60, 80, 55, 40, 65, 75, 50, 60],
        color: "bg-blue-500",
    },
    {
        icon: BarChart3, tab: "Analytics",
        title: "See what sells in real time",
        description: "Revenue, orders, conversion rates, top products — all in one dashboard. Make decisions with data.",
        preview: [
            { label: "Revenue", value: "Rs 47,200", change: "+12%" },
            { label: "Orders", value: "84", change: "+8%" },
            { label: "Conversion", value: "3.2%", change: "+0.4%" },
        ],
        barHeights: [55, 70, 40, 85, 60, 75, 50, 90, 65, 80, 45, 95],
        color: "bg-purple-500",
    },
    {
        icon: Smartphone, tab: "Mobile",
        title: "Run your store from your phone",
        description: "Manage orders, check analytics, and respond to customers while you're sourcing products.",
        preview: [
            { label: "New orders", value: "12" },
            { label: "Messages", value: "5" },
            { label: "Low stock", value: "3" },
        ],
        barHeights: [60, 45, 75, 50, 65, 40, 80, 55, 70, 45, 60, 50],
        color: "bg-amber-500",
    },
    {
        icon: Globe, tab: "Multi-currency",
        title: "Sell beyond Nepal",
        description: "Multi-currency support with international Visa & Mastercard. Reach customers from India to Dubai.",
        preview: [
            { label: "NPR", value: "Rs 2.1M" },
            { label: "USD", value: "$1,240" },
            { label: "INR", value: "₹48,000" },
        ],
        barHeights: [70, 55, 85, 40, 60, 75, 50, 80, 65, 45, 70, 90],
        color: "bg-indigo-500",
    },
];

export function Features() {
    const [active, setActive] = useState(0);
    const f = features[active];

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

                <div className="flex flex-wrap justify-center gap-2 mb-16">
                    {features.map((feat, i) => (
                        <button
                            key={feat.tab}
                            onClick={() => setActive(i)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                                active === i
                                    ? "bg-foreground text-background scale-105"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <feat.icon className="w-4 h-4" />
                            {feat.tab}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h3 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-4">{f.title}</h3>
                            <p className="text-base text-muted-foreground leading-relaxed max-w-lg">{f.description}</p>
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={active}
                            className="rounded-2xl border border-border/50 bg-muted/10 p-6 md:p-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-3 gap-3">
                                {f.preview.map((p, i) => (
                                    <motion.div
                                        key={p.label}
                                        className="rounded-xl border border-border/50 bg-background p-4"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{p.label}</p>
                                        <p className="text-lg font-semibold text-foreground tracking-tight tabular-nums">{p.value}</p>
                                        {p.change && <p className="text-xs text-success mt-1 tabular-nums">{p.change}</p>}
                                    </motion.div>
                                ))}
                            </div>
                            <div className="mt-6 flex items-end gap-1.5 h-20">
                                {f.barHeights.map((h, i) => (
                                    <motion.div
                                        key={`${active}-${i}`}
                                        className={cn("flex-1 rounded-sm origin-bottom", f.color + "/30")}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ duration: 0.5, delay: i * 0.03, ease: "easeOut" }}
                                        style={{ height: `${h}%` }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

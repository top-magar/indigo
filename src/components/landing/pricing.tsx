/**
 * Pricing — Cards with Framer Motion stagger and billing toggle.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/shared/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Minus, ChevronDown } from "lucide-react";

const plans = [
    {
        id: "hobby", name: "Hobby", description: "Test the waters",
        price: { monthly: 0, yearly: 0 },
        features: ["Up to 50 products", "Store theme", "Cash on delivery", "Order management", "Community support"],
        cta: "Start Free", highlighted: false,
    },
    {
        id: "pro", name: "Pro", description: "For serious sellers",
        price: { monthly: 2500, yearly: 25000 },
        features: ["Unlimited products", "Online payment integrations", "Custom domain", "Real-time analytics", "Priority WhatsApp support", "FB & Instagram sync"],
        cta: "Start 14-Day Trial", highlighted: true,
    },
    {
        id: "scale", name: "Scale", description: "High volume brands",
        price: { monthly: 6000, yearly: 60000 },
        features: ["Everything in Pro", "Multi-store dashboard", "Developer API", "Dedicated success manager", "99.9% uptime SLA"],
        cta: "Talk to Sales", highlighted: false,
    },
];

type V = true | false | string;
const compareRows: [string, V, V, V][] = [
    ["Products", "50", "Unlimited", "Unlimited"],
    ["Store themes", "1", "All", "All + custom"],
    ["Custom domain", false, true, true],
    ["Online payments", false, true, true],
    ["Cash on delivery", true, true, true],
    ["Real-time analytics", false, true, true],
    ["FB & Instagram sync", false, true, true],
    ["Multi-store dashboard", false, false, true],
    ["Developer API", false, false, true],
    ["Dedicated success manager", false, false, true],
    ["99.9% uptime SLA", false, false, true],
    ["Support", "Community", "Priority WhatsApp", "Dedicated"],
];

export function Pricing() {
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
    const [showCompare, setShowCompare] = useState(false);

    return (
        <section id="pricing" className="py-24 sm:py-32 bg-background scroll-mt-28">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <motion.div
                    className="max-w-2xl mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Pricing</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1] mb-6">
                        Simple pricing.<br />
                        <span className="text-muted-foreground">No surprises.</span>
                    </h2>
                </motion.div>

                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 mb-16">
                    {(["monthly", "yearly"] as const).map((b) => (
                        <button
                            key={b}
                            onClick={() => setBilling(b)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                                billing === b ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {b === "monthly" ? "Monthly" : "Yearly"}{" "}
                            {b === "yearly" && <span className="text-xs text-success">−20%</span>}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            className={cn(
                                "relative rounded-2xl border p-8 flex flex-col hover:-translate-y-1 transition-all duration-300",
                                plan.highlighted
                                    ? "border-foreground/20 bg-foreground/[0.02] ring-1 ring-foreground/10"
                                    : "border-border/50 hover:border-border"
                            )}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">{plan.name}</p>
                            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                            <div className="mb-8">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={`${plan.id}-${billing}`}
                                        className="inline-block text-4xl md:text-5xl font-semibold text-foreground tracking-tight tabular-nums"
                                        initial={{ opacity: 0, y: billing === "yearly" ? -8 : 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {plan.price[billing] === 0 ? "Free" : `Rs ${plan.price[billing].toLocaleString()}`}
                                    </motion.span>
                                </AnimatePresence>
                                {plan.price[billing] > 0 && (
                                    <span className="text-sm text-muted-foreground ml-1">/{billing === "monthly" ? "mo" : "yr"}</span>
                                )}
                            </div>

                            <Link href={plan.cta === "Talk to Sales" ? "mailto:sales@indigo.com.np" : "/login"} className="block mb-10">
                                <Button variant={plan.highlighted ? "default" : "outline"} className="w-full h-11 rounded-full text-sm">
                                    {plan.cta}
                                </Button>
                            </Link>

                            <ul className="space-y-3">
                                {plan.features.map((f, fi) => (
                                    <motion.li
                                        key={f}
                                        className="flex items-start gap-3 text-sm text-muted-foreground"
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + fi * 0.05 }}
                                    >
                                        <Check strokeWidth={1.5} className="w-4 h-4 text-success mt-0.5 shrink-0" />
                                        {f}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={() => setShowCompare(!showCompare)}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Compare all features
                        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showCompare && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {showCompare && (
                            <motion.div
                                className="mt-8 overflow-x-auto"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border/50">
                                            <th className="py-3 pr-4 text-muted-foreground font-medium w-1/3">Feature</th>
                                            {plans.map((p) => (
                                                <th key={p.id} className="py-3 px-4 text-foreground font-medium text-center">{p.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compareRows.map(([label, ...vals]) => (
                                            <tr key={label as string} className="border-b border-border/30">
                                                <td className="py-3 pr-4 text-muted-foreground">{label}</td>
                                                {vals.map((v, i) => (
                                                    <td key={i} className="py-3 px-4 text-center">
                                                        {v === true ? <Check className="w-4 h-4 text-success mx-auto" /> :
                                                         v === false ? <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" /> :
                                                         <span className="text-foreground/80">{v}</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

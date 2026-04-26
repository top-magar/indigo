/**
 * FAQ — Accordion with Framer Motion.
 */

"use client";

import { useState } from "react";
import { cn } from "@/shared/utils";
import { motion } from "framer-motion";
import { Plus, MessageCircle } from "lucide-react";

const faqs = [
    { q: "How much does it cost?", a: "Free forever for up to 50 products. Pro starts at Rs 2,500/month. No hidden fees." },
    { q: "What payment methods are supported?", a: "All major Nepal payment methods including digital wallets, bank transfers, and international cards. Setup takes 5 minutes." },
    { q: "How does shipping work?", a: "One-click Pathao booking. Auto labels, real-time tracking, SMS notifications to your customers." },
    { q: "Do I need technical skills?", a: "No. Pick a theme, add products, connect payments. Your store is live. No code required." },
    { q: "Can I use my own domain?", a: "Yes, on Pro and Scale plans. Connect your domain and we handle SSL automatically." },
    { q: "What kind of support do you offer?", a: "Community support on free. Priority WhatsApp on Pro. Dedicated success manager on Scale." },
];

export function FAQ() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 sm:py-32 bg-background scroll-mt-28">
            <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
                <motion.div
                    className="mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">FAQ</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Common questions.
                    </h2>
                </motion.div>

                <div className="divide-y divide-border/50">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center justify-between py-6 text-left group"
                                aria-expanded={open === i}
                            >
                                <h3 className="text-base font-semibold text-foreground pr-8 group-hover:text-primary transition-colors duration-300">
                                    {faq.q}
                                </h3>
                                <Plus
                                    strokeWidth={1.5}
                                    className={cn(
                                        "w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300",
                                        open === i && "rotate-45"
                                    )}
                                />
                            </button>
                            <div className={cn(
                                "overflow-hidden transition-all duration-300",
                                open === i ? "max-h-40 pb-6" : "max-h-0"
                            )}>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{faq.a}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-border/30 text-center">
                    <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
                    <a
                        href="mailto:hello@indigo.com.np"
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat with us on WhatsApp
                    </a>
                </div>
            </div>
        </section>
    );
}

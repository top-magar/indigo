/**
 * Infrastructure — Trust pillars with Framer Motion stagger.
 */

"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Server, Headphones, type LucideIcon } from "lucide-react";
import { CardSpotlight } from "@/components/ui/aceternity/card-spotlight";

const pillars: { icon: LucideIcon; title: string; description: string; stat: string; color: string }[] = [
    { icon: Zap, title: "Built for speed", description: "Edge-optimized pages that load in under 2 seconds, even on 3G networks across Nepal.", stat: "<2s", color: "from-amber-500/10" },
    { icon: Shield, title: "Secured by default", description: "SSL encryption, PCI-compliant payments, and automatic backups for every store.", stat: "PCI", color: "from-emerald-500/10" },
    { icon: Server, title: "99.9% uptime", description: "Multi-region hosting ensures your store stays online, even during Dashain traffic spikes.", stat: "99.9%", color: "from-blue-500/10" },
    { icon: Headphones, title: "Support when you need it", description: "WhatsApp support in Nepali and English. Priority response for Pro and Scale plans.", stat: "<1hr", color: "from-purple-500/10" },
];

export function Infrastructure() {
    return (
        <section className="py-24 sm:py-32 bg-muted/10">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Infrastructure</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Grow on a rock-solid foundation
                    </h2>
                    <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
                        Your store runs on infrastructure built to support thousands of businesses across Nepal.
                    </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pillars.map((p, i) => (
                        <motion.div
                            key={p.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <CardSpotlight className={`rounded-2xl border border-border/50 bg-gradient-to-b ${p.color} to-background p-6 text-center hover:border-border hover:-translate-y-2 transition-all duration-300 cursor-default h-full`}>
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-foreground/5 mb-4">
                                    <p.icon strokeWidth={1.5} className="w-5 h-5 text-foreground" />
                                </div>
                                <p className="text-3xl font-semibold text-foreground tabular-nums mb-1">{p.stat}</p>
                                <h3 className="text-sm font-medium text-foreground mb-2 tracking-tight">{p.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                            </CardSpotlight>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

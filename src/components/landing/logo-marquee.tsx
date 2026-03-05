"use client";

import { motion } from "framer-motion";

const PARTNERS = [
    { name: "eSewa", color: "#60B158" },
    { name: "Khalti", color: "#5C2D91" },
    { name: "IME Pay", color: "#E31837" },
    { name: "ConnectIPS", color: "#0066B3" },
    { name: "Pathao", color: "#00C853" },
    { name: "Stripe", color: "#635BFF" },
    { name: "Visa", color: "#1A1F71" },
    { name: "Mastercard", color: "#EB001B" },
];

export function LogoMarquee() {
    return (
        <section className="relative border-y border-border/30 bg-muted/30 py-10 overflow-hidden">
            <motion.p
                className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                Trusted payment &amp; delivery partners
            </motion.p>
            <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
                <div className="flex animate-marquee gap-12 w-max">
                    {[...PARTNERS, ...PARTNERS].map((p, i) => (
                        <div key={i} className="flex items-center gap-2 shrink-0 px-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                            <span className="text-sm font-medium text-muted-foreground/60 whitespace-nowrap">{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

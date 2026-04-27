/**
 * PullQuote — Aceternity TextGenerateEffect + Spotlight for dramatic depth.
 */

"use client";

import { TextGenerateEffect } from "@/components/ui/aceternity/text-generate-effect";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { motion } from "framer-motion";

export function PullQuote() {
    return (
        <section className="relative py-24 sm:py-32 bg-[#09090b] overflow-hidden">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
            <div className="relative max-w-4xl mx-auto px-6 text-center">
                <TextGenerateEffect
                    words="We went from zero to 200 orders a day in three months. Indigo made e-commerce possible for us in a market where no one else was building."
                    className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug text-white/90"
                />
                <motion.div
                    className="mt-8 flex items-center justify-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-semibold text-white">
                        B
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-medium text-white/70">Bikash Thapa</p>
                        <p className="text-xs text-white/55">CEO, Kathmandu Bazaar</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

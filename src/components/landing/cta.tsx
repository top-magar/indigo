/**
 * CTA — Simple dark section.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section className="py-32 md:py-40 bg-[#09090b]">
            <div className="max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white tracking-tight leading-[0.95] mb-6">
                    Your store. Your rules.
                    <br />
                    <span className="text-white-500">Your success.</span>
                </h2>
                <Link href="/signup">
                    <Button
                        size="lg"
                        className="h-14 px-10 text-base rounded-full gap-2 bg-white text-foreground hover:bg-white/90"
                    >
                        Get Started <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
                <p className="mt-6 text-xs text-white-500">
                    Start for free. No credit card required.
                </p>
            </div>
        </section>
    );
}

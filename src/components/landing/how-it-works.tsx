/**
 * How It Works — Aceternity Timeline.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Timeline } from "@/components/ui/aceternity/timeline";

const data = [
    {
        title: "Create",
        content: (
            <div>
                <p className="text-sm font-semibold text-foreground mb-1">Create your store</p>
                <p className="text-sm text-muted-foreground">Pick a theme, add your products, and set prices. Takes under 5 minutes.</p>
            </div>
        ),
    },
    {
        title: "Connect",
        content: (
            <div>
                <p className="text-sm font-semibold text-foreground mb-1">Connect payments</p>
                <p className="text-sm text-muted-foreground">Link eSewa, Khalti, or bank transfer. Start accepting money immediately.</p>
            </div>
        ),
    },
    {
        title: "Ship",
        content: (
            <div>
                <p className="text-sm font-semibold text-foreground mb-1">Set up shipping</p>
                <p className="text-sm text-muted-foreground">Connect Pathao for one-click delivery. Auto labels and tracking included.</p>
            </div>
        ),
    },
    {
        title: "Sell",
        content: (
            <div>
                <p className="text-sm font-semibold text-foreground mb-1">Start selling</p>
                <p className="text-sm text-muted-foreground">Share your store link. Orders flow in. Manage everything from one dashboard.</p>
            </div>
        ),
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 sm:py-32 bg-muted/30">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Getting started</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                            How to launch your store
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground">
                            Four steps. Five minutes. You&apos;re live.
                        </p>
                    </div>
                    <Link href="/signup">
                        <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                            Get Started <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>

                <Timeline data={data} />
            </div>
        </section>
    );
}

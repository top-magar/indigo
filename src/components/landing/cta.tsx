"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border shadow-sm mb-8">
                    <Sparkles strokeWidth={2} className="w-4 h-4 text-chart-4" />
                    <span className="text-sm font-medium">No credit card required • Setup in 5 minutes</span>
                </div>
                <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 tracking-tight">
                    Your Dream Store is <br />
                    <span className="text-primary">Just 5 Minutes Away</span>
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Join 12,000+ Nepali entrepreneurs who stopped waiting and started selling. Your competitors are already here.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login">
                        <Button size="lg" className="h-16 px-10 text-xl rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                            Start Your Free Store →
                        </Button>
                    </Link>
                    <Link href="mailto:sales@indigo.com.np">
                        <Button size="lg" variant="outline" className="h-16 px-8 text-xl rounded-full bg-background hover:bg-muted hover:-translate-y-1 transition-all group">
                            Talk to Sales <ArrowRight strokeWidth={2} className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
                <p className="mt-8 text-sm text-muted-foreground">
                    ⚡ Average store goes live in under 15 minutes
                </p>
            </div>
        </section>
    );
}

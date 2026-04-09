/**
 * Testimonials — Aceternity InfiniteMovingCards replacing anime.js grid.
 */

"use client";

import { InfiniteMovingCards } from "@/components/ui/aceternity/infinite-moving-cards";

const testimonials = [
    {
        quote: "Setting up eSewa took me 5 minutes. My sales doubled in the first month.",
        name: "Aarati Sharma",
        title: "Founder, Kathmandu Kicks",
    },
    {
        quote: "Inventory syncs perfectly across Instagram and my website. Zero overselling since we switched.",
        name: "Rajesh Hamal",
        title: "CEO, Nepal Organic Tea",
    },
    {
        quote: "Pathao integration saves us 3 hours every single day. We ship 200+ orders now.",
        name: "Sita Gurung",
        title: "Operations Lead, Pokhara Adventure Gear",
    },
    {
        quote: "We went from local market to shipping internationally. Indigo handles multi-currency beautifully.",
        name: "Deepak Prajapati",
        title: "Artisan & Owner, Bhaktapur Pottery",
    },
    {
        quote: "The visual editor let us redesign our store in an afternoon. No developer needed.",
        name: "Priya Maharjan",
        title: "Creative Director, Thamel Fashion House",
    },
    {
        quote: "Real-time analytics showed us our best products. Revenue up 40% in two months.",
        name: "Binod Tamang",
        title: "Co-founder, Himalayan Honey Co.",
    },
];

export function Testimonials() {
    return (
        <section className="py-24 sm:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Testimonials</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-[1.1]">
                        Thriving with Indigo
                    </h2>
                </div>

                <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
            </div>
        </section>
    );
}

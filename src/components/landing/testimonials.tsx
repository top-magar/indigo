"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Aarati Sharma",
        role: "Owner, Kathmandu Kicks",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 5,
        text: "Setting up eSewa and Khalti was a nightmare on other platforms. With Indigo, it took me literally 5 minutes. My sales have doubled since switching.",
        highlight: "Best for Payments"
    },
    {
        name: "Rajesh Hamal",
        role: "Founder, Nepal Organic Tea",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 5,
        text: "The inventory sync is a lifesaver. I sell on Instagram and my website, and I never have to worry about overselling anymore. Highly recommended!",
        highlight: "Inventory Sync"
    },
    {
        name: "Sita Gurung",
        role: "CEO, Pokhara Adventure Gear",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 5,
        text: "Finally, a platform that understands Nepali logistics. The Pathao integration is seamless. Label printing has saved us hours every day.",
        highlight: "Logistics Automation"
    },
    {
        name: "Bibek Thapa",
        role: "Manager, TechHub Lalitpur",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 4,
        text: "The analytics dashboard is beautiful. I can clearly see which products are performing well and which ones need promotion. Great tool.",
        highlight: "Analytics"
    },
    {
        name: "Priya Malik",
        role: "Founder, Craft Nepal",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 5,
        text: "Support is amazing. They actually pick up the phone and help you. The 'Starter' plan is perfect for small businesses like mine.",
        highlight: "Great Support"
    },
    {
        name: "Amit Pradhan",
        role: "Director, Urban Wear",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
        rating: 5,
        text: "We scaled from 10 to 100 orders a day without breaking a sweat. Indigo handles the volume perfectly.",
        highlight: "Scalability"
    }
];

export function Testimonials() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
                    Trusted by <span className="text-primary">Nepal&apos;s Best</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Don&apos;t just take our word for it. See what 12,000+ business owners are saying about Indigo.
                </p>
            </div>

            {/* Clean Grid Layout - No duplication */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {testimonials.map((testimonial, i) => (
                    <div
                        key={i}
                        className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-0.5 text-chart-4">
                                {[...Array(5)].map((_, j) => (
                                    <Star
                                        key={j}
                                        strokeWidth={0}
                                        fill="currentColor"
                                        className={cn("w-4 h-4", j < testimonial.rating ? "text-chart-4 fill-chart-4" : "text-muted/30 fill-muted/30")}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 bg-muted px-2 py-1 rounded-full">
                                {testimonial.highlight}
                            </span>
                        </div>

                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
                            &quot;{testimonial.text}&quot;
                        </p>

                        <div className="mt-auto flex items-center gap-4 pt-4 border-t border-border/50">
                            <img
                                src={testimonial.image}
                                alt={testimonial.name}
                                className="w-10 h-10 rounded-full object-cover border border-border bg-muted"
                            />
                            <div>
                                <h4 className="text-sm font-bold text-foreground">{testimonial.name}</h4>
                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

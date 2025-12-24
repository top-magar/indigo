'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

// Plan data
const plans = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Essential tools for new businesses just starting their online journey.',
        price: { monthly: 0, yearly: 0 },
        features: [
            'Up to 50 Products',
            'Basic Storefront',
            'Cash on Delivery Support',
            'Standard Order Management',
            'Email Support'
        ],
        notIncluded: [
            'Digital Payments (eSewa/Khalti)',
            'Custom Domain',
            'Advanced Analytics'
        ],
        cta: 'Start for Free',
        popular: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        description: 'Advanced features for growing businesses ready to scale sales.',
        price: { monthly: 2500, yearly: 25000 }, // 2500 * 10 for yearly (2 months free)
        features: [
            'Unlimited Products',
            'Accept eSewa, Khalti, IME Pay',
            'Custom Domain (yourname.com)',
            'Advanced Analytics Dashboard',
            'Inventory Automation',
            'Priority Chat Support',
            'Facebook & Insta Sync'
        ],
        notIncluded: [],
        cta: 'Get Started',
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Dedicated infrastructure for high-volume retailers and brands.',
        price: { monthly: 6000, yearly: 60000 },
        features: [
            'Everything in Growth',
            'Multi-Store Management',
            'API Access',
            'Dedicated Account Manager',
            'Custom Reporting',
            'SLA & Uptime Guarantee',
            'Staff Accounts (Unlimited)'
        ],
        notIncluded: [],
        cta: 'Contact Sales',
        popular: false,
    }
];

export const Pricing: React.FC = () => {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

    return (
        <section id="pricing" className="py-24 bg-background relative overflow-hidden scroll-mt-28">
            {/* Backgrounds */}
            <div className="absolute inset-0 bg-dot-pattern dark:bg-dot-pattern-dark opacity-[0.3] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
                        Plans that scale with your <span className="text-primary">Pasaal</span>
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Simple, transparent pricing in NPR. Start for free and upgrade as your business grows.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={cn("text-sm font-medium transition-colors", billing === 'monthly' ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
                        <button
                            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
                            className="relative w-14 h-8 bg-muted rounded-full p-1 transition-colors duration-300 focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                            aria-label="Toggle billing cycle"
                        >
                            <div className={cn(
                                "w-6 h-6 bg-white dark:bg-primary rounded-full shadow-sm transition-transform duration-300",
                                billing === 'yearly' ? "translate-x-6" : "translate-x-0"
                            )} />
                        </button>
                        <span className={cn("text-sm font-medium transition-colors flex items-center gap-1.5", billing === 'yearly' ? "text-foreground" : "text-muted-foreground")}>
                            Yearly
                            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                SAVE 20%
                            </span>
                        </span>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                "relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300 border",
                                plan.popular
                                    ? "bg-card border-primary shadow-2xl shadow-primary/10 scale-105 z-10 ring-1 ring-primary/20"
                                    : "bg-card/50 border-border hover:border-primary/30 hover:shadow-lg hover:bg-card"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                                    <div className="bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide" style={{ fontVariant: 'small-caps' }}>
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
                            </div>

                            <div className="mb-6 pb-6 border-b border-border">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-foreground tracking-tight">
                                        {plan.price[billing] === 0 ? 'Free' : `Rs ${plan.price[billing].toLocaleString()}`}
                                    </span>
                                    {plan.price[billing] > 0 && (
                                        <span className="text-muted-foreground font-medium">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                                    )}
                                </div>
                                {billing === 'yearly' && plan.price.monthly > 0 && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                        Billed Rs {plan.price.yearly.toLocaleString()} yearly
                                    </p>
                                )}
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 p-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm text-foreground/90">{feature}</span>
                                    </div>
                                ))}

                                {/* Visual cue for missing features in lower tiers to encourage upgrade */}
                                {plan.notIncluded.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 opacity-50 grayscale select-none" aria-hidden="true">
                                        <div className="mt-0.5 p-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                                            <XCircle className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-sm text-muted-foreground decoration-muted-foreground/50">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href={plan.cta === 'Contact Sales' ? 'mailto:sales@pasaal.com' : '/sign-up'} className="w-full">
                                <Button
                                    variant={plan.popular ? 'default' : 'outline'}
                                    className={cn("w-full", plan.popular ? "shadow-lg shadow-primary/20 h-12" : "h-12")}
                                    size="lg"
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Enterprise CTA Footer */}
                <div className="mt-16 bg-muted/30 rounded-2xl p-8 border border-border text-center max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-muted/50 transition-colors">
                    <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <HelpCircle className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold text-foreground">Need a custom solution?</h3>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-md">
                            We offer tailored packages for large marketplaces, government entities, and NGO projects requiring custom integrations.
                        </p>
                    </div>
                    <Link href="mailto:sales@pasaal.com">
                        <Button variant="secondary" className="whitespace-nowrap">Contact Enterprise Team</Button>
                    </Link>
                </div>

            </div>
        </section>
    );
};

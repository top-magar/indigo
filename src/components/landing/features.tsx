"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DashboardSquare01Icon,
    Wallet01Icon,
    SmartPhone01Icon,
    GlobalIcon,
    DeliveryTruck01Icon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

// --- Feature Data ---
const features = [
    {
        id: "dashboard",
        title: "Powerful Dashboard",
        subtitle: "Your Command Center",
        description: "See everything at a glance — sales, orders, inventory. Make data-driven decisions that grow your bottom line. Real-time analytics that actually make sense.",
        icon: DashboardSquare01Icon,
    },
    {
        id: "payments",
        title: "Instant Payments",
        subtitle: "Get Paid Fast",
        description: "Accept eSewa, Khalti, FonePay & international cards. Setup takes 5 minutes. Money hits your account same day, every day.",
        icon: Wallet01Icon,
    },
    {
        id: "logistics",
        title: "One-Click Shipping",
        subtitle: "Deliver Anywhere",
        description: "Book Pathao deliveries instantly. Auto-generated labels, real-time tracking, and happy customers. From Kathmandu to Biratnagar.",
        icon: DeliveryTruck01Icon,
    },
    {
        id: "mobile",
        title: "Mobile First",
        subtitle: "Business in Your Pocket",
        description: "Manage orders from your phone while you source products. Your store runs 24/7, even when you sleep. Never miss an order again.",
        icon: SmartPhone01Icon,
    },
    {
        id: "global",
        title: "Sell Globally",
        subtitle: "Beyond Borders",
        description: "Accept international Visa & Mastercard. Serve customers from India to Dubai to the US. Multi-currency support included.",
        icon: GlobalIcon,
    },
];

// --- Animated Preview Components ---
const DashboardPreview = () => (
    <div className="w-full h-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="h-10 bg-muted/50 border-b border-border flex items-center px-4 gap-2 shrink-0">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
                <div className="h-6 bg-background rounded-md border border-border/50 flex items-center px-3 text-xs text-muted-foreground w-full max-w-[200px]">
                    app.indigo.com.np
                </div>
            </div>
        </div>
        <div className="p-6 space-y-4 flex-1 overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Today&apos;s Sales</p>
                    <p className="text-2xl font-bold text-foreground">Rs 45,200</p>
                    <span className="text-xs text-green-500 font-medium">+12%</span>
                </div>
                <div className="p-4 bg-background rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Active Orders</p>
                    <p className="text-2xl font-bold text-foreground">24</p>
                    <span className="text-xs text-blue-500 font-medium">8 new</span>
                </div>
            </div>
            <div className="bg-background rounded-lg border border-border p-4 h-32 flex items-end justify-between gap-2">
                {[35, 55, 40, 70, 50, 85, 95, 60, 75, 50].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary/80 rounded-t-sm" />
                ))}
            </div>
        </div>
    </div>
);

const PaymentsPreview = () => (
    <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-green-500/10 to-purple-500/10 rounded-2xl border border-border overflow-hidden">
        <div className="relative">
            <div className="w-56 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-xl p-4 -rotate-6">
                <div className="w-8 h-8 bg-white/20 rounded-full mb-4" />
                <div className="w-20 h-2 bg-white/30 rounded" />
                <p className="mt-4 text-white text-xs font-medium opacity-60">eSewa</p>
            </div>
            <div className="absolute top-0 left-0 w-56 h-32 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-2xl p-4 rotate-3 translate-x-8 -translate-y-12">
                <div className="w-8 h-8 bg-white/20 rounded-full mb-4" />
                <p className="text-white font-bold text-lg mt-4">Rs 12,500</p>
                <p className="text-white text-xs opacity-60">Khalti</p>
            </div>
            <div className="absolute -right-4 -bottom-4 bg-white text-green-600 rounded-full p-2 shadow-xl flex items-center gap-2 pr-4">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5" />
                <span className="text-xs font-bold">Paid</span>
            </div>
        </div>
    </div>
);

const LogisticsPreview = () => (
    <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-border overflow-hidden">
        <div className="w-[80%] h-[60%] bg-card rounded-xl border border-border shadow-xl relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full stroke-primary/30" strokeWidth="2" fill="none">
                <path d="M 40 120 Q 120 40 200 100 T 320 80" />
            </svg>
            <div className="absolute left-[70%] top-[35%] w-3 h-3 bg-red-500 rounded-full shadow-lg animate-pulse" />
            <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur p-2 rounded-lg border border-border flex items-center gap-2">
                <HugeiconsIcon icon={DeliveryTruck01Icon} className="w-4 h-4 text-orange-500" />
                <div className="flex-1">
                    <p className="text-xs font-bold">New Baneshwor</p>
                    <p className="text-[10px] text-muted-foreground">Arriving in 15 mins</p>
                </div>
            </div>
        </div>
    </div>
);

const MobilePreview = () => (
    <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-border">
        <div className="relative w-40 h-72 bg-neutral-900 rounded-[2rem] border-4 border-neutral-800 shadow-2xl overflow-hidden">
            <div className="h-5 w-full flex justify-center items-start pt-1">
                <div className="h-3 w-16 bg-black rounded-full" />
            </div>
            <div className="flex-1 bg-card p-2 pt-4 flex flex-col h-[calc(100%-1.25rem)]">
                <p className="text-[10px] text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-lg font-bold mb-3">Rs 84.5k</p>
                <div className="flex-1 space-y-1.5">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 bg-muted/50 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
        <div className="absolute top-16 right-6 bg-card px-2 py-1 rounded-lg border border-border shadow-lg">
            <p className="text-[10px] font-bold text-green-500">🎉 New Order!</p>
        </div>
    </div>
);

const GlobalPreview = () => (
    <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl border border-border">
        <div className="relative">
            <div className="w-36 h-36 border-2 border-dashed border-primary/30 rounded-full animate-spin" style={{ animationDuration: "30s" }}>
                <div className="absolute top-0 left-1/2 -ml-1.5 w-3 h-3 bg-blue-500 rounded-full" />
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-purple-500 rounded-full" />
                <div className="absolute top-4 left-2 w-2 h-2 bg-pink-500 rounded-full" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/10">
                    <HugeiconsIcon icon={GlobalIcon} className="w-8 h-8 text-primary" />
                </div>
            </div>
        </div>
        <div className="absolute bottom-8 text-center">
            <p className="text-sm font-bold">150+ Countries</p>
            <p className="text-xs text-muted-foreground">Multi-currency support</p>
        </div>
    </div>
);

const previewComponents = [
    <DashboardPreview key="dashboard" />,
    <PaymentsPreview key="payments" />,
    <LogisticsPreview key="logistics" />,
    <MobilePreview key="mobile" />,
    <GlobalPreview key="global" />,
];

// --- Main Component ---
export function Features() {
    const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Use Intersection Observer for scroll-based activation
    useEffect(() => {
        if (typeof window === "undefined") return;

        const observers: IntersectionObserver[] = [];

        panelRefs.current.forEach((panel, index) => {
            if (!panel) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setActiveIndex(index);
                        }
                    });
                },
                {
                    threshold: 0.5,
                    rootMargin: "-20% 0px -20% 0px",
                }
            );

            observer.observe(panel);
            observers.push(observer);
        });

        return () => {
            observers.forEach((observer) => observer.disconnect());
        };
    }, []);

    return (
        <section id="features" className="relative bg-background">
            {/* Section Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                    Everything You Need to <span className="text-primary">Succeed Online</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    A complete commerce platform built for Nepal. Scroll to explore each feature.
                </p>
            </div>

            {/* Scrollytelling Container */}
            <div className="flex min-h-screen">
                {/* LEFT: Scrolling Text Panels */}
                <div className="w-1/2 px-8 lg:px-16">
                    {features.map((feature, index) => (
                        <div
                            key={feature.id}
                            ref={(el) => { panelRefs.current[index] = el; }}
                            className="min-h-screen flex items-center py-20"
                        >
                            <div className={cn(
                                "max-w-lg transition-all duration-500",
                                activeIndex === index ? "opacity-100" : "opacity-30"
                            )}>
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300",
                                    activeIndex === index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    <HugeiconsIcon icon={feature.icon} strokeWidth={2} className="w-7 h-7" />
                                </div>

                                <p className={cn(
                                    "text-sm font-bold uppercase tracking-widest mb-2 transition-colors duration-300",
                                    activeIndex === index ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {feature.subtitle}
                                </p>

                                <h3 className={cn(
                                    "text-4xl font-bold mb-6 transition-colors duration-300",
                                    activeIndex === index ? "text-foreground" : "text-muted-foreground"
                                )}>
                                    {feature.title}
                                </h3>

                                <p className={cn(
                                    "text-lg leading-relaxed transition-colors duration-300",
                                    activeIndex === index ? "text-muted-foreground" : "text-muted-foreground/50"
                                )}>
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Sticky Visual with Framer Motion animations */}
                <div className="w-1/2 h-screen sticky top-0 flex items-center justify-center p-8 lg:p-16">
                    <div className="w-full h-[70vh] max-w-xl relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                {previewComponents[activeIndex]}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

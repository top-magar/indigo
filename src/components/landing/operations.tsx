"use client";

import { Button } from "@/components/ui/button";
import { BRAND_COLORS } from "@/config/brand-colors";
import {
    Bell,
    PackageOpen,
    Globe,
    Zap,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";

export function Operations() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl sm:text-5xl font-semibold text-foreground mb-4 tracking-tight leading-[1.1]">
                            Save 10+ Hours <br />
                            <span className="text-primary">Every Single Week</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            While you sleep, Indigo sends tracking updates, alerts you about low stock, and syncs your products across channels. Automation that actually works.
                        </p>
                    </div>
                    <Button variant="outline" className="hidden md:flex gap-2">
                        See All Automations <ArrowRight strokeWidth={2} className="w-4 h-4" />
                    </Button>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Card 1: Automated Notifications */}
                    <div className="group relative rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:shadow-chart-4/5 transition-all duration-500 flex flex-col">
                        <div className="p-8 pb-0 flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-chart-4/10 flex items-center justify-center text-chart-4 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Bell strokeWidth={2} className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Happy Customers, Zero Effort</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                Auto-send order confirmations, shipping updates, and delivery notifications. Customers love it. You don&apos;t lift a finger.
                            </p>
                        </div>

                        {/* Visual: Notification Mockup */}
                        <div className="mt-8 px-6 pb-6 h-48 relative overflow-hidden">
                            <div className="absolute top-0 left-6 right-6 space-y-3">
                                {/* Notification 1 */}
                                <div className="bg-background border border-border rounded-lg p-3 shadow-sm flex gap-3 translate-y-2 opacity-50 scale-95">
                                    <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center text-chart-2 shrink-0">
                                        <CheckCircle strokeWidth={2} className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-foreground">Order #2910 Confirmed</p>
                                        <p className="text-[10px] text-muted-foreground truncate">Payment received via eSewa</p>
                                    </div>
                                </div>
                                {/* Notification 2 (Active) */}
                                <div className="bg-background border border-border rounded-lg p-3 shadow-md flex gap-3 group-hover:-translate-y-1 transition-transform duration-500">
                                    <div className="w-8 h-8 rounded-full bg-chart-4/10 flex items-center justify-center text-chart-4 shrink-0">
                                        <Zap strokeWidth={2} className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs font-semibold text-foreground">SMS Sent</p>
                                            <span className="text-[10px] text-muted-foreground">Just now</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">&quot;Hi Ram, your package is out for delivery via Pathao...&quot;</p>
                                    </div>
                                </div>
                                {/* Notification 3 */}
                                <div className="bg-background border border-border rounded-lg p-3 shadow-sm flex gap-3 opacity-60">
                                    <div className="w-8 h-8 rounded-full bg-chart-5/10 flex items-center justify-center text-chart-5 shrink-0">
                                        <PackageOpen strokeWidth={2} className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-foreground">Low Stock Warning</p>
                                        <p className="text-[10px] text-muted-foreground">Goldstar Shoes (Size 42) is running low.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Bottom fade overlay */}
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-card pointer-events-none opacity-80"></div>
                        </div>
                    </div>

                    {/* Card 2: Smart Inventory */}
                    <div className="group relative rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:shadow-chart-3/5 transition-all duration-500 flex flex-col">
                        <div className="p-8 pb-0 flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-chart-3/10 flex items-center justify-center text-chart-3 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <PackageOpen strokeWidth={2} className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">Never Miss a Sale</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                Get alerts before you run out of stock. Set auto-reorder points. Be ready for Dashain, Tihar, and every festival rush.
                            </p>
                        </div>

                        {/* Visual: Product Card Mockup */}
                        <div className="mt-8 px-6 pb-6 h-48 relative flex items-end justify-center">
                            <div className="w-full bg-background border border-border rounded-t-xl p-4 shadow-sm group-hover:pb-6 transition-all duration-500 relative z-10">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-12 h-12 bg-muted rounded-md shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-3 w-3/4 bg-foreground/10 rounded mb-2"></div>
                                        <div className="h-2 w-1/2 bg-foreground/5 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium text-foreground">Stock Level</span>
                                        <span className="text-[var(--ds-red-700)] font-semibold flex items-center gap-1">
                                            <AlertTriangle strokeWidth={2} className="w-3 h-3" /> 5 Left
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full w-[15%] bg-[var(--ds-red-700)] rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="pt-2">
                                        <button className="w-full py-1.5 text-xs font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity">
                                            Reorder Stock
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 w-[90%] h-full bg-muted/20 border-x border-t border-border/50 rounded-t-xl z-0 scale-95 translate-y-2"></div>
                        </div>
                    </div>

                    {/* Card 3: Multi-channel Sync */}
                    <div className="group relative rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:shadow-chart-2/5 transition-all duration-500 flex flex-col">
                        <div className="p-8 pb-0 flex-1">
                            <div className="w-12 h-12 rounded-2xl bg-chart-2/10 flex items-center justify-center text-chart-2 mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Globe strokeWidth={2} className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">One Store, Everywhere</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                Sell on Instagram, Facebook Marketplace, and your own site &mdash; with one shared inventory. No overselling. No manual sync.
                            </p>
                        </div>

                        {/* Visual: Connection Toggles */}
                        <div className="mt-8 px-6 pb-6 h-48 relative overflow-hidden">
                            <div className="space-y-3 pt-2">
                                {/* FB Toggle */}
                                <div className="flex items-center justify-between bg-background border border-border p-3 rounded-lg shadow-sm group-hover:translate-x-1 transition-transform duration-300 delay-75">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: BRAND_COLORS.facebook }}>f</div>
                                        <span className="text-sm font-medium text-foreground">Facebook</span>
                                    </div>
                                    <div className="w-8 h-4 bg-chart-2 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                                {/* Insta Toggle */}
                                <div className="flex items-center justify-between bg-background border border-border p-3 rounded-lg shadow-sm group-hover:translate-x-1 transition-transform duration-300 delay-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: BRAND_COLORS.instagram }}>IG</div>
                                        <span className="text-sm font-medium text-foreground">Instagram</span>
                                    </div>
                                    <div className="w-8 h-4 bg-chart-2 rounded-full relative">
                                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                                {/* Daraz Toggle (Off) */}
                                <div className="flex items-center justify-between bg-background border border-border p-3 rounded-lg shadow-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--ds-amber-700)] flex items-center justify-center text-white font-bold text-xs">D</div>
                                        <span className="text-sm font-medium text-foreground">Daraz</span>
                                    </div>
                                    <div className="w-8 h-4 bg-muted rounded-full relative">
                                        <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background glow */}
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-chart-2/10 rounded-full blur-2xl pointer-events-none"></div>
                        </div>
                    </div>

                </div>

                <div className="mt-12 text-center md:hidden">
                    <Button variant="outline">Explore All Features</Button>
                </div>
            </div>
        </section>
    );
}

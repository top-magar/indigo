"use client";

import React, { useState } from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    PackageIcon,
    AnalyticsUpIcon,
    UserGroupIcon,
    FilterHorizontalIcon,
    CheckmarkCircle02Icon,
    Clock01Icon,
    DeliveryTruck01Icon,
    Alert01Icon,
} from "@hugeicons/core-free-icons";

const tabs = [
    {
        id: "orders",
        title: "Orders on Autopilot",
        subtitle: "Fulfill Faster",
        desc: "One-click Pathao booking. Print labels in seconds. Your orders ship themselves.",
        icon: PackageIcon,
        color: "text-chart-4",
        bg: "bg-chart-4/10",
    },
    {
        id: "sales",
        title: "Know What's Working",
        subtitle: "Grow Smarter",
        desc: "See which products are hot in Kathmandu vs Pokhara. Double down on what sells.",
        icon: AnalyticsUpIcon,
        color: "text-chart-2",
        bg: "bg-chart-2/10",
    },
    {
        id: "team",
        title: "Your Team, Organized",
        subtitle: "Work Together",
        desc: "Give staff access without sharing passwords. See who did what, when.",
        icon: UserGroupIcon,
        color: "text-chart-3",
        bg: "bg-chart-3/10",
    }
];

export function Workflow() {
    const [activeTab, setActiveTab] = useState("orders");

    return (
        <section id="workflow" className="py-24 bg-muted/20 relative overflow-hidden scroll-mt-28">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-chart-4/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
                        One Dashboard to <br />
                        <span className="text-primary">Rule Your Business</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Stop tab-hopping between apps. Orders, analytics, team — everything lives here.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">

                    {/* Left Column: Navigation Tabs */}
                    <div className="lg:col-span-5 space-y-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full text-left p-6 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                                    activeTab === tab.id
                                        ? "bg-card border-primary/50 shadow-xl ring-1 ring-primary/5"
                                        : "bg-transparent border-transparent hover:bg-card/50 hover:border-border"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={cn("p-3 rounded-xl transition-colors", activeTab === tab.id ? tab.bg : "bg-muted")}>
                                        <HugeiconsIcon icon={tab.icon} strokeWidth={2} className={cn("w-6 h-6", activeTab === tab.id ? tab.color : "text-muted-foreground")} />
                                    </div>
                                    <div>
                                        <span className={cn("text-xs font-bold uppercase tracking-wider mb-1 block", activeTab === tab.id ? "text-primary" : "text-muted-foreground")}>
                                            {tab.subtitle}
                                        </span>
                                        <h3 className={cn("text-xl font-bold mb-2", activeTab === tab.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                                            {tab.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {tab.desc}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Right Column: Interactive Preview */}
                    <div className="lg:col-span-7">
                        <div className="relative rounded-2xl border border-border bg-background shadow-2xl overflow-hidden h-[600px] flex flex-col">
                            {/* Browser/App Header */}
                            <div className="h-14 border-b border-border bg-muted/30 flex items-center px-4 justify-between shrink-0">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-chart-1/80" />
                                    <div className="w-3 h-3 rounded-full bg-chart-4/80" />
                                    <div className="w-3 h-3 rounded-full bg-chart-2/80" />
                                </div>
                                <div className="bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-2 shadow-sm hidden sm:flex">
                                    <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
                                    app.indigo.com.np/dashboard/{activeTab}
                                </div>
                                <div className="w-8" />
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 bg-muted/10 p-6 overflow-hidden relative">

                                {/* Tab Content: Orders */}
                                {activeTab === "orders" && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                        <div className="flex justify-between items-end mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-foreground">Orders</h2>
                                                <p className="text-sm text-muted-foreground">Manage and fulfill customer orders</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
                                                    <HugeiconsIcon icon={FilterHorizontalIcon} strokeWidth={2} className="w-4 h-4" /> Filter
                                                </Button>
                                                <Button size="sm" className="gap-2">Create Order</Button>
                                            </div>
                                        </div>

                                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex-1">
                                            <div className="border-b border-border px-4 py-3 flex items-center gap-4 bg-muted/20 text-xs font-medium text-muted-foreground">
                                                <div className="flex-1">Order ID</div>
                                                <div className="hidden sm:block flex-[2]">Customer</div>
                                                <div className="flex-[1.5]">Status</div>
                                                <div className="flex-[1] text-right">Amount</div>
                                            </div>
                                            <div className="divide-y divide-border">
                                                {[
                                                    { id: "#9281", name: "Aarav Shrestha", loc: "Lazimpat, Kathmandu", status: "Processing", price: "Rs 12,500" },
                                                    { id: "#9282", name: "Priya Gurung", loc: "Lakeside, Pokhara", status: "Shipped", price: "Rs 4,200" },
                                                    { id: "#9283", name: "Rabin Thapa", loc: "Itahari, Sunsari", status: "Delivered", price: "Rs 2,100" },
                                                    { id: "#9284", name: "Sita Pandey", loc: "Baneshwor, Kathmandu", status: "Processing", price: "Rs 8,900" },
                                                    { id: "#9285", name: "Bibek Magar", loc: "Bharatpur, Chitwan", status: "Cancelled", price: "Rs 1,500" },
                                                ].map((order, i) => (
                                                    <div key={i} className="px-4 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                                                        <div className="flex-1 font-mono text-xs font-medium text-primary">{order.id}</div>
                                                        <div className="hidden sm:block flex-[2]">
                                                            <p className="text-sm font-medium text-foreground">{order.name}</p>
                                                            <p className="text-xs text-muted-foreground">{order.loc}</p>
                                                        </div>
                                                        <div className="flex-[1.5]">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                                                order.status === "Delivered" ? "bg-chart-2/10 text-chart-2 border-chart-2/20" :
                                                                    order.status === "Shipped" ? "bg-chart-4/10 text-chart-4 border-chart-4/20" :
                                                                        order.status === "Processing" ? "bg-chart-5/10 text-chart-5 border-chart-5/20" :
                                                                            "bg-chart-1/10 text-chart-1 border-chart-1/20"
                                                            )}>
                                                                {order.status === "Delivered" && <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="w-3 h-3" />}
                                                                {order.status === "Shipped" && <HugeiconsIcon icon={DeliveryTruck01Icon} strokeWidth={2} className="w-3 h-3" />}
                                                                {order.status === "Processing" && <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="w-3 h-3" />}
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex-[1] text-right font-medium text-sm">
                                                            {order.price}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Content: Sales */}
                                {activeTab === "sales" && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
                                            <div className="flex bg-muted rounded-lg p-1">
                                                <button className="px-3 py-1 text-xs font-medium rounded-md bg-background shadow-sm text-foreground">7 Days</button>
                                                <button className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground">30 Days</button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                                <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                                                <h3 className="text-2xl font-bold text-foreground flex items-end gap-2">
                                                    Rs 2.4L <span className="text-xs font-medium text-chart-2 mb-1 bg-chart-2/10 px-1.5 rounded">+12%</span>
                                                </h3>
                                            </div>
                                            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                                <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                                                <h3 className="text-2xl font-bold text-foreground flex items-end gap-2">
                                                    3.2% <span className="text-xs font-medium text-chart-2 mb-1 bg-chart-2/10 px-1.5 rounded">+0.4%</span>
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex-1 flex flex-col">
                                            <h3 className="text-sm font-medium text-foreground mb-6">Sales by Region</h3>
                                            <div className="space-y-5">
                                                {[
                                                    { region: "Bagmati Province", val: 75, color: "bg-chart-4" },
                                                    { region: "Gandaki Province", val: 45, color: "bg-chart-3" },
                                                    { region: "Lumbini Province", val: 30, color: "bg-chart-5" },
                                                    { region: "Koshi Province", val: 20, color: "bg-chart-2" }
                                                ].map((item, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="font-medium text-foreground">{item.region}</span>
                                                            <span className="text-muted-foreground">{item.val}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                style={{ width: `${item.val}%` }}
                                                                className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.color)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab Content: Team */}
                                {activeTab === "team" && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
                                            <Button size="sm" variant="outline" className="gap-2">
                                                <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} className="w-4 h-4" /> Invite
                                            </Button>
                                        </div>

                                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                            {[
                                                { name: "Sushil Koirala", role: "Store Manager", email: "sushil@store.com", status: "Active" },
                                                { name: "Anjali Tamang", role: "Support Agent", email: "anjali@store.com", status: "Active" },
                                                { name: "Rohit Gupta", role: "Editor", email: "rohit@store.com", status: "Away" },
                                            ].map((member, i) => (
                                                <div key={i} className="p-4 border-b border-border last:border-0 flex items-center justify-between hover:bg-muted/20">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary border border-primary/10">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{member.role}</span>
                                                        <div className={cn("w-2 h-2 rounded-full", member.status === "Active" ? "bg-chart-2" : "bg-chart-5")} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 bg-chart-4/10 p-4 rounded-xl border border-chart-4/20 flex gap-3">
                                            <HugeiconsIcon icon={Alert01Icon} strokeWidth={2} className="w-5 h-5 text-chart-4 shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-chart-4">Admin Permissions</h4>
                                                <p className="text-xs text-chart-4/80 mt-1">
                                                    You can now assign granular permissions for inventory management and financial reports to specific roles.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

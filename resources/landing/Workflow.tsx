'use client';

import React, { useState } from 'react';
import {
    ArrowRight,
    Package,
    TrendingUp,
    Users,
    Filter,
    MapPin,
    CheckCircle2,
    Clock,
    Truck,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

const tabs = [
    {
        id: 'orders',
        title: 'Smart Order Management',
        subtitle: 'Track Orders',
        desc: 'Automate fulfillment with integrated logistics partners like Pathao and Upaya City Cargo.',
        icon: Package,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        id: 'sales',
        title: 'Real-time Growth Engine',
        subtitle: 'Analyze Sales',
        desc: 'Deep dive into customer behavior across Nepal. See which products are trending in Kathmandu vs Pokhara.',
        icon: TrendingUp,
        color: 'text-green-500',
        bg: 'bg-green-500/10',
    },
    {
        id: 'team',
        title: 'Collaborative Workspace',
        subtitle: 'Manage Team',
        desc: 'Set granular permissions for your staff. Track performance and manage shifts effortlessly.',
        icon: Users,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
    }
];

export const Workflow: React.FC = () => {
    const [activeTab, setActiveTab] = useState('orders');

    return (
        <section id="workflow" className="py-24 bg-muted/20 relative overflow-hidden scroll-mt-28">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
                        Everything You Need to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Run Your Pasaal</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Stop juggling multiple spreadsheets and apps. Pasaal brings your entire retail operation into one streamlined operating system.
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
                                        <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? tab.color : "text-muted-foreground")} />
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
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                <div className="bg-background border border-border rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-2 shadow-sm hidden sm:flex">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    app.pasaal.com/dashboard/{activeTab}
                                </div>
                                <div className="w-8" /> {/* Spacer */}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 bg-muted/10 p-6 overflow-hidden relative">

                                {/* Tab Content: Orders */}
                                {activeTab === 'orders' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                        <div className="flex justify-between items-end mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-foreground">Orders</h2>
                                                <p className="text-sm text-muted-foreground">Manage and fulfill customer orders</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="gap-2 hidden sm:flex"><Filter className="w-4 h-4" /> Filter</Button>
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
                                                    { id: '#9281', name: 'Aarav Shrestha', loc: 'Lazimpat, Kathmandu', status: 'Processing', price: 'Rs 12,500', time: '2 mins ago', method: 'eSewa' },
                                                    { id: '#9282', name: 'Priya Gurung', loc: 'Lakeside, Pokhara', status: 'Shipped', price: 'Rs 4,200', time: '15 mins ago', method: 'Khalti' },
                                                    { id: '#9283', name: 'Rabin Thapa', loc: 'Itahari, Sunsari', status: 'Delivered', price: 'Rs 2,100', time: '2 hours ago', method: 'COD' },
                                                    { id: '#9284', name: 'Sita Pandey', loc: 'Baneshwor, Kathmandu', status: 'Processing', price: 'Rs 8,900', time: '3 hours ago', method: 'FonePay' },
                                                    { id: '#9285', name: 'Bibek Magar', loc: 'Bharatpur, Chitwan', status: 'Cancelled', price: 'Rs 1,500', time: '5 hours ago', method: 'eSewa' },
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
                                                                order.status === 'Delivered' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                                    order.status === 'Shipped' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                                        order.status === 'Processing' ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                                                                            "bg-red-500/10 text-red-600 border-red-500/20"
                                                            )}>
                                                                {order.status === 'Delivered' && <CheckCircle2 className="w-3 h-3" />}
                                                                {order.status === 'Shipped' && <Truck className="w-3 h-3" />}
                                                                {order.status === 'Processing' && <Clock className="w-3 h-3" />}
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
                                {activeTab === 'sales' && (
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
                                                    Rs 2.4L <span className="text-xs font-medium text-green-600 mb-1 bg-green-500/10 px-1.5 rounded">+12%</span>
                                                </h3>
                                            </div>
                                            <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                                <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                                                <h3 className="text-2xl font-bold text-foreground flex items-end gap-2">
                                                    3.2% <span className="text-xs font-medium text-green-600 mb-1 bg-green-500/10 px-1.5 rounded">+0.4%</span>
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex-1 flex flex-col">
                                            <h3 className="text-sm font-medium text-foreground mb-6">Sales by Region</h3>
                                            <div className="space-y-5">
                                                {[
                                                    { region: 'Bagmati Province', val: 75, color: 'bg-blue-500' },
                                                    { region: 'Gandaki Province', val: 45, color: 'bg-purple-500' },
                                                    { region: 'Lumbini Province', val: 30, color: 'bg-orange-500' },
                                                    { region: 'Koshi Province', val: 20, color: 'bg-green-500' }
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
                                {activeTab === 'team' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
                                            <Button size="sm" variant="outline" className="gap-2">
                                                <Users className="w-4 h-4" /> Invite
                                            </Button>
                                        </div>

                                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                                            {[
                                                { name: 'Sushil Koirala', role: 'Store Manager', email: 'sushil@store.com', status: 'Active' },
                                                { name: 'Anjali Tamang', role: 'Support Agent', email: 'anjali@store.com', status: 'Active' },
                                                { name: 'Rohit Gupta', role: 'Editor', email: 'rohit@store.com', status: 'Away' },
                                            ].map((member, i) => (
                                                <div key={i} className="p-4 border-b border-border last:border-0 flex items-center justify-between hover:bg-muted/20">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-400/20 flex items-center justify-center text-sm font-bold text-primary border border-primary/10">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{member.name}</p>
                                                            <p className="text-xs text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{member.role}</span>
                                                        <div className={cn("w-2 h-2 rounded-full", member.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500')} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">Admin Permissions</h4>
                                                <p className="text-xs text-blue-600/80 dark:text-blue-300/70 mt-1">
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
};

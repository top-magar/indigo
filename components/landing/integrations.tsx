"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
    CreditCardIcon,
    DeliveryTruck01Icon,
    Share01Icon,
    Message01Icon,
    CodeIcon,
} from "@hugeicons/core-free-icons";

export function Integrations() {
    return (
        <section id="integrations" className="py-24 bg-background relative overflow-hidden border-y border-border scroll-mt-28">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center relative z-10">
                <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
                    Plays Nice with <span className="text-primary">Everything</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Connect Indigo to the tools that power your business. From local wallets to global marketing platforms.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">

                {/* Card 1: Payments (Large, 7 cols) */}
                <div className="md:col-span-7 group relative rounded-3xl border border-border bg-card overflow-hidden min-h-[400px] flex flex-col hover:shadow-2xl hover:shadow-chart-3/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-chart-3/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="p-8 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center text-chart-3 mb-6">
                            <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Universal Payment Gateway</h3>
                        <p className="text-muted-foreground max-w-md leading-relaxed">Accept payments from eSewa, Khalti, IME Pay, and ConnectIPS instantly. No complex paperwork required.</p>
                    </div>

                    {/* Visual: Payment Mockup */}
                    <div className="mt-auto relative h-64 w-full overflow-hidden">
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-sm">
                            <div className="relative bg-background border-t border-x border-border rounded-t-2xl shadow-2xl p-6 pb-0 h-full translate-y-6 group-hover:translate-y-2 transition-transform duration-500">
                                <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
                                <div className="space-y-3">
                                    {/* eSewa Option */}
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-green-100 flex items-center justify-center p-1">
                                                <svg viewBox="0 0 120 40" className="w-full h-full">
                                                    <path d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35H35V5H20Z" className="fill-[#60BB46]" />
                                                    <path d="M20 15L25 20L20 25" stroke="white" strokeWidth="3" />
                                                    <text x="45" y="28" fontFamily="sans-serif" fontWeight="900" fontSize="24" className="fill-[#60BB46]">eSewa</text>
                                                </svg>
                                            </div>
                                            <span className="font-medium text-green-900">Pay with eSewa</span>
                                        </div>
                                        <div className="w-4 h-4 rounded-full border-2 border-green-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    {/* Khalti Option */}
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer group/item">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-purple-100 flex items-center justify-center p-1">
                                                <svg viewBox="0 0 120 40" className="w-full h-full">
                                                    <path d="M5 5H25V12H12V23H25V30H5V5Z" className="fill-[#5C2D91]" />
                                                    <text x="35" y="28" fontFamily="sans-serif" fontWeight="800" fontSize="24" className="fill-[#5C2D91]">Khalti</text>
                                                </svg>
                                            </div>
                                            <span className="font-medium text-purple-900">Pay with Khalti</span>
                                        </div>
                                        <div className="w-4 h-4 rounded-full border-2 border-muted" />
                                    </div>
                                    {/* Cards Option */}
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground"><HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className="w-5 h-5" /></div>
                                            <span className="font-medium text-foreground">Credit/Debit Card</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Logistics (Medium, 5 cols) */}
                <div className="md:col-span-5 group relative rounded-3xl border border-border bg-card overflow-hidden min-h-[400px] flex flex-col hover:shadow-2xl hover:shadow-chart-5/10 transition-all duration-500">
                    <div className="absolute inset-0 bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1px)] bg-size-[16px_16px] opacity-20" />
                    <div className="absolute inset-0 bg-background/50" />

                    <div className="p-8 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-chart-5/10 flex items-center justify-center text-chart-5 mb-6">
                            <HugeiconsIcon icon={DeliveryTruck01Icon} strokeWidth={2} className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">Automated Logistics</h3>
                        <p className="text-muted-foreground">One-click courier requests with Pathao and Upaya. Print labels instantly.</p>
                    </div>

                    <div className="mt-auto relative h-48 w-full flex items-center justify-center overflow-hidden">
                        {/* Animated Truck/Path Line */}
                        <div className="absolute w-[120%] h-32 border-t-2 border-dashed border-chart-5/50 rotate-[-10deg] flex items-center translate-y-4">
                            <div className="absolute -top-4 bg-chart-5 text-white p-2 rounded-lg shadow-lg z-10 truck-animation">
                                <HugeiconsIcon icon={DeliveryTruck01Icon} strokeWidth={2} className="w-5 h-5" />
                            </div>
                            <div className="absolute -top-4 bg-chart-1 text-white p-2 rounded-lg shadow-lg z-10 truck-animation-delayed">
                                <HugeiconsIcon icon={DeliveryTruck01Icon} strokeWidth={2} className="w-5 h-5" />
                            </div>
                        </div>

                        {/* City Markers */}
                        <div className="absolute bottom-8 left-12 flex flex-col items-center gap-1 z-0 opacity-60">
                            <div className="w-3 h-3 rounded-full bg-foreground" />
                            <span className="text-[10px] font-mono uppercase">KTM</span>
                        </div>
                        <div className="absolute top-12 right-12 flex flex-col items-center gap-1 z-0 opacity-60">
                            <div className="w-3 h-3 rounded-full bg-foreground" />
                            <span className="text-[10px] font-mono uppercase">PKR</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Social (4 cols) */}
                <div className="md:col-span-4 group relative rounded-3xl border border-border bg-card overflow-hidden min-h-[300px] hover:shadow-xl transition-shadow">
                    <div className="p-8 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center text-chart-1 mb-4">
                            <HugeiconsIcon icon={Share01Icon} strokeWidth={2} className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Social Commerce</h3>
                        <p className="text-sm text-muted-foreground">Sync products to FB & Instagram Shops automatically.</p>
                    </div>
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-chart-1/10 blur-3xl rounded-full" />
                    <div className="absolute bottom-6 right-6 flex gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg translate-y-0 group-hover:-translate-y-2 transition-transform duration-300 ring-4 ring-background">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </div>
                        <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ring-4 ring-background">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </div>
                    </div>
                </div>

                {/* Card 4: SMS/Communication (4 cols) */}
                <div className="md:col-span-4 group relative rounded-3xl border border-border bg-card overflow-hidden min-h-[300px] hover:shadow-xl transition-shadow">
                    <div className="p-8 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center text-chart-4 mb-4">
                            <HugeiconsIcon icon={Message01Icon} strokeWidth={2} className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Sparrow SMS</h3>
                        <p className="text-sm text-muted-foreground">Automatic order confirmations and OTP verification via SMS.</p>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <div className="bg-background border border-border p-3 rounded-xl shadow-sm text-xs flex gap-3 items-center opacity-80 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                            <div className="w-8 h-8 rounded-full bg-chart-4/10 flex items-center justify-center text-chart-4 shrink-0"><HugeiconsIcon icon={Message01Icon} strokeWidth={2} className="w-4 h-4" /></div>
                            <div>
                                <p className="font-semibold">Indigo Alert</p>
                                <p className="text-muted-foreground">Your order #8821 has been confirmed!</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 5: Developers (4 cols) */}
                <div className="md:col-span-4 group relative rounded-3xl border border-border overflow-hidden min-h-[300px] bg-gray-950 text-white hover:shadow-xl transition-shadow">
                    <div className="p-8 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 ring-1 ring-white/20">
                            <HugeiconsIcon icon={CodeIcon} strokeWidth={2} className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">API First</h3>
                        <p className="text-sm text-gray-400">Build custom integrations with our robust REST API.</p>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-black/50 backdrop-blur-md font-mono text-[10px] leading-relaxed text-green-400 border-t border-white/10">
                        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                            <span className="text-purple-400">POST</span> /api/v1/orders/create <br />
                            <span className="text-blue-400">Authorization:</span> Bearer sk_live...<br />
                            <span className="text-yellow-400">{'{ "status": "success", "id": "ord_123" }'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

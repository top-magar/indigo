"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/aceternity/spotlight";
import { FlipWords } from "@/components/ui/aceternity/flip-words";
import { NumberTicker } from "@/components/ui/aceternity/number-ticker";

const ROTATING_PHRASES = ["live in minutes", "built for Nepal", "ready to sell", "growing daily", "your next chapter"];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export function Hero() {
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;
        const handleMove = (e: MouseEvent) => {
            const rect = grid.getBoundingClientRect();
            grid.style.setProperty("--mx", `${e.clientX - rect.left}px`);
            grid.style.setProperty("--my", `${e.clientY - rect.top}px`);
        };
        grid.addEventListener("mousemove", handleMove);
        return () => grid.removeEventListener("mousemove", handleMove);
    }, []);

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#09090b]">
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

            {/* Gradient mesh */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[oklch(0.45_0.15_270)] opacity-20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(0.50_0.18_185)] opacity-15 blur-[100px]" />
                <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-[oklch(0.40_0.12_330)] opacity-10 blur-[80px]" />
            </div>

            {/* Animated grid */}
            <div
                ref={gridRef}
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                    maskImage: `radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), black, transparent)`,
                    WebkitMaskImage: `radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), black, transparent)`,
                }}
            />

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                    <motion.div className="max-w-xl" variants={stagger} initial="hidden" animate="show">
                        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white-50 px-3 py-1 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-success/100" />
                            </span>
                            <span className="text-xs text-white-600">12,000+ stores launched in Nepal</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08] text-white mb-6">
                            Your store,{" "}
                            <span className="bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                                <FlipWords words={ROTATING_PHRASES} className="text-white" />
                            </span>
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-lg text-white-400 leading-relaxed mb-10 max-w-md">
                            The e-commerce platform built for Nepal. Accept eSewa, Khalti, ship with Pathao — everything works out of the box.
                        </motion.p>

                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-3">
                            <Link href="/signup">
                                <Button size="lg" className="h-12 px-8 text-sm rounded-full gap-2 bg-white text-foreground hover:bg-white/90 font-medium landing-btn">
                                    Start for free <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="lg" className="h-12 px-6 text-sm rounded-full gap-2 text-white-600 hover:text-white hover:bg-white-50">
                                <Play className="w-3.5 h-3.5 fill-current" /> Watch demo
                            </Button>
                        </motion.div>

                        <motion.div variants={fadeUp} className="mt-12 flex items-center gap-6 text-xs text-white-500">
                            <span>No credit card</span>
                            <span className="w-px h-3 bg-white-100" />
                            <span>Free forever plan</span>
                            <span className="w-px h-3 bg-white-100" />
                            <span>Setup in 5 min</span>
                        </motion.div>
                    </motion.div>

                    {/* Right — Dashboard visual */}
                    <motion.div
                        className="relative hidden lg:block"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white-100" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white-100" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white-100" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-success/100" />
                                        <span className="text-[10px] text-white-500 font-mono">yourstore.indigo.store</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-[10px] text-white-500 uppercase tracking-widest">Dashboard</p>
                                    <p className="text-sm font-medium text-white-700 mt-1">Good morning, Aarati ✨</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: "Revenue", value: "Rs 47,200", change: "+12%", color: "text-success" },
                                        { label: "Orders", value: "84", change: "+8%", color: "text-success" },
                                        { label: "Visitors", value: "1,247", change: "+23%", color: "text-success" },
                                    ].map((s) => (
                                        <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                                            <p className="text-[10px] uppercase tracking-wider text-white-500">{s.label}</p>
                                            <p className="text-base font-semibold text-white-700 mt-1 tabular-nums">{s.value}</p>
                                            <span className={`text-[10px] ${s.color}`}>{s.change}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] text-white-500 uppercase tracking-wider">Revenue this week</p>
                                        <p className="text-[10px] text-white-500">Rs 329,400</p>
                                    </div>
                                    <div className="flex items-end gap-1 h-20">
                                        {[35, 55, 40, 70, 50, 85, 65, 78, 90, 68, 82, 95, 72, 88].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex-1 rounded-sm bg-gradient-to-t from-white/[0.06] to-white/[0.12]"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h}%` }}
                                                transition={{ duration: 0.6, delay: 0.5 + i * 0.04, ease: "easeOut" }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-white-500 uppercase tracking-wider">Recent orders</p>
                                    {[
                                        { name: "Aarati S.", amount: "Rs 2,450", method: "eSewa", status: "bg-success/100" },
                                        { name: "Bikash K.", amount: "Rs 890", method: "Khalti", status: "bg-amber-500" },
                                        { name: "Priya M.", amount: "Rs 5,200", method: "Card", status: "bg-blue-500" },
                                    ].map((o) => (
                                        <div key={o.name} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                                            <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-medium text-white-500">{o.name.charAt(0)}</div>
                                            <p className="text-xs font-medium text-white-500 flex-1">{o.name}</p>
                                            <span className="text-[10px] text-white-500 px-1.5 py-0.5 rounded bg-white/[0.04]">{o.method}</span>
                                            <p className="text-xs font-medium text-white-500 tabular-nums">{o.amount}</p>
                                            <div className={`w-1.5 h-1.5 rounded-full ${o.status}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <motion.div
                            className="absolute -bottom-4 -left-8 rounded-xl border border-white/[0.08] bg-[#09090b]/90 backdrop-blur-xl px-4 py-3 shadow-xl"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-success/100/20 flex items-center justify-center">
                                    <span className="text-success text-xs">₹</span>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-white-700">New order received</p>
                                    <p className="text-[10px] text-white-500">Rs 3,200 via eSewa · just now</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="absolute -top-3 -right-4 rounded-lg border border-white/[0.08] bg-[#09090b]/90 backdrop-blur-xl px-3 py-2 shadow-xl"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-1">
                                    {["bg-green-500", "bg-purple-500", "bg-blue-500"].map((c, i) => (
                                        <div key={i} className={`w-4 h-4 rounded-full ${c} border border-[#09090b]`} />
                                    ))}
                                </div>
                                <span className="text-[10px] text-white-400">eSewa · Khalti · Cards</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Social proof bar — NumberTicker */}
            <div className="relative border-t border-white/[0.04]">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: 12000, suffix: "+", label: "Stores launched" },
                            { value: 2.1, suffix: "B+", prefix: "Rs ", label: "Payments processed", decimals: 1 },
                            { value: 75, label: "Districts reached" },
                            { value: 4.8, suffix: "★", label: "Average rating", decimals: 1 },
                        ].map((s) => (
                            <div key={s.label} className="text-center">
                                <p className="text-xl md:text-2xl font-semibold text-white-700 tabular-nums">
                                    {s.prefix}<NumberTicker value={s.value} decimalPlaces={s.decimals ?? 0} className="text-white-700" />{s.suffix}
                                </p>
                                <p className="text-xs text-white-500 mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

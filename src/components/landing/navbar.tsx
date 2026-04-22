"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/shared/utils";
import { Menu, X, ArrowRight, ChevronDown, Wallet, Truck, BarChart3, Smartphone, Globe, Palette } from "lucide-react";

const FEATURE_ITEMS = [
    { icon: Wallet, label: "Payments", desc: "eSewa, Khalti & cards", href: "/#features" },
    { icon: Truck, label: "Shipping", desc: "Pathao integration", href: "/#features" },
    { icon: BarChart3, label: "Analytics", desc: "Real-time insights", href: "/#features" },
    { icon: Smartphone, label: "Mobile", desc: "Manage on the go", href: "/#features" },
    { icon: Globe, label: "Multi-currency", desc: "Sell beyond Nepal", href: "/#features" },
    { icon: Palette, label: "Visual Editor", desc: "Drag & drop builder", href: "/#features" },
];

const NAV_LINKS = [
    { label: "Features", href: "/#features", hasDropdown: true },
    { label: "Solutions", href: "/#solutions" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
    { label: "Blog", href: "/blog" },
] as const;

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const [announcementH, setAnnouncementH] = useState(0);

    useEffect(() => {
        const update = () => {
            const bar = document.getElementById("announcement-bar");
            setAnnouncementH(bar ? bar.offsetHeight : 0);
        };
        update();
        const obs = new MutationObserver(update);
        obs.observe(document.body, { childList: true, subtree: true });
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const openDropdown = () => { clearTimeout(timeoutRef.current); setShowFeatures(true); };
    const closeDropdown = () => { timeoutRef.current = setTimeout(() => setShowFeatures(false), 150); };

    return (
        <>
            <header
                style={{ top: announcementH }}
                className={cn(
                    "fixed w-full z-50 transition-all duration-500",
                    isScrolled
                        ? "bg-background/70 backdrop-blur-2xl border-b border-border/30 shadow-sm"
                        : "bg-transparent"
                )}
            >
                <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 select-none z-50">
                        <div className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold transition-colors",
                            isScrolled || isOpen
                                ? "bg-foreground text-background"
                                : "bg-white text-black"
                        )}>
                            I
                        </div>
                        <span className={cn(
                            "text-base font-medium tracking-tight transition-colors",
                            isScrolled || isOpen ? "text-foreground" : "text-white"
                        )}>
                            Indigo
                        </span>
                    </Link>

                    {/* Desktop links — pill style with mega-menu */}
                    <div className={cn(
                        "hidden md:flex items-center gap-1 rounded-full px-1 py-1 transition-colors",
                        isScrolled ? "bg-muted/50" : "bg-white/[0.06]"
                    )}>
                        {NAV_LINKS.map(({ label, href, ...rest }) => {
                            const hasDropdown = "hasDropdown" in rest && rest.hasDropdown;
                            return hasDropdown ? (
                                <div
                                    key={href}
                                    className="relative"
                                    onMouseEnter={openDropdown}
                                    onMouseLeave={closeDropdown}
                                    ref={dropdownRef}
                                >
                                    <Link
                                        href={href}
                                        className={cn(
                                            "inline-flex items-center gap-1 text-[13px] px-3.5 py-1.5 rounded-full transition-colors",
                                            isScrolled
                                                ? "text-muted-foreground hover:text-foreground hover:bg-background"
                                                : "text-white/50 hover:text-white hover:bg-white/[0.08]"
                                        )}
                                    >
                                        {label}
                                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", showFeatures && "rotate-180")} />
                                    </Link>

                                    {/* Mega-menu dropdown */}
                                    {showFeatures && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
                                            <div className="w-[420px] rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg p-4 grid grid-cols-2 gap-1">
                                                {FEATURE_ITEMS.map((f) => (
                                                    <Link
                                                        key={f.label}
                                                        href={f.href}
                                                        onClick={() => setShowFeatures(false)}
                                                        className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors group"
                                                    >
                                                        <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
                                                            <f.icon className="w-4 h-4 text-foreground/60" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">{f.label}</p>
                                                            <p className="text-xs text-muted-foreground">{f.desc}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "text-[13px] px-3.5 py-1.5 rounded-full transition-colors",
                                        isScrolled
                                            ? "text-muted-foreground hover:text-foreground hover:bg-background"
                                            : "text-white/50 hover:text-white hover:bg-white/[0.08]"
                                    )}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/login"
                            className={cn(
                                "text-[13px] transition-colors",
                                isScrolled
                                    ? "text-muted-foreground hover:text-foreground"
                                    : "text-white/50 hover:text-white"
                            )}
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className={cn(
                                "inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-1.5 rounded-full transition-all",
                                isScrolled
                                    ? "bg-foreground text-background hover:bg-foreground/90"
                                    : "bg-white text-black hover:bg-white/90"
                            )}
                        >
                            Start Free
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "md:hidden z-50 p-2 -mr-2",
                            isScrolled || isOpen ? "text-foreground" : "text-white"
                        )}
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </nav>
            </header>

            {/* Mobile menu */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-background md:hidden">
                    <nav className="flex flex-col justify-center h-full px-6 gap-8">
                        {NAV_LINKS.map(({ label, href, ...rest }) => (
                            <div key={label}>
                                <Link
                                    href={href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-3xl font-semibold text-foreground hover:text-muted-foreground transition-colors"
                                >
                                    {label}
                                </Link>
                                {"hasDropdown" in rest && rest.hasDropdown && (
                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                        {FEATURE_ITEMS.map((f) => (
                                            <Link
                                                key={f.label}
                                                href={f.href}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                                            >
                                                <f.icon className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{f.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="h-px bg-border/50" />
                        <div className="flex flex-col gap-3">
                            <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg text-muted-foreground">
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center justify-center gap-2 bg-foreground text-background rounded-full py-3 text-base font-medium"
                            >
                                Start Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}

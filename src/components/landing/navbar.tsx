"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import Link from "next/link";
import {
  Menu, X, Search, Store, CreditCard, Palette,
  FileCode, Webhook, BookOpen, Layout, ShoppingCart,
  Rocket, Building2, Globe, Shield, BarChart3,
  Code2, Terminal, BookMarked, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

/* ═══ Mega-menu context ═══ */
const MegaMenuContext = createContext<{
  open: string | null;
  setOpen: (v: string | null) => void;
}>({ open: null, setOpen: () => {} });

/* ═══ Dropdown data ═══ */
const productLinks = [
  { icon: Store, label: "Headless CMS", description: "Content-first architecture for modern teams", href: "#features", image: "/landing/payload-capture/desktop-hero.png" },
  { icon: ShoppingCart, label: "eCommerce", description: "Full storefront builder with local payments", href: "#features", image: "/landing/payload-capture/desktop-hero.png" },
  { icon: Palette, label: "Visual Editor", description: "Drag-and-drop page builder with live preview", href: "#features", image: "/landing/payload-capture/desktop-hero.png" },
  { icon: CreditCard, label: "Payments", description: "eSewa, Khalti, Stripe, and 10+ gateways", href: "#pricing", image: "/landing/payload-capture/desktop-hero.png" },
  { icon: Layout, label: "Multi-Tenant", description: "One dashboard, unlimited storefronts", href: "#features", image: "/landing/payload-capture/desktop-hero.png" },
  { icon: FileCode, label: "Custom Domains", description: "Your brand, your URL, fully customizable", href: "#features", image: "/landing/payload-capture/desktop-hero.png" },
];

const solutionCards = [
  { icon: Rocket, label: "For Founders", description: "Launch in a weekend", href: "#", bg: "from-blue-900/40 to-blue-950/60" },
  { icon: Building2, label: "For Enterprise", description: "Scale securely", href: "#", bg: "from-purple-900/40 to-purple-950/60" },
  { icon: Globe, label: "For Global Brands", description: "Multi-region ops", href: "#", bg: "from-emerald-900/40 to-emerald-950/60" },
];

const companyLogos = [
  { name: "Blue Origin", description: "Aerospace" },
  { name: "Microsoft", description: "Technology" },
  { name: "Nike", description: "Retail" },
  { name: "Stripe", description: "Fintech" },
  { name: "Vercel", description: "Developer Tools" },
  { name: "Linear", description: "Productivity" },
];

const devLinks = [
  { group: "Start Building", items: [
    { icon: Terminal, label: "Quick Start", description: "Get running in 5 minutes", href: "#" },
    { icon: Code2, label: "Templates", description: "Pre-built project starters", href: "#" },
    { icon: Cpu, label: "Examples", description: "Reference implementations", href: "#" },
  ]},
  { group: "Resources", items: [
    { icon: BookOpen, label: "Documentation", description: "Guides and API references", href: "#" },
    { icon: Webhook, label: "Webhooks", description: "Real-time event subscriptions", href: "#" },
    { icon: BookMarked, label: "Blog", description: "Tutorials and case studies", href: "#" },
  ]},
];

/* ═══ Hover image preview ═══ */
function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-secondary">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
    </div>
  );
}

/* ═══ Product dropdown: 2-col grid + image ═══ */
function ProductDropdown() {
  const [hoveredIdx, setHoveredIdx] = useState(0);

  return (
    <div className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Links grid — 2 columns */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-1">
              {productLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
                      hoveredIdx === i
                        ? "bg-secondary"
                        : "hover:bg-secondary/50 opacity-60 hover:opacity-100",
                    )}
                    onMouseEnter={() => setHoveredIdx(i)}
                  >
                    <div className="p-2 rounded-lg bg-secondary border border-border shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-payload-body font-medium text-foreground text-sm">
                        {item.label}
                      </div>
                      <div className="font-payload-body text-muted-foreground text-xs mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Image preview */}
          <div className="lg:col-span-5 hidden lg:block">
            <ImagePreview
              src={productLinks[hoveredIdx].image}
              alt={productLinks[hoveredIdx].label}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Solutions dropdown: featured cards + logo grid ═══ */
function SolutionsDropdown() {
  return (
    <div className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Featured cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {solutionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className={cn(
                  "relative rounded-lg overflow-hidden p-6 h-40 flex flex-col justify-end bg-gradient-to-br transition-all duration-300 hover:scale-[1.02]",
                  card.bg,
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative z-10">
                  <Icon className="w-5 h-5 text-white/80 mb-2" />
                  <div className="font-payload-body font-medium text-white text-sm">
                    {card.label}
                  </div>
                  <div className="font-payload-body text-white/70 text-xs mt-0.5">
                    {card.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6" />

        {/* Company logos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {companyLogos.map((logo) => (
            <Link
              key={logo.name}
              href="#"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 group-hover:bg-border transition-colors">
                <span className="font-payload-body font-bold text-xs text-muted-foreground">
                  {logo.name[0]}
                </span>
              </div>
              <div className="min-w-0">
                <div className="font-payload-body font-medium text-foreground text-xs truncate">
                  {logo.name}
                </div>
                <div className="font-payload-body text-muted-foreground text-[10px] truncate">
                  {logo.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ Developers dropdown: link groups + image ═══ */
function DevelopersDropdown() {
  return (
    <div className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Link groups */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-8">
              {devLinks.map((group) => (
                <div key={group.group}>
                  <div className="font-payload-h6 text-muted-foreground mb-4">
                    {group.group}
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-all duration-200 opacity-60 hover:opacity-100"
                        >
                          <div className="p-2 rounded-lg bg-secondary border border-border shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-payload-body font-medium text-foreground text-sm">
                              {item.label}
                            </div>
                            <div className="font-payload-body text-muted-foreground text-xs mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured image */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative w-full h-full min-h-[280px] rounded-lg overflow-hidden bg-secondary border border-border">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Terminal className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <div className="font-mono text-sm text-muted-foreground/50">
                    npx create-indigo-app
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Mobile accordion menu ═══ */
function MobileMenu() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-6 px-6">
        <AccordionPrimitive.Root type="single" collapsible className="space-y-2">
          {/* Product */}
          <AccordionPrimitive.Item value="product" className="border-b border-border pb-2">
            <AccordionPrimitive.Trigger className="flex items-center justify-between w-full py-3 font-payload-body font-medium text-foreground">
              Product
            </AccordionPrimitive.Trigger>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-2 data-[state=open]:slide-down-2">
              <div className="grid grid-cols-2 gap-2 pb-4 pl-4">
                {productLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="font-payload-body font-medium text-foreground text-sm">{item.label}</div>
                        <div className="font-payload-body text-muted-foreground text-xs">{item.description}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>

          {/* Solutions */}
          <AccordionPrimitive.Item value="solutions" className="border-b border-border pb-2">
            <AccordionPrimitive.Trigger className="flex items-center justify-between w-full py-3 font-payload-body font-medium text-foreground">
              Solutions
            </AccordionPrimitive.Trigger>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-2 data-[state=open]:slide-down-2">
              <div className="space-y-2 pb-4 pl-4">
                {solutionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <a key={card.label} href={card.href} className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <div className="font-payload-body font-medium text-foreground text-sm">{card.label}</div>
                        <div className="font-payload-body text-muted-foreground text-xs">{card.description}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>

          {/* Developers */}
          <AccordionPrimitive.Item value="developers" className="border-b border-border pb-2">
            <AccordionPrimitive.Trigger className="flex items-center justify-between w-full py-3 font-payload-body font-medium text-foreground">
              Developers
            </AccordionPrimitive.Trigger>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-2 data-[state=open]:slide-down-2">
              <div className="space-y-4 pb-4 pl-4">
                {devLinks.map((group) => (
                  <div key={group.group}>
                    <div className="font-payload-h6 text-muted-foreground mb-2">{group.group}</div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a key={item.label} href={item.href} className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
                            <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <div className="font-payload-body font-medium text-foreground text-sm">{item.label}</div>
                              <div className="font-payload-body text-muted-foreground text-xs">{item.description}</div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>

          {/* Simple links */}
          <a href="#pricing" className="block py-3 font-payload-body font-medium text-foreground border-b border-border">
            Pricing
          </a>
          <a href="#" className="block py-3 font-payload-body font-medium text-foreground border-b border-border">
            Docs
          </a>
        </AccordionPrimitive.Root>
      </div>

      {/* Pinned bottom CTA */}
      <div className="border-t border-border p-6 space-y-3">
        <div className="flex items-center justify-between py-2">
          <span className="font-payload-body text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Link href="/login" className="block text-center font-payload-body text-muted-foreground py-2">
          Login
        </Link>
        <Link href="/signup" className="block">
          <Button className="w-full h-12 rounded-lg text-base">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}

/* ═══ Main Navbar ═══ */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close on click outside */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleEnter = (name: string) => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(name);
  };

  const handleLeave = () => {
    closeTimeout.current = setTimeout(() => setOpen(null), 100);
  };

  const triggers = [
    { name: "Product", hasDropdown: true },
    { name: "Solutions", hasDropdown: true },
    { name: "Developers", hasDropdown: true },
    { name: "Pricing", href: "#pricing", hasDropdown: false },
    { name: "Docs", href: "#", hasDropdown: false },
  ];

  const renderDropdown = () => {
    switch (open) {
      case "Product": return <ProductDropdown />;
      case "Solutions": return <SolutionsDropdown />;
      case "Developers": return <DevelopersDropdown />;
      default: return null;
    }
  };

  return (
    <MegaMenuContext.Provider value={{ open, setOpen }}>
      <>
        {/* ═══ Desktop header ═══ */}
        <header
          className={cn(
            "sticky top-0 z-50 transition-all duration-300",
            scrolled
              ? "bg-background/80 backdrop-blur-md border-b border-border"
              : "bg-transparent",
          )}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center shrink-0">
                <span className="font-payload-h3 text-foreground tracking-tight">
                  Indigo
                </span>
              </Link>

              {/* Nav triggers */}
              <nav ref={navRef} className="hidden md:flex items-center gap-1">
                {triggers.map((t) => (
                  <div
                    key={t.name}
                    onMouseEnter={() => t.hasDropdown && handleEnter(t.name)}
                    onMouseLeave={() => t.hasDropdown && handleLeave()}
                  >
                    {t.hasDropdown ? (
                      <button
                        className={cn(
                          "font-payload-body px-3 py-2 rounded-lg transition-colors",
                          open === t.name
                            ? "text-foreground bg-secondary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                        )}
                        onClick={() => setOpen(open === t.name ? null : t.name)}
                      >
                        {t.name}
                      </button>
                    ) : (
                      <Link
                        href={t.href!}
                        className="font-payload-body text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary/50"
                      >
                        {t.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* CTA */}
              <div className="hidden md:flex items-center gap-3">
                <a
                  href="https://github.com/indigo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-2"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <div className="h-4 w-px bg-border" aria-hidden="true" />
                <ThemeToggle />
                <Link href="/login" className="font-payload-body text-muted-foreground hover:text-foreground transition-colors px-2">
                  Login
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="h-9 px-5 text-sm">Get Started</Button>
                </Link>
                <button className="text-muted-foreground hover:text-foreground transition-colors p-2" aria-label="Search">
                  <Search size={18} />
                </button>
              </div>

              {/* Mobile toggle */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="md:hidden p-2 text-foreground" aria-label="Menu">
                    <Menu size={24} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <MobileMenu />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* ═══ Desktop dropdown panels ═══ */}
        {open && (
          <div
            className="fixed top-16 left-0 right-0 z-40 border-b border-border bg-background shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseEnter={() => handleEnter(open)}
            onMouseLeave={handleLeave}
          >
            {renderDropdown()}
          </div>
        )}

      </>
    </MegaMenuContext.Provider>
  );
}

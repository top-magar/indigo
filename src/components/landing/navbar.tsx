"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND_COLORS } from "@/config/brand-colors";
import {
    Menu,
    X,
    ArrowRight,
    Store,
    CreditCard,
    Truck,
    TrendingUp,
    Smartphone,
    Users,
    Rocket,
    Building,
    BookOpen,
    HelpCircle,
    Code,
    Sparkles,
    ShoppingCart,
    Package,
    Settings,
    Percent,
    Mail,
    MessageCircleQuestion,
    Newspaper,
    BarChart3,
    Globe,
    ChevronDown,
    Search,
    Command,
    Bell,
    CheckCircle,
    Star,
    Play,
    ExternalLink,
    type LucideIcon,
} from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

// ============================================================================
// TYPES & DATA
// ============================================================================

interface NavItem {
    title: string;
    href: string;
    description?: string;
    icon?: LucideIcon;
    badge?: string;
    badgeVariant?: "new" | "soon" | "popular";
    external?: boolean;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

// Solutions menu data
const solutionsData = {
    byStage: [
        {
            title: "Solopreneurs",
            href: "/solutions/solopreneurs",
            description: "Perfect for side hustles and passion projects",
            icon: Users,
        },
        {
            title: "Growing Brands",
            href: "/solutions/growing-brands",
            description: "Scale your business with powerful tools",
            icon: Rocket,
        },
        {
            title: "Enterprise",
            href: "/solutions/enterprise",
            description: "Custom solutions for large organizations",
            icon: Building,
        },
    ],
    byUseCase: [
        { title: "Instagram Sellers", href: "/solutions/instagram-sellers" },
        { title: "Retail Chains", href: "/solutions/retail-chains" },
        { title: "Wholesalers", href: "/solutions/wholesalers" },
        { title: "Dropshipping", href: "/solutions/dropshipping" },
        { title: "Digital Products", href: "/solutions/digital-products", badge: "new" as const },
    ],
    featured: {
        title: "Success Story",
        subtitle: "Scaling with Indigo",
        description: "How Goldstar Shoes reached 50,000+ customers online in their first month using Indigo's platform.",
        cta: "Read the full story",
        href: "/customers/goldstar",
        image: "/images/case-study-goldstar.jpg",
    },
};

// Platform menu data
const platformData = {
    products: [
        {
            title: "Store Builder",
            href: "/platform/store-builder",
            description: "Beautiful, conversion-optimized storefronts",
            icon: Store,
        },
        {
            title: "Payments",
            href: "/platform/payments",
            description: "Accept payments from anywhere",
            icon: CreditCard,
        },
        {
            title: "Logistics",
            href: "/platform/logistics",
            description: "Shipping and fulfillment made easy",
            icon: Truck,
        },
        {
            title: "Channels",
            href: "/platform/channels",
            description: "Sell everywhere your customers are",
            icon: Globe,
        },
    ],
    features: [
        { title: "Order Management", href: "/features/orders", icon: ShoppingCart },
        { title: "Inventory Sync", href: "/features/inventory", icon: Package },
        { title: "Customer Insights", href: "/features/customers", icon: Users },
        { title: "Marketing Tools", href: "/features/marketing", icon: Mail },
        { title: "Discount Engine", href: "/features/discounts", icon: Percent },
        { title: "Analytics", href: "/features/analytics", icon: TrendingUp },
        { title: "Mobile App", href: "/features/mobile-app", icon: Smartphone, badge: "new" as const },
    ],
    spotlight: {
        badge: "NEW",
        title: "Introducing Indigo AI",
        description: "Automate product descriptions, marketing copy, and customer support with our AI-powered tools.",
        cta: "Learn more",
        href: "/platform/ai",
    },
};

// Resources menu data
const resourcesData = {
    learn: [
        { title: "Blog", href: "/blog", icon: Newspaper, description: "Latest news and insights" },
        { title: "Guides", href: "/guides", icon: BookOpen, description: "Step-by-step tutorials" },
        { title: "Customer Stories", href: "/customers", icon: Star, description: "Success stories" },
        { title: "Help Center", href: "/help", icon: HelpCircle, description: "Get support" },
    ],
    developers: [
        { title: "API Documentation", href: "/docs/api", icon: Code },
        { title: "Changelog", href: "/changelog", icon: BarChart3 },
        { title: "System Status", href: "/status", icon: CheckCircle, external: true },
        { title: "Open Source", href: "https://github.com/indigo", icon: ExternalLink, external: true },
    ],
    community: {
        title: "Join Our Community",
        description: "Connect with 12,000+ Nepali founders building the future of commerce.",
        stats: [
            { label: "Members", value: "12K+" },
            { label: "Countries", value: "15+" },
            { label: "Messages/day", value: "500+" },
        ],
        cta: "Join Discord",
        href: "https://discord.gg/indigo",
    },
};

// Search commands data
const searchCommands = [
    { title: "Start free trial", href: "/signup", icon: Rocket },
    { title: "View pricing", href: "/#pricing", icon: CreditCard },
    { title: "Contact sales", href: "/contact", icon: Mail },
    { title: "Read documentation", href: "/docs", icon: BookOpen },
    { title: "Watch demo", href: "/demo", icon: Play },
];

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function NavLink({ 
    item, 
    className,
    showDescription = false,
    showIcon = true,
}: { 
    item: NavItem; 
    className?: string;
    showDescription?: boolean;
    showIcon?: boolean;
}) {
    const IconComponent = item.icon;
    const content = (
        <div className={cn("flex items-start gap-3 group/link", className)}>
            {showIcon && IconComponent && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50 group-hover/link:bg-primary/10 group-hover/link:border-primary/20 transition-colors">
                    <IconComponent className="h-5 w-5 text-muted-foreground group-hover/link:text-primary transition-colors" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground group-hover/link:text-primary transition-colors">
                        {item.title}
                    </span>
                    {item.badge && (
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "text-[9px] px-1.5 py-0 h-4 uppercase font-semibold",
                                item.badgeVariant === "new" && "bg-chart-2/10 text-chart-2 border-chart-2/20",
                                item.badgeVariant === "soon" && "bg-muted text-muted-foreground",
                                item.badgeVariant === "popular" && "bg-chart-4/10 text-chart-4 border-chart-4/20",
                                !item.badgeVariant && item.badge === "new" && "bg-chart-2/10 text-chart-2 border-chart-2/20"
                            )}
                        >
                            {item.badge}
                        </Badge>
                    )}
                    {item.external && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    )}
                </div>
                {showDescription && item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {item.description}
                    </p>
                )}
            </div>
        </div>
    );

    if (item.external) {
        return (
            <a 
                href={item.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
                {content}
            </a>
        );
    }

    return (
        <Link 
            href={item.href}
            className="block p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
            {content}
        </Link>
    );
}

function SimpleNavLink({ item, className }: { item: NavItem; className?: string }) {
    const content = (
        <span className={cn(
            "text-sm text-foreground/70 hover:text-primary transition-colors flex items-center gap-1.5",
            className
        )}>
            {item.title}
            {item.badge && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-chart-2/10 text-chart-2">
                    {item.badge}
                </Badge>
            )}
            {item.external && <ExternalLink className="h-3 w-3" />}
        </span>
    );

    if (item.external) {
        return <a href={item.href} target="_blank" rel="noopener noreferrer">{content}</a>;
    }
    return <Link href={item.href}>{content}</Link>;
}

function MenuSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("space-y-4", className)}>
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.15em]">
                {title}
            </h4>
            {children}
        </div>
    );
}

// ============================================================================
// MEGA MENU PANELS
// ============================================================================

function SolutionsMenu() {
    return (
        <div className="w-[800px] p-6">
            <div className="grid grid-cols-12 gap-8">
                {/* By Stage - Main cards */}
                <div className="col-span-5">
                    <MenuSection title="By Business Stage">
                        <div className="space-y-2">
                            {solutionsData.byStage.map((item) => (
                                <NavLink key={item.href} item={item} showDescription showIcon />
                            ))}
                        </div>
                    </MenuSection>
                </div>

                {/* By Use Case - Simple list */}
                <div className="col-span-3">
                    <MenuSection title="By Use Case">
                        <div className="space-y-2.5">
                            {solutionsData.byUseCase.map((item) => (
                                <SimpleNavLink key={item.href} item={item} />
                            ))}
                        </div>
                    </MenuSection>
                </div>

                {/* Featured Story */}
                <div className="col-span-4 pl-6 border-l border-border/50">
                    <MenuSection title={solutionsData.featured.title}>
                        <div className="space-y-3">
                            <div className="aspect-video w-full rounded-xl bg-muted/50 border border-border/50 overflow-hidden">
                                <div className="w-full h-full bg-linear-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                                    <Play className="h-8 w-8 text-primary/40" />
                                </div>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-foreground mb-1">
                                    {solutionsData.featured.subtitle}
                                </h5>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {solutionsData.featured.description}
                                </p>
                                <Link 
                                    href={solutionsData.featured.href}
                                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                                >
                                    {solutionsData.featured.cta}
                                    <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    </MenuSection>
                </div>
            </div>
        </div>
    );
}

function PlatformMenu() {
    return (
        <div className="w-[900px] p-6">
            <div className="grid grid-cols-12 gap-6">
                {/* Products - Main cards */}
                <div className="col-span-5">
                    <MenuSection title="Products">
                        <div className="space-y-2">
                            {platformData.products.map((item) => (
                                <NavLink key={item.href} item={item} showDescription showIcon />
                            ))}
                        </div>
                    </MenuSection>
                </div>

                {/* Features - Grid */}
                <div className="col-span-4">
                    <MenuSection title="Features">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            {platformData.features.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href}
                                        className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors group"
                                    >
                                        {IconComponent && (
                                            <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                        <span>{item.title}</span>
                                        {item.badge && (
                                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-chart-2/10 text-chart-2">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </MenuSection>
                </div>

                {/* Spotlight */}
                <div className="col-span-3 pl-6 border-l border-border/50">
                    <div className="h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-chart-4" />
                            <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-[9px] px-1.5 py-0 h-4">
                                {platformData.spotlight.badge}
                            </Badge>
                        </div>
                        <h5 className="text-sm font-medium text-foreground mb-2">
                            {platformData.spotlight.title}
                        </h5>
                        <p className="text-xs text-muted-foreground flex-1 mb-3">
                            {platformData.spotlight.description}
                        </p>
                        <div className="aspect-video w-full rounded-xl bg-linear-to-br from-[var(--ds-purple-500)]/10 to-[var(--ds-purple-500)]/10 border border-[var(--ds-purple-500)]/20 flex items-center justify-center mb-3">
                            <Sparkles className="h-6 w-6 text-[var(--ds-purple-600)]" />
                        </div>
                        <Link 
                            href={platformData.spotlight.href}
                            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                            {platformData.spotlight.cta}
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ResourcesMenu() {
    return (
        <div className="w-[750px] p-6">
            <div className="grid grid-cols-12 gap-6">
                {/* Learn */}
                <div className="col-span-4">
                    <MenuSection title="Learn">
                        <div className="space-y-2">
                            {resourcesData.learn.map((item) => (
                                <NavLink key={item.href} item={item} showDescription showIcon />
                            ))}
                        </div>
                    </MenuSection>
                </div>

                {/* Developers */}
                <div className="col-span-3">
                    <MenuSection title="Developers">
                        <div className="space-y-2.5">
                            {resourcesData.developers.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href}
                                        target={item.external ? "_blank" : undefined}
                                        rel={item.external ? "noopener noreferrer" : undefined}
                                        className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary transition-colors group"
                                    >
                                        {IconComponent && (
                                            <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        )}
                                        <span>{item.title}</span>
                                        {item.external && (
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </MenuSection>
                </div>

                {/* Community */}
                <div className="col-span-5 pl-6 border-l border-border/50">
                    <MenuSection title="Community">
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {resourcesData.community.description}
                            </p>
                            <div className="flex gap-4">
                                {resourcesData.community.stats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                            <a 
                                href={resourcesData.community.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{ 
                                    backgroundColor: `${BRAND_COLORS.discord}10`,
                                    color: BRAND_COLORS.discord
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${BRAND_COLORS.discord}20`}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${BRAND_COLORS.discord}10`}
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                </svg>
                                {resourcesData.community.cta}
                            </a>
                        </div>
                    </MenuSection>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MOBILE MENU
// ============================================================================

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className={cn(
            "fixed inset-0 bg-background z-40 md:hidden transition-all duration-300 ease-out",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
            {/* Backdrop blur overlay */}
            <div className={cn(
                "absolute inset-0 bg-background/98 backdrop-blur-xl transition-opacity duration-300",
                isOpen ? "opacity-100" : "opacity-0"
            )} />

            {/* Content */}
            <div className={cn(
                "relative h-full pt-20 pb-6 px-6 overflow-y-auto transition-transform duration-300",
                isOpen ? "translate-y-0" : "-translate-y-4"
            )}>
                <nav className="space-y-6">
                    {/* Solutions Section */}
                    <MobileMenuSection
                        title="Solutions"
                        isExpanded={expandedSection === "solutions"}
                        onToggle={() => toggleSection("solutions")}
                    >
                        <div className="space-y-4 pt-3">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Stage</p>
                                {solutionsData.byStage.map((item) => (
                                    <MobileNavLink key={item.href} item={item} onClick={onClose} />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Use Case</p>
                                {solutionsData.byUseCase.map((item) => (
                                    <MobileNavLink key={item.href} item={item} onClick={onClose} simple />
                                ))}
                            </div>
                        </div>
                    </MobileMenuSection>

                    {/* Platform Section */}
                    <MobileMenuSection
                        title="Platform"
                        isExpanded={expandedSection === "platform"}
                        onToggle={() => toggleSection("platform")}
                    >
                        <div className="space-y-4 pt-3">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Products</p>
                                {platformData.products.map((item) => (
                                    <MobileNavLink key={item.href} item={item} onClick={onClose} />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Features</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {platformData.features.map((item) => (
                                        <MobileNavLink key={item.href} item={item} onClick={onClose} simple />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </MobileMenuSection>

                    {/* Resources Section */}
                    <MobileMenuSection
                        title="Resources"
                        isExpanded={expandedSection === "resources"}
                        onToggle={() => toggleSection("resources")}
                    >
                        <div className="space-y-4 pt-3">
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Learn</p>
                                {resourcesData.learn.map((item) => (
                                    <MobileNavLink key={item.href} item={item} onClick={onClose} />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Developers</p>
                                {resourcesData.developers.map((item) => (
                                    <MobileNavLink key={item.href} item={item} onClick={onClose} simple />
                                ))}
                            </div>
                        </div>
                    </MobileMenuSection>

                    {/* Pricing - Direct link */}
                    <Link 
                        href="/#pricing" 
                        onClick={onClose}
                        className="block py-3 text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Pricing
                    </Link>

                    {/* Divider */}
                    <div className="h-px bg-border" />

                    {/* CTA Buttons */}
                    <div className="space-y-3 pt-2">
                        <Link href="/login" onClick={onClose}>
                            <Button variant="outline" className="w-full h-12 rounded-full text-base font-medium">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={onClose}>
                            <Button className="w-full h-12 rounded-full text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                                Start For Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </nav>
            </div>
        </div>
    );
}

function MobileMenuSection({ 
    title, 
    isExpanded, 
    onToggle, 
    children 
}: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
}) {
    return (
        <div className="border-b border-border/50 pb-4">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full py-2 text-lg font-medium text-foreground"
            >
                {title}
                <ChevronDown 
                    className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )} 
                />
            </button>
            <div className={cn(
                "overflow-hidden transition-all duration-300",
                isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}>
                {children}
            </div>
        </div>
    );
}

function MobileNavLink({ 
    item, 
    onClick, 
    simple = false 
}: { 
    item: NavItem; 
    onClick: () => void; 
    simple?: boolean;
}) {
    const IconComponent = item.icon;
    const content = simple ? (
        <span className="flex items-center gap-2 text-sm text-foreground/70">
            {IconComponent && <IconComponent className="h-4 w-4" />}
            {item.title}
            {item.badge && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-chart-2/10 text-chart-2">
                    {item.badge}
                </Badge>
            )}
        </span>
    ) : (
        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            {IconComponent && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                </div>
            )}
            <div>
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    {item.title}
                    {item.badge && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-chart-2/10 text-chart-2">
                            {item.badge}
                        </Badge>
                    )}
                </span>
                {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                )}
            </div>
        </div>
    );

    return (
        <Link href={item.href} onClick={onClick} className="block">
            {content}
        </Link>
    );
}

// ============================================================================
// MAIN NAVBAR COMPONENT
// ============================================================================

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Check initial state
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Handle keyboard shortcut for search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setSearchOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 w-full z-50 transition-all duration-300",
                    isScrolled 
                        ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm" 
                        : "bg-black/20 backdrop-blur-md border-b border-white/10"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-18">
                        {/* Logo */}
                        <Link 
                            href="/" 
                            className="shrink-0 flex items-center gap-2 group select-none relative z-50"
                        >
                            <span className={cn(
                                "font-sans font-medium text-xl lg:text-2xl transition-colors",
                                isScrolled ? "text-foreground" : "text-white"
                            )}>
                                Indigo
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            <NavigationMenu>
                                <NavigationMenuList className="gap-1">
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger 
                                            className={cn(
                                                "bg-transparent text-sm font-medium transition-colors",
                                                isScrolled 
                                                    ? "text-foreground/70 hover:text-foreground data-[state=open]:text-foreground" 
                                                    : "text-white/80 hover:text-white data-[state=open]:text-white"
                                            )}
                                        >
                                            Solutions
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <SolutionsMenu />
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger 
                                            className={cn(
                                                "bg-transparent text-sm font-medium transition-colors",
                                                isScrolled 
                                                    ? "text-foreground/70 hover:text-foreground data-[state=open]:text-foreground" 
                                                    : "text-white/80 hover:text-white data-[state=open]:text-white"
                                            )}
                                        >
                                            Platform
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <PlatformMenu />
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger 
                                            className={cn(
                                                "bg-transparent text-sm font-medium transition-colors",
                                                isScrolled 
                                                    ? "text-foreground/70 hover:text-foreground data-[state=open]:text-foreground" 
                                                    : "text-white/80 hover:text-white data-[state=open]:text-white"
                                            )}
                                        >
                                            Resources
                                        </NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <ResourcesMenu />
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>

                                    <NavigationMenuItem>
                                        <NavigationMenuLink asChild>
                                            <Link 
                                                href="/#pricing"
                                                className={cn(
                                                    "inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                                                    isScrolled 
                                                        ? "text-foreground/70 hover:text-foreground hover:bg-accent" 
                                                        : "text-white/80 hover:text-white hover:bg-white/10"
                                                )}
                                            >
                                                Pricing
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Search Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchOpen(true)}
                                className={cn(
                                    "h-9 gap-2 rounded-full transition-colors",
                                    isScrolled 
                                        ? "text-foreground/70 hover:text-foreground hover:bg-accent" 
                                        : "text-white/70 hover:text-white hover:bg-white/10"
                                )}
                            >
                                <Search className="h-4 w-4" />
                                <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </Button>

                            {/* Login */}
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "hidden lg:flex h-9 rounded-full font-medium transition-colors",
                                        isScrolled 
                                            ? "text-foreground/70 hover:text-foreground hover:bg-accent" 
                                            : "text-white/80 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    Log in
                                </Button>
                            </Link>

                            {/* CTA */}
                            <Link href="/signup">
                                <Button
                                    size="sm"
                                    className={cn(
                                        "h-9 rounded-full font-medium gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95",
                                        isScrolled 
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" 
                                            : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/20"
                                    )}
                                >
                                    Start For Free
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2 relative z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSearchOpen(true)}
                                className={cn(
                                    "h-9 w-9 rounded-full",
                                    isScrolled || isOpen
                                        ? "text-foreground hover:bg-accent" 
                                        : "text-white hover:bg-white/10"
                                )}
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(!isOpen)}
                                className={cn(
                                    "h-9 w-9 rounded-full",
                                    isScrolled || isOpen
                                        ? "text-foreground hover:bg-accent" 
                                        : "text-white hover:bg-white/10"
                                )}
                                aria-label={isOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isOpen}
                            >
                                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Search Command Palette */}
            <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
                <CommandInput placeholder="Search Indigo..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Actions">
                        {searchCommands.map((cmd) => {
                            const IconComponent = cmd.icon;
                            return (
                                <CommandItem 
                                    key={cmd.href}
                                    onSelect={() => {
                                        setSearchOpen(false);
                                        window.location.href = cmd.href;
                                    }}
                                >
                                    <IconComponent className="mr-2 h-4 w-4" />
                                    {cmd.title}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Pages">
                        <CommandItem onSelect={() => { setSearchOpen(false); window.location.href = "/"; }}>
                            <Store className="mr-2 h-4 w-4" />
                            Home
                        </CommandItem>
                        <CommandItem onSelect={() => { setSearchOpen(false); window.location.href = "/#features"; }}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Features
                        </CommandItem>
                        <CommandItem onSelect={() => { setSearchOpen(false); window.location.href = "/#pricing"; }}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pricing
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}

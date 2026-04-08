"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SectionTabs, MARKETING_TABS } from "@/components/dashboard/section-tabs";
import {
    Tag,
    Mail,
    Plus,
    MoreHorizontal,
    CheckCircle,
    Copy,
    Trash2,
    Edit,
    Percent,
    DollarSign,
    Users,
    TrendingUp,
    ArrowRight,
    Pause,
    Play,
    Truck,
    Rocket,
    Send,
    Target,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency } from "@/shared/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { MarketingData, Discount } from "./types";
import { 
    toggleDiscountStatus,
    deleteDiscount,
} from "./actions";
import { toast } from "sonner";
import { formatNumber, formatRelativeTime, getDiscountTypeIcon, getDiscountValue, getDiscountStatus, getStatusBadgeClass } from "./_components/helpers";

interface MarketingClientProps {
    data: MarketingData;
    currency: string;
}

export function MarketingClient({ data, currency }: MarketingClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Discount code copied");
    };

    const handleToggleDiscount = async (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            const result = await toggleDiscountStatus(id, !currentStatus);
            if (result.success) {
                toast.success(currentStatus ? "Discount deactivated" : "Discount activated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update discount");
            }
        });
    };

    const handleDeleteDiscount = async (id: string) => {
        startTransition(async () => {
            const result = await deleteDiscount(id);
            if (result.success) {
                toast.success("Discount deleted");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete discount");
            }
        });
    };

    return (
        <div className="space-y-3">
            {/* Section Tabs */}
            <SectionTabs tabs={MARKETING_TABS} />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-[-0.4px]">Marketing</h1>
                    <p className="text-sm text-muted-foreground">
                        Drive sales with discounts, campaigns, and automations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                        <Link href="/dashboard/marketing/discounts">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Discount
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="stat-label">Total Discounts</p>
                                <p className="stat-value mt-1">{data.stats.totalDiscounts}</p>
                                <p className="text-xs text-muted-foreground">{data.stats.activeDiscounts} active</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ds-teal-700/10">
                                <Tag className="h-5 w-5 text-ds-teal-700" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="stat-label">Total Redemptions</p>
                                <p className="stat-value mt-1">{formatNumber(data.stats.totalRedemptions)}</p>
                                <p className="text-xs text-muted-foreground">All time</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="stat-label">Discount Savings</p>
                                <p className="stat-value mt-1">{formatCurrency(data.stats.discountRevenue, currency)}</p>
                                <p className="text-xs text-muted-foreground">Customer savings</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                                <CheckCircle className="h-5 w-5 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="stat-label">Avg Discount</p>
                                <p className="stat-value mt-1">
                                    {data.stats.avgDiscountValue > 0 
                                        ? formatCurrency(data.stats.avgDiscountValue, currency)
                                        : "—"
                                    }
                                </p>
                                <p className="text-xs text-muted-foreground">Per redemption</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                                <Percent className="h-5 w-5 text-warning" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link 
                    href="/dashboard/marketing/discounts"
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ds-teal-700/10">
                        <Tag className="h-5 w-5 text-ds-teal-700" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Discounts</p>
                        <p className="text-xs text-muted-foreground">{data.stats.activeDiscounts} active</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link 
                    href="/dashboard/marketing/campaigns"
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Send className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Campaigns</p>
                        <p className="text-xs text-muted-foreground">
                            {data.stats.totalCampaigns > 0 
                                ? `${data.stats.activeCampaigns} active`
                                : "Create campaigns"
                            }
                        </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <div 
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card opacity-60 cursor-not-allowed"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                        <Rocket className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Automations</p>
                        <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                </div>
                <Link 
                    href="/dashboard/customers"
                    className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                        <Target className="h-5 w-5 text-warning" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Segments</p>
                        <p className="text-xs text-muted-foreground">{data.segments.length} segments</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Left Column - Discounts */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Active Discounts */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-sm">Active Discounts</CardTitle>
                                <CardDescription>
                                    {data.stats.activeDiscounts} of {data.stats.totalDiscounts} discounts active
                                </CardDescription>
                            </div>
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard/marketing/discounts">
                                    View All
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.discounts.length === 0 ? (
                                <EmptyState
                                    icon={Tag}
                                    title="No discounts yet"
                                    description="Create your first discount code"
                                    action={{
                                        label: "Create Discount",
                                        onClick: () => router.push("/dashboard/marketing/discounts"),
                                    }}
                                   
                                    className="py-8"
                                />
                            ) : (
                                data.discounts.slice(0, 5).map((discount) => {
                                    const status = getDiscountStatus(discount);
                                    const usagePercent = discount.max_uses 
                                        ? (discount.used_count / discount.max_uses) * 100 
                                        : null;

                                    return (
                                        <div
                                            key={discount.id}
                                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                    {(() => {
                                                        const Icon = getDiscountTypeIcon(discount.type);
                                                        return <Icon className="h-5 w-5 text-muted-foreground" />;
                                                    })()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <code className="text-sm font-mono font-medium">{discount.code}</code>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm" aria-label="Copy"
                                                            className="h-6 w-6"
                                                            onClick={() => handleCopyCode(discount.code)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {getDiscountValue(discount, currency)}
                                                        {discount.min_order_amount && ` • Min ${formatCurrency(Number(discount.min_order_amount), currency)}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {usagePercent !== null && (
                                                    <div className="hidden sm:block w-20">
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-muted-foreground">{discount.used_count}</span>
                                                            <span className="text-muted-foreground">/{discount.max_uses}</span>
                                                        </div>
                                                        <Progress value={usagePercent} className="h-1.5" />
                                                    </div>
                                                )}
                                                <Badge variant="secondary" className={getStatusBadgeClass(status.variant)}>
                                                    {status.label}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm" aria-label="More actions" disabled={isPending}>
                                                            {isPending ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleCopyCode(discount.code)}>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Copy Code
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href="/dashboard/marketing/discounts">
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleDiscount(discount.id, discount.is_active)}>
                                                            {discount.is_active ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                                            {discount.is_active ? "Deactivate" : "Activate"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDeleteDiscount(discount.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    {/* Campaigns Section */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-sm">Email Campaigns</CardTitle>
                                <CardDescription>
                                    {data.campaigns.length === 0 
                                        ? "Send targeted email campaigns to your customers"
                                        : `${data.stats.totalCampaigns} campaigns • ${data.stats.totalEmailsSent.toLocaleString()} emails sent`
                                    }
                                </CardDescription>
                            </div>
                            <Button variant="ghost" asChild>
                                <Link href="/dashboard/marketing/campaigns">
                                    View All
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.campaigns.length === 0 ? (
                                <EmptyState
                                    icon={Mail}
                                    title="No campaigns yet"
                                    description="Create your first email campaign"
                                    action={{
                                        label: "Create Campaign",
                                        onClick: () => router.push("/dashboard/marketing/campaigns"),
                                    }}
                                   
                                    className="py-8"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {data.campaigns.slice(0, 5).map((campaign) => {
                                        const openRate = campaign.delivered_count > 0 
                                            ? ((campaign.opened_count / campaign.delivered_count) * 100)
                                            : 0;

                                        return (
                                            <div
                                                key={campaign.id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">{campaign.name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {campaign.subject || "No subject"}
                                                            {campaign.status === "sent" && ` • ${openRate.toFixed(1)}% open rate`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={cn(
                                                        campaign.status === "sent" && "bg-success/10 text-success",
                                                        campaign.status === "scheduled" && "bg-warning/10 text-warning",
                                                        campaign.status === "draft" && "bg-muted text-muted-foreground",
                                                        campaign.status === "sending" && "bg-primary/10 text-primary",
                                                        campaign.status === "paused" && "bg-warning/10 text-warning",
                                                        campaign.status === "failed" && "bg-destructive/10 text-destructive"
                                                    )}
                                                >
                                                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Activity & Automations */}
                <div className="space-y-4">
                    {/* Automations Coming Soon */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Automations</CardTitle>
                            <CardDescription>
                                Automated email sequences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 mb-3">
                                    <Rocket className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <h3 className="text-sm font-medium mb-1">Coming Soon</h3>
                                <p className="text-xs text-muted-foreground">
                                    Automated workflows will be available soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.recentActivity.length === 0 ? (
                                <EmptyState
                                    icon={Users}
                                    title="No activity yet"
                                    description="Activity will appear here when customers use discounts"
                                   
                                    className="py-6"
                                />
                            ) : (
                                <div className="space-y-4">
                                    {data.recentActivity.map((activity, index) => (
                                        <div key={activity.id} className="flex gap-3">
                                            <div className="relative">
                                                <div className={cn(
                                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                                    activity.type === "discount_used" && "bg-ds-teal-700/10"
                                                )}>
                                                    <Tag 
                                                        className="h-4 w-4 text-ds-teal-700" 
                                                    />
                                                </div>
                                                {index < data.recentActivity.length - 1 && (
                                                    <div className="absolute left-1/2 top-8 bottom-0 w-px -translate-x-1/2 bg-border h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pb-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium">{activity.title}</p>
                                                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {formatRelativeTime(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

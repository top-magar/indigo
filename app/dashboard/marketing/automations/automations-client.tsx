"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Mail01Icon,
    Add01Icon,
    MoreHorizontalIcon,
    Delete01Icon,
    Edit01Icon,
    AnalyticsUpIcon,
    PauseIcon,
    PlayIcon,
    ArrowLeft01Icon,
    SparklesIcon,
    ShoppingCart01Icon,
    CheckmarkCircle02Icon,
    RefreshIcon,
    DiscountIcon,
    Settings01Icon,
    Clock01Icon,
    ArrowUp02Icon,
    ChartLineData01Icon,
    UserMultipleIcon,
    MailSend01Icon,
    ArrowRight01Icon,
    Calendar01Icon,
    Copy01Icon,
    ViewIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { type Automation, toggleAutomation } from "../actions";
import { toast } from "sonner";

interface AutomationsClientProps {
    automations: Automation[];
    currency: string;
}

function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US", {
        notation: value >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(value);
}

function getAutomationTypeIcon(type: Automation["type"]) {
    switch (type) {
        case "welcome": return SparklesIcon;
        case "abandoned_cart": return ShoppingCart01Icon;
        case "post_purchase": return CheckmarkCircle02Icon;
        case "win_back": return RefreshIcon;
        case "birthday": return DiscountIcon;
        default: return Mail01Icon;
    }
}

function getAutomationTypeLabel(type: Automation["type"]) {
    const labels: Record<Automation["type"], string> = {
        welcome: "Welcome Series",
        abandoned_cart: "Abandoned Cart",
        post_purchase: "Post-Purchase",
        win_back: "Win-Back",
        birthday: "Birthday",
    };
    return labels[type];
}

function getAutomationTypeColor(type: Automation["type"]) {
    switch (type) {
        case "welcome": return { bg: "bg-chart-2/10", text: "text-chart-2", border: "border-chart-2/20" };
        case "abandoned_cart": return { bg: "bg-chart-4/10", text: "text-chart-4", border: "border-chart-4/20" };
        case "post_purchase": return { bg: "bg-chart-1/10", text: "text-chart-1", border: "border-chart-1/20" };
        case "win_back": return { bg: "bg-chart-3/10", text: "text-chart-3", border: "border-chart-3/20" };
        case "birthday": return { bg: "bg-chart-5/10", text: "text-chart-5", border: "border-chart-5/20" };
        default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    }
}

function getTriggerDescription(type: Automation["type"], delayHours: number) {
    const delayText = delayHours === 0 
        ? "immediately" 
        : delayHours < 24 
            ? `after ${delayHours} hour${delayHours !== 1 ? "s" : ""}`
            : `after ${Math.floor(delayHours / 24)} day${Math.floor(delayHours / 24) !== 1 ? "s" : ""}`;

    switch (type) {
        case "welcome": return `Sends ${delayText} when a customer subscribes`;
        case "abandoned_cart": return `Sends ${delayText} when cart is abandoned`;
        case "post_purchase": return `Sends ${delayText} after purchase`;
        case "win_back": return `Sends ${delayText} of inactivity`;
        case "birthday": return `Sends on customer's birthday`;
        default: return `Triggers ${delayText}`;
    }
}

// Predefined automation templates
const automationTemplates = [
    {
        type: "welcome" as const,
        name: "Welcome Series",
        description: "Greet new subscribers with a series of onboarding emails introducing your brand and products",
        defaultDelay: 0,
        emailCount: 3,
        avgConversion: "12-15%",
    },
    {
        type: "abandoned_cart" as const,
        name: "Abandoned Cart Recovery",
        description: "Remind customers about items left in their cart with personalized product recommendations",
        defaultDelay: 1,
        emailCount: 3,
        avgConversion: "15-20%",
    },
    {
        type: "post_purchase" as const,
        name: "Post-Purchase Follow-up",
        description: "Thank customers, request reviews, and suggest complementary products after purchase",
        defaultDelay: 24,
        emailCount: 2,
        avgConversion: "8-12%",
    },
    {
        type: "win_back" as const,
        name: "Win-Back Campaign",
        description: "Re-engage customers who haven't purchased recently with special offers and incentives",
        defaultDelay: 1440,
        emailCount: 3,
        avgConversion: "5-8%",
    },
    {
        type: "birthday" as const,
        name: "Birthday Rewards",
        description: "Send special birthday offers and discounts to make customers feel valued",
        defaultDelay: 0,
        emailCount: 1,
        avgConversion: "10-15%",
    },
];

export function AutomationsClient({ automations, currency }: AutomationsClientProps) {
    const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);
    const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [automationToDelete, setAutomationToDelete] = useState<Automation | null>(null);

    // Stats
    const activeCount = automations.filter(a => a.is_active).length;
    const totalEmailsSent = automations.reduce((sum, a) => sum + a.emails_sent, 0);
    const totalRevenue = automations.reduce((sum, a) => sum + a.revenue_generated, 0);
    const avgConversion = automations.length > 0
        ? automations.reduce((sum, a) => sum + a.conversion_rate, 0) / automations.length
        : 0;

    const handleToggleAutomation = async (id: string, currentStatus: boolean) => {
        const result = await toggleAutomation(id, !currentStatus);
        if (result.success) {
            toast.success(currentStatus ? "Automation paused" : "Automation activated");
        } else {
            toast.error(result.error || "Failed to update automation");
        }
    };

    const handleDeleteAutomation = async () => {
        if (!automationToDelete) return;
        // In production, call deleteAutomation action
        toast.success("Automation deleted");
        setAutomationToDelete(null);
        setDeleteDialogOpen(false);
    };

    const openAnalytics = (automation: Automation) => {
        setSelectedAutomation(automation);
        setAnalyticsDialogOpen(true);
    };

    // Find which templates are not yet created
    const existingTypes = new Set(automations.map(a => a.type));
    const availableTemplates = automationTemplates.filter(t => !existingTypes.has(t.type));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/dashboard/marketing">
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
                        <p className="text-sm text-muted-foreground">
                            Set up automated email workflows to engage customers
                        </p>
                    </div>
                </div>
                {availableTemplates.length > 0 && (
                    <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                        Create Automation
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                                <HugeiconsIcon icon={PlayIcon} className="h-5 w-5 text-chart-2" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-xl font-semibold">{activeCount} / {automations.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                                <HugeiconsIcon icon={MailSend01Icon} className="h-5 w-5 text-chart-1" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Emails Sent</p>
                                <p className="text-xl font-semibold">{formatNumber(totalEmailsSent)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                                <HugeiconsIcon icon={ArrowUp02Icon} className="h-5 w-5 text-chart-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Conversion</p>
                                <p className="text-xl font-semibold">{avgConversion.toFixed(1)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                                <HugeiconsIcon icon={AnalyticsUpIcon} className="h-5 w-5 text-chart-3" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-xl font-semibold">{formatCurrency(totalRevenue, currency)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Automations Grid */}
            {automations.length === 0 ? (
                <Card>
                    <CardContent className="py-12">
                        <EmptyState
                            icon={Mail01Icon}
                            title="No automations yet"
                            description="Set up automated email workflows to engage customers at key moments"
                            action={{
                                label: "Create Automation",
                                onClick: () => setCreateDialogOpen(true),
                            }}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {automations.map((automation) => {
                        const colors = getAutomationTypeColor(automation.type);
                        const conversionProgress = Math.min(automation.conversion_rate * 5, 100); // Scale for visual
                        
                        return (
                            <Card 
                                key={automation.id} 
                                className={cn(
                                    "transition-all",
                                    !automation.is_active && "opacity-60"
                                )}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Left Section - Info */}
                                        <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", colors.bg)}>
                                                        <HugeiconsIcon icon={getAutomationTypeIcon(automation.type)} className={cn("h-6 w-6", colors.text)} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{automation.name}</h3>
                                                        <Badge variant="outline" className={cn("text-xs mt-1", colors.text, colors.border)}>
                                                            {getAutomationTypeLabel(automation.type)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div>
                                                                    <Switch
                                                                        checked={automation.is_active}
                                                                        onCheckedChange={() => handleToggleAutomation(automation.id, automation.is_active)}
                                                                    />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {automation.is_active ? "Pause automation" : "Activate automation"}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-muted-foreground mb-4">{automation.description}</p>
                                            
                                            {/* Trigger Info */}
                                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                                                <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {getTriggerDescription(automation.type, automation.trigger_delay_hours)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Section - Stats */}
                                        <div className="lg:w-80 p-5">
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="text-center">
                                                    <p className="text-2xl font-semibold">{formatNumber(automation.emails_sent)}</p>
                                                    <p className="text-xs text-muted-foreground">Emails Sent</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-semibold">{automation.conversion_rate}%</p>
                                                    <p className="text-xs text-muted-foreground">Conversion</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-semibold text-chart-2">{formatCurrency(automation.revenue_generated, currency)}</p>
                                                    <p className="text-xs text-muted-foreground">Revenue</p>
                                                </div>
                                            </div>

                                            {/* Conversion Progress */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-muted-foreground">Conversion Rate</span>
                                                    <span className="font-medium">{automation.conversion_rate}%</span>
                                                </div>
                                                <Progress value={conversionProgress} className="h-2" />
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1"
                                                    onClick={() => openAnalytics(automation)}
                                                >
                                                    <HugeiconsIcon icon={ChartLineData01Icon} className="h-4 w-4 mr-1" />
                                                    Analytics
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 mr-2" />
                                                            Configure
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                                                            Edit Emails
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleAutomation(automation.id, automation.is_active)}>
                                                            <HugeiconsIcon icon={automation.is_active ? PauseIcon : PlayIcon} className="h-4 w-4 mr-2" />
                                                            {automation.is_active ? "Pause" : "Activate"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setAutomationToDelete(automation);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Available Templates */}
            {availableTemplates.length > 0 && automations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Available Automations</CardTitle>
                        <CardDescription>
                            Set up additional automated workflows to boost engagement
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {availableTemplates.map((template) => {
                                const colors = getAutomationTypeColor(template.type);
                                return (
                                    <button
                                        key={template.type}
                                        onClick={() => setCreateDialogOpen(true)}
                                        className="flex items-start gap-4 p-4 rounded-xl border border-dashed hover:border-primary hover:bg-muted/30 transition-all text-left group"
                                    >
                                        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", colors.bg)}>
                                            <HugeiconsIcon icon={getAutomationTypeIcon(template.type)} className={cn("h-6 w-6", colors.text)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{template.name}</p>
                                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <HugeiconsIcon icon={Mail01Icon} className="h-3 w-3" />
                                                    {template.emailCount} emails
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <HugeiconsIcon icon={ArrowUp02Icon} className="h-3 w-3" />
                                                    {template.avgConversion} avg
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Create Automation Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Automation</DialogTitle>
                        <DialogDescription>
                            Choose an automation type to get started
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4">
                        {availableTemplates.map((template) => {
                            const colors = getAutomationTypeColor(template.type);
                            return (
                                <button
                                    key={template.type}
                                    className="flex items-start gap-4 p-4 rounded-xl border hover:border-primary hover:bg-muted/30 transition-all text-left"
                                >
                                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", colors.bg)}>
                                        <HugeiconsIcon icon={getAutomationTypeIcon(template.type)} className={cn("h-6 w-6", colors.text)} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{template.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <HugeiconsIcon icon={Mail01Icon} className="h-3 w-3" />
                                                {template.emailCount} email{template.emailCount !== 1 ? "s" : ""} in sequence
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <HugeiconsIcon icon={ArrowUp02Icon} className="h-3 w-3" />
                                                {template.avgConversion} conversion
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Analytics Dialog */}
            <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Automation Analytics</DialogTitle>
                        <DialogDescription>
                            {selectedAutomation?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAutomation && (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <HugeiconsIcon icon={MailSend01Icon} className="h-5 w-5 mx-auto mb-2 text-chart-1" />
                                    <p className="text-2xl font-semibold">{formatNumber(selectedAutomation.emails_sent)}</p>
                                    <p className="text-xs text-muted-foreground">Emails Sent</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <HugeiconsIcon icon={ArrowUp02Icon} className="h-5 w-5 mx-auto mb-2 text-chart-2" />
                                    <p className="text-2xl font-semibold">{selectedAutomation.conversion_rate}%</p>
                                    <p className="text-xs text-muted-foreground">Conversion</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <HugeiconsIcon icon={UserMultipleIcon} className="h-5 w-5 mx-auto mb-2 text-chart-4" />
                                    <p className="text-2xl font-semibold">
                                        {formatNumber(Math.round(selectedAutomation.emails_sent * selectedAutomation.conversion_rate / 100))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Conversions</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <HugeiconsIcon icon={AnalyticsUpIcon} className="h-5 w-5 mx-auto mb-2 text-chart-3" />
                                    <p className="text-2xl font-semibold">{formatCurrency(selectedAutomation.revenue_generated, currency)}</p>
                                    <p className="text-xs text-muted-foreground">Revenue</p>
                                </div>
                            </div>

                            {/* Performance Over Time (Placeholder) */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Performance Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                                        <HugeiconsIcon icon={ChartLineData01Icon} className="h-8 w-8 mr-2 opacity-50" />
                                        Chart visualization would go here
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trigger Info */}
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Trigger</p>
                                    <p className="text-sm text-muted-foreground">
                                        {getTriggerDescription(selectedAutomation.type, selectedAutomation.trigger_delay_hours)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Automation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{automationToDelete?.name}"?
                            This will stop all automated emails and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAutomation}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
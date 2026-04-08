"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Mail,
    Plus,
    MoreHorizontal,
    Trash2,
    Edit,
    TrendingUp,
    Pause,
    Play,
    ArrowLeft,
    Sparkles,
    ShoppingCart,
    CheckCircle,
    RefreshCw,
    Percent,
    Settings,
    Clock,
    ArrowUp,
    LineChart,
    Users,
    Send,
    ArrowRight,
    Calendar,
    Copy,
    Eye,
} from "lucide-react";
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
import { cn, formatCurrency } from "@/shared/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { Automation } from "../types";
import { toggleAutomation } from "../actions";
import { toast } from "sonner";
import { formatNumber, getAutomationTypeIcon, getAutomationTypeLabel, getAutomationTypeColor, getTriggerDescription, automationTemplates } from "./_components/helpers";

interface AutomationsClientProps {
    automations: Automation[];
    currency: string;
}

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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon-sm" aria-label="Go back" asChild>
                        <Link href="/dashboard/marketing">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold tracking-[-0.4px]">Automations</h1>
                        <p className="text-sm text-muted-foreground">
                            Set up automated email workflows to engage customers
                        </p>
                    </div>
                </div>
                {availableTemplates.length > 0 && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Automation
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                                <Play className="h-5 w-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="stat-value">{activeCount} / {automations.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Send className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Emails Sent</p>
                                <p className="stat-value">{formatNumber(totalEmailsSent)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                                <ArrowUp className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Conversion</p>
                                <p className="stat-value">{avgConversion.toFixed(1)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ds-teal-700/10">
                                <TrendingUp className="h-5 w-5 text-ds-teal-700" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="stat-value">{formatCurrency(totalRevenue, currency)}</p>
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
                            icon={Mail}
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
                                                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colors.bg)}>
                                                        {(() => {
                                                            const Icon = getAutomationTypeIcon(automation.type);
                                                            return <Icon className={cn("h-6 w-6", colors.text)} />;
                                                        })()}
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
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground">
                                                    {getTriggerDescription(automation.type, automation.trigger_delay_hours)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Section - Stats */}
                                        <div className="lg:w-80 p-5">
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div className="text-center">
                                                    <p className="stat-value">{formatNumber(automation.emails_sent)}</p>
                                                    <p className="text-xs text-muted-foreground">Emails Sent</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="stat-value">{automation.conversion_rate}%</p>
                                                    <p className="text-xs text-muted-foreground">Conversion</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="stat-value text-success">{formatCurrency(automation.revenue_generated, currency)}</p>
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
                                                <Button size="sm"
                                                    variant="outline" 
                                                    className="flex-1"
                                                    onClick={() => openAnalytics(automation)}
                                                >
                                                    <LineChart className="h-4 w-4 mr-1" />
                                                    Analytics
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon-sm" aria-label="More actions">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Configure
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit Emails
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Copy className="h-4 w-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleAutomation(automation.id, automation.is_active)}>
                                                            {automation.is_active ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
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
                                                            <Trash2 className="h-4 w-4 mr-2" />
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
                        <CardTitle className="text-sm">Available Automations</CardTitle>
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
                                        className="flex items-start gap-4 p-4 rounded-lg border border-dashed hover:border-primary hover:bg-muted/30 transition-all text-left group"
                                    >
                                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colors.bg)}>
                                            {(() => {
                                                const Icon = getAutomationTypeIcon(template.type);
                                                return <Icon className={cn("h-6 w-6", colors.text)} />;
                                            })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{template.name}</p>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {template.emailCount} emails
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ArrowUp className="h-3 w-3" />
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
                                    className="flex items-start gap-4 p-4 rounded-lg border hover:border-primary hover:bg-muted/30 transition-all text-left"
                                >
                                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", colors.bg)}>
                                        {(() => {
                                            const Icon = getAutomationTypeIcon(template.type);
                                            return <Icon className={cn("h-6 w-6", colors.text)} />;
                                        })()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{template.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {template.emailCount} email{template.emailCount !== 1 ? "s" : ""} in sequence
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ArrowUp className="h-3 w-3" />
                                                {template.avgConversion} conversion
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(false)}>
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
                        <div className="space-y-4">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <Send className="h-5 w-5 mx-auto mb-2 text-primary" />
                                    <p className="stat-value">{formatNumber(selectedAutomation.emails_sent)}</p>
                                    <p className="text-xs text-muted-foreground">Emails Sent</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <ArrowUp className="h-5 w-5 mx-auto mb-2 text-success" />
                                    <p className="stat-value">{selectedAutomation.conversion_rate}%</p>
                                    <p className="text-xs text-muted-foreground">Conversion</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <Users className="h-5 w-5 mx-auto mb-2 text-warning" />
                                    <p className="stat-value">
                                        {formatNumber(Math.round(selectedAutomation.emails_sent * selectedAutomation.conversion_rate / 100))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Conversions</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-ds-teal-700" />
                                    <p className="stat-value">{formatCurrency(selectedAutomation.revenue_generated, currency)}</p>
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
                                        <LineChart className="h-8 w-8 mr-2 opacity-50" />
                                        Chart visualization would go here
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trigger Info */}
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <Clock className="h-5 w-5 text-muted-foreground" />
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
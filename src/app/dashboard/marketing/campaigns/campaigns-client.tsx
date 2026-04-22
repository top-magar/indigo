"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Mail,
    Plus,
    MoreHorizontal,
    Copy,
    Trash2,
    Edit,
    Users,
    TrendingUp,
    Pause,
    Search,
    Calendar,
    ArrowLeft,
    Send,
    ArrowUp,
    ArrowDown,
    Download,
    Check,
    LineChart,
    MousePointerClick,
    MailOpen,
    Link2,
    UserMinus,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Campaign, CustomerSegment } from "../types";
import { formatNumber, formatDate, formatDateTime, getStatusBadgeClass, getStatusLabel, exportToCSV } from "./_components/helpers";
import { deleteCampaign, pauseCampaign, sendCampaign, duplicateCampaign } from "../actions";
import { CampaignDialog } from "../campaign-dialog";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/shared/utils";
import { EntityListPage } from "@/components/dashboard/templates";

interface CampaignsClientProps {
    campaigns: Campaign[];
    segments: CustomerSegment[];
    currency: string;
}

type SortField = "name" | "status" | "recipients_count" | "opened_count" | "revenue_generated" | "created_at";
type SortDirection = "asc" | "desc";

export function CampaignsClient({ campaigns, segments, currency }: CampaignsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    // Campaign dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCampaignForEdit, setSelectedCampaignForEdit] = useState<Campaign | null>(null);
    
    // Analytics dialog state
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
    
    // Delete dialog states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    
    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [segmentFilter, setSegmentFilter] = useState(searchParams.get("segment") || "all");
    
    // Sort state
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Update URL with filters
    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Filter and sort campaigns
    const filteredCampaigns = useMemo(() => {
        let result = campaigns.filter((campaign) => {
            const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                campaign.subject?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
            const matchesSegment = segmentFilter === "all" || campaign.segment_id === segmentFilter;
            return matchesSearch && matchesStatus && matchesSegment;
        });

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "name":
                    comparison = a.name.localeCompare(b.name);
                    break;
                case "status":
                    comparison = a.status.localeCompare(b.status);
                    break;
                case "recipients_count":
                    comparison = a.recipients_count - b.recipients_count;
                    break;
                case "opened_count":
                    comparison = a.opened_count - b.opened_count;
                    break;
                case "revenue_generated":
                    comparison = a.revenue_generated - b.revenue_generated;
                    break;
                case "created_at":
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return result;
    }, [campaigns, searchQuery, statusFilter, segmentFilter, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredCampaigns.length / pageSize);
    const paginatedCampaigns = filteredCampaigns.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Stats
    const totalSent = campaigns.filter(c => c.status === "sent").length;
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue_generated, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered_count, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.opened_count, 0);
    const avgOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered * 100) : 0;
    const totalClicked = campaigns.reduce((sum, c) => sum + c.clicked_count, 0);
    const avgClickRate = totalDelivered > 0 ? (totalClicked / totalDelivered * 100) : 0;

    // Selection handlers
    const isAllSelected = paginatedCampaigns.length > 0 && paginatedCampaigns.every(c => selectedIds.has(c.id));
    const isSomeSelected = paginatedCampaigns.some(c => selectedIds.has(c.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedCampaigns.map(c => c.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Sort handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === "asc" ? (
            <ArrowUp className="size-3.5 ml-1" />
        ) : (
            <ArrowDown className="size-3.5 ml-1" />
        );
    };

    // Action handlers
    const handleDeleteCampaign = async () => {
        if (!campaignToDelete) return;
        startTransition(async () => {
            const result = await deleteCampaign(campaignToDelete.id);
            if (result.success) {
                toast.success("Campaign deleted");
                setCampaignToDelete(null);
                setDeleteDialogOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete campaign");
            }
        });
    };

    const handlePauseCampaign = async (id: string) => {
        startTransition(async () => {
            const result = await pauseCampaign(id);
            if (result.success) {
                toast.success("Campaign paused");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to pause campaign");
            }
        });
    };

    const handleSendCampaign = async (id: string) => {
        startTransition(async () => {
            const result = await sendCampaign(id);
            if (result.success) {
                toast.success("Campaign sent");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to send campaign");
            }
        });
    };

    const handleDuplicateCampaign = async (id: string) => {
        startTransition(async () => {
            const result = await duplicateCampaign(id);
            if (result.success) {
                toast.success("Campaign duplicated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to duplicate campaign");
            }
        });
    };

    const handleBulkDelete = async () => {
        startTransition(async () => {
            const results = await Promise.allSettled(Array.from(selectedIds).map(id => deleteCampaign(id)));
            const failed = results.filter(r => r.status === "rejected").length;
            if (failed > 0) toast.error(`${failed} campaigns failed to delete`);
            else toast.success(`${selectedIds.size} campaigns deleted`);
            setSelectedIds(new Set());
            setBulkDeleteDialogOpen(false);
            router.refresh();
        });
    };

    const handleEditCampaign = (campaign: Campaign) => {
        setSelectedCampaignForEdit(campaign);
        setDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setSelectedCampaignForEdit(null);
        }
    };

    const openAnalytics = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setAnalyticsDialogOpen(true);
    };

    return (
        <EntityListPage
            title="Campaigns"
            description="Create and manage email campaigns"
            actions={
                <>
                    <Button variant="ghost" size="icon" aria-label="Go back" asChild>
                        <Link href="/dashboard/marketing">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline" 
                                    size="icon-sm" aria-label="Download" 
                                    onClick={() => exportToCSV(filteredCampaigns, currency)}
                                >
                                    <Download className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export to CSV</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button onClick={() => { setSelectedCampaignForEdit(null); setDialogOpen(true); }}>
                        <Plus className="size-3.5" />
                        Create Campaign
                    </Button>
                </>
            }
        >

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                                <Send className="size-4 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Sent</p>
                                <p className="text-xl font-semibold tabular-nums">{totalSent}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <MailOpen className="size-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Open Rate</p>
                                <p className="text-xl font-semibold tabular-nums">{avgOpenRate.toFixed(1)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                                <MousePointerClick className="size-4 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Click Rate</p>
                                <p className="text-xl font-semibold tabular-nums">{avgClickRate.toFixed(1)}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ds-teal-700/10">
                                <TrendingUp className="size-4 text-ds-teal-700" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-xl font-semibold tabular-nums">{formatCurrency(totalRevenue, currency)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Campaigns List */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-sm">All Campaigns</CardTitle>
                            <CardDescription>
                                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""}
                                {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {selectedIds.size > 0 ? (
                                <Button
                                    variant="outline" 
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setBulkDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="size-4 mr-1" />
                                    Delete ({selectedIds.size})
                                </Button>
                            ) : (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            aria-label="Search campaigns" placeholder="Search campaigns..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="pl-8 w-full sm:w-[200px]"
                                        />
                                    </div>
                                    <Select 
                                        value={statusFilter} 
                                        onValueChange={(v) => {
                                            setStatusFilter(v);
                                            updateFilters("status", v);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[140px]" aria-label="Filter by status">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="paused">Paused</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select 
                                        value={segmentFilter} 
                                        onValueChange={(v) => {
                                            setSegmentFilter(v);
                                            updateFilters("segment", v);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by segment">
                                            <SelectValue placeholder="Segment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Segments</SelectItem>
                                            {segments.map(segment => (
                                                <SelectItem key={segment.id} value={segment.id}>
                                                    {segment.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredCampaigns.length === 0 ? (
                        <EmptyState
                            icon={Mail}
                            title={searchQuery || statusFilter !== "all" ? "No campaigns found" : "No campaigns yet"}
                            description={searchQuery || statusFilter !== "all"
                                ? "Try adjusting your filters"
                                : "Create your first email campaign to engage customers"
                            }
                            action={!searchQuery && statusFilter === "all" ? {
                                label: "Create Campaign",
                                onClick: () => { setSelectedCampaignForEdit(null); setDialogOpen(true); },
                            } : undefined}
                            size="md"
                            className="py-12"
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <Checkbox
                                                checked={isAllSelected}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                                className={isSomeSelected && !isAllSelected ? "opacity-50" : ""}
                                            />
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground"
                                            onClick={() => handleSort("name")}
                                        >
                                            <div className="flex items-center">
                                                Campaign
                                                <SortIcon field="name" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground"
                                            onClick={() => handleSort("status")}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                <SortIcon field="status" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground"
                                            onClick={() => handleSort("recipients_count")}
                                        >
                                            <div className="flex items-center">
                                                Recipients
                                                <SortIcon field="recipients_count" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground hidden md:table-cell"
                                            onClick={() => handleSort("opened_count")}
                                        >
                                            <div className="flex items-center">
                                                Performance
                                                <SortIcon field="opened_count" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground hidden lg:table-cell"
                                            onClick={() => handleSort("revenue_generated")}
                                        >
                                            <div className="flex items-center">
                                                Revenue
                                                <SortIcon field="revenue_generated" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCampaigns.map((campaign) => {
                                        const openRate = campaign.delivered_count > 0 
                                            ? ((campaign.opened_count / campaign.delivered_count) * 100)
                                            : 0;
                                        const clickRate = campaign.delivered_count > 0 
                                            ? ((campaign.clicked_count / campaign.delivered_count) * 100)
                                            : 0;

                                        return (
                                            <TableRow 
                                                key={campaign.id}
                                                className={selectedIds.has(campaign.id) ? "bg-muted/50" : ""}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.has(campaign.id)}
                                                        onCheckedChange={() => toggleSelect(campaign.id)}
                                                        aria-label={`Select ${campaign.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                            <Mail className="size-4 text-muted-foreground" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium truncate">{campaign.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {campaign.subject || "No subject"}
                                                            </p>
                                                            {campaign.segment_name && (
                                                                <Badge variant="outline" className="text-[10px] mt-1">
                                                                    <Users className="size-2.5 mr-1" />
                                                                    {campaign.segment_name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Badge variant="secondary" className={getStatusBadgeClass(campaign.status)}>
                                                            {getStatusLabel(campaign.status)}
                                                        </Badge>
                                                        {campaign.status === "scheduled" && campaign.scheduled_at && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="size-3.5" />
                                                                {formatDateTime(campaign.scheduled_at)}
                                                            </p>
                                                        )}
                                                        {campaign.status === "sent" && campaign.sent_at && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatDate(campaign.sent_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium">{formatNumber(campaign.recipients_count)}</p>
                                                        {campaign.delivered_count > 0 && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatNumber(campaign.delivered_count)} delivered
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {campaign.status === "sent" ? (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-4 text-xs">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger className="flex items-center gap-1">
                                                                            <MailOpen className="size-3.5 text-primary" />
                                                                            <span className="font-medium">{openRate.toFixed(1)}%</span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {campaign.opened_count.toLocaleString()} opens
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger className="flex items-center gap-1">
                                                                            <MousePointerClick className="size-3.5 text-warning" />
                                                                            <span className="font-medium">{clickRate.toFixed(1)}%</span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            {campaign.clicked_count.toLocaleString()} clicks
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            <Progress value={openRate} className="h-1" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    {campaign.revenue_generated > 0 ? (
                                                        <span className="font-medium text-success">
                                                            {formatCurrency(campaign.revenue_generated, currency)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon-sm" aria-label="More actions" disabled={isPending}>
                                                                {isPending ? (
                                                                    <Loader2 className="size-4 animate-spin" />
                                                                ) : (
                                                                    <MoreHorizontal className="size-4" />
                                                                )}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {campaign.status === "sent" && (
                                                                <DropdownMenuItem onClick={() => openAnalytics(campaign)}>
                                                                    <LineChart className="size-3.5" />
                                                                    View Analytics
                                                                </DropdownMenuItem>
                                                            )}
                                                            {campaign.status === "draft" && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                                                                        <Edit className="size-3.5" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleSendCampaign(campaign.id)}>
                                                                        <Send className="size-3.5" />
                                                                        Send Now
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {campaign.status === "scheduled" && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                                                                        <Edit className="size-3.5" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handlePauseCampaign(campaign.id)}>
                                                                        <Pause className="size-3.5" />
                                                                        Pause
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            {campaign.status === "paused" && (
                                                                <DropdownMenuItem onClick={() => handleEditCampaign(campaign)}>
                                                                    <Edit className="size-3.5" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => handleDuplicateCampaign(campaign.id)}>
                                                                <Copy className="size-3.5" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => {
                                                                    setCampaignToDelete(campaign);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredCampaigns.length)} of {filteredCampaigns.length}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum: number;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                       
                                                        className="size-8 p-0"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Analytics Dialog */}
            <Dialog open={analyticsDialogOpen} onOpenChange={setAnalyticsDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Campaign Analytics</DialogTitle>
                        <DialogDescription>
                            {selectedCampaign?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedCampaign && (
                        <div className="space-y-4">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <Send className="size-4 mx-auto mb-2 text-primary" />
                                    <p className="text-xl font-semibold tabular-nums">{formatNumber(selectedCampaign.delivered_count)}</p>
                                    <p className="text-xs text-muted-foreground">Delivered</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <MailOpen className="size-4 mx-auto mb-2 text-success" />
                                    <p className="text-xl font-semibold tabular-nums">
                                        {selectedCampaign.delivered_count > 0 
                                            ? ((selectedCampaign.opened_count / selectedCampaign.delivered_count) * 100).toFixed(1)
                                            : 0}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Open Rate</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <MousePointerClick className="size-4 mx-auto mb-2 text-warning" />
                                    <p className="text-xl font-semibold tabular-nums">
                                        {selectedCampaign.delivered_count > 0 
                                            ? ((selectedCampaign.clicked_count / selectedCampaign.delivered_count) * 100).toFixed(1)
                                            : 0}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Click Rate</p>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 text-center">
                                    <TrendingUp className="size-4 mx-auto mb-2 text-ds-teal-700" />
                                    <p className="text-xl font-semibold tabular-nums">{formatCurrency(selectedCampaign.revenue_generated, currency)}</p>
                                    <p className="text-xs text-muted-foreground">Revenue</p>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Delivery Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Users className="size-4" />
                                                Recipients
                                            </span>
                                            <span className="font-medium">{selectedCampaign.recipients_count.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Check className="size-4" />
                                                Delivered
                                            </span>
                                            <span className="font-medium">{selectedCampaign.delivered_count.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <AlertTriangle className="size-4" />
                                                Bounced
                                            </span>
                                            <span className="font-medium">{selectedCampaign.bounced_count.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Engagement Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <MailOpen className="size-4" />
                                                Opened
                                            </span>
                                            <span className="font-medium">{selectedCampaign.opened_count.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <Link2 className="size-4" />
                                                Clicked
                                            </span>
                                            <span className="font-medium">{selectedCampaign.clicked_count.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-2">
                                                <UserMinus className="size-4" />
                                                Unsubscribed
                                            </span>
                                            <span className="font-medium">{selectedCampaign.unsubscribed_count.toLocaleString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{campaignToDelete?.name}"?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCampaign}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} Campaigns</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.size} selected campaign{selectedIds.size !== 1 ? "s" : ""}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CampaignDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                campaign={selectedCampaignForEdit}
                segments={segments}
            />
        </EntityListPage>
    );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Edit01Icon,
    MoreVerticalIcon,
    Copy01Icon,
    Delete02Icon,
    EyeIcon,
    Home01Icon,
    File01Icon,
    Loading03Icon,
    PaintBrush01Icon,
    Globe02Icon,
    Search01Icon,
    GridIcon,
    Layers01Icon,
    StarIcon,
    LayoutTopIcon,
    Mail01Icon,
    UserMultiple02Icon,
    Settings01Icon,
    ArrowRight01Icon,
    Clock01Icon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import type { StorePage, PageType } from "@/types/page-builder";
import { createStorePage, duplicateStorePage, deleteStorePage } from "./actions";

interface StoreEditorClientProps {
    pages: StorePage[];
    storeSlug: string;
    storeName: string;
}

// Page type configurations
const PAGE_TYPE_CONFIG: Record<PageType, { icon: typeof Home01Icon; label: string; description: string; color: string }> = {
    home: { icon: Home01Icon, label: "Homepage", description: "Main landing page", color: "chart-2" },
    about: { icon: UserMultiple02Icon, label: "About", description: "About your store", color: "chart-1" },
    contact: { icon: Mail01Icon, label: "Contact", description: "Contact information", color: "chart-3" },
    landing: { icon: StarIcon, label: "Landing", description: "Marketing page", color: "chart-4" },
    custom: { icon: File01Icon, label: "Custom", description: "Custom page", color: "chart-5" },
};

// Starter templates
const STARTER_TEMPLATES = [
    { id: "blank", name: "Blank Page", description: "Start from scratch", icon: File01Icon, blocks: 0 },
    { id: "hero-products", name: "Hero + Products", description: "Hero section with featured products", icon: LayoutTopIcon, blocks: 3 },
    { id: "landing", name: "Landing Page", description: "Full marketing landing page", icon: StarIcon, blocks: 6 },
    { id: "about", name: "About Us", description: "Company story and team", icon: UserMultiple02Icon, blocks: 4 },
];

export function StoreEditorClient({ pages, storeSlug, storeName }: StoreEditorClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
    const [newPageTitle, setNewPageTitle] = useState("");
    const [newPageType, setNewPageType] = useState<PageType>("custom");
    const [selectedTemplate, setSelectedTemplate] = useState("blank");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const handleCreatePage = () => {
        if (!newPageTitle.trim()) {
            toast.error("Please enter a page title");
            return;
        }

        startTransition(async () => {
            const result = await createStorePage(newPageTitle, newPageType);
            if (result.success && result.pageId) {
                toast.success("Page created");
                setShowCreateDialog(false);
                setNewPageTitle("");
                router.push(`/editor/${result.pageId}`);
            } else {
                toast.error(result.error || "Failed to create page");
            }
        });
    };

    const handleDuplicate = (pageId: string) => {
        startTransition(async () => {
            const result = await duplicateStorePage(pageId);
            if (result.success) {
                toast.success("Page duplicated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to duplicate page");
            }
        });
    };

    const handleDelete = (pageId: string) => {
        startTransition(async () => {
            const result = await deleteStorePage(pageId);
            if (result.success) {
                toast.success("Page deleted");
                setShowDeleteDialog(null);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete page");
            }
        });
    };

    const homepage = pages.find((p) => p.is_homepage);
    const otherPages = pages.filter((p) => !p.is_homepage);
    const filteredPages = otherPages.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "bg-chart-2/15 text-chart-2 border-chart-2/20";
            case "draft": return "bg-chart-4/15 text-chart-4 border-chart-4/20";
            case "archived": return "bg-muted text-muted-foreground";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Store Editor</h1>
                    <p className="text-muted-foreground">
                        Design and customize your storefront pages
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                            <HugeiconsIcon icon={Globe02Icon} className="mr-2 h-4 w-4" />
                            View Store
                        </a>
                    </Button>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
                                Create Page
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Page</DialogTitle>
                                <DialogDescription>
                                    Choose a template and customize your new page
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                {/* Page Details */}
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label>Page Title</Label>
                                        <Input
                                            value={newPageTitle}
                                            onChange={(e) => setNewPageTitle(e.target.value)}
                                            placeholder="e.g., About Us, Contact, Sale"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Page Type</Label>
                                        <Select value={newPageType} onValueChange={(v) => setNewPageType(v as PageType)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(PAGE_TYPE_CONFIG).map(([type, config]) => (
                                                    <SelectItem key={type} value={type}>
                                                        <div className="flex items-center gap-2">
                                                            <HugeiconsIcon icon={config.icon} className="h-4 w-4" />
                                                            {config.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Template Selection */}
                                <div className="space-y-3">
                                    <Label>Start with a template</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {STARTER_TEMPLATES.map((template) => (
                                            <button
                                                key={template.id}
                                                onClick={() => setSelectedTemplate(template.id)}
                                                className={cn(
                                                    "flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left",
                                                    selectedTemplate === template.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                    selectedTemplate === template.id ? "bg-primary/10" : "bg-muted"
                                                )}>
                                                    <HugeiconsIcon
                                                        icon={template.icon}
                                                        className={cn(
                                                            "h-5 w-5",
                                                            selectedTemplate === template.id ? "text-primary" : "text-muted-foreground"
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{template.name}</p>
                                                    <p className="text-xs text-muted-foreground">{template.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreatePage} disabled={isPending || !newPageTitle.trim()}>
                                    {isPending && <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Page
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Homepage Section */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
                        <HugeiconsIcon icon={Home01Icon} className="h-4 w-4 text-chart-2" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Homepage</h2>
                        <p className="text-xs text-muted-foreground">The main page visitors see first</p>
                    </div>
                </div>

                {homepage ? (
                    <Card className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                            {/* Page Preview Thumbnail */}
                            <div className="sm:w-64 h-40 sm:h-auto bg-linear-to-br from-muted to-muted/50 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border relative group">
                                <div className="absolute inset-0 bg-linear-to-br from-chart-2/5 to-chart-1/5" />
                                <div className="relative flex flex-col items-center gap-2 text-muted-foreground">
                                    <HugeiconsIcon icon={PaintBrush01Icon} className="h-8 w-8" />
                                    <span className="text-xs font-medium">{homepage.blocks.length} blocks</span>
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" variant="secondary" asChild>
                                        <Link href={`/editor/${homepage.id}`}>
                                            <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button size="sm" variant="secondary" asChild>
                                        <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                                            <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* Page Info */}
                            <div className="flex-1 p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">{homepage.title}</h3>
                                            <Badge variant="secondary" className={getStatusColor(homepage.status)}>
                                                {homepage.status === "published" && (
                                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3 mr-1" />
                                                )}
                                                {homepage.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            /{homepage.slug}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5" />
                                                Updated {formatDistanceToNow(new Date(homepage.updated_at), { addSuffix: true })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <HugeiconsIcon icon={Layers01Icon} className="h-3.5 w-3.5" />
                                                {homepage.blocks.length} blocks
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                                                <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                                                Preview
                                            </a>
                                        </Button>
                                        <Button size="sm" asChild>
                                            <Link href={`/editor/${homepage.id}`}>
                                                <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                                                Edit Page
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-chart-2/10 flex items-center justify-center mb-4">
                                <HugeiconsIcon icon={Home01Icon} className="h-8 w-8 text-chart-2" />
                            </div>
                            <h3 className="font-semibold text-lg">No Homepage Set</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
                                Create a homepage to customize what visitors see when they first visit your store
                            </p>
                            <Button onClick={() => {
                                setNewPageType("home");
                                setNewPageTitle("Homepage");
                                setShowCreateDialog(true);
                            }}>
                                <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
                                Create Homepage
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Other Pages Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <HugeiconsIcon icon={File01Icon} className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Other Pages</h2>
                            <p className="text-xs text-muted-foreground">{otherPages.length} pages</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="relative">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            />
                            <Input
                                placeholder="Search pages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-[200px] pl-9"
                            />
                        </div>
                        {/* View Toggle */}
                        <div className="flex items-center bg-muted rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
                                    viewMode === "grid" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <HugeiconsIcon icon={GridIcon} className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
                                    viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <HugeiconsIcon icon={Layers01Icon} className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {filteredPages.length === 0 && otherPages.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <HugeiconsIcon icon={File01Icon} className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">No other pages yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 mb-6 text-center max-w-sm">
                                Create additional pages like About, Contact, or custom landing pages
                            </p>
                            <Button variant="outline" onClick={() => setShowCreateDialog(true)}>
                                <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
                                Create Page
                            </Button>
                        </CardContent>
                    </Card>
                ) : filteredPages.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <p className="text-sm text-muted-foreground">No pages match your search</p>
                        </CardContent>
                    </Card>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPages.map((page) => {
                            const typeConfig = PAGE_TYPE_CONFIG[page.page_type] || PAGE_TYPE_CONFIG.custom;
                            return (
                                <Card key={page.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Thumbnail */}
                                    <div className="h-32 bg-linear-to-br from-muted to-muted/50 flex items-center justify-center relative">
                                        <div className={cn("absolute inset-0 bg-linear-to-br opacity-30", `from-${typeConfig.color}/10 to-${typeConfig.color}/5`)} />
                                        <div className="relative flex flex-col items-center gap-1 text-muted-foreground">
                                            <HugeiconsIcon icon={typeConfig.icon} className="h-6 w-6" />
                                            <span className="text-[10px] font-medium">{page.blocks.length} blocks</span>
                                        </div>
                                        {/* Quick Actions Overlay */}
                                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button size="sm" variant="secondary" asChild>
                                                <Link href={`/editor/${page.id}`}>
                                                    <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button size="sm" variant="secondary" asChild>
                                                <a href={`/store/${storeSlug}/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                                    <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Info */}
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium truncate">{page.title}</h3>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">/{page.slug}</p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                        <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/editor/${page.id}`}>
                                                            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <a href={`/store/${storeSlug}/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                                            <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
                                                            Preview
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(page.id)}>
                                                        <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setShowDeleteDialog(page.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Badge variant="secondary" className={cn("text-[10px]", getStatusColor(page.status))}>
                                                {page.status}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (

                    /* List View */
                    <Card>
                        <div className="divide-y divide-border">
                            {filteredPages.map((page) => {
                                const typeConfig = PAGE_TYPE_CONFIG[page.page_type] || PAGE_TYPE_CONFIG.custom;
                                return (
                                    <div key={page.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                            `bg-${typeConfig.color}/10`
                                        )}>
                                            <HugeiconsIcon icon={typeConfig.icon} className={cn("h-5 w-5", `text-${typeConfig.color}`)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{page.title}</h3>
                                                <Badge variant="secondary" className={cn("text-[10px]", getStatusColor(page.status))}>
                                                    {page.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">/{page.slug}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{page.blocks.length} blocks</span>
                                            <span>{formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <Link href={`/editor/${page.id}`}>
                                                    <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <a href={`/store/${storeSlug}/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                                    <HugeiconsIcon icon={EyeIcon} className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleDuplicate(page.id)}>
                                                        <HugeiconsIcon icon={Copy01Icon} className="mr-2 h-4 w-4" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setShowDeleteDialog(page.id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}
            </section>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this page? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending && <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
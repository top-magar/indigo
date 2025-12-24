"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { StorePage, PageType } from "@/types/page-builder";
import { createStorePage, duplicateStorePage, deleteStorePage } from "./actions";

interface StoreEditorClientProps {
    pages: StorePage[];
    storeSlug: string;
    storeName: string;
}

export function StoreEditorClient({ pages, storeSlug, storeName }: StoreEditorClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState("");
    const [newPageType, setNewPageType] = useState<PageType>("custom");

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
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete page");
            }
        });
    };

    const homepage = pages.find((p) => p.is_homepage);
    const otherPages = pages.filter((p) => !p.is_homepage);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Store Editor</h1>
                    <p className="text-muted-foreground">
                        Customize your store pages with the visual editor
                    </p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
                            Create Page
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Page</DialogTitle>
                            <DialogDescription>
                                Create a new page for your store. You can customize it with the visual editor.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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
                                        <SelectItem value="home">Homepage</SelectItem>
                                        <SelectItem value="about">About Page</SelectItem>
                                        <SelectItem value="contact">Contact Page</SelectItem>
                                        <SelectItem value="landing">Landing Page</SelectItem>
                                        <SelectItem value="custom">Custom Page</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreatePage} disabled={isPending}>
                                {isPending && <HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />}
                                Create Page
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Homepage Section */}
            {homepage ? (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={Home01Icon} className="h-5 w-5 text-chart-2" />
                            <CardTitle className="text-lg">Homepage</CardTitle>
                        </div>
                        <CardDescription>
                            This is the main page visitors see when they access your store
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-24 rounded-md bg-muted flex items-center justify-center">
                                    <HugeiconsIcon icon={PaintBrush01Icon} className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{homepage.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        /{homepage.slug} • {homepage.blocks.length} blocks
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant="secondary"
                                            className={
                                                homepage.status === "published"
                                                    ? "bg-chart-2/10 text-chart-2"
                                                    : "bg-chart-4/10 text-chart-4"
                                            }
                                        >
                                            {homepage.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            Updated {formatDistanceToNow(new Date(homepage.updated_at), { addSuffix: true })}
                                        </span>
                                    </div>
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
                                        Edit
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="rounded-2xl bg-muted/50 p-4 mb-4">
                            <HugeiconsIcon icon={Home01Icon} className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold">No Homepage Set</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Create a homepage to customize what visitors see first
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

            {/* Other Pages */}
            <div>
                <h2 className="text-lg font-semibold mb-4">All Pages</h2>
                {otherPages.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="rounded-2xl bg-muted/50 p-4 mb-4">
                                <HugeiconsIcon icon={File01Icon} className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold">No Additional Pages</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create pages like About, Contact, or custom landing pages
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {otherPages.map((page) => (
                            <Card key={page.id} className="group">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium truncate">{page.title}</h3>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    /{page.slug}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs ${
                                                            page.status === "published"
                                                                ? "bg-chart-2/10 text-chart-2"
                                                                : page.status === "archived"
                                                                ? "bg-muted text-muted-foreground"
                                                                : "bg-chart-4/10 text-chart-4"
                                                        }`}
                                                    >
                                                        {page.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {page.blocks.length} blocks
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
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
                                                    onClick={() => handleDelete(page.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1" asChild>
                                            <a href={`/store/${storeSlug}/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                                <HugeiconsIcon icon={EyeIcon} className="mr-1 h-3 w-3" />
                                                Preview
                                            </a>
                                        </Button>
                                        <Button size="sm" className="flex-1" asChild>
                                            <Link href={`/editor/${page.id}`}>
                                                <HugeiconsIcon icon={Edit01Icon} className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

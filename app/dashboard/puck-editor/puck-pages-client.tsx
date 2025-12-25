"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Search01Icon,
    PencilEdit01Icon,
    Delete02Icon,
    Copy01Icon,
    MoreHorizontalIcon,
    File01Icon,
    Home01Icon,
    Globe02Icon,
    Calendar01Icon,
    Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createPuckPage, deletePuckPage } from "./actions";

interface Page {
    id: string;
    title: string;
    slug: string;
    status: string;
    page_type: string;
    updated_at: string;
}

interface PuckPagesClientProps {
    pages: Page[];
}

export function PuckPagesClient({ pages }: PuckPagesClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");
    const [newPageTitle, setNewPageTitle] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [deletePageId, setDeletePageId] = useState<string | null>(null);
    const [deletePageTitle, setDeletePageTitle] = useState("");

    const filteredPages = pages.filter(
        (page) =>
            page.title.toLowerCase().includes(search.toLowerCase()) ||
            page.slug.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreatePage = () => {
        if (!newPageTitle.trim()) return;

        startTransition(async () => {
            const result = await createPuckPage(newPageTitle.trim());
            if (result.success && result.pageId) {
                setShowCreateDialog(false);
                setNewPageTitle("");
                toast.success("Page created successfully");
                router.push(`/puck/${result.pageId}`);
            } else {
                toast.error(result.error || "Failed to create page");
            }
        });
    };

    const handleDeletePage = () => {
        if (!deletePageId) return;

        startTransition(async () => {
            const result = await deletePuckPage(deletePageId);
            if (result.success) {
                setDeletePageId(null);
                toast.success("Page deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete page");
            }
        });
    };

    const getPageTypeIcon = (type: string) => {
        switch (type) {
            case "home":
                return Home01Icon;
            case "landing":
                return Globe02Icon;
            default:
                return File01Icon;
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Page Builder</h1>
                    <p className="text-sm text-muted-foreground">
                        Create and manage your store pages
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
                    New Page
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                        placeholder="Search pages..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Badge variant="secondary" className="text-muted-foreground">
                    {filteredPages.length} {filteredPages.length === 1 ? "page" : "pages"}
                </Badge>
            </div>

            {/* Pages Grid */}
            {filteredPages.length === 0 ? (
                <EmptyState
                    icon={File01Icon}
                    title={search ? "No pages found" : "No pages yet"}
                    description={
                        search
                            ? "Try adjusting your search terms"
                            : "Create your first page to start building your store"
                    }
                    action={
                        !search
                            ? {
                                  label: "Create Page",
                                  onClick: () => setShowCreateDialog(true),
                              }
                            : undefined
                    }
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPages.map((page) => (
                        <Card
                            key={page.id}
                            className="group overflow-hidden transition-all hover:shadow-md hover:border-chart-1/30"
                        >
                            {/* Preview Area */}
                            <div className="relative h-36 bg-muted/50 flex items-center justify-center border-b">
                                <HugeiconsIcon
                                    icon={getPageTypeIcon(page.page_type)}
                                    className="h-10 w-10 text-muted-foreground/30"
                                />
                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button size="sm" asChild>
                                        <Link href={`/puck/${page.id}`}>
                                            <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-1.5" />
                                            Edit
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-medium truncate">{page.title}</h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/puck/${page.id}`}>
                                                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => {
                                                    setDeletePageId(page.id);
                                                    setDeletePageTitle(page.title);
                                                }}
                                            >
                                                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <p className="text-sm text-muted-foreground truncate mb-3">
                                    /{page.slug}
                                </p>

                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "text-xs",
                                            page.status === "published"
                                                ? "bg-chart-2/10 text-chart-2"
                                                : "bg-chart-4/10 text-chart-4"
                                        )}
                                    >
                                        {page.status}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
                                        {format(new Date(page.updated_at), "MMM d")}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Page Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Page</DialogTitle>
                        <DialogDescription>
                            Enter a title for your new page. You can customize it further in the editor.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="page-title">Page Title</Label>
                            <Input
                                id="page-title"
                                placeholder="e.g., About Us, Contact, Sale"
                                value={newPageTitle}
                                onChange={(e) => setNewPageTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreatePage()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePage}
                            disabled={isPending || !newPageTitle.trim()}
                            className="gap-2"
                        >
                            {isPending && (
                                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                            )}
                            Create Page
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletePageId} onOpenChange={() => setDeletePageId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletePageTitle}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePage}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending && (
                                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

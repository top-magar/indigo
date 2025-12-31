"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    MoreHorizontalIcon,
    Delete01Icon,
    Copy01Icon,
    ViewIcon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Collection } from "../types";
import { cn } from "@/lib/utils";

interface CollectionHeaderProps {
    collection: Collection;
    onStatusChange?: (isActive: boolean) => void;
    onDelete?: () => void;
}

export function CollectionHeader({ collection, onStatusChange, onDelete }: CollectionHeaderProps) {
    const router = useRouter();

    const copyCollectionId = () => {
        navigator.clipboard.writeText(collection.id);
        toast.success("Collection ID copied");
    };

    const handleViewStorefront = () => {
        window.open(`/collections/${collection.slug}`, "_blank");
    };

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/collections">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {collection.name}
                        </h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={copyCollectionId}
                        >
                            <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Created {format(new Date(collection.createdAt), "PPP")}
                        {` · ${collection.productCount} product${collection.productCount !== 1 ? "s" : ""}`}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Status Badge */}
                <Badge
                    variant="secondary"
                    className={cn(
                        "border-0",
                        collection.isActive
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-muted text-muted-foreground"
                    )}
                >
                    {collection.isActive ? "Active" : "Inactive"}
                </Badge>

                {/* Type Badge */}
                <Badge variant="outline" className="capitalize">
                    {collection.type}
                </Badge>

                {/* View in Store */}
                {collection.isActive && (
                    <Button variant="outline" size="sm" onClick={handleViewStorefront}>
                        <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
                        View
                    </Button>
                )}

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {collection.isActive ? (
                            <DropdownMenuItem onClick={() => onStatusChange?.(false)}>
                                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-2" />
                                Deactivate
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => onStatusChange?.(true)}>
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 mr-2" />
                                Activate
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                            Delete Collection
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

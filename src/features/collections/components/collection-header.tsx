"use client";

import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Trash, Copy, Eye, CheckCircle, X } from "lucide-react";
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
import type { Collection } from "@/app/dashboard/collections/types";
import { cn } from "@/shared/utils";

interface CollectionHeaderProps {
    collection: Collection;
    onStatusChange?: (isActive: boolean) => void;
    onDelete?: () => void;
}

export function CollectionHeader({ collection, onStatusChange, onDelete }: CollectionHeaderProps) {
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
                        <ArrowLeft className="size-4" />
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
                            className="size-5"
                            onClick={copyCollectionId}
                        >
                            <Copy className="size-3.5" />
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
                            ? "bg-success/10 text-success"
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
                    <Button variant="outline" onClick={handleViewStorefront}>
                        <Eye className="size-4" />
                        View
                    </Button>
                )}

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {collection.isActive ? (
                            <DropdownMenuItem onClick={() => onStatusChange?.(false)}>
                                <X className="size-4" />
                                Deactivate
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={() => onStatusChange?.(true)}>
                                <CheckCircle className="size-4" />
                                Activate
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={onDelete}
                        >
                            <Trash className="size-4" />
                            Delete Collection
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

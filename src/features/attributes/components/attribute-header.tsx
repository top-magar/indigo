"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { deleteAttribute } from "@/app/dashboard/attributes/attribute-actions";
import { INPUT_TYPE_CONFIG } from "@/app/dashboard/attributes/types";
import type { Attribute } from "@/app/dashboard/attributes/types";

interface AttributeHeaderProps {
    attribute: Attribute;
}

export function AttributeHeader({ attribute }: AttributeHeaderProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const inputTypeConfig = INPUT_TYPE_CONFIG[attribute.inputType];

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteAttribute(attribute.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Attribute deleted");
                router.push("/dashboard/attributes");
            }
        });
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/attributes">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {attribute.name}
                        </h1>
                        <Badge variant="secondary">
                            {inputTypeConfig.label}
                        </Badge>
                        {attribute.valueRequired && (
                            <Badge variant="outline" className="text-chart-4 border-chart-4">
                                Required
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground">
                        Slug: <code className="text-xs bg-muted px-1 py-0.5 rounded">{attribute.slug}</code>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                                disabled={attribute.usedInProductTypes > 0}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Attribute
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Attribute</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{attribute.name}"? This action cannot be undone.
                            {attribute.values.length > 0 && (
                                <span className="block mt-2">
                                    This will also delete {attribute.values.length} value(s).
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

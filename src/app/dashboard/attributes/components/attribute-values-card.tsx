"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Delete02Icon,
    PencilEdit01Icon,
    DragDropVerticalIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteAttributeValue } from "../attribute-actions";
import { INPUT_TYPE_CONFIG } from "../types";
import type { Attribute, AttributeValue } from "../types";

interface AttributeValuesCardProps {
    attribute: Attribute;
    onAddValue: () => void;
    onEditValue: (value: AttributeValue) => void;
}

export function AttributeValuesCard({ 
    attribute, 
    onAddValue,
    onEditValue 
}: AttributeValuesCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [valueToDelete, setValueToDelete] = useState<AttributeValue | null>(null);

    const inputTypeConfig = INPUT_TYPE_CONFIG[attribute.inputType];

    // Only show values card for types that have predefined values
    if (!inputTypeConfig.hasValues) {
        return null;
    }

    const handleDelete = () => {
        if (!valueToDelete) return;

        startTransition(async () => {
            const result = await deleteAttributeValue(valueToDelete.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Value deleted");
                router.refresh();
            }
            setDeleteDialogOpen(false);
            setValueToDelete(null);
        });
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">
                        Attribute Values ({attribute.values.length})
                    </CardTitle>
                    <Button size="sm" onClick={onAddValue}>
                        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1" />
                        Add Value
                    </Button>
                </CardHeader>
                <CardContent>
                    {attribute.values.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                No values defined yet. Add values that users can select from.
                            </p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={onAddValue}>
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1" />
                                Add First Value
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {attribute.values.map((value, index) => (
                                <div
                                    key={value.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border group hover:bg-muted/50 transition-colors"
                                >
                                    <div className="text-muted-foreground cursor-grab">
                                        <HugeiconsIcon icon={DragDropVerticalIcon} className="w-4 h-4" />
                                    </div>
                                    
                                    {/* Swatch preview */}
                                    {attribute.inputType === "swatch" && (
                                        <div className="shrink-0">
                                            {value.swatchColor ? (
                                                <div
                                                    className="w-8 h-8 rounded-md border"
                                                    style={{ backgroundColor: value.swatchColor }}
                                                />
                                            ) : value.swatchImage ? (
                                                <img
                                                    src={value.swatchImage}
                                                    alt={value.name}
                                                    className="w-8 h-8 rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-md border bg-muted" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{value.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {value.slug}
                                        </p>
                                    </div>

                                    <Badge variant="outline" className="shrink-0">
                                        #{index + 1}
                                    </Badge>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onEditValue(value)}
                                        >
                                            <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => {
                                                setValueToDelete(value);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Value</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{valueToDelete?.name}"? 
                            Products using this value will lose it.
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

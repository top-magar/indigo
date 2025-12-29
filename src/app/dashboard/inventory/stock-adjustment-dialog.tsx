"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    Remove01Icon,
    Edit02Icon,
    Loading01Icon,
    PackageIcon,
    ArrowUp02Icon,
    ArrowDown02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { adjustStock } from "./actions";
import type { InventoryProduct } from "./actions";

interface StockAdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: InventoryProduct | null;
    onSuccess: (productId: string, newQuantity: number) => void;
}

type AdjustmentType = "add" | "remove" | "set";

const adjustmentReasons = {
    add: [
        "Received shipment",
        "Returned item",
        "Found in inventory",
        "Correction",
        "Transfer in",
        "Other",
    ],
    remove: [
        "Damaged",
        "Lost",
        "Stolen",
        "Expired",
        "Sample/Giveaway",
        "Transfer out",
        "Correction",
        "Other",
    ],
    set: [
        "Physical count",
        "Inventory audit",
        "System correction",
        "Initial stock",
        "Other",
    ],
};

export function StockAdjustmentDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
}: StockAdjustmentDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<AdjustmentType>("add");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [reference, setReference] = useState("");

    const resetForm = () => {
        setType("add");
        setQuantity("");
        setReason("");
        setNotes("");
        setReference("");
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        }
        onOpenChange(newOpen);
    };

    const calculateNewQuantity = (): number => {
        if (!product) return 0;
        const qty = parseInt(quantity) || 0;
        switch (type) {
            case "add":
                return product.quantity + qty;
            case "remove":
                return Math.max(0, product.quantity - qty);
            case "set":
                return Math.max(0, qty);
            default:
                return product.quantity;
        }
    };

    const handleSubmit = async () => {
        if (!product) return;
        
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        if (!reason) {
            toast.error("Please select a reason");
            return;
        }

        startTransition(async () => {
            const result = await adjustStock({
                productId: product.id,
                type,
                quantity: qty,
                reason,
                notes: notes || undefined,
                reference: reference || undefined,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Stock ${type === "add" ? "added" : type === "remove" ? "removed" : "updated"} successfully`);
                onSuccess(product.id, result.newQuantity!);
                handleOpenChange(false);
            }
        });
    };

    const newQuantity = calculateNewQuantity();
    const quantityDiff = product ? newQuantity - product.quantity : 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={PackageIcon} className="w-5 h-5" />
                        Adjust Stock
                    </DialogTitle>
                    <DialogDescription>
                        {product ? (
                            <span>
                                Adjusting stock for <span className="font-medium text-foreground">{product.name}</span>
                                {product.sku && <span className="text-xs ml-2 font-mono">({product.sku})</span>}
                            </span>
                        ) : (
                            "Select a product to adjust stock"
                        )}
                    </DialogDescription>
                </DialogHeader>

                {product && (
                    <div className="space-y-5 py-4">
                        {/* Current Stock Display */}
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div>
                                <p className="text-sm text-muted-foreground">Current Stock</p>
                                <p className="text-3xl font-bold">{product.quantity}</p>
                            </div>
                            {quantity && (
                                <div className="flex items-center gap-3">
                                    <HugeiconsIcon 
                                        icon={quantityDiff >= 0 ? ArrowUp02Icon : ArrowDown02Icon} 
                                        className={cn(
                                            "w-5 h-5",
                                            quantityDiff > 0 && "text-chart-2",
                                            quantityDiff < 0 && "text-destructive",
                                            quantityDiff === 0 && "text-muted-foreground"
                                        )}
                                    />
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">New Stock</p>
                                        <p className={cn(
                                            "text-3xl font-bold",
                                            quantityDiff > 0 && "text-chart-2",
                                            quantityDiff < 0 && "text-destructive"
                                        )}>
                                            {newQuantity}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Adjustment Type */}
                        <div className="space-y-2">
                            <Label>Adjustment Type</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    variant={type === "add" ? "default" : "outline"}
                                    className={cn(
                                        "gap-2",
                                        type === "add" && "bg-chart-2 hover:bg-chart-2/90"
                                    )}
                                    onClick={() => {
                                        setType("add");
                                        setReason("");
                                    }}
                                >
                                    <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                                    Add
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === "remove" ? "default" : "outline"}
                                    className={cn(
                                        "gap-2",
                                        type === "remove" && "bg-destructive hover:bg-destructive/90"
                                    )}
                                    onClick={() => {
                                        setType("remove");
                                        setReason("");
                                    }}
                                >
                                    <HugeiconsIcon icon={Remove01Icon} className="w-4 h-4" />
                                    Remove
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === "set" ? "default" : "outline"}
                                    className="gap-2"
                                    onClick={() => {
                                        setType("set");
                                        setReason("");
                                    }}
                                >
                                    <HugeiconsIcon icon={Edit02Icon} className="w-4 h-4" />
                                    Set
                                </Button>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity">
                                {type === "set" ? "New Quantity" : "Quantity to " + (type === "add" ? "Add" : "Remove")}
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder={type === "set" ? "Enter new quantity" : "Enter quantity"}
                                className="text-lg"
                            />
                            {type === "remove" && parseInt(quantity) > product.quantity && (
                                <p className="text-xs text-destructive">
                                    Cannot remove more than current stock. Will be set to 0.
                                </p>
                            )}
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {adjustmentReasons[type].map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reference (optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="reference">Reference (optional)</Label>
                            <Input
                                id="reference"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="PO number, order ID, etc."
                            />
                        </div>

                        {/* Notes (optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Additional details..."
                                className="resize-none"
                                rows={2}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isPending || !quantity || !reason}
                        className={cn(
                            type === "add" && "bg-chart-2 hover:bg-chart-2/90",
                            type === "remove" && "bg-destructive hover:bg-destructive/90"
                        )}
                    >
                        {isPending ? (
                            <>
                                <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                {type === "add" && <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />}
                                {type === "remove" && <HugeiconsIcon icon={Remove01Icon} className="w-4 h-4 mr-2" />}
                                {type === "set" && <HugeiconsIcon icon={Edit02Icon} className="w-4 h-4 mr-2" />}
                                {type === "add" ? "Add Stock" : type === "remove" ? "Remove Stock" : "Set Stock"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

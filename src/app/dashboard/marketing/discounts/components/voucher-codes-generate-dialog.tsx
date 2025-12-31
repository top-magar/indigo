"use client";

import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
    generateCodePreview, 
    estimateUniqueCodeCount,
    type GenerateCodesOptions,
} from "@/lib/discounts/voucher-code-generator";

export interface GenerateCodesFormData {
    quantity: number;
    prefix: string;
    suffix: string;
    length: number;
    charset: "alphanumeric" | "alphabetic" | "numeric";
}

interface VoucherCodesGenerateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: GenerateCodesFormData) => void;
    existingCodesCount?: number;
}

const MAX_CODES = 100;
const DEFAULT_LENGTH = 8;

export function VoucherCodesGenerateDialog({
    open,
    onOpenChange,
    onSubmit,
    existingCodesCount = 0,
}: VoucherCodesGenerateDialogProps) {
    const [quantity, setQuantity] = useState("10");
    const [prefix, setPrefix] = useState("");
    const [suffix, setSuffix] = useState("");
    const [length, setLength] = useState(DEFAULT_LENGTH.toString());
    const [charset, setCharset] = useState<"alphanumeric" | "alphabetic" | "numeric">("alphanumeric");

    // Generate preview code
    const previewCode = useMemo(() => {
        return generateCodePreview({
            prefix: prefix || undefined,
            suffix: suffix || undefined,
            length: parseInt(length) || DEFAULT_LENGTH,
            charset,
            separator: "-",
        });
    }, [prefix, suffix, length, charset]);

    // Estimate unique codes possible
    const uniqueCodesEstimate = useMemo(() => {
        return estimateUniqueCodeCount({
            length: parseInt(length) || DEFAULT_LENGTH,
            charset,
        });
    }, [length, charset]);

    const handleQuantityChange = (value: string) => {
        const num = parseInt(value);
        if (value === "" || (num >= 0 && num <= MAX_CODES)) {
            setQuantity(value);
        }
    };

    const handleLengthChange = (value: string) => {
        const num = parseInt(value);
        if (value === "" || (num >= 4 && num <= 16)) {
            setLength(value);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity);
        if (qty > 0 && qty <= MAX_CODES) {
            onSubmit({
                quantity: qty,
                prefix,
                suffix,
                length: parseInt(length) || DEFAULT_LENGTH,
                charset,
            });
            resetForm();
        }
    };

    const resetForm = () => {
        setQuantity("10");
        setPrefix("");
        setSuffix("");
        setLength(DEFAULT_LENGTH.toString());
        setCharset("alphanumeric");
    };

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const qty = parseInt(quantity) || 0;
    const isValid = qty > 0 && qty <= MAX_CODES;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Generate Voucher Codes</DialogTitle>
                    <DialogDescription>
                        Generate multiple unique voucher codes at once. Codes are automatically 
                        generated to avoid duplicates.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            Number of codes
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            placeholder="10"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(e.target.value)}
                            min={1}
                            max={MAX_CODES}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Maximum {MAX_CODES} codes per batch. You have {existingCodesCount} existing codes.
                        </p>
                    </div>

                    {/* Prefix and Suffix */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="prefix">Prefix (optional)</Label>
                            <Input
                                id="prefix"
                                placeholder="SUMMER"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                                maxLength={10}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="suffix">Suffix (optional)</Label>
                            <Input
                                id="suffix"
                                placeholder="2024"
                                value={suffix}
                                onChange={(e) => setSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                                maxLength={10}
                            />
                        </div>
                    </div>

                    {/* Code Length and Charset */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="length">Code length</Label>
                            <Input
                                id="length"
                                type="number"
                                value={length}
                                onChange={(e) => handleLengthChange(e.target.value)}
                                min={4}
                                max={16}
                            />
                            <p className="text-xs text-muted-foreground">
                                4-16 characters
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="charset">Character set</Label>
                            <Select value={charset} onValueChange={(v) => setCharset(v as typeof charset)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="alphanumeric">Letters & Numbers</SelectItem>
                                    <SelectItem value="alphabetic">Letters Only</SelectItem>
                                    <SelectItem value="numeric">Numbers Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Preview</span>
                            <Badge variant="secondary" className="text-xs">
                                ~{uniqueCodesEstimate.toLocaleString()} unique codes possible
                            </Badge>
                        </div>
                        <code className="block font-mono text-lg bg-background px-3 py-2 rounded border">
                            {previewCode}
                        </code>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isValid}>
                            Generate {qty} code{qty !== 1 ? "s" : ""}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

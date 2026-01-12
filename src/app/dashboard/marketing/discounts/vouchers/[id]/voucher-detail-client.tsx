"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Percent,
    DollarSign,
    Truck,
    Trash2,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import {
    VoucherCodes,
    DiscountProducts,
    DiscountCollections,
    DiscountCategories,
} from "@/features/discounts/components";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateDiscount, deleteDiscount, addVoucherCode, generateVoucherCodes, deleteVoucherCodes } from "../../actions";
import { toast } from "sonner";
import type { Discount, VoucherCode, DiscountType, DiscountScope } from "../../types";

type VoucherScope = "entire_order" | "specific_products";

interface VoucherDetailClientProps {
    voucher: Discount & { codes?: VoucherCode[] };
}

// Format date for datetime-local input
function formatDateForInput(date: Date | null): string {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
}

export function VoucherDetailClient({ voucher }: VoucherDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Form state
    const [name, setName] = useState(voucher.name);
    const [description, setDescription] = useState(voucher.description || "");
    const [type, setType] = useState<DiscountType>(voucher.type);
    const [value, setValue] = useState(voucher.value);
    const [scope, setScope] = useState<VoucherScope>(voucher.scope as VoucherScope);
    const [minOrderAmount, setMinOrderAmount] = useState(voucher.minOrderAmount || "");
    const [minCheckoutItemsQuantity, setMinCheckoutItemsQuantity] = useState(
        voucher.minCheckoutItemsQuantity?.toString() || ""
    );
    const [hasUsageLimit, setHasUsageLimit] = useState(!!voucher.usageLimit);
    const [usageLimit, setUsageLimit] = useState(voucher.usageLimit?.toString() || "");
    const [applyOncePerCustomer, setApplyOncePerCustomer] = useState(voucher.applyOncePerCustomer);
    const [onlyForStaff, setOnlyForStaff] = useState(voucher.onlyForStaff);
    const [singleUse, setSingleUse] = useState(voucher.singleUse);
    const [applyOncePerOrder, setApplyOncePerOrder] = useState(voucher.applyOncePerOrder);
    const [hasStartDate, setHasStartDate] = useState(!!voucher.startsAt);
    const [hasEndDate, setHasEndDate] = useState(!!voucher.endsAt);
    const [startsAt, setStartsAt] = useState(formatDateForInput(voucher.startsAt));
    const [endsAt, setEndsAt] = useState(formatDateForInput(voucher.endsAt));
    const [isActive, setIsActive] = useState(voucher.isActive);

    // Data state
    const [codes, setCodes] = useState(voucher.codes || []);
    const [products, setProducts] = useState<{ id: string; name: string; thumbnail: string | null; productType: string; isAvailable: boolean }[]>([]);
    const [collections, setCollections] = useState<{ id: string; name: string; productsCount: number; isPublished: boolean }[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string; productsCount: number; parentName: string | null }[]>([]);

    const handleSave = async () => {
        startTransition(async () => {
            const result = await updateDiscount({
                id: voucher.id,
                name,
                description: description || undefined,
                type,
                value: parseFloat(value),
                scope,
                minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
                minCheckoutItemsQuantity: minCheckoutItemsQuantity ? parseInt(minCheckoutItemsQuantity) : null,
                usageLimit: hasUsageLimit && usageLimit ? parseInt(usageLimit) : null,
                applyOncePerCustomer,
                onlyForStaff,
                singleUse,
                applyOncePerOrder,
                startsAt: hasStartDate ? startsAt : null,
                endsAt: hasEndDate ? endsAt : null,
                isActive,
            });

            if (result.success) {
                toast.success("Voucher updated successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update voucher");
            }
        });
    };

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteDiscount(voucher.id);
            if (result.success) {
                toast.success("Voucher deleted");
                router.push("/dashboard/marketing/discounts?tab=vouchers");
            } else {
                toast.error(result.error || "Failed to delete voucher");
            }
        });
    };

    const handleCodesGenerate = async (quantity: number, prefix: string) => {
        startTransition(async () => {
            const result = await generateVoucherCodes({
                discountId: voucher.id,
                quantity,
                prefix: prefix || undefined,
            });

            if (result.success && result.data) {
                toast.success(`${quantity} codes generated`);
                setCodes([...codes, ...result.data]);
            } else {
                toast.error(result.error || "Failed to generate codes");
            }
        });
    };

    const handleCodeAdd = async (code: string) => {
        startTransition(async () => {
            const result = await addVoucherCode({
                discountId: voucher.id,
                code,
                isManuallyCreated: true,
            });

            if (result.success && result.data) {
                toast.success("Code added");
                setCodes([...codes, result.data]);
            } else {
                toast.error(result.error || "Failed to add code");
            }
        });
    };

    const handleCodesDelete = async (ids: string[]) => {
        startTransition(async () => {
            const result = await deleteVoucherCodes(ids);
            if (result.success) {
                toast.success(`${ids.length} codes deleted`);
                setCodes(codes.filter((c) => !ids.includes(c.id)));
            } else {
                toast.error(result.error || "Failed to delete codes");
            }
        });
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/marketing/discounts?tab=vouchers">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-semibold">{name}</h1>
                            <Badge variant={isActive ? "default" : "secondary"}>
                                {isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {voucher.usedCount} used
                            {voucher.usageLimit && ` / ${voucher.usageLimit}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-destructive" disabled={isPending}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Voucher</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this voucher? This action cannot be undone.
                                    All associated codes will also be deleted.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Voucher Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Internal notes..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Discount Value */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Discount Value</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Discount Type</Label>
                                <RadioGroup
                                    value={type}
                                    onValueChange={(v) => setType(v as DiscountType)}
                                    className="grid grid-cols-3 gap-4"
                                >
                                    <Label
                                        htmlFor="edit-percentage"
                                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                                            type === "percentage" ? "border-primary" : "border-muted"
                                        }`}
                                    >
                                        <RadioGroupItem value="percentage" id="edit-percentage" className="sr-only" />
                                        <Percent className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">Percentage</span>
                                    </Label>
                                    <Label
                                        htmlFor="edit-fixed"
                                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                                            type === "fixed" ? "border-primary" : "border-muted"
                                        }`}
                                    >
                                        <RadioGroupItem value="fixed" id="edit-fixed" className="sr-only" />
                                        <DollarSign className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">Fixed Amount</span>
                                    </Label>
                                    <Label
                                        htmlFor="edit-free_shipping"
                                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                                            type === "free_shipping" ? "border-primary" : "border-muted"
                                        }`}
                                    >
                                        <RadioGroupItem value="free_shipping" id="edit-free_shipping" className="sr-only" />
                                        <Truck className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">Free Shipping</span>
                                    </Label>
                                </RadioGroup>
                            </div>

                            {type !== "free_shipping" && (
                                <div className="space-y-2">
                                    <Label htmlFor="value">
                                        {type === "percentage" ? "Percentage Off" : "Amount Off"}
                                    </Label>
                                    <div className="relative max-w-xs">
                                        <Input
                                            id="value"
                                            type="number"
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            className="pr-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {type === "percentage" ? "%" : "USD"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <Label>Applies To</Label>
                                <RadioGroup
                                    value={scope}
                                    onValueChange={(v) => setScope(v as VoucherScope)}
                                    className="space-y-2"
                                >
                                    <Label
                                        htmlFor="edit-entire_order"
                                        className={`flex items-center gap-3 rounded-md border-2 p-3 cursor-pointer hover:bg-accent ${
                                            scope === "entire_order" ? "border-primary" : "border-muted"
                                        }`}
                                    >
                                        <RadioGroupItem value="entire_order" id="edit-entire_order" />
                                        <span className="text-sm">Entire order</span>
                                    </Label>
                                    <Label
                                        htmlFor="edit-specific_products"
                                        className={`flex items-center gap-3 rounded-md border-2 p-3 cursor-pointer hover:bg-accent ${
                                            scope === "specific_products" ? "border-primary" : "border-muted"
                                        }`}
                                    >
                                        <RadioGroupItem value="specific_products" id="edit-specific_products" />
                                        <span className="text-sm">Specific products</span>
                                    </Label>
                                </RadioGroup>
                            </div>

                            {scope === "specific_products" && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Apply only to cheapest eligible product</Label>
                                        <p className="text-sm text-muted-foreground">
                                            If disabled, discount applies to every eligible product
                                        </p>
                                    </div>
                                    <Switch
                                        checked={applyOncePerOrder}
                                        onCheckedChange={setApplyOncePerOrder}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Voucher Codes */}
                    <VoucherCodes
                        voucherId={voucher.id}
                        codes={codes}
                        singleUse={singleUse}
                        onCodesGenerate={handleCodesGenerate}
                        onCodeAdd={handleCodeAdd}
                        onCodesDelete={handleCodesDelete}
                    />

                    {/* Products/Collections/Categories (only for specific_products scope) */}
                    {scope === "specific_products" && (
                        <>
                            <DiscountProducts
                                discountId={voucher.id}
                                products={products}
                                onProductAssign={(ids) => {
                                    const newProducts = ids.map((id) => ({
                                        id,
                                        name: `Product ${id}`,
                                        thumbnail: null,
                                        productType: "General",
                                        isAvailable: true,
                                    }));
                                    setProducts([...products, ...newProducts]);
                                }}
                                onProductUnassign={(id) => setProducts(products.filter((p) => p.id !== id))}
                                onBulkUnassign={(ids) => setProducts(products.filter((p) => !ids.includes(p.id)))}
                            />

                            <DiscountCollections
                                discountId={voucher.id}
                                collections={collections}
                                onCollectionAssign={(ids) => {
                                    const newCollections = ids.map((id) => ({
                                        id,
                                        name: `Collection ${id}`,
                                        productsCount: 0,
                                        isPublished: true,
                                    }));
                                    setCollections([...collections, ...newCollections]);
                                }}
                                onCollectionUnassign={(id) => setCollections(collections.filter((c) => c.id !== id))}
                                onBulkUnassign={(ids) => setCollections(collections.filter((c) => !ids.includes(c.id)))}
                            />

                            <DiscountCategories
                                discountId={voucher.id}
                                categories={categories}
                                onCategoryAssign={(ids) => {
                                    const newCategories = ids.map((id) => ({
                                        id,
                                        name: `Category ${id}`,
                                        productsCount: 0,
                                        parentName: null,
                                    }));
                                    setCategories([...categories, ...newCategories]);
                                }}
                                onCategoryUnassign={(id) => setCategories(categories.filter((c) => c.id !== id))}
                                onBulkUnassign={(ids) => setCategories(categories.filter((c) => !ids.includes(c.id)))}
                            />
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label>Active</Label>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Dates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Start date</Label>
                                <Switch
                                    checked={hasStartDate}
                                    onCheckedChange={setHasStartDate}
                                />
                            </div>
                            {hasStartDate && (
                                <Input
                                    type="datetime-local"
                                    value={startsAt}
                                    onChange={(e) => setStartsAt(e.target.value)}
                                />
                            )}

                            <Separator />

                            <div className="flex items-center justify-between">
                                <Label>End date</Label>
                                <Switch
                                    checked={hasEndDate}
                                    onCheckedChange={setHasEndDate}
                                />
                            </div>
                            {hasEndDate && (
                                <Input
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(e) => setEndsAt(e.target.value)}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Minimum order amount</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={minOrderAmount}
                                        onChange={(e) => setMinOrderAmount(e.target.value)}
                                        className="pl-7"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Minimum items in checkout</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minCheckoutItemsQuantity}
                                    onChange={(e) => setMinCheckoutItemsQuantity(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Limits */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Limits</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Limit total usage</Label>
                                <Switch
                                    checked={hasUsageLimit}
                                    onCheckedChange={setHasUsageLimit}
                                />
                            </div>
                            {hasUsageLimit && (
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={usageLimit}
                                    onChange={(e) => setUsageLimit(e.target.value)}
                                />
                            )}

                            <Separator />

                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Once per customer</Label>
                                <Switch
                                    checked={applyOncePerCustomer}
                                    onCheckedChange={setApplyOncePerCustomer}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Staff only</Label>
                                <Switch
                                    checked={onlyForStaff}
                                    onCheckedChange={setOnlyForStaff}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-sm">Single use codes</Label>
                                <Switch
                                    checked={singleUse}
                                    onCheckedChange={setSingleUse}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

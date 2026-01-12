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
    Trash2,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import {
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
import { updateDiscount, deleteDiscount } from "../../actions";
import { toast } from "sonner";
import type { Discount } from "../../types";

type SaleDiscountType = "percentage" | "fixed";

interface SaleDetailClientProps {
    sale: Discount;
}

// Format date for datetime-local input
function formatDateForInput(date: Date | null): string {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
}

export function SaleDetailClient({ sale }: SaleDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Form state
    const [name, setName] = useState(sale.name);
    const [description, setDescription] = useState(sale.description || "");
    const [type, setType] = useState<SaleDiscountType>(sale.type as SaleDiscountType);
    const [value, setValue] = useState(sale.value);
    const [hasStartDate, setHasStartDate] = useState(!!sale.startsAt);
    const [hasEndDate, setHasEndDate] = useState(!!sale.endsAt);
    const [startsAt, setStartsAt] = useState(formatDateForInput(sale.startsAt));
    const [endsAt, setEndsAt] = useState(formatDateForInput(sale.endsAt));
    const [isActive, setIsActive] = useState(sale.isActive);

    // Data state - initialize from sale's applicable IDs
    const [products, setProducts] = useState<{ id: string; name: string; thumbnail: string | null; productType: string; isAvailable: boolean }[]>([]);
    const [collections, setCollections] = useState<{ id: string; name: string; productsCount: number; isPublished: boolean }[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string; productsCount: number; parentName: string | null }[]>([]);

    const handleSave = async () => {
        startTransition(async () => {
            const result = await updateDiscount({
                id: sale.id,
                name,
                description: description || undefined,
                type,
                value: parseFloat(value),
                startsAt: hasStartDate ? startsAt : null,
                endsAt: hasEndDate ? endsAt : null,
                isActive,
                applicableProductIds: products.map((p) => p.id),
                applicableCollectionIds: collections.map((c) => c.id),
                applicableCategoryIds: categories.map((c) => c.id),
            });

            if (result.success) {
                toast.success("Sale updated successfully");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update sale");
            }
        });
    };

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteDiscount(sale.id);
            if (result.success) {
                toast.success("Sale deleted");
                router.push("/dashboard/marketing/discounts?tab=sales");
            } else {
                toast.error(result.error || "Failed to delete sale");
            }
        });
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/marketing/discounts?tab=sales">
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
                            {products.length} products, {collections.length} collections, {categories.length} categories
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
                                <AlertDialogTitle>Delete Sale</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this sale? This action cannot be undone.
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
                                <Label htmlFor="name">Sale Name</Label>
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
                                    onValueChange={(v) => setType(v as SaleDiscountType)}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <Label
                                        htmlFor="sale-edit-percentage"
                                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                                            type === "percentage" ? "border-primary" : "border-muted"
                                        }`}
                                    >
                                        <RadioGroupItem value="percentage" id="sale-edit-percentage" className="sr-only" />
                                        <Percent className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">Percentage</span>
                                    </Label>
                                    <Label
                                        htmlFor="sale-edit-fixed"
                                        className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer hover:bg-accent ${
                                            type === "fixed" ? "border-primary" : "border-muted"
                                        }`}
                                    >
                                        <RadioGroupItem value="fixed" id="sale-edit-fixed" className="sr-only" />
                                        <DollarSign className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">Fixed Amount</span>
                                    </Label>
                                </RadioGroup>
                            </div>

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
                        </CardContent>
                    </Card>

                    {/* Products */}
                    <DiscountProducts
                        discountId={sale.id}
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

                    {/* Collections */}
                    <DiscountCollections
                        discountId={sale.id}
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

                    {/* Categories */}
                    <DiscountCategories
                        discountId={sale.id}
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

                    {/* Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Products</span>
                                <span>{products.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Collections</span>
                                <span>{collections.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Categories</span>
                                <span>{categories.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

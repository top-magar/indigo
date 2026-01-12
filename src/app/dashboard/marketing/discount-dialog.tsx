"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Percent,
    DollarSign,
    Loader2,
    Truck,
    Tag,
    Info,
    Check,
    Search,
    X,
    Image,
    Package,
    Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import { 
    type Discount, 
    type DiscountType, 
    type DiscountScope, 
    type ProductOption,
    type CollectionOption,
    createDiscount, 
    updateDiscount,
    getProductsForDiscount,
    getCollectionsForDiscount,
} from "./actions";
import { toast } from "sonner";

interface DiscountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    discount: Discount | null;
    currency: string;
}

import type { LucideIcon } from "lucide-react";

const discountTypes: { value: DiscountType; label: string; description: string; icon: LucideIcon }[] = [
    { value: "percentage", label: "Percentage", description: "Discount by percentage", icon: Percent },
    { value: "fixed", label: "Fixed Amount", description: "Discount by fixed amount", icon: DollarSign },
    { value: "free_shipping", label: "Free Shipping", description: "Free shipping on order", icon: Truck },
    { value: "buy_x_get_y", label: "Buy X Get Y", description: "Buy items, get items free", icon: Tag },
];

const scopeOptions: { value: DiscountScope; label: string; description: string }[] = [
    { value: "all", label: "All Products", description: "Applies to entire order" },
    { value: "products", label: "Specific Products", description: "Select products to apply" },
    { value: "collections", label: "Specific Collections", description: "Select collections to apply" },
];

export function DiscountDialog({ open, onOpenChange, discount, currency }: DiscountDialogProps) {
    const router = useRouter();
    const isEditing = !!discount;
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState("basic");
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Products and collections for targeting
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [collections, setCollections] = useState<CollectionOption[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCollections, setLoadingCollections] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [collectionSearch, setCollectionSearch] = useState("");
    
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        type: "percentage" as DiscountType,
        value: "",
        scope: "all" as DiscountScope,
        min_order_amount: "",
        min_quantity: "",
        max_uses: "",
        max_uses_per_customer: "",
        starts_at: "",
        expires_at: "",
        has_start_date: false,
        has_expiry: false,
        has_min_order: false,
        has_min_quantity: false,
        has_max_uses: false,
        has_max_per_customer: false,
        combines_with_other_discounts: false,
        first_time_purchase_only: false,
        selected_product_ids: [] as string[],
        selected_collection_ids: [] as string[],
    });

    // Load products and collections when dialog opens
    useEffect(() => {
        if (open) {
            loadProducts();
            loadCollections();
        }
    }, [open]);

    const loadProducts = async () => {
        setLoadingProducts(true);
        const { products: data } = await getProductsForDiscount();
        setProducts(data);
        setLoadingProducts(false);
    };

    const loadCollections = async () => {
        setLoadingCollections(true);
        const { collections: data } = await getCollectionsForDiscount();
        setCollections(data);
        setLoadingCollections(false);
    };

    // Reset form when dialog opens/closes or discount changes
    useEffect(() => {
        if (open && discount) {
            setFormData({
                code: discount.code,
                name: discount.name,
                description: discount.description || "",
                type: discount.type,
                value: String(discount.value),
                scope: discount.scope,
                min_order_amount: discount.min_order_amount ? String(discount.min_order_amount) : "",
                min_quantity: discount.min_quantity ? String(discount.min_quantity) : "",
                max_uses: discount.max_uses ? String(discount.max_uses) : "",
                max_uses_per_customer: discount.max_uses_per_customer ? String(discount.max_uses_per_customer) : "",
                starts_at: discount.starts_at ? discount.starts_at.split("T")[0] : "",
                expires_at: discount.expires_at ? discount.expires_at.split("T")[0] : "",
                has_start_date: !!discount.starts_at,
                has_expiry: !!discount.expires_at,
                has_min_order: !!discount.min_order_amount,
                has_min_quantity: !!discount.min_quantity,
                has_max_uses: !!discount.max_uses,
                has_max_per_customer: !!discount.max_uses_per_customer,
                combines_with_other_discounts: discount.combines_with_other_discounts,
                first_time_purchase_only: discount.first_time_purchase_only,
                selected_product_ids: discount.applicable_product_ids || [],
                selected_collection_ids: discount.applicable_collection_ids || [],
            });
            setActiveTab("basic");
            setErrors({});
            setProductSearch("");
            setCollectionSearch("");
        } else if (open && !discount) {
            setFormData({
                code: "",
                name: "",
                description: "",
                type: "percentage",
                value: "",
                scope: "all",
                min_order_amount: "",
                min_quantity: "",
                max_uses: "",
                max_uses_per_customer: "",
                starts_at: "",
                expires_at: "",
                has_start_date: false,
                has_expiry: false,
                has_min_order: false,
                has_min_quantity: false,
                has_max_uses: false,
                has_max_per_customer: false,
                combines_with_other_discounts: false,
                first_time_purchase_only: false,
                selected_product_ids: [],
                selected_collection_ids: [],
            });
            setActiveTab("basic");
            setErrors({});
            setProductSearch("");
            setCollectionSearch("");
        }
    }, [open, discount]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = "Discount code is required";
        } else if (!/^[A-Z0-9_-]{3,20}$/i.test(formData.code.trim())) {
            newErrors.code = "Code must be 3-20 characters (letters, numbers, hyphens, underscores)";
        }

        if (formData.type !== "free_shipping") {
            if (!formData.value) {
                newErrors.value = "Value is required";
            } else {
                const numValue = parseFloat(formData.value);
                if (isNaN(numValue) || numValue <= 0) {
                    newErrors.value = "Value must be greater than 0";
                } else if (formData.type === "percentage" && numValue > 100) {
                    newErrors.value = "Percentage cannot exceed 100%";
                }
            }
        }

        if (formData.has_start_date && formData.has_expiry) {
            if (formData.starts_at && formData.expires_at) {
                if (new Date(formData.starts_at) >= new Date(formData.expires_at)) {
                    newErrors.expires_at = "Expiry date must be after start date";
                }
            }
        }

        // Validate scope selection
        if (formData.scope === "products" && formData.selected_product_ids.length === 0) {
            newErrors.scope = "Please select at least one product";
        }
        if (formData.scope === "collections" && formData.selected_collection_ids.length === 0) {
            newErrors.scope = "Please select at least one collection";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            if (errors.code || errors.value) {
                setActiveTab("basic");
            } else if (errors.scope) {
                setActiveTab("conditions");
            }
            return;
        }

        startTransition(async () => {
            try {
                const data = {
                    code: formData.code.toUpperCase().trim(),
                    name: formData.name.trim() || formData.code.toUpperCase().trim(),
                    description: formData.description.trim() || undefined,
                    type: formData.type,
                    value: formData.type === "free_shipping" ? 0 : parseFloat(formData.value),
                    scope: formData.scope,
                    min_order_amount: formData.has_min_order && formData.min_order_amount 
                        ? parseFloat(formData.min_order_amount) 
                        : undefined,
                    min_quantity: formData.has_min_quantity && formData.min_quantity 
                        ? parseInt(formData.min_quantity) 
                        : undefined,
                    max_uses: formData.has_max_uses && formData.max_uses 
                        ? parseInt(formData.max_uses) 
                        : undefined,
                    max_uses_per_customer: formData.has_max_per_customer && formData.max_uses_per_customer 
                        ? parseInt(formData.max_uses_per_customer) 
                        : undefined,
                    starts_at: formData.has_start_date && formData.starts_at 
                        ? `${formData.starts_at}T00:00:00Z` 
                        : undefined,
                    expires_at: formData.has_expiry && formData.expires_at 
                        ? `${formData.expires_at}T23:59:59Z` 
                        : undefined,
                    combines_with_other_discounts: formData.combines_with_other_discounts,
                    first_time_purchase_only: formData.first_time_purchase_only,
                    applicable_product_ids: formData.scope === "products" ? formData.selected_product_ids : undefined,
                    applicable_collection_ids: formData.scope === "collections" ? formData.selected_collection_ids : undefined,
                };

                const result = isEditing 
                    ? await updateDiscount(discount.id, data)
                    : await createDiscount(data);

                if (result.success) {
                    toast.success(isEditing ? "Discount updated successfully" : "Discount created successfully");
                    onOpenChange(false);
                    router.refresh();
                } else {
                    toast.error(result.error || "Something went wrong");
                    if (result.error?.includes("code already exists")) {
                        setErrors({ code: "A discount with this code already exists" });
                        setActiveTab("basic");
                    }
                }
            } catch {
                toast.error("Something went wrong");
            }
        });
    };

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
        setErrors({ ...errors, code: "" });
    };

    const getCurrencySymbol = () => {
        switch (currency) {
            case "USD": return "$";
            case "EUR": return "€";
            case "GBP": return "£";
            case "NPR": return "Rs";
            default: return currency;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price);
    };

    // Filter products and collections by search
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    );

    const filteredCollections = collections.filter(c => 
        c.name.toLowerCase().includes(collectionSearch.toLowerCase())
    );

    // Toggle product selection
    const toggleProduct = (productId: string) => {
        const newIds = formData.selected_product_ids.includes(productId)
            ? formData.selected_product_ids.filter(id => id !== productId)
            : [...formData.selected_product_ids, productId];
        setFormData({ ...formData, selected_product_ids: newIds });
        if (errors.scope) setErrors({ ...errors, scope: "" });
    };

    // Toggle collection selection
    const toggleCollection = (collectionId: string) => {
        const newIds = formData.selected_collection_ids.includes(collectionId)
            ? formData.selected_collection_ids.filter(id => id !== collectionId)
            : [...formData.selected_collection_ids, collectionId];
        setFormData({ ...formData, selected_collection_ids: newIds });
        if (errors.scope) setErrors({ ...errors, scope: "" });
    };

    // Get selected items for display
    const selectedProducts = products.filter(p => formData.selected_product_ids.includes(p.id));
    const selectedCollections = collections.filter(c => formData.selected_collection_ids.includes(c.id));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Discount" : "Create Discount"}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Update the discount code details" 
                            : "Create a new discount code for your customers"
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="conditions">Conditions</TabsTrigger>
                            <TabsTrigger value="options">Options</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 overflow-y-auto py-4 px-1">
                            {/* Basic Tab */}
                            <TabsContent value="basic" className="mt-0 space-y-5">
                                {/* Code & Name */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">
                                            Discount Code <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="code"
                                                placeholder="e.g., SUMMER25"
                                                value={formData.code}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, code: e.target.value.toUpperCase() });
                                                    if (errors.code) setErrors({ ...errors, code: "" });
                                                }}
                                                className={cn("font-mono uppercase", errors.code && "border-destructive")}
                                                disabled={isEditing}
                                            />
                                            {!isEditing && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button type="button" variant="outline" size="icon" onClick={generateCode}>
                                                                <span className="text-xs">🎲</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Generate random code</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                        {errors.code && (
                                            <p className="text-xs text-destructive">{errors.code}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., Summer Sale"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">Optional. Defaults to code if empty.</p>
                                    </div>
                                </div>

                                {/* Type Selection */}
                                <div className="space-y-2">
                                    <Label>Discount Type</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {discountTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: type.value })}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                                                    formData.type === type.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex h-9 w-9 items-center justify-center rounded-lg",
                                                    formData.type === type.value ? "bg-primary/10" : "bg-muted"
                                                )}>
                                                    <type.icon 
                                                        className={cn(
                                                            "h-4 w-4",
                                                            formData.type === type.value ? "text-primary" : "text-muted-foreground"
                                                        )} 
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{type.label}</p>
                                                    <p className="text-xs text-muted-foreground">{type.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Value */}
                                {formData.type !== "free_shipping" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="value">
                                            {formData.type === "percentage" ? "Percentage Off" : 
                                             formData.type === "buy_x_get_y" ? "Buy X Get Y Free" : "Amount Off"}
                                            <span className="text-destructive"> *</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="value"
                                                type="number"
                                                min="0"
                                                max={formData.type === "percentage" ? "100" : undefined}
                                                step={formData.type === "percentage" ? "1" : "0.01"}
                                                placeholder={formData.type === "percentage" ? "10" : "500"}
                                                value={formData.value}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, value: e.target.value });
                                                    if (errors.value) setErrors({ ...errors, value: "" });
                                                }}
                                                className={cn(
                                                    formData.type === "percentage" || formData.type === "buy_x_get_y" ? "pr-8" : "pl-10",
                                                    errors.value && "border-destructive"
                                                )}
                                            />
                                            {formData.type === "percentage" ? (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                            ) : formData.type === "buy_x_get_y" ? (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">items</span>
                                            ) : (
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                                    {getCurrencySymbol()}
                                                </span>
                                            )}
                                        </div>
                                        {errors.value && (
                                            <p className="text-xs text-destructive">{errors.value}</p>
                                        )}
                                    </div>
                                )}

                                {/* Schedule */}
                                <div className="space-y-4 pt-2 border-t">
                                    <p className="text-sm font-medium">Schedule</p>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="has_start_date" className="cursor-pointer text-sm">
                                                    Start date
                                                </Label>
                                                <Switch
                                                    id="has_start_date"
                                                    checked={formData.has_start_date}
                                                    onCheckedChange={(checked) => 
                                                        setFormData({ ...formData, has_start_date: checked })
                                                    }
                                                />
                                            </div>
                                            {formData.has_start_date && (
                                                <Input
                                                    type="date"
                                                    value={formData.starts_at}
                                                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="has_expiry" className="cursor-pointer text-sm">
                                                    Expiry date
                                                </Label>
                                                <Switch
                                                    id="has_expiry"
                                                    checked={formData.has_expiry}
                                                    onCheckedChange={(checked) => 
                                                        setFormData({ ...formData, has_expiry: checked })
                                                    }
                                                />
                                            </div>
                                            {formData.has_expiry && (
                                                <>
                                                    <Input
                                                        type="date"
                                                        value={formData.expires_at}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, expires_at: e.target.value });
                                                            if (errors.expires_at) setErrors({ ...errors, expires_at: "" });
                                                        }}
                                                        min={formData.starts_at || new Date().toISOString().split("T")[0]}
                                                        className={errors.expires_at ? "border-destructive" : ""}
                                                    />
                                                    {errors.expires_at && (
                                                        <p className="text-xs text-destructive">{errors.expires_at}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Conditions Tab */}
                            <TabsContent value="conditions" className="mt-0 space-y-5">
                                {/* Scope Selection */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Applies to</Label>
                                    <div className="space-y-2">
                                        {scopeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, scope: option.value })}
                                                className={cn(
                                                    "flex items-center gap-3 w-full p-3 rounded-lg border text-left transition-colors",
                                                    formData.scope === option.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                                                    formData.scope === option.value
                                                        ? "border-primary bg-primary"
                                                        : "border-muted-foreground"
                                                )}>
                                                    {formData.scope === option.value && (
                                                        <Check className="h-3 w-3 text-primary-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{option.label}</p>
                                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.scope && (
                                        <p className="text-xs text-destructive">{errors.scope}</p>
                                    )}
                                </div>

                                {/* Product Selection */}
                                {formData.scope === "products" && (
                                    <div className="space-y-3 pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">Select Products</Label>
                                            {selectedProducts.length > 0 && (
                                                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                                                    {selectedProducts.length} selected
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {/* Selected Products */}
                                        {selectedProducts.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProducts.map((product) => (
                                                    <Badge 
                                                        key={product.id} 
                                                        variant="secondary"
                                                        className="flex items-center gap-1 pr-1"
                                                    >
                                                        {product.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleProduct(product.id)}
                                                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search products..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>

                                        {/* Product List */}
                                        <ScrollArea className="h-[200px] rounded-lg border">
                                            {loadingProducts ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : filteredProducts.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/50 mb-2">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {products.length === 0 ? "No products found" : "No matching products"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="p-2 space-y-1">
                                                    {filteredProducts.map((product) => (
                                                        <label
                                                            key={product.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                                                formData.selected_product_ids.includes(product.id)
                                                                    ? "bg-primary/5"
                                                                    : "hover:bg-muted/50"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={formData.selected_product_ids.includes(product.id)}
                                                                onCheckedChange={() => toggleProduct(product.id)}
                                                            />
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                                                                {product.image_url ? (
                                                                    <img 
                                                                        src={product.image_url} 
                                                                        alt={product.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Image className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{product.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatPrice(product.price)}
                                                                    {product.sku && ` • ${product.sku}`}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                )}

                                {/* Collection Selection */}
                                {formData.scope === "collections" && (
                                    <div className="space-y-3 pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">Select Collections</Label>
                                            {selectedCollections.length > 0 && (
                                                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                                                    {selectedCollections.length} selected
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {/* Selected Collections */}
                                        {selectedCollections.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCollections.map((collection) => (
                                                    <Badge 
                                                        key={collection.id} 
                                                        variant="secondary"
                                                        className="flex items-center gap-1 pr-1"
                                                    >
                                                        {collection.name}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleCollection(collection.id)}
                                                            className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search collections..."
                                                value={collectionSearch}
                                                onChange={(e) => setCollectionSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>

                                        {/* Collection List */}
                                        <ScrollArea className="h-[200px] rounded-lg border">
                                            {loadingCollections ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : filteredCollections.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/50 mb-2">
                                                        <Folder className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {collections.length === 0 ? "No collections found" : "No matching collections"}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="p-2 space-y-1">
                                                    {filteredCollections.map((collection) => (
                                                        <label
                                                            key={collection.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                                                formData.selected_collection_ids.includes(collection.id)
                                                                    ? "bg-primary/5"
                                                                    : "hover:bg-muted/50"
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={formData.selected_collection_ids.includes(collection.id)}
                                                                onCheckedChange={() => toggleCollection(collection.id)}
                                                            />
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                                <Folder className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{collection.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {collection.product_count} product{collection.product_count !== 1 ? "s" : ""}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                )}

                                {/* Minimum Order Amount */}
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="has_min_order" className="cursor-pointer text-sm font-medium">
                                                Minimum order amount
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Require a minimum purchase to use this discount
                                            </p>
                                        </div>
                                        <Switch
                                            id="has_min_order"
                                            checked={formData.has_min_order}
                                            onCheckedChange={(checked) => 
                                                setFormData({ ...formData, has_min_order: checked })
                                            }
                                        />
                                    </div>
                                    {formData.has_min_order && (
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                                {getCurrencySymbol()}
                                            </span>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="100"
                                                value={formData.min_order_amount}
                                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                                className="pl-10"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Minimum Quantity */}
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="has_min_quantity" className="cursor-pointer text-sm font-medium">
                                                Minimum quantity
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Require a minimum number of items in cart
                                            </p>
                                        </div>
                                        <Switch
                                            id="has_min_quantity"
                                            checked={formData.has_min_quantity}
                                            onCheckedChange={(checked) => 
                                                setFormData({ ...formData, has_min_quantity: checked })
                                            }
                                        />
                                    </div>
                                    {formData.has_min_quantity && (
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="2"
                                                value={formData.min_quantity}
                                                onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                                items
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Usage Limits */}
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="has_max_uses" className="cursor-pointer text-sm font-medium">
                                                Total usage limit
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Maximum number of times this code can be used
                                            </p>
                                        </div>
                                        <Switch
                                            id="has_max_uses"
                                            checked={formData.has_max_uses}
                                            onCheckedChange={(checked) => 
                                                setFormData({ ...formData, has_max_uses: checked })
                                            }
                                        />
                                    </div>
                                    {formData.has_max_uses && (
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="100"
                                                value={formData.max_uses}
                                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                                uses
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Per Customer Limit */}
                                <div className="space-y-3 pt-3 border-t">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="has_max_per_customer" className="cursor-pointer text-sm font-medium">
                                                Limit per customer
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Maximum uses per customer
                                            </p>
                                        </div>
                                        <Switch
                                            id="has_max_per_customer"
                                            checked={formData.has_max_per_customer}
                                            onCheckedChange={(checked) => 
                                                setFormData({ ...formData, has_max_per_customer: checked })
                                            }
                                        />
                                    </div>
                                    {formData.has_max_per_customer && (
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                min="1"
                                                step="1"
                                                placeholder="1"
                                                value={formData.max_uses_per_customer}
                                                onChange={(e) => setFormData({ ...formData, max_uses_per_customer: e.target.value })}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                                per customer
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Options Tab */}
                            <TabsContent value="options" className="mt-0 space-y-5">
                                {/* First Time Purchase Only */}
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="first_time_purchase" className="cursor-pointer text-sm font-medium">
                                            First-time purchase only
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Only allow customers who haven&apos;t made a purchase before
                                        </p>
                                    </div>
                                    <Switch
                                        id="first_time_purchase"
                                        checked={formData.first_time_purchase_only}
                                        onCheckedChange={(checked) => 
                                            setFormData({ ...formData, first_time_purchase_only: checked })
                                        }
                                    />
                                </div>

                                {/* Combine with Other Discounts */}
                                <div className="flex items-center justify-between p-4 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="combines_with_other" className="cursor-pointer text-sm font-medium">
                                            Combine with other discounts
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Allow this discount to be used with other discount codes
                                        </p>
                                    </div>
                                    <Switch
                                        id="combines_with_other"
                                        checked={formData.combines_with_other_discounts}
                                        onCheckedChange={(checked) => 
                                            setFormData({ ...formData, combines_with_other_discounts: checked })
                                        }
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2 pt-3 border-t">
                                    <Label htmlFor="description">Internal Notes</Label>
                                    <textarea
                                        id="description"
                                        placeholder="Add notes about this discount (only visible to you)"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        These notes are for internal use only and won&apos;t be shown to customers.
                                    </p>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter className="pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isEditing ? "Saving..." : "Creating..."}
                                </>
                            ) : (
                                isEditing ? "Save Changes" : "Create Discount"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    ArrowUp02Icon,
    ArrowDown02Icon,
    PackageIcon,
    Image01Icon,
    Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Stock History | Dashboard",
    description: "View stock movement history for a product.",
};

interface PageProps {
    params: Promise<{ productId: string }>;
}

export default async function StockHistoryPage({ params }: PageProps) {
    const { productId } = await params;
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Get product details
    const { data: product } = await supabase
        .from("products")
        .select("id, name, sku, quantity, images")
        .eq("id", productId)
        .eq("tenant_id", userData.tenant_id)
        .single();

    if (!product) notFound();

    // Get stock movements
    const { data: movements } = await supabase
        .from("stock_movements")
        .select("*")
        .eq("product_id", productId)
        .eq("tenant_id", userData.tenant_id)
        .order("created_at", { ascending: false })
        .limit(100);

    const hasImage = product.images && product.images.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/inventory">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
                    </Link>
                </Button>
                <div className="flex items-center gap-4 flex-1">
                    {hasImage ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted shrink-0">
                            <Image
                                src={(product.images as any[])[0].url}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted shrink-0">
                            <HugeiconsIcon icon={Image01Icon} className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            {product.sku && (
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                    SKU: {product.sku}
                                </code>
                            )}
                            <span>Current Stock: <span className="font-semibold text-foreground">{product.quantity}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Movements</p>
                        <p className="text-2xl font-bold mt-1">{movements?.length || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Added</p>
                        <p className="text-2xl font-bold mt-1 text-chart-2">
                            +{movements?.filter(m => m.quantity_change > 0).reduce((sum, m) => sum + m.quantity_change, 0) || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Removed</p>
                        <p className="text-2xl font-bold mt-1 text-destructive">
                            {movements?.filter(m => m.quantity_change < 0).reduce((sum, m) => sum + m.quantity_change, 0) || 0}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Stock</p>
                        <p className="text-2xl font-bold mt-1">{product.quantity}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Movement History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5" />
                        Stock Movement History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!movements || movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                                <HugeiconsIcon icon={PackageIcon} className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <p className="mt-4 font-medium">No stock movements yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Stock changes will appear here when you adjust inventory
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {movements.map((movement, index) => (
                                <div 
                                    key={movement.id} 
                                    className={cn(
                                        "flex items-start gap-4 p-4 rounded-lg border",
                                        index === 0 && "bg-muted/30"
                                    )}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                        movement.quantity_change > 0 ? "bg-chart-2/10" : "bg-destructive/10"
                                    )}>
                                        <HugeiconsIcon 
                                            icon={movement.quantity_change > 0 ? ArrowUp02Icon : ArrowDown02Icon}
                                            className={cn(
                                                "w-5 h-5",
                                                movement.quantity_change > 0 ? "text-chart-2" : "text-destructive"
                                            )}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={cn(
                                                "text-lg font-bold",
                                                movement.quantity_change > 0 ? "text-chart-2" : "text-destructive"
                                            )}>
                                                {movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change}
                                            </span>
                                            <Badge variant="secondary" className="capitalize">
                                                {movement.type}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {movement.quantity_before} → {movement.quantity_after}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium mt-1">{movement.reason}</p>
                                        {movement.notes && (
                                            <p className="text-sm text-muted-foreground mt-1">{movement.notes}</p>
                                        )}
                                        {movement.reference && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Ref: {movement.reference}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(movement.created_at), "MMM d, yyyy")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(movement.created_at), "h:mm a")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
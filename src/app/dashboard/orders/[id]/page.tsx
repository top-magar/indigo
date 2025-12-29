import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { updateOrderStatus, updateOrderNotes } from "../actions";
import Link from "next/link";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    CheckmarkCircle02Icon,
    Clock01Icon,
    DeliveryTruck01Icon,
    PackageIcon,
    Cancel01Icon,
    Mail01Icon,
    SmartPhone01Icon,
    Location01Icon,
    NoteIcon,
} from "@hugeicons/core-free-icons";
import { OrderStepper, type OrderStatus } from "@/components/dashboard";

// Status configuration for visual styling
const statusConfig: Record<string, { color: string; bgColor: string; textColor: string; icon: typeof Clock01Icon; label: string }> = {
    pending: {
        color: "bg-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-950/50",
        textColor: "text-amber-700 dark:text-amber-400",
        icon: Clock01Icon,
        label: "Pending"
    },
    confirmed: {
        color: "bg-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/50",
        textColor: "text-blue-700 dark:text-blue-400",
        icon: PackageIcon,
        label: "Confirmed"
    },
    processing: {
        color: "bg-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950/50",
        textColor: "text-blue-700 dark:text-blue-400",
        icon: PackageIcon,
        label: "Processing"
    },
    shipped: {
        color: "bg-violet-500",
        bgColor: "bg-violet-50 dark:bg-violet-950/50",
        textColor: "text-violet-700 dark:text-violet-400",
        icon: DeliveryTruck01Icon,
        label: "Shipped"
    },
    delivered: {
        color: "bg-emerald-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
        textColor: "text-emerald-700 dark:text-emerald-400",
        icon: CheckmarkCircle02Icon,
        label: "Delivered"
    },
    completed: {
        color: "bg-emerald-500",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
        textColor: "text-emerald-700 dark:text-emerald-400",
        icon: CheckmarkCircle02Icon,
        label: "Completed"
    },
    cancelled: {
        color: "bg-rose-500",
        bgColor: "bg-rose-50 dark:bg-rose-950/50",
        textColor: "text-rose-700 dark:text-rose-400",
        icon: Cancel01Icon,
        label: "Cancelled"
    },
    refunded: {
        color: "bg-rose-500",
        bgColor: "bg-rose-50 dark:bg-rose-950/50",
        textColor: "text-rose-700 dark:text-rose-400",
        icon: Cancel01Icon,
        label: "Refunded"
    },
};

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function OrderDetailPage(props: PageProps) {
    const { id } = await props.params;

    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    const tenantId = userData.tenant_id;

    // Fetch order
    const { data: order } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!order) return notFound();

    // Fetch order items
    const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id)
        .eq("tenant_id", tenantId);

    const orderItems = items || [];
    const currentStatus = statusConfig[order.status] || statusConfig.pending;

    // Parse shipping address if it's JSON
    const shippingAddress = order.shipping_address as { 
        address_line1?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
        phone?: string;
    } | null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/orders"
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Created {format(new Date(order.created_at), "PPP 'at' p")}
                        </p>
                    </div>
                </div>
                <Badge
                    className={`${currentStatus.color} text-white px-3 py-1.5 text-sm font-medium`}
                >
                    <HugeiconsIcon icon={currentStatus.icon} className="w-4 h-4 mr-1.5" />
                    {currentStatus.label}
                </Badge>
            </div>

            {/* Order Progress Stepper */}
            <Card>
                <CardContent className="py-6">
                    <OrderStepper currentStatus={order.status as OrderStatus} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HugeiconsIcon icon={PackageIcon} className="w-5 h-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                No items in this order
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orderItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {item.product_name || "Unknown Product"}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-mono text-xs">
                                                    {item.product_sku || "-"}
                                                </TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right">Rs {item.unit_price}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    Rs {item.total_price}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            <div className="border-t p-4 bg-muted/30">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>Rs {order.subtotal}</span>
                                    </div>
                                    {order.shipping_total > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>Rs {order.shipping_total}</span>
                                        </div>
                                    )}
                                    {order.tax_total > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Tax</span>
                                            <span>Rs {order.tax_total}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                                        <span>Order Total</span>
                                        <span>Rs {order.total}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5" />
                                Payment & Fulfillment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment Status</p>
                                    <Badge variant={order.payment_status === "paid" ? "default" : "secondary"} className="mt-1">
                                        {order.payment_status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Fulfillment Status</p>
                                    <Badge variant={order.fulfillment_status === "fulfilled" ? "default" : "secondary"} className="mt-1">
                                        {order.fulfillment_status}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Update Status */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={updateOrderStatus} className="space-y-3">
                                <input type="hidden" name="orderId" value={order.id} />
                                <select
                                    name="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue={order.status}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <input
                                    type="text"
                                    name="note"
                                    placeholder="Add a note (optional)"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <Button type="submit" className="w-full">
                                    Update Status
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.customer_name && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-bold text-primary">
                                            {order.customer_name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{order.customer_name}</p>
                                    </div>
                                </div>
                            )}
                            {order.customer_email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-muted-foreground" />
                                    <span>{order.customer_email}</span>
                                </div>
                            )}
                            {shippingAddress?.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <HugeiconsIcon icon={SmartPhone01Icon} className="w-4 h-4 text-muted-foreground" />
                                    <span>{shippingAddress.phone}</span>
                                </div>
                            )}
                            {!order.customer_name && !order.customer_email && (
                                <p className="text-muted-foreground text-sm">No customer info</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HugeiconsIcon icon={Location01Icon} className="w-5 h-5" />
                                Shipping
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {shippingAddress ? (
                                <div className="text-sm space-y-1">
                                    {shippingAddress.address_line1 && <p>{shippingAddress.address_line1}</p>}
                                    {(shippingAddress.city || shippingAddress.state) && (
                                        <p className="text-muted-foreground">
                                            {[shippingAddress.city, shippingAddress.state, shippingAddress.postal_code].filter(Boolean).join(", ")}
                                        </p>
                                    )}
                                    {shippingAddress.country && (
                                        <p className="text-muted-foreground">{shippingAddress.country}</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No shipping address</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order Notes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HugeiconsIcon icon={NoteIcon} className="w-5 h-5" />
                                Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form action={updateOrderNotes} className="space-y-3">
                                <input type="hidden" name="orderId" value={order.id} />
                                <textarea
                                    name="notes"
                                    placeholder="Add internal notes about this order..."
                                    defaultValue={order.notes || ""}
                                    rows={3}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                />
                                <Button type="submit" variant="outline" size="sm" className="w-full">
                                    Save Notes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

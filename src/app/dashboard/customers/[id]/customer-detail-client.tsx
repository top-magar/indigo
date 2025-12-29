"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    UserIcon,
    Mail01Icon,
    SmartPhone01Icon,
    Calendar03Icon,
    ShoppingCart01Icon,
    Money01Icon,
    Location01Icon,
    PencilEdit01Icon,
    Delete02Icon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
    Loading01Icon,
    Add01Icon,
    Clock01Icon,
    NoteIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { updateCustomer, deleteCustomer, addCustomerNote } from "../actions";
import type { Customer, Order, Address } from "@/lib/supabase/types";

interface CustomerDetailClientProps {
    customer: Customer;
    orders: Order[];
    addresses: Address[];
    stats: {
        totalOrders: number;
        totalSpent: number;
        avgOrderValue: number;
        lastOrderDate: string | null;
    };
    currency: string;
}

// Format currency
function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

// Get initials
function getInitials(firstName: string | null, lastName: string | null, email: string): string {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    return email.slice(0, 2).toUpperCase();
}

// Status config for orders
const orderStatusConfig: Record<string, { color: string; bgColor: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10" },
    confirmed: { color: "text-chart-1", bgColor: "bg-chart-1/10" },
    processing: { color: "text-chart-1", bgColor: "bg-chart-1/10" },
    shipped: { color: "text-chart-5", bgColor: "bg-chart-5/10" },
    delivered: { color: "text-chart-2", bgColor: "bg-chart-2/10" },
    cancelled: { color: "text-destructive", bgColor: "bg-destructive/10" },
    refunded: { color: "text-destructive", bgColor: "bg-destructive/10" },
};

export function CustomerDetailClient({
    customer,
    orders,
    addresses,
    stats,
    currency,
}: CustomerDetailClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Edit state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [firstName, setFirstName] = useState(customer.first_name || "");
    const [lastName, setLastName] = useState(customer.last_name || "");
    const [phone, setPhone] = useState(customer.phone || "");
    const [acceptsMarketing, setAcceptsMarketing] = useState(customer.accepts_marketing);

    // Note state
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [newNote, setNewNote] = useState("");

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const metadata = customer.metadata as Record<string, unknown> || {};
    const notes = (metadata.notes as Array<{ text: string; date: string }>) || [];

    const handleSave = async () => {
        startTransition(async () => {
            const result = await updateCustomer(customer.id, {
                first_name: firstName || undefined,
                last_name: lastName || undefined,
                phone: phone || undefined,
                accepts_marketing: acceptsMarketing,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Customer updated");
                setEditDialogOpen(false);
                router.refresh();
            }
        });
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        startTransition(async () => {
            const result = await addCustomerNote(customer.id, newNote.trim());

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Note added");
                setNewNote("");
                setNoteDialogOpen(false);
                router.refresh();
            }
        });
    };

    const handleDelete = async () => {
        startTransition(async () => {
            const result = await deleteCustomer(customer.id);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Customer deleted");
                router.push("/dashboard/customers");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/customers">
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                                {getInitials(customer.first_name, customer.last_name, customer.email)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {customer.first_name || customer.last_name
                                    ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
                                    : customer.email.split("@")[0]}
                            </h1>
                            <p className="text-muted-foreground">{customer.email}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                        <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5 text-chart-1" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                                        <p className="text-xs text-muted-foreground">Orders</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                        <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-chart-2" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent, currency)}</p>
                                        <p className="text-xs text-muted-foreground">Total Spent</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                        <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{formatCurrency(stats.avgOrderValue, currency)}</p>
                                        <p className="text-xs text-muted-foreground">Avg. Order</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                        <HugeiconsIcon icon={Calendar03Icon} className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">
                                            {stats.lastOrderDate
                                                ? formatDistanceToNow(new Date(stats.lastOrderDate), { addSuffix: true })
                                                : "Never"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Last Order</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5" />
                                Recent Orders
                            </CardTitle>
                            <CardDescription>Last 10 orders from this customer</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {orders.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                                        <HugeiconsIcon icon={ShoppingCart01Icon} className="w-6 h-6 text-muted-foreground/50" />
                                    </div>
                                    <p className="mt-3 text-sm text-muted-foreground">No orders yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map((order) => {
                                        const statusStyle = orderStatusConfig[order.status] || orderStatusConfig.pending;
                                        return (
                                            <Link
                                                key={order.id}
                                                href={`/dashboard/orders/${order.id}`}
                                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-sm">
                                                        <p className="font-medium">#{order.order_number}</p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {format(new Date(order.created_at), "MMM d, yyyy")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn("border-0 capitalize", statusStyle.bgColor, statusStyle.color)}
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                    <span className="font-medium">
                                                        {formatCurrency(order.total, currency)}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Addresses */}
                    {addresses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <HugeiconsIcon icon={Location01Icon} className="w-5 h-5" />
                                    Addresses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {addresses.map((address) => (
                                        <div key={address.id} className="p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge variant="outline" className="capitalize">
                                                    {address.type}
                                                </Badge>
                                                {address.is_default && (
                                                    <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0">
                                                        Default
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm space-y-1">
                                                {(address.first_name || address.last_name) && (
                                                    <p className="font-medium">
                                                        {address.first_name} {address.last_name}
                                                    </p>
                                                )}
                                                {address.company && <p>{address.company}</p>}
                                                <p className="text-muted-foreground">{address.address_line1}</p>
                                                {address.address_line2 && (
                                                    <p className="text-muted-foreground">{address.address_line2}</p>
                                                )}
                                                <p className="text-muted-foreground">
                                                    {address.city}{address.state ? `, ${address.state}` : ""} {address.postal_code}
                                                </p>
                                                <p className="text-muted-foreground">{address.country}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>


                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Customer Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                                    {customer.email}
                                </a>
                            </div>
                            {customer.phone && (
                                <div className="flex items-center gap-3">
                                    <HugeiconsIcon icon={SmartPhone01Icon} className="w-4 h-4 text-muted-foreground" />
                                    <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                                        {customer.phone}
                                    </a>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    Customer since {format(new Date(customer.created_at), "MMM d, yyyy")}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Marketing</span>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "border-0",
                                        customer.accepts_marketing
                                            ? "bg-chart-2/10 text-chart-2"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {customer.accepts_marketing ? "Subscribed" : "Not subscribed"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">Notes</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setNoteDialogOpen(true)}>
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {notes.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No notes yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {notes.slice(0, 5).map((note, index) => (
                                        <div key={index} className="text-sm">
                                            <p className="text-muted-foreground">{note.text}</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                {formatDistanceToNow(new Date(note.date), { addSuffix: true })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orders.slice(0, 3).map((order) => (
                                    <div key={order.id} className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-chart-1/10 flex items-center justify-center shrink-0">
                                            <HugeiconsIcon icon={ShoppingCart01Icon} className="w-4 h-4 text-chart-1" />
                                        </div>
                                        <div className="text-sm">
                                            <p>Placed order <span className="font-medium">#{order.order_number}</span></p>
                                            <p className="text-muted-foreground text-xs">
                                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                                        <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-chart-2" />
                                    </div>
                                    <div className="text-sm">
                                        <p>Customer created</p>
                                        <p className="text-muted-foreground text-xs">
                                            {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>Update customer information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Marketing</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive marketing emails
                                </p>
                            </div>
                            <Switch
                                checked={acceptsMarketing}
                                onCheckedChange={setAcceptsMarketing}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>Add a note about this customer</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Enter your note..."
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddNote} disabled={isPending || !newNote.trim()}>
                            {isPending ? "Adding..." : "Add Note"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this customer? This action cannot be undone.
                            {stats.totalOrders > 0 && (
                                <span className="block mt-2 text-destructive">
                                    Note: Customers with orders cannot be deleted.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

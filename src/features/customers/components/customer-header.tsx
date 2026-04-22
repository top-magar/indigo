"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import { CopyableText } from "@/components/ui/copyable-text";
import { cn } from "@/shared/utils";
import { deleteCustomerAction, toggleCustomerStatus } from "@/app/dashboard/customers/customer-actions";
import type { Customer } from "@/app/dashboard/customers/types";

interface CustomerHeaderProps {
    customer: Customer;
    onEdit: () => void;
}

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName.slice(0, 2).toUpperCase();
    return email.slice(0, 2).toUpperCase();
}

function getDisplayName(firstName: string | null, lastName: string | null, email: string): string {
    if (firstName || lastName) return `${firstName || ""} ${lastName || ""}`.trim();
    return email.split("@")[0];
}

export function CustomerHeader({ customer, onEdit }: CustomerHeaderProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteCustomerAction(customer.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Customer deleted");
                router.push("/dashboard/customers");
            }
        });
    };

    const handleToggleStatus = () => {
        startTransition(async () => {
            const result = await toggleCustomerStatus(customer.id, !customer.isActive);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(customer.isActive ? "Customer deactivated" : "Customer activated");
                router.refresh();
            }
        });
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/customers">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-12">
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                                {getInitials(customer.firstName, customer.lastName, customer.email)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {getDisplayName(customer.firstName, customer.lastName, customer.email)}
                                </h1>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "border-0",
                                        customer.isActive
                                            ? "bg-success/10 text-success"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {customer.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                            <CopyableText 
                                text={customer.email} 
                               
                                className="text-muted-foreground"
                                tooltipText="Copy email"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <a href={`mailto:${customer.email}`}>
                            <Mail className="size-4" />
                            Email
                        </a>
                    </Button>
                    <Button variant="outline" onClick={onEdit}>
                        <Pencil className="size-4" />
                        Edit
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={handleToggleStatus} disabled={isPending}>
                                {customer.isActive ? (
                                    <XCircle className="size-4" />
                                ) : (
                                    <CheckCircle2 className="size-4" />
                                )}
                                {customer.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="size-4" />
                                Delete Customer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this customer? This action cannot be undone.
                            {customer.stats.totalOrders > 0 && (
                                <span className="block mt-2 text-destructive">
                                    This customer has {customer.stats.totalOrders} order(s) and cannot be deleted.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending || customer.stats.totalOrders > 0}
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

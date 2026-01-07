"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Location01Icon,
    PencilEdit01Icon,
    Delete02Icon,
    Add01Icon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { deleteCustomerAddress, setDefaultAddress } from "@/app/dashboard/customers/customer-actions";
import type { Customer, CustomerAddress } from "@/app/dashboard/customers/types";

interface CustomerAddressesCardProps {
    customer: Customer;
    onAddAddress: () => void;
    onEditAddress: (address: CustomerAddress) => void;
}

function formatAddress(address: CustomerAddress): string[] {
    const lines: string[] = [];
    
    if (address.firstName || address.lastName) {
        lines.push(`${address.firstName || ""} ${address.lastName || ""}`.trim());
    }
    if (address.company) {
        lines.push(address.company);
    }
    lines.push(address.addressLine1);
    if (address.addressLine2) {
        lines.push(address.addressLine2);
    }
    lines.push(
        `${address.city}${address.state ? `, ${address.state}` : ""} ${address.postalCode || ""}`.trim()
    );
    lines.push(address.country);
    
    return lines;
}

export function CustomerAddressesCard({ 
    customer, 
    onAddAddress,
    onEditAddress 
}: CustomerAddressesCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<CustomerAddress | null>(null);

    const handleDelete = () => {
        if (!addressToDelete) return;
        
        startTransition(async () => {
            const result = await deleteCustomerAddress(addressToDelete.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Address deleted");
                router.refresh();
            }
            setDeleteDialogOpen(false);
            setAddressToDelete(null);
        });
    };

    const handleSetDefault = (address: CustomerAddress, type: "shipping" | "billing") => {
        startTransition(async () => {
            const result = await setDefaultAddress(address.id, type);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Set as default ${type} address`);
                router.refresh();
            }
        });
    };

    const { defaultBillingAddress, defaultShippingAddress, addresses } = customer;
    const hasAddresses = addresses.length > 0;

    // Check if billing and shipping are the same
    const sameAddress = defaultBillingAddress?.id === defaultShippingAddress?.id;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">Address Information</CardTitle>
                    <Button variant="outline" size="sm" onClick={onAddAddress}>
                        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1" />
                        Add
                    </Button>
                </CardHeader>
                <CardContent>
                    {!hasAddresses ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            This customer has no addresses yet
                        </p>
                    ) : sameAddress && defaultBillingAddress ? (
                        // Same address for both
                        <AddressBlock
                            address={defaultBillingAddress}
                            label="Address"
                            onEdit={() => onEditAddress(defaultBillingAddress)}
                            onDelete={() => {
                                setAddressToDelete(defaultBillingAddress);
                                setDeleteDialogOpen(true);
                            }}
                            onSetDefault={(type) => handleSetDefault(defaultBillingAddress, type)}
                            isPending={isPending}
                        />
                    ) : (
                        <div className="space-y-4">
                            {defaultBillingAddress && (
                                <AddressBlock
                                    address={defaultBillingAddress}
                                    label="Billing Address"
                                    onEdit={() => onEditAddress(defaultBillingAddress)}
                                    onDelete={() => {
                                        setAddressToDelete(defaultBillingAddress);
                                        setDeleteDialogOpen(true);
                                    }}
                                    onSetDefault={(type) => handleSetDefault(defaultBillingAddress, type)}
                                    isPending={isPending}
                                />
                            )}
                            {defaultBillingAddress && defaultShippingAddress && <Separator />}
                            {defaultShippingAddress && (
                                <AddressBlock
                                    address={defaultShippingAddress}
                                    label="Shipping Address"
                                    onEdit={() => onEditAddress(defaultShippingAddress)}
                                    onDelete={() => {
                                        setAddressToDelete(defaultShippingAddress);
                                        setDeleteDialogOpen(true);
                                    }}
                                    onSetDefault={(type) => handleSetDefault(defaultShippingAddress, type)}
                                    isPending={isPending}
                                />
                            )}
                        </div>
                    )}

                    {/* Other addresses */}
                    {addresses.filter(a => 
                        a.id !== defaultBillingAddress?.id && 
                        a.id !== defaultShippingAddress?.id
                    ).length > 0 && (
                        <>
                            <Separator className="my-4" />
                            <p className="text-sm font-medium mb-3">Other Addresses</p>
                            <div className="space-y-3">
                                {addresses
                                    .filter(a => 
                                        a.id !== defaultBillingAddress?.id && 
                                        a.id !== defaultShippingAddress?.id
                                    )
                                    .map(address => (
                                        <AddressBlock
                                            key={address.id}
                                            address={address}
                                            onEdit={() => onEditAddress(address)}
                                            onDelete={() => {
                                                setAddressToDelete(address);
                                                setDeleteDialogOpen(true);
                                            }}
                                            onSetDefault={(type) => handleSetDefault(address, type)}
                                            isPending={isPending}
                                            compact
                                        />
                                    ))
                                }
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this address? This action cannot be undone.
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

interface AddressBlockProps {
    address: CustomerAddress;
    label?: string;
    onEdit: () => void;
    onDelete: () => void;
    onSetDefault: (type: "shipping" | "billing") => void;
    isPending: boolean;
    compact?: boolean;
}

function AddressBlock({ 
    address, 
    label, 
    onEdit, 
    onDelete, 
    onSetDefault,
    isPending,
    compact 
}: AddressBlockProps) {
    const lines = formatAddress(address);

    return (
        <div className={compact ? "p-3 rounded-lg border" : ""}>
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                    {label && (
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    )}
                    {!label && address.isDefault && (
                        <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0 mb-1">
                            Default {address.type}
                        </Badge>
                    )}
                    {lines.map((line, idx) => (
                        <p key={idx} className="text-sm">
                            {line}
                        </p>
                    ))}
                    {address.phone && (
                        <p className="text-sm text-muted-foreground">{address.phone}</p>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onSetDefault("billing")}
                            disabled={isPending}
                        >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                            Set as billing
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onSetDefault("shipping")}
                            disabled={isPending}
                        >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                            Set as shipping
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

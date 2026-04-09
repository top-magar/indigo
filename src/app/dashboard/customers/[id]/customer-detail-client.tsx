"use client";

import { useState } from "react";
import {
    ShoppingCart,
    DollarSign,
    Calendar,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import {
    CustomerHeader,
    CustomerInfoCard,
    CustomerAddressesCard,
    CustomerOrdersCard,
    CustomerStatsCard,
    CustomerNotesCard,
    CustomerTimelineCard,
    CustomerTagsCard,
    AddAddressDialog,
    EditCustomerDialog,
} from "@/features/customers/components";
import { EntityDetailPage } from "@/components/dashboard/templates";
import type { Customer, CustomerAddress } from "@/app/dashboard/customers/types";
import { formatCurrency } from "@/shared/utils";

interface CustomerDetailClientProps {
    customer: Customer;
    currency: string;
}

export function CustomerDetailClient({ customer, currency }: CustomerDetailClientProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

    const handleAddAddress = () => {
        setEditingAddress(null);
        setAddressDialogOpen(true);
    };

    const handleEditAddress = (address: CustomerAddress) => {
        setEditingAddress(address);
        setAddressDialogOpen(true);
    };

    return (
        <>
            <EntityDetailPage
                backHref="/dashboard/customers"
                backLabel="Customers"
                title={`${customer.firstName || ""} ${customer.lastName || ""}`.trim() || customer.email.split("@")[0]}
                subtitle={customer.email}
                sidebar={
                    <>
                        <CustomerInfoCard customer={customer} />
                        <CustomerTagsCard customer={customer} />
                        <CustomerAddressesCard 
                            customer={customer}
                            onAddAddress={handleAddAddress}
                            onEditAddress={handleEditAddress}
                        />
                        <CustomerStatsCard customer={customer} />
                        <CustomerNotesCard customer={customer} />
                        <CustomerTimelineCard customer={customer} />
                    </>
                }
            >
                {/* Header with avatar/status/actions */}
                <CustomerHeader 
                    customer={customer} 
                    onEdit={() => setEditDialogOpen(true)} 
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <ShoppingCart className="size-4 text-primary" />
                                </div>
                                <div>
                                    <p className="stat-value">{customer.stats.totalOrders}</p>
                                    <p className="stat-label">Total Orders</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                                    <DollarSign className="size-4 text-success" />
                                </div>
                                <div>
                                    <p className="stat-value">{formatCurrency(customer.stats.totalSpent, currency)}</p>
                                    <p className="stat-label">Lifetime Value</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
                                    <TrendingUp className="size-4 text-info" />
                                </div>
                                <div>
                                    <p className="stat-value">{formatCurrency(customer.stats.avgOrderValue, currency)}</p>
                                    <p className="stat-label">Avg. Order</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                                    <Calendar className="size-4 text-warning" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">
                                        {customer.stats.lastOrderDate
                                            ? formatDistanceToNow(new Date(customer.stats.lastOrderDate), { addSuffix: true })
                                            : "Never"}
                                    </p>
                                    <p className="stat-label">Last Order</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Orders */}
                <CustomerOrdersCard customer={customer} currency={currency} />
            </EntityDetailPage>

            {/* Dialogs */}
            <EditCustomerDialog
                customer={customer}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />

            <AddAddressDialog
                customerId={customer.id}
                open={addressDialogOpen}
                onOpenChange={setAddressDialogOpen}
                editAddress={editingAddress}
            />
        </>
    );
}

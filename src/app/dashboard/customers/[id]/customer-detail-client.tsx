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
        <div className="space-y-4">
            {/* Header */}
            <CustomerHeader 
                customer={customer} 
                onEdit={() => setEditDialogOpen(true)} 
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <ShoppingCart className="w-5 h-5 text-primary" />
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
                                <DollarSign className="w-5 h-5 text-success" />
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
                                <TrendingUp className="w-5 h-5 text-info" />
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
                                <Calendar className="w-5 h-5 text-warning" />
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

            {/* Two Column Layout */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Orders */}
                    <CustomerOrdersCard customer={customer} currency={currency} />
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-4">
                    {/* Customer Info */}
                    <CustomerInfoCard customer={customer} />

                    {/* Tags */}
                    <CustomerTagsCard customer={customer} />

                    {/* Addresses */}
                    <CustomerAddressesCard 
                        customer={customer}
                        onAddAddress={handleAddAddress}
                        onEditAddress={handleEditAddress}
                    />

                    {/* Stats */}
                    <CustomerStatsCard customer={customer} />

                    {/* Notes */}
                    <CustomerNotesCard customer={customer} />

                    {/* Timeline */}
                    <CustomerTimelineCard customer={customer} />
                </div>
            </div>

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
        </div>
    );
}

"use client";

import Link from "next/link";
import { User, Mail, Smartphone, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Order, OrderAddress } from "@/features/orders/types";

interface OrderCustomerCardProps {
    order: Order;
}

function formatAddress(address: OrderAddress | null | undefined): string[] {
    if (!address) return [];
    
    const lines: string[] = [];
    
    if (address.firstName || address.lastName) {
        lines.push([address.firstName, address.lastName].filter(Boolean).join(" "));
    }
    if (address.company) lines.push(address.company);
    if (address.addressLine1) lines.push(address.addressLine1);
    if (address.addressLine2) lines.push(address.addressLine2);
    
    const cityLine = [address.city, address.state, address.postalCode].filter(Boolean).join(", ");
    if (cityLine) lines.push(cityLine);
    
    if (address.country) lines.push(address.country);
    
    return lines;
}

export function OrderCustomerCard({ order }: OrderCustomerCardProps) {
    const { customer, shippingAddress, billingAddress } = order;
    const customerName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Guest";
    const shippingLines = formatAddress(shippingAddress);
    const billingLines = formatAddress(billingAddress);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                            {customerName[0].toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{customerName}</p>
                            {customer.isGuest && (
                                <Badge variant="secondary" className="text-xs">Guest</Badge>
                            )}
                        </div>
                        {customer.email && (
                            <a
                                href={`mailto:${customer.email}`}
                                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                                <Mail className="h-3 w-3" />
                                {customer.email}
                            </a>
                        )}
                        {customer.phone && (
                            <a
                                href={`tel:${customer.phone}`}
                                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                                <Smartphone className="h-3 w-3" />
                                {customer.phone}
                            </a>
                        )}
                    </div>
                    {customer.id && (
                        <Button variant="ghost" size="icon-sm" asChild>
                            <Link href={`/dashboard/customers/${customer.id}`}>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </div>

                <Separator />

                {/* Shipping Address */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Shipping Address</span>
                    </div>
                    {shippingLines.length > 0 ? (
                        <div className="text-sm text-muted-foreground space-y-0.5 pl-6">
                            {shippingLines.map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                            {shippingAddress?.phone && (
                                <p className="pt-1">{shippingAddress.phone}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground pl-6">No shipping address</p>
                    )}
                </div>

                {/* Billing Address */}
                {billingLines.length > 0 && (
                    <>
                        <Separator />
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Billing Address</span>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-0.5 pl-6">
                                {billingLines.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Customer Note */}
                {order.customerNote && (
                    <>
                        <Separator />
                        <div>
                            <p className="text-sm font-medium mb-1">Customer Note</p>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {order.customerNote}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

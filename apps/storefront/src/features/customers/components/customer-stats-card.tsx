"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Clock, ShoppingCart, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Customer } from "@/app/dashboard/customers/types";

interface CustomerStatsCardProps {
    customer: Customer;
}

export function CustomerStatsCard({ customer }: CustomerStatsCardProps) {
    const { stats, lastLogin } = customer;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Customer History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Last Login */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Last login</p>
                        <p className="text-sm font-medium">
                            {lastLogin 
                                ? formatDistanceToNow(new Date(lastLogin), { addSuffix: true })
                                : "Never"
                            }
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Last Order */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Last order</p>
                        <p className="text-sm font-medium">
                            {stats.lastOrderDate 
                                ? formatDistanceToNow(new Date(stats.lastOrderDate), { addSuffix: true })
                                : "No orders yet"
                            }
                        </p>
                    </div>
                </div>

                <Separator />

                {/* First Order */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">First order</p>
                        <p className="text-sm font-medium">
                            {stats.firstOrderDate 
                                ? format(new Date(stats.firstOrderDate), "MMM d, yyyy")
                                : "No orders yet"
                            }
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

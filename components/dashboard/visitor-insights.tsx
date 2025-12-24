"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon, ArrowUp01Icon, ArrowDown01Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";

interface VisitorInsightsProps {
    totalVisits: number;
    growthPercent: number;
}

export function VisitorInsights({ totalVisits, growthPercent }: VisitorInsightsProps) {
    const isPositiveGrowth = growthPercent >= 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base">Customer Overview</CardTitle>
                <Button variant="ghost" size="sm">
                    <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Customers</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold">{totalVisits.toLocaleString()}</span>
                            {growthPercent !== 0 && (
                                <Badge 
                                    variant={isPositiveGrowth ? "default" : "destructive"} 
                                    className="gap-0.5"
                                >
                                    <HugeiconsIcon 
                                        icon={isPositiveGrowth ? ArrowUp01Icon : ArrowDown01Icon} 
                                        className="w-3 h-3" 
                                    />
                                    {Math.abs(growthPercent)}%
                                </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">vs last month</span>
                        </div>
                    </div>

                    {/* Customer Stats Summary */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={UserMultipleIcon} className="w-4 h-4 text-chart-2" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Active Customers</p>
                                    <p className="text-xs text-muted-foreground">Made a purchase</p>
                                </div>
                            </div>
                            <span className="text-lg font-semibold">{totalVisits}</span>
                        </div>
                        
                        <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">Customer analytics coming soon</p>
                            <p className="text-xs mt-1">Location, demographics & more</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

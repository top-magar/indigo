"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, TrendingUp, TrendingDown, Receipt, Truck, Tag, ShoppingCart } from "lucide-react";
import { SectionTabs, ANALYTICS_TABS } from "@/components/dashboard/section-tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/shared/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { type FinanceSummary, type MonthlyBreakdown, getFinanceSummary } from "./actions";

type Period = "30d" | "90d" | "12m";

interface Props {
    initialSummary: FinanceSummary;
    initialMonthly: MonthlyBreakdown[];
}

export function FinancesClient({ initialSummary, initialMonthly }: Props) {
    const router = useRouter();
    const [summary, setSummary] = useState(initialSummary);
    const [monthly, setMonthly] = useState(initialMonthly);
    const [period, setPeriod] = useState<Period>("30d");
    const [isPending, startTransition] = useTransition();

    function changePeriod(p: Period) {
        setPeriod(p);
        startTransition(async () => {
            const result = await getFinanceSummary(p);
            setSummary(result.summary);
            setMonthly(result.monthly);
        });
    }

    const c = summary.currency;

    return (
        <div className="space-y-3">
            {/* Section Tabs */}
            <SectionTabs tabs={ANALYTICS_TABS} />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-[-0.4px]">Finances</h1>
                    <p className="text-sm text-muted-foreground mt-1">Revenue, refunds, and financial summary.</p>
                </div>
                <div className="flex gap-1">
                    {(["30d", "90d", "12m"] as Period[]).map((p) => (
                        <Button
                            key={p}
                            variant={period === p ? "default" : "outline"}
                            size="sm"
                            onClick={() => changePeriod(p)}
                            disabled={isPending}
                        >
                            {p === "30d" ? "30 days" : p === "90d" ? "90 days" : "12 months"}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Top-level metrics */}
            {summary.ordersCount === 0 ? (
                <EmptyState
                    icon={DollarSign}
                    title="No financial data yet"
                    description="Revenue and financial summaries will appear here when you receive your first order."
                    size="lg"
                    className="py-16"
                    action={{
                        label: "View Products",
                        onClick: () => router.push("/dashboard/products"),
                    }}
                />
            ) : (
            <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="stat-label">Gross Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><p className="stat-value">{formatCurrency(summary.grossRevenue, c)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="stat-label">Refunds</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><p className="stat-value text-destructive">-{formatCurrency(summary.refunds, c)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="stat-label">Net Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent><p className="stat-value">{formatCurrency(summary.netRevenue, c)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="stat-label">Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="stat-value">{summary.ordersCount}</p>
                        <p className="text-sm leading-4 text-muted-foreground">Avg {formatCurrency(summary.avgOrderValue, c)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Breakdown</CardTitle>
                        <CardDescription>Where your revenue comes from and goes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: "Gross Revenue", value: summary.grossRevenue, icon: DollarSign },
                            { label: "Refunds", value: -summary.refunds, icon: TrendingDown },
                            { label: "Tax Collected", value: summary.taxCollected, icon: Receipt },
                            { label: "Shipping Collected", value: summary.shippingCollected, icon: Truck },
                            { label: "Discounts Given", value: -summary.discountsGiven, icon: Tag },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                    {item.label}
                                </div>
                                <span className={`text-sm font-medium ${item.value < 0 ? "text-destructive" : ""}`}>
                                    {item.value < 0 ? "-" : ""}{formatCurrency(Math.abs(item.value), c)}
                                </span>
                            </div>
                        ))}
                        <div className="border-t pt-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Net Revenue</span>
                            <span className="text-sm font-semibold">{formatCurrency(summary.netRevenue, c)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Breakdown</CardTitle>
                        <CardDescription>Revenue and refunds by month.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthly.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No data for this period.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                        <TableHead className="text-right">Refunds</TableHead>
                                        <TableHead className="text-right">Orders</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthly.map((m) => (
                                        <TableRow key={m.month}>
                                            <TableCell className="font-medium">{m.month}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(m.revenue, c)}</TableCell>
                                            <TableCell className="text-right text-destructive">
                                                {m.refunds > 0 ? `-${formatCurrency(m.refunds, c)}` : "—"}
                                            </TableCell>
                                            <TableCell className="text-right">{m.orders}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            </>
            )}
        </div>
    );
}

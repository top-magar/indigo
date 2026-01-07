"use client";

import { useMemo } from "react";
import { cn, formatCurrency } from "@/shared/utils";

interface CategoryData {
    id: string;
    name: string;
    revenue: number;
    percentage: number;
}

interface DonutChartProps {
    data: CategoryData[];
    currency: string;
}

export function DonutChart({ data, currency }: DonutChartProps) {
    const total = useMemo(() => data.reduce((sum, d) => sum + d.revenue, 0), [data]);
    
    const colors = [
        "stroke-chart-1",
        "stroke-chart-2", 
        "stroke-chart-3",
        "stroke-chart-4",
        "stroke-chart-5",
    ];

    // Calculate segments
    const segments = useMemo(() => {
        let currentAngle = 0;
        return data.map((item, index) => {
            const angle = (item.percentage / 100) * 360;
            const segment = {
                ...item,
                startAngle: currentAngle,
                endAngle: currentAngle + angle,
                color: colors[index % colors.length],
            };
            currentAngle += angle;
            return segment;
        });
    }, [data]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[160px]">
                <p className="text-sm text-muted-foreground">No data</p>
            </div>
        );
    }

    // SVG donut chart
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    return (
        <div className="flex items-center justify-center">
            <div className="relative">
                <svg width={size} height={size} className="-rotate-90">
                    {segments.map((segment, index) => {
                        const dashArray = (segment.percentage / 100) * circumference;
                        const dashOffset = segments
                            .slice(0, index)
                            .reduce((sum, s) => sum + (s.percentage / 100) * circumference, 0);
                        
                        return (
                            <circle
                                key={segment.id}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                strokeWidth={strokeWidth}
                                className={cn(segment.color, "transition-all duration-300")}
                                strokeDasharray={`${dashArray} ${circumference}`}
                                strokeDashoffset={-dashOffset}
                                strokeLinecap="round"
                            />
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{formatCurrency(total, currency)}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                </div>
            </div>
        </div>
    );
}

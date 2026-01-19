"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/shared/utils";

export interface ChartDataPoint {
  date: string;
  current: number;
  previous: number;
}

interface SalesChartProps {
  data: ChartDataPoint[];
  currency: string;
}

function CustomTooltip({ active, payload, label, currency }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[var(--ds-gray-200)] rounded-lg shadow-lg p-3">
        <p className="text-xs font-medium text-[var(--ds-gray-900)] mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[var(--ds-gray-600)]">
                {entry.name === "current" ? "This month" : "Last month"}
              </span>
            </div>
            <span className="font-medium text-[var(--ds-gray-900)]">
              {formatCurrency(entry.value, currency)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function SalesChart({ data, currency }: SalesChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-[var(--ds-gray-900)]">
              Revenue Overview
            </CardTitle>
            <p className="text-xs text-[var(--ds-gray-600)] mt-0.5">
              Comparing current vs previous month
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/analytics" className="text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-900)]">
              View Details
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--ds-gray-200)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="var(--ds-gray-400)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--ds-gray-400)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip currency={currency} />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                }}
                formatter={(value) => (value === "current" ? "This month" : "Last month")}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="var(--ds-chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--ds-chart-1)" }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="var(--ds-gray-400)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: "var(--ds-gray-400)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

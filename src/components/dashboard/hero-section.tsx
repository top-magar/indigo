"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp, Package, Eye, Calendar } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import { MovingBorder } from "@/components/ui/aceternity/moving-border";
import { FlipWords } from "@/components/ui/aceternity/flip-words";
import { motion } from "framer-motion";
import Link from "next/link";

export interface HeroSectionProps {
  userName: string;
  todayRevenue: number;
  todayOrders: number;
  currency: string;
  storeSlug?: string;
  greeting: string;
  setupProgress?: number;
}

const greetingWords = ["Welcome back,", "Good to see you,", "Let's build,", "Ready to grow,"];

export function HeroSection({
  userName,
  todayRevenue,
  todayOrders,
  currency,
  storeSlug,
  greeting,
  setupProgress,
}: HeroSectionProps) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} className="motion-reduce:!opacity-100 motion-reduce:!transform-none">
    <MovingBorder duration={4000} borderRadius="0.75rem" borderWidth={2}>
      <div className="rounded-[inherit] bg-background p-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {today}
            {typeof setupProgress === "number" && setupProgress < 100 && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.03_55)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.50_0.18_55)]">
                Setup {setupProgress}%
              </span>
            )}
            {typeof setupProgress === "number" && setupProgress === 100 && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.03_155)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.50_0.18_155)]">
                Store ready
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            <FlipWords words={greetingWords} duration={3500} />
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.96px]">{userName}</h1>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 text-sm tabular-nums">
              <div className="size-6 rounded-md bg-[oklch(0.95_0.03_155)] flex items-center justify-center">
                <TrendingUp className="size-3 text-[oklch(0.50_0.18_155)]" />
              </div>
              <span className="font-medium">{formatCurrency(todayRevenue, currency)}</span>
              <span className="text-muted-foreground">today</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 text-sm tabular-nums">
              <div className="size-6 rounded-md bg-[oklch(0.95_0.03_230)] flex items-center justify-center">
                <Package className="size-3 text-[oklch(0.50_0.18_230)]" />
              </div>
              <span className="font-medium">{todayOrders}</span>
              <span className="text-muted-foreground">orders</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/dashboard/products/new">
              <Package className="size-4 mr-2" />
              Add Product
            </Link>
          </Button>
          {storeSlug && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/store/${storeSlug}`} target="_blank">
                <Eye className="size-4 mr-2" />
                View Store
              </Link>
            </Button>
          )}
        </div>
      </div>
      </div>
    </MovingBorder>
    </motion.div>
  );
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, Sparkles, Brain, CheckCircle2, ArrowUpRight, Zap, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NoiseBackground } from "@/components/ui/aceternity/noise-background"
import { cn } from "@/shared/utils"
import { motion, AnimatePresence } from "motion/react"
import type { AIInsight } from "../types"

function AIInsightCard({ insight }: { insight: AIInsight }) {
  const iconMap = { warning: AlertTriangle, opportunity: Sparkles, info: Brain, success: CheckCircle2 }
  const colorMap = { warning: "border-warning/20 bg-warning/5", opportunity: "border-purple-100 bg-purple-50", info: "border-info/20 bg-primary/5", success: "border-success/20 bg-success/10" }
  const iconColorMap = { warning: "text-warning", opportunity: "text-purple-400", info: "text-info", success: "text-success" }
  const Icon = iconMap[insight.type]

  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border", colorMap[insight.type])}>
      <div className={cn("mt-0.5", iconColorMap[insight.type])}><Icon className="h-4 w-4" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{insight.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
        {insight.action && (
          <Link href={insight.action.href} className="inline-flex items-center gap-1 text-xs font-medium text-info hover:text-info mt-2 transition-colors">
            {insight.action.label}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  )
}

export function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  const [isExpanded, setIsExpanded] = useState(true)
  if (!insights || insights.length === 0) return null

  return (
    <NoiseBackground containerClassName="p-1" gradientColors={["rgb(139, 92, 246)", "rgb(59, 130, 246)", "rgb(147, 51, 234)"]} noiseIntensity={0.12} speed={0.08}>
      <div className="rounded-md bg-background overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">AI Insights</h3>
              <p className="text-xs text-muted-foreground">Smart order analysis</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", !isExpanded && "-rotate-90")} />
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
              <div className="px-4 pb-4 space-y-2">
                {insights.slice(0, 3).map((insight) => (<AIInsightCard key={insight.id} insight={insight} />))}
                {insights.length > 3 && (<Button variant="ghost" size="sm" className="w-full mt-2 text-xs">View {insights.length - 3} more insights</Button>)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NoiseBackground>
  )
}

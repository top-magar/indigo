"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CheckmarkCircle02Icon,
    ArrowRight01Icon,
    Cancel01Icon,
    RocketIcon,
    SparklesIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SetupStep } from "./setup-steps";

export type { SetupStep };

interface SetupChecklistProps {
    steps: SetupStep[];
    storeName: string;
    onDismiss?: () => void;
}

export function SetupChecklist({ steps, storeName, onDismiss }: SetupChecklistProps) {
    const completedCount = steps.filter(s => s.completed).length;
    const totalSteps = steps.length;
    const progress = Math.round((completedCount / totalSteps) * 100);
    const allComplete = completedCount === totalSteps;

    // Find the first incomplete step to auto-expand
    const firstIncompleteIndex = steps.findIndex(s => !s.completed);
    const [expandedStep, setExpandedStep] = useState<string | null>(
        firstIncompleteIndex >= 0 ? steps[firstIncompleteIndex].id : null
    );

    if (allComplete) {
        return (
            <Card className="border-chart-2/30 bg-chart-2/5">
                <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                            <HugeiconsIcon icon={SparklesIcon} className="w-6 h-6 text-chart-2" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">You&apos;re all set! 🎉</h3>
                            <p className="text-sm text-muted-foreground">
                                Your store is ready to start selling. Good luck!
                            </p>
                        </div>
                        {onDismiss && (
                            <Button variant="ghost" size="sm" onClick={onDismiss}>
                                Dismiss
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <HugeiconsIcon icon={RocketIcon} className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Setup guide</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Get {storeName} ready to sell
                            </p>
                        </div>
                    </div>
                    {onDismiss && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground"
                            onClick={onDismiss}
                        >
                            <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                
                {/* Progress */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {completedCount} of {totalSteps} tasks complete
                        </span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-1">
                    {steps.map((step, index) => (
                        <Collapsible
                            key={step.id}
                            open={expandedStep === step.id}
                            onOpenChange={(open) => setExpandedStep(open ? step.id : null)}
                        >
                            <CollapsibleTrigger asChild>
                                <button
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                        "hover:bg-muted/50",
                                        expandedStep === step.id && "bg-muted/50"
                                    )}
                                >
                                    {/* Step number or checkmark */}
                                    <div className={cn(
                                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors",
                                        step.completed 
                                            ? "bg-chart-2/10 text-chart-2" 
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {step.completed ? (
                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>

                                    {/* Title */}
                                    <span className={cn(
                                        "flex-1 text-sm font-medium",
                                        step.completed && "text-muted-foreground line-through"
                                    )}>
                                        {step.title}
                                    </span>

                                    {/* Expand indicator */}
                                    {!step.completed && (
                                        <HugeiconsIcon 
                                            icon={ArrowRight01Icon} 
                                            className={cn(
                                                "w-4 h-4 text-muted-foreground transition-transform",
                                                expandedStep === step.id && "rotate-90"
                                            )} 
                                        />
                                    )}
                                </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                {!step.completed && (
                                    <div className="pl-10 pr-3 pb-3 space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            {step.description}
                                        </p>
                                        <Button asChild size="sm">
                                            <Link href={step.href}>
                                                {step.ctaText}
                                                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

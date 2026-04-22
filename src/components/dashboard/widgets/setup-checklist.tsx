"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    CheckCircle,
    ChevronRight,
    X,
    Rocket,
    Sparkles,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SetupStep } from "./setup-steps";
import { SETUP_STEP_ICONS } from "./setup-steps";

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
            <Card className="border-success/30 bg-success/5">
                <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold tracking-[-0.28px]">You&apos;re all set!</h3>
                            <p className="text-xs text-muted-foreground">
                                Your store is ready to start selling.
                            </p>
                        </div>
                        {onDismiss && (
                            <Button variant="ghost" onClick={onDismiss}>
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
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold tracking-[-0.28px]">Setup guide</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Get {storeName} ready to sell
                            </p>
                        </div>
                    </div>
                    {onDismiss && (
                        <Button
                            variant="ghost" 
                            size="icon" aria-label="Dismiss setup guide"
                            className="text-muted-foreground"
                            onClick={onDismiss}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                
                {/* Progress */}
                <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            {completedCount} of {totalSteps} tasks complete
                        </span>
                        <span className="font-medium tabular-nums">{progress}%</span>
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
                                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                                        "hover:bg-muted/50",
                                        expandedStep === step.id && "bg-muted/50"
                                    )}
                                >
                                    {/* Step number or checkmark */}
                                    <div className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors",
                                        step.completed 
                                            ? "bg-success/10 text-success" 
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {step.completed ? (
                                            <CheckCircle className="w-4 h-4" />
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
                                        <ChevronRight 
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
                                    <div className="pl-10 pr-3 pb-2 space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            {step.description}
                                        </p>
                                        <Button asChild>
                                            <Link href={step.href}>
                                                {step.ctaText}
                                                <ChevronRight className="w-4 h-4 ml-1.5" />
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

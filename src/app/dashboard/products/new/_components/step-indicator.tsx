import { Check } from "lucide-react";
import { cn } from "@/shared/utils";

interface Step {
    label: string;
    description: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
    const progress = ((currentStep) / (steps.length - 1)) * 100;

    return (
        <div className="space-y-4">
            {/* Warm gradient progress bar */}
            <div className="h-1 bg-muted/60 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    style={{
                        width: `${Math.max(progress, 2)}%`,
                        background: "linear-gradient(90deg, var(--color-foreground) 0%, var(--color-foreground) 100%)",
                    }}
                />
            </div>

            {/* Step pills */}
            <div className="flex items-center gap-2">
                {steps.map((step, i) => {
                    const isCompleted = i < currentStep;
                    const isCurrent = i === currentStep;
                    const isClickable = i <= currentStep + 1;
                    return (
                        <button
                            key={step.label}
                            type="button"
                            onClick={() => isClickable && onStepClick(i)}
                            disabled={!isClickable}
                            className={cn(
                                "group flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-all duration-200",
                                isCurrent && "bg-foreground text-background shadow-sm",
                                isCompleted && "bg-muted text-foreground hover:bg-muted/80 cursor-pointer",
                                !isCompleted && !isCurrent && "text-muted-foreground/40",
                            )}
                        >
                            <span className={cn(
                                "flex size-5 items-center justify-center rounded-full text-[10px] font-semibold transition-all",
                                isCurrent && "bg-background/20",
                                isCompleted && "bg-foreground/10",
                            )}>
                                {isCompleted ? <Check className="size-3" /> : i + 1}
                            </span>
                            <span className="font-medium">{step.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

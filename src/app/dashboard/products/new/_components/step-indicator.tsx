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
        <div className="space-y-3">
            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>

            {/* Step labels */}
            <div className="flex items-center justify-between">
                {steps.map((step, i) => {
                    const isCompleted = i < currentStep;
                    const isCurrent = i === currentStep;
                    return (
                        <button
                            key={step.label}
                            type="button"
                            onClick={() => onStepClick(i)}
                            disabled={i > currentStep + 1}
                            className={cn(
                                "text-left transition-colors",
                                isCurrent && "text-foreground",
                                isCompleted && "text-foreground cursor-pointer",
                                !isCompleted && !isCurrent && "text-muted-foreground/50 cursor-not-allowed",
                            )}
                        >
                            <p className={cn("text-xs", isCurrent ? "font-medium" : "font-normal")}>{step.label}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

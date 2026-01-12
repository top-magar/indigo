"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Circle, Sparkles, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils";

export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  href?: string;
}

interface OnboardingProgressProps {
  /** List of setup steps */
  steps: OnboardingStep[];
  /** Optional title for the progress card */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Whether to show the step list */
  showStepList?: boolean;
  /** Whether to show celebratory animation at 100% */
  showCelebration?: boolean;
  /** Callback when celebration animation completes */
  onCelebrationComplete?: () => void;
  /** Custom class name */
  className?: string;
  /** Compact mode - just shows progress bar */
  compact?: boolean;
}

export function OnboardingProgress({
  steps,
  title = "Setup Progress",
  subtitle,
  showStepList = true,
  showCelebration = true,
  onCelebrationComplete,
  className,
  compact = false,
}: OnboardingProgressProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasTriggeredCelebration, setHasTriggeredCelebration] = useState(false);

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 
    ? Math.round((completedCount / totalSteps) * 100) 
    : 0;
  const isComplete = progressPercentage === 100;

  // Trigger celebration when reaching 100%
  useEffect(() => {
    if (isComplete && showCelebration && !hasTriggeredCelebration) {
      // Use a microtask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setShowConfetti(true);
        setHasTriggeredCelebration(true);
      });
      
      // Auto-hide confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onCelebrationComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isComplete, showCelebration, hasTriggeredCelebration, onCelebrationComplete]);

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} of {totalSteps} complete
          </span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Celebration overlay */}
      {showConfetti && <CelebrationOverlay />}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                isComplete ? "bg-chart-2/10" : "bg-primary/10"
              )}
            >
              {isComplete ? (
                <PartyPopper className={cn("w-5 h-5", "text-chart-2")} />
              ) : (
                <Sparkles className={cn("w-5 h-5", "text-primary")} />
              )}
            </div>
            <div>
              <CardTitle className="text-base">
                {isComplete ? "All done! 🎉" : title}
              </CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Percentage badge */}
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              isComplete
                ? "bg-chart-2/10 text-chart-2"
                : "bg-muted text-muted-foreground"
            )}
          >
            {progressPercentage}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {totalSteps} tasks complete
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={cn("h-2", isComplete && "bg-chart-2/20")}
          />
        </div>
      </CardHeader>

      {showStepList && (
        <CardContent className="pt-0">
          <div className="space-y-1">
            {steps.map((step) => (
              <StepItem key={step.id} step={step} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Individual step item
function StepItem({ step }: { step: OnboardingStep }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-xl transition-colors",
        step.completed ? "opacity-60" : "hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
          step.completed ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"
        )}
      >
        {step.completed ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            step.completed && "line-through text-muted-foreground"
          )}
        >
          {step.title}
        </p>
        {step.description && !step.completed && (
          <p className="text-xs text-muted-foreground truncate">
            {step.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Celebration overlay with confetti animation
function CelebrationOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-chart-2/10 to-transparent animate-pulse" />
      
      {/* Confetti particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
      </div>
      
      {/* Sparkle burst */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-chart-2 rounded-full animate-ping"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-20px)`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual confetti particle
function ConfettiParticle({ index }: { index: number }) {
  const colors = [
    "bg-chart-1",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-4",
    "bg-chart-5",
    "bg-primary",
  ];
  
  const color = colors[index % colors.length];
  // Use deterministic values based on index instead of Math.random()
  const left = ((index * 17) % 100);
  const delay = (index * 0.05) % 0.5;
  const duration = 2 + ((index * 0.3) % 1);
  const size = 4 + ((index * 0.5) % 4);

  return (
    <div
      className={cn("absolute rounded-full", color)}
      style={{
        left: `${left}%`,
        top: "-10px",
        width: `${size}px`,
        height: `${size}px`,
        animation: `confetti-fall ${duration}s ease-out ${delay}s forwards`,
      }}
    />
  );
}

// Inline progress indicator (for headers/navbars)
interface InlineProgressProps {
  completedCount: number;
  totalSteps: number;
  className?: string;
}

export function InlineOnboardingProgress({
  completedCount,
  totalSteps,
  className,
}: InlineProgressProps) {
  const percentage = totalSteps > 0 
    ? Math.round((completedCount / totalSteps) * 100) 
    : 0;
  const isComplete = percentage === 100;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-2 w-24 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            isComplete ? "bg-chart-2" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          "text-xs font-medium",
          isComplete ? "text-chart-2" : "text-muted-foreground"
        )}
      >
        {percentage}%
      </span>
    </div>
  );
}

// Add confetti animation to global styles
const confettiStyles = `
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(300px) rotate(720deg);
    opacity: 0;
  }
}
`;

// Inject styles on mount
if (typeof document !== "undefined") {
  const styleId = "onboarding-progress-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = confettiStyles;
    document.head.appendChild(style);
  }
}

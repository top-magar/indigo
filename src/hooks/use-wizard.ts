"use client";

import { useState, useCallback, useMemo } from "react";

interface UseWizardOptions<T> {
  /** Callback fired when transitioning between steps */
  onTransition?: (prevStep: T, nextStep: T) => void;
  /** Callback fired when completing the wizard (after last step) */
  onComplete?: () => void;
}

interface UseWizardReturn<T> {
  /** Current step */
  currentStep: T;
  /** Current step index (0-based) */
  currentIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether on the first step */
  isFirstStep: boolean;
  /** Whether on the last step */
  isLastStep: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Go to next step */
  next: () => void;
  /** Go to previous step */
  prev: () => void;
  /** Go to a specific step */
  goTo: (step: T) => void;
  /** Go to step by index */
  goToIndex: (index: number) => void;
  /** Check if a step has been completed (is before current) */
  isCompleted: (step: T) => boolean;
  /** Check if a step is the current step */
  isCurrent: (step: T) => boolean;
  /** Reset to initial step */
  reset: () => void;
}

/**
 * Hook for managing multi-step wizard/form flows
 * Inspired by Saleor's useWizard pattern
 * 
 * @example
 * ```tsx
 * const steps = ['info', 'pricing', 'inventory', 'review'] as const;
 * type Step = typeof steps[number];
 * 
 * const wizard = useWizard<Step>('info', steps, {
 *   onTransition: (prev, next) => console.log(`${prev} -> ${next}`),
 *   onComplete: () => handleSubmit(),
 * });
 * 
 * return (
 *   <div>
 *     <StepIndicator 
 *       steps={steps} 
 *       current={wizard.currentIndex} 
 *       progress={wizard.progress} 
 *     />
 *     
 *     {wizard.currentStep === 'info' && <InfoStep />}
 *     {wizard.currentStep === 'pricing' && <PricingStep />}
 *     
 *     <div className="flex gap-2">
 *       <Button onClick={wizard.prev} disabled={wizard.isFirstStep}>
 *         Back
 *       </Button>
 *       <Button onClick={wizard.next}>
 *         {wizard.isLastStep ? 'Complete' : 'Next'}
 *       </Button>
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useWizard<T>(
  initial: T,
  steps: readonly T[],
  options?: UseWizardOptions<T>
): UseWizardReturn<T> {
  const initialIndex = steps.indexOf(initial);
  const [stepIndex, setStepIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );

  const goToStep = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= steps.length) {
        console.warn(`Invalid step index: ${nextIndex}`);
        return;
      }

      const prevStep = steps[stepIndex];
      const nextStep = steps[nextIndex];

      if (options?.onTransition) {
        options.onTransition(prevStep, nextStep);
      }

      setStepIndex(nextIndex);
    },
    [stepIndex, steps, options]
  );

  const next = useCallback(() => {
    if (stepIndex === steps.length - 1) {
      // On last step, trigger complete callback
      if (options?.onComplete) {
        options.onComplete();
      }
    } else {
      goToStep(stepIndex + 1);
    }
  }, [stepIndex, steps.length, goToStep, options]);

  const prev = useCallback(() => {
    if (stepIndex > 0) {
      goToStep(stepIndex - 1);
    }
  }, [stepIndex, goToStep]);

  const goTo = useCallback(
    (step: T) => {
      const index = steps.indexOf(step);
      if (index === -1) {
        console.warn(`Step not found: ${step}`);
        return;
      }
      goToStep(index);
    },
    [steps, goToStep]
  );

  const goToIndex = useCallback(
    (index: number) => {
      goToStep(index);
    },
    [goToStep]
  );

  const isCompleted = useCallback(
    (step: T) => {
      const index = steps.indexOf(step);
      return index < stepIndex;
    },
    [steps, stepIndex]
  );

  const isCurrent = useCallback(
    (step: T) => {
      return steps[stepIndex] === step;
    },
    [steps, stepIndex]
  );

  const reset = useCallback(() => {
    setStepIndex(initialIndex >= 0 ? initialIndex : 0);
  }, [initialIndex]);

  const progress = useMemo(() => {
    if (steps.length <= 1) return 100;
    return Math.round((stepIndex / (steps.length - 1)) * 100);
  }, [stepIndex, steps.length]);

  return {
    currentStep: steps[stepIndex],
    currentIndex: stepIndex,
    totalSteps: steps.length,
    isFirstStep: stepIndex === 0,
    isLastStep: stepIndex === steps.length - 1,
    progress,
    next,
    prev,
    goTo,
    goToIndex,
    isCompleted,
    isCurrent,
    reset,
  };
}

export type { UseWizardReturn, UseWizardOptions };

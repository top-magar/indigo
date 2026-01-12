"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { cn } from "@/shared/utils";

const feedbackVariants = cva(
  "inline-flex items-center gap-3",
  {
    variants: {
      size: {
        sm: "gap-2",
        md: "gap-3",
        lg: "gap-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const feedbackButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[var(--ds-gray-400)] dark:border-[var(--ds-gray-700)] bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-900)] text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)] hover:bg-[var(--ds-gray-100)] dark:hover:bg-[var(--ds-gray-800)] hover:text-[var(--ds-gray-900)] dark:hover:text-[var(--ds-gray-200)] hover:border-[var(--ds-gray-500)] dark:hover:border-[var(--ds-gray-600)]",
        positive:
          "border-[var(--ds-green-700)] bg-[var(--ds-green-100)] dark:bg-[var(--ds-green-900)] text-[var(--ds-green-700)] dark:text-[var(--ds-green-400)]",
        negative:
          "border-[var(--ds-red-700)] bg-[var(--ds-red-100)] dark:bg-[var(--ds-red-900)] text-[var(--ds-red-700)] dark:text-[var(--ds-red-400)]",
      },
      size: {
        sm: "size-7 [&_svg]:size-3.5",
        md: "size-8 [&_svg]:size-4",
        lg: "size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const feedbackSuccessVariants = cva(
  "inline-flex items-center gap-2 text-[var(--ds-green-700)] dark:text-[var(--ds-green-400)]",
  {
    variants: {
      size: {
        sm: "text-xs gap-1.5 [&_svg]:size-3.5",
        md: "text-sm gap-2 [&_svg]:size-4",
        lg: "text-base gap-2.5 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface FeedbackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit">,
    VariantProps<typeof feedbackVariants> {
  onFeedback?: (positive: boolean) => void;
  submitted?: boolean;
  prompt?: string;
  successMessage?: string;
}

const FeedbackButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof feedbackButtonVariants> & {
      positive?: boolean;
      selected?: boolean;
    }
>(({ className, variant, size, positive, selected, children, ...props }, ref) => {
  const buttonVariant = selected
    ? positive
      ? "positive"
      : "negative"
    : variant;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(feedbackButtonVariants({ variant: buttonVariant, size }), className)}
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
});
FeedbackButton.displayName = "FeedbackButton";

const FeedbackSuccess = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof feedbackSuccessVariants> & {
      message?: string;
    }
>(({ className, size, message = "Thank you for your feedback", ...props }, ref) => (
  <div
    ref={ref}
    role="status"
    aria-live="polite"
    className={cn(feedbackSuccessVariants({ size }), className)}
    {...props}
  >
    <Check aria-hidden="true" />
    <span>{message}</span>
  </div>
));
FeedbackSuccess.displayName = "FeedbackSuccess";

const FeedbackPrompt = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    size?: "sm" | "md" | "lg";
  }
>(({ className, size = "md", children, ...props }, ref) => {
  const textSizeClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <span
      ref={ref}
      className={cn(
        textSizeClass,
        "text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});
FeedbackPrompt.displayName = "FeedbackPrompt";

const Feedback = React.forwardRef<HTMLDivElement, FeedbackProps>(
  (
    {
      className,
      onFeedback,
      submitted: controlledSubmitted,
      prompt = "Was this helpful?",
      successMessage = "Thank you for your feedback",
      size,
      ...props
    },
    ref
  ) => {
    const [internalSubmitted, setInternalSubmitted] = React.useState(false);
    const [selectedFeedback, setSelectedFeedback] = React.useState<boolean | null>(null);

    const isControlled = controlledSubmitted !== undefined;
    const submitted = isControlled ? controlledSubmitted : internalSubmitted;
    const resolvedSize = size ?? "md";

    const handleFeedback = (positive: boolean) => {
      setSelectedFeedback(positive);
      if (!isControlled) {
        setInternalSubmitted(true);
      }
      onFeedback?.(positive);
    };

    if (submitted) {
      return (
        <div
          ref={ref}
          className={cn(feedbackVariants({ size: resolvedSize }), className)}
          {...props}
        >
          <FeedbackSuccess size={resolvedSize} message={successMessage} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(feedbackVariants({ size: resolvedSize }), className)}
        role="group"
        aria-label="Feedback"
        {...props}
      >
        <FeedbackPrompt size={resolvedSize}>{prompt}</FeedbackPrompt>
        <div className="inline-flex items-center gap-1">
          <FeedbackButton
            size={resolvedSize}
            positive
            selected={selectedFeedback === true}
            onClick={() => handleFeedback(true)}
            aria-label="Yes, this was helpful"
          >
            <ThumbsUp aria-hidden="true" />
          </FeedbackButton>
          <FeedbackButton
            size={resolvedSize}
            positive={false}
            selected={selectedFeedback === false}
            onClick={() => handleFeedback(false)}
            aria-label="No, this was not helpful"
          >
            <ThumbsDown aria-hidden="true" />
          </FeedbackButton>
        </div>
      </div>
    );
  }
);
Feedback.displayName = "Feedback";

export {
  Feedback,
  FeedbackButton,
  FeedbackSuccess,
  FeedbackPrompt,
  feedbackVariants,
  feedbackButtonVariants,
};

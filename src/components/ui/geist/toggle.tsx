"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

// Toggle track variants
const toggleVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2",
  {
    variants: {
      size: {
        small: "h-5 w-9", // 20px x 36px
        medium: "h-6 w-11", // 24px x 44px
        large: "h-7 w-14", // 28px x 56px
      },
      type: {
        default: "",
        success: "",
        warning: "",
        error: "",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      size: "medium",
      type: "default",
      disabled: false,
    },
  }
);

// Toggle thumb variants
const toggleThumbVariants = cva(
  "pointer-events-none absolute rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ease-in-out",
  {
    variants: {
      size: {
        small: "top-0.5 left-0.5 h-4 w-4", // 16px
        medium: "top-0.5 left-0.5 h-5 w-5", // 20px
        large: "top-0.5 left-0.5 h-6 w-6", // 24px
      },
      checked: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { size: "small", checked: true, className: "translate-x-4" }, // 16px
      { size: "medium", checked: true, className: "translate-x-5" }, // 20px
      { size: "large", checked: true, className: "translate-x-7" }, // 28px
      { size: "small", checked: false, className: "translate-x-0" },
      { size: "medium", checked: false, className: "translate-x-0" },
      { size: "large", checked: false, className: "translate-x-0" },
    ],
    defaultVariants: {
      size: "medium",
      checked: false,
    },
  }
);

// Toggle label variants
const toggleLabelVariants = cva(
  "select-none text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]",
  {
    variants: {
      size: {
        small: "text-xs",
        medium: "text-sm",
        large: "text-base",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      size: "medium",
      disabled: false,
    },
  }
);

// Toggle container variants (for label positioning)
const toggleContainerVariants = cva("inline-flex items-center", {
  variants: {
    labelPosition: {
      left: "flex-row-reverse",
      right: "flex-row",
    },
    size: {
      small: "gap-2",
      medium: "gap-2.5",
      large: "gap-3",
    },
  },
  defaultVariants: {
    labelPosition: "right",
    size: "medium",
  },
});

// Type colors for checked state
const typeColors: Record<string, string> = {
  default: "bg-[var(--ds-gray-1000)] dark:bg-[var(--ds-gray-100)]",
  success: "bg-[var(--ds-green-700)]",
  warning: "bg-[var(--ds-amber-700)]",
  error: "bg-[var(--ds-red-700)]",
};

// Unchecked track color
const uncheckedColor = "bg-[var(--ds-gray-alpha-400)]";

export interface ToggleEvent {
  target: {
    checked: boolean;
    name?: string;
    value?: string;
  };
  type: "change";
  nativeEvent: React.MouseEvent | React.KeyboardEvent;
}

export interface ToggleProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "onChange" | "color">,
    VariantProps<typeof toggleVariants> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled mode */
  defaultChecked?: boolean;
  /** Change handler */
  onChange?: (event: ToggleEvent) => void;
  /** Toggle type/color scheme */
  type?: "default" | "success" | "warning" | "error";
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Toggle size */
  size?: "small" | "medium" | "large";
  /** Label text */
  label?: string;
  /** Label position relative to toggle */
  labelPosition?: "left" | "right";
  /** Custom active color (overrides type color) */
  color?: string;
  /** Name attribute for form submission */
  name?: string;
  /** Value attribute for form submission */
  value?: string;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onChange,
      type = "default",
      disabled = false,
      size = "medium",
      label,
      labelPosition = "right",
      color,
      name,
      value,
      ...props
    },
    ref
  ) => {
    // Internal state for uncontrolled mode
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);

    // Determine if controlled or uncontrolled
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    // Handle toggle click
    const handleToggle = React.useCallback(
      (nativeEvent: React.MouseEvent | React.KeyboardEvent) => {
        if (disabled) return;

        const newChecked = !isChecked;

        // Update internal state if uncontrolled
        if (!isControlled) {
          setInternalChecked(newChecked);
        }

        // Call onChange handler
        onChange?.({
          target: {
            checked: newChecked,
            name,
            value,
          },
          type: "change",
          nativeEvent,
        });
      },
      [disabled, isChecked, isControlled, onChange, name, value]
    );

    // Handle click
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      handleToggle(event);
    };

    // Handle keyboard
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleToggle(event);
      }
    };

    // Determine track background color
    const getTrackColor = () => {
      if (!isChecked) return uncheckedColor;
      if (color) return ""; // Custom color handled via style
      return typeColors[type] || typeColors.default;
    };

    // Custom style for custom color
    const trackStyle: React.CSSProperties = isChecked && color ? { backgroundColor: color } : {};

    // Generate unique ID for accessibility
    const toggleId = React.useId();

    const toggleButton = (
      <button
        ref={ref}
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        aria-label={label || "Toggle"}
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          toggleVariants({ size, type, disabled }),
          getTrackColor(),
          className
        )}
        style={trackStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span
          className={cn(toggleThumbVariants({ size, checked: isChecked }))}
          aria-hidden="true"
        />
      </button>
    );

    // If no label, return just the toggle
    if (!label) {
      return toggleButton;
    }

    // With label, wrap in container
    return (
      <div className={cn(toggleContainerVariants({ labelPosition, size }))}>
        {toggleButton}
        <label
          htmlFor={toggleId}
          className={cn(toggleLabelVariants({ size, disabled }))}
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) {
              handleToggle(e as unknown as React.MouseEvent);
            }
          }}
        >
          {label}
        </label>
      </div>
    );
  }
);
Toggle.displayName = "Toggle";

export {
  Toggle,
  toggleVariants,
  toggleThumbVariants,
  toggleLabelVariants,
  toggleContainerVariants,
};

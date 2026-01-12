"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils";

// ============================================================================
// Variants
// ============================================================================

const switchVariants = cva(
  [
    "inline-flex items-center",
    "bg-[var(--ds-background-100)]",
    "shadow-[0_0_0_1px_var(--ds-gray-alpha-400)]",
    "rounded-md",
    "p-1",
  ],
  {
    variants: {
      size: {
        small: "h-8 text-xs",
        medium: "h-10 text-sm",
        large: "h-12 text-sm",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      size: "medium",
      fullWidth: false,
      disabled: false,
    },
  }
);

const switchControlVariants = cva(
  [
    "flex-1",
    "flex items-center justify-center gap-1.5",
    "cursor-pointer",
    "rounded-sm",
    "font-medium",
    "transition-all duration-150 ease-out",
    "select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-1",
  ],
  {
    variants: {
      size: {
        small: "px-2 py-1 min-w-[60px]",
        medium: "px-3 py-1.5 min-w-[72px]",
        large: "px-4 py-2 min-w-[84px]",
      },
      active: {
        true: [
          "bg-[var(--ds-gray-100)]",
          "text-[var(--ds-gray-1000)]",
          "shadow-[0_0_0_1px_var(--ds-gray-alpha-400)]",
        ],
        false: [
          "bg-transparent",
          "text-[var(--ds-gray-900)]",
          "hover:text-[var(--ds-gray-1000)]",
        ],
      },
      disabled: {
        true: "cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      size: "medium",
      active: false,
      disabled: false,
    },
  }
);

// ============================================================================
// Types
// ============================================================================

export type SwitchSize = "small" | "medium" | "large";

export interface SwitchProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    VariantProps<typeof switchVariants> {
  /** Size of the switch */
  size?: SwitchSize;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Controlled value */
  value?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Whether the switch should take full width */
  fullWidth?: boolean;
  /** SwitchControl children */
  children: React.ReactNode;
}

export interface SwitchControlProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, "value"> {
  /** Unique value for this control */
  value: string;
  /** Label text to display */
  label?: string;
  /** Whether this control is disabled */
  disabled?: boolean;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Children (alternative to label) */
  children?: React.ReactNode;
}

// ============================================================================
// Context
// ============================================================================

interface SwitchContextValue {
  selectedValue: string;
  size: SwitchSize;
  disabled: boolean;
  onSelect: (value: string) => void;
}

const SwitchContext = React.createContext<SwitchContextValue | null>(null);

const useSwitchContext = () => {
  const context = React.useContext(SwitchContext);
  if (!context) {
    throw new Error("SwitchControl must be used within a Switch component");
  }
  return context;
};

// ============================================================================
// Components
// ============================================================================

const Switch = React.forwardRef<HTMLDivElement, SwitchProps>(
  (
    {
      className,
      children,
      size = "medium",
      disabled = false,
      defaultValue,
      value: controlledValue,
      onChange,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    // Get first child value as default if not provided
    const getFirstChildValue = React.useCallback(() => {
      const childArray = React.Children.toArray(children);
      const firstChild = childArray[0];
      if (React.isValidElement<SwitchControlProps>(firstChild)) {
        return firstChild.props.value;
      }
      return "";
    }, [children]);

    const [internalValue, setInternalValue] = React.useState<string>(() => {
      return defaultValue ?? getFirstChildValue();
    });

    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : internalValue;

    const handleSelect = React.useCallback(
      (value: string) => {
        if (disabled) return;

        if (!isControlled) {
          setInternalValue(value);
        }

        onChange?.(value);
      },
      [disabled, isControlled, onChange]
    );

    const contextValue = React.useMemo(
      () => ({
        selectedValue,
        size,
        disabled,
        onSelect: handleSelect,
      }),
      [selectedValue, size, disabled, handleSelect]
    );

    return (
      <SwitchContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          aria-disabled={disabled}
          className={cn(switchVariants({ size, fullWidth, disabled }), className)}
          {...props}
        >
          {children}
        </div>
      </SwitchContext.Provider>
    );
  }
);
Switch.displayName = "Switch";

const SwitchControl = React.forwardRef<HTMLButtonElement, SwitchControlProps>(
  (
    {
      className,
      value,
      label,
      disabled: itemDisabled = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const { selectedValue, size, disabled: groupDisabled, onSelect } = useSwitchContext();

    const isActive = selectedValue === value;
    const isDisabled = groupDisabled || itemDisabled;

    const handleClick = () => {
      if (!isDisabled) {
        onSelect(value);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isDisabled) {
          onSelect(value);
        }
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isActive}
        aria-disabled={isDisabled}
        data-state={isActive ? "active" : "inactive"}
        data-disabled={isDisabled ? "" : undefined}
        tabIndex={isDisabled ? -1 : 0}
        className={cn(
          switchControlVariants({ size, active: isActive, disabled: isDisabled }),
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {icon && (
          <span className="shrink-0 [&>svg]:size-4" aria-hidden="true">
            {icon}
          </span>
        )}
        {label || children}
      </button>
    );
  }
);
SwitchControl.displayName = "SwitchControl";

// ============================================================================
// Exports
// ============================================================================

export {
  Switch,
  SwitchControl,
  switchVariants,
  switchControlVariants,
};

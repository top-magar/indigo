"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils";

const choiceboxGroupVariants = cva("flex flex-col", {
  variants: {
    gap: {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    gap: "md",
  },
});

const choiceboxVariants = cva(
  "relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)] focus-visible:ring-offset-2",
  {
    variants: {
      selected: {
        true: "border-[var(--ds-gray-1000)] dark:border-[var(--ds-gray-100)] bg-[var(--ds-gray-100)] dark:bg-[var(--ds-gray-900)]",
        false:
          "border-[var(--ds-gray-400)] dark:border-[var(--ds-gray-700)] bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-950)] hover:border-[var(--ds-gray-600)] dark:hover:border-[var(--ds-gray-500)]",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed hover:border-[var(--ds-gray-400)] dark:hover:border-[var(--ds-gray-700)]",
        false: "",
      },
    },
    defaultVariants: {
      selected: false,
      disabled: false,
    },
  }
);

const choiceboxIndicatorVariants = cva(
  "flex-shrink-0 flex items-center justify-center border-2 transition-all",
  {
    variants: {
      multiple: {
        true: "rounded-sm",
        false: "rounded-full",
      },
      selected: {
        true: "border-[var(--ds-gray-1000)] dark:border-[var(--ds-gray-100)] bg-[var(--ds-gray-1000)] dark:bg-[var(--ds-gray-100)]",
        false: "border-[var(--ds-gray-500)] dark:border-[var(--ds-gray-600)] bg-transparent",
      },
      size: {
        sm: "size-4",
        md: "size-5",
        lg: "size-6",
      },
    },
    defaultVariants: {
      multiple: false,
      selected: false,
      size: "md",
    },
  }
);

export interface ChoiceboxGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof choiceboxGroupVariants> {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  indicatorSize?: "sm" | "md" | "lg";
}

export interface ChoiceboxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  value: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  expandedContent?: React.ReactNode;
}

interface ChoiceboxContextValue {
  selectedValues: string[];
  multiple: boolean;
  disabled: boolean;
  indicatorSize: "sm" | "md" | "lg";
  onSelect: (value: string) => void;
}

const ChoiceboxContext = React.createContext<ChoiceboxContextValue | null>(null);

const useChoiceboxContext = () => {
  const context = React.useContext(ChoiceboxContext);
  if (!context) {
    throw new Error("Choicebox must be used within a ChoiceboxGroup");
  }
  return context;
};


const ChoiceboxGroup = React.forwardRef<HTMLDivElement, ChoiceboxGroupProps>(
  (
    {
      className,
      children,
      value: controlledValue,
      defaultValue,
      onChange,
      multiple = false,
      disabled = false,
      gap,
      indicatorSize = "md",
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<string[]>(() => {
      if (defaultValue) {
        return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      }
      return [];
    });

    const isControlled = controlledValue !== undefined;
    const selectedValues = isControlled
      ? Array.isArray(controlledValue)
        ? controlledValue
        : [controlledValue]
      : internalValue;

    const handleSelect = React.useCallback(
      (value: string) => {
        if (disabled) return;

        let newValues: string[];

        if (multiple) {
          if (selectedValues.includes(value)) {
            newValues = selectedValues.filter((v) => v !== value);
          } else {
            newValues = [...selectedValues, value];
          }
        } else {
          newValues = selectedValues.includes(value) ? [] : [value];
        }

        if (!isControlled) {
          setInternalValue(newValues);
        }

        onChange?.(multiple ? newValues : newValues[0] ?? "");
      },
      [disabled, multiple, selectedValues, isControlled, onChange]
    );

    const contextValue = React.useMemo(
      () => ({
        selectedValues,
        multiple,
        disabled,
        indicatorSize,
        onSelect: handleSelect,
      }),
      [selectedValues, multiple, disabled, indicatorSize, handleSelect]
    );

    return (
      <ChoiceboxContext.Provider value={contextValue}>
        <div
          ref={ref}
          role={multiple ? "group" : "radiogroup"}
          aria-disabled={disabled}
          className={cn(choiceboxGroupVariants({ gap }), className)}
          {...props}
        >
          {children}
        </div>
      </ChoiceboxContext.Provider>
    );
  }
);
ChoiceboxGroup.displayName = "ChoiceboxGroup";

const Choicebox = React.forwardRef<HTMLDivElement, ChoiceboxProps>(
  (
    {
      className,
      value,
      title,
      description,
      disabled: itemDisabled = false,
      badge,
      icon,
      expandedContent,
      ...props
    },
    ref
  ) => {
    const { selectedValues, multiple, disabled: groupDisabled, indicatorSize, onSelect } =
      useChoiceboxContext();

    const isSelected = selectedValues.includes(value);
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
      <div
        ref={ref}
        role={multiple ? "checkbox" : "radio"}
        aria-checked={isSelected}
        aria-disabled={isDisabled}
        tabIndex={isDisabled ? -1 : 0}
        className={cn(
          choiceboxVariants({ selected: isSelected, disabled: isDisabled }),
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Selection indicator */}
        <div
          className={cn(
            choiceboxIndicatorVariants({
              multiple,
              selected: isSelected,
              size: indicatorSize,
            })
          )}
          aria-hidden="true"
        >
          {isSelected && (
            multiple ? (
              <Check
                className={cn(
                  "text-[var(--ds-background-100)] dark:text-[var(--ds-gray-1000)]",
                  indicatorSize === "sm" && "size-2.5",
                  indicatorSize === "md" && "size-3",
                  indicatorSize === "lg" && "size-4"
                )}
              />
            ) : (
              <div
                className={cn(
                  "rounded-full bg-[var(--ds-background-100)] dark:bg-[var(--ds-gray-1000)]",
                  indicatorSize === "sm" && "size-1.5",
                  indicatorSize === "md" && "size-2",
                  indicatorSize === "lg" && "size-2.5"
                )}
              />
            )
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]">
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-[var(--ds-gray-1000)] dark:text-[var(--ds-gray-100)]">
              {title}
            </span>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="mt-1 text-sm text-[var(--ds-gray-700)] dark:text-[var(--ds-gray-400)]">
              {description}
            </p>
          )}
          {/* Expanded content when selected */}
          {isSelected && expandedContent && (
            <div className="mt-3 pt-3 border-t border-[var(--ds-gray-300)] dark:border-[var(--ds-gray-700)]">
              {expandedContent}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Choicebox.displayName = "Choicebox";

export {
  ChoiceboxGroup,
  Choicebox,
  choiceboxGroupVariants,
  choiceboxVariants,
  choiceboxIndicatorVariants,
};

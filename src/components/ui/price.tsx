/**
 * Price Component
 * 
 * Displays formatted prices with currency support.
 * Uses tenant currency from context by default.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */

import { cn } from "@/shared/utils";
import { formatPrice, type CurrencyCode, type FormatPriceOptions } from "@/shared/currency";

export interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Price amount (number or decimal string) */
  amount: number | string;
  /** Currency code (uses tenant currency from context if not provided) */
  currency?: string;
  /** Show currency symbol (default: true) */
  showSymbol?: boolean;
  /** Show currency code instead of symbol */
  showCode?: boolean;
  /** Override decimal places */
  decimals?: number;
  /** Use compact notation for large numbers */
  compact?: boolean;
  /** Original price for showing discounts */
  originalAmount?: number | string;
  /** Show discount percentage badge */
  showDiscountBadge?: boolean;
  /** Size variant */
  size?: "xs" | "sm" | "default" | "lg" | "xl";
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  default: "text-base",
  lg: "text-lg",
  xl: "text-2xl font-bold",
};

/**
 * Price display component
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Price amount={99.99} />
 * 
 * // With specific currency
 * <Price amount={99.99} currency="EUR" />
 * 
 * // With discount
 * <Price amount={79.99} originalAmount={99.99} showDiscountBadge />
 * 
 * // Compact for large numbers
 * <Price amount={1500000} compact />
 * 
 * // Different sizes
 * <Price amount={99.99} size="xl" />
 * ```
 */
export function Price({
  amount,
  currency = "NPR",
  showSymbol = true,
  showCode = false,
  decimals,
  compact = false,
  originalAmount,
  showDiscountBadge = false,
  size = "default",
  className,
  ...props
}: PriceProps) {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const numOriginal = originalAmount
    ? typeof originalAmount === "string"
      ? parseFloat(originalAmount)
      : originalAmount
    : null;

  const hasDiscount = numOriginal !== null && numOriginal > numAmount;
  const discountPercentage = hasDiscount
    ? Math.round(((numOriginal - numAmount) / numOriginal) * 100)
    : 0;

  const formatOptions: FormatPriceOptions = {
    showSymbol,
    showCode,
    compact,
    ...(decimals !== undefined && { decimals }),
  };

  const formattedPrice = formatPrice(numAmount, currency, formatOptions);
  const formattedOriginal = numOriginal
    ? formatPrice(numOriginal, currency, formatOptions)
    : null;

  if (hasDiscount) {
    return (
      <span
        data-slot="price"
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        <span className={cn(sizeClasses[size], "font-semibold text-foreground")}>
          {formattedPrice}
        </span>
        <span
          className={cn(
            sizeClasses[size === "xl" ? "lg" : size === "lg" ? "default" : "sm"],
            "text-muted-foreground line-through"
          )}
        >
          {formattedOriginal}
        </span>
        {showDiscountBadge && discountPercentage > 0 && (
          <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            -{discountPercentage}%
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      data-slot="price"
      className={cn(sizeClasses[size], "font-semibold", className)}
      {...props}
    >
      {formattedPrice}
    </span>
  );
}

/**
 * Price range component
 * 
 * @example
 * ```tsx
 * <PriceRange min={10} max={50} currency="USD" />
 * ```
 */
export interface PriceRangeProps extends Omit<PriceProps, "amount" | "originalAmount"> {
  /** Minimum price */
  min: number | string;
  /** Maximum price */
  max: number | string;
  /** Separator between prices */
  separator?: string;
}

export function PriceRange({
  min,
  max,
  currency = "NPR",
  separator = " - ",
  showSymbol = true,
  size = "default",
  className,
  ...props
}: PriceRangeProps) {
  const numMin = typeof min === "string" ? parseFloat(min) : min;
  const numMax = typeof max === "string" ? parseFloat(max) : max;

  // If min and max are the same, just show one price
  if (numMin === numMax) {
    return (
      <Price
        amount={numMin}
        currency={currency}
        showSymbol={showSymbol}
        size={size}
        className={className}
        {...props}
      />
    );
  }

  const formatOptions: FormatPriceOptions = { showSymbol };
  const formattedMin = formatPrice(numMin, currency, formatOptions);
  const formattedMax = formatPrice(numMax, currency, { ...formatOptions, showSymbol: false });

  return (
    <span
      data-slot="price-range"
      className={cn(sizeClasses[size], "font-semibold", className)}
      {...props}
    >
      {formattedMin}
      {separator}
      {showSymbol ? formatPrice(numMax, currency, formatOptions) : formattedMax}
    </span>
  );
}

/**
 * Free price badge
 * 
 * @example
 * ```tsx
 * {price === 0 ? <FreePrice /> : <Price amount={price} />}
 * ```
 */
export interface FreePriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text to display (default: "Free") */
  text?: string;
  /** Size variant */
  size?: "xs" | "sm" | "default" | "lg" | "xl";
}

export function FreePrice({
  text = "Free",
  size = "default",
  className,
  ...props
}: FreePriceProps) {
  return (
    <span
      data-slot="free-price"
      className={cn(
        sizeClasses[size],
        "font-semibold text-primary",
        className
      )}
      {...props}
    >
      {text}
    </span>
  );
}

/**
 * Smart price component that handles zero prices
 * 
 * @example
 * ```tsx
 * <SmartPrice amount={product.price} currency={tenant.currency} />
 * ```
 */
export interface SmartPriceProps extends PriceProps {
  /** Text to show for free items */
  freeText?: string;
}

export function SmartPrice({
  amount,
  freeText = "Free",
  ...props
}: SmartPriceProps) {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (numAmount === 0 || isNaN(numAmount)) {
    return <FreePrice text={freeText} size={props.size} className={props.className} />;
  }

  return <Price amount={amount} {...props} />;
}

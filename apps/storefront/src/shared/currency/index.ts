/**
 * Currency Service
 * 
 * Provides utilities for formatting, parsing, and converting currencies.
 * All prices in the database are stored as decimal strings - this service
 * handles display-only formatting and conversion.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */

import {
  currencies,
  type CurrencyCode,
  type CurrencyConfig,
  isValidCurrency,
  getCurrencyConfig,
  defaultCurrency,
  currencyToLocale,
} from './config';

export * from './config';

/**
 * Format options for price display
 */
export interface FormatPriceOptions {
  /** Show currency symbol (default: true) */
  showSymbol?: boolean;
  /** Show currency code instead of symbol (default: false) */
  showCode?: boolean;
  /** Override decimal places */
  decimals?: number;
  /** Locale for formatting (uses currency default if not specified) */
  locale?: string;
  /** Compact notation for large numbers (e.g., 1.2K, 1.5M) */
  compact?: boolean;
}

/**
 * Format a price for display
 * 
 * @param amount - The amount to format (number or string)
 * @param currency - Currency code (default: NPR)
 * @param options - Formatting options
 * @returns Formatted price string
 * 
 * @example
 * formatPrice(1234.56, 'USD') // "$1,234.56"
 * formatPrice(1234.56, 'EUR') // "1.234,56 €"
 * formatPrice(1234, 'JPY') // "¥1,234"
 * formatPrice(1234.56, 'USD', { showSymbol: false }) // "1,234.56"
 */
export function formatPrice(
  amount: number | string,
  currency: string = defaultCurrency,
  options: FormatPriceOptions = {}
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return formatPrice(0, currency, options);
  }

  const currencyCode = isValidCurrency(currency) ? currency : defaultCurrency;
  const config = currencies[currencyCode];
  const locale = options.locale || config.defaultLocale;
  
  const {
    showSymbol = true,
    showCode = false,
    decimals = config.decimals,
    compact = false,
  } = options;

  try {
    const formatOptions: Intl.NumberFormatOptions = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    };

    if (compact) {
      formatOptions.notation = 'compact';
      formatOptions.compactDisplay = 'short';
    }

    if (showSymbol || showCode) {
      formatOptions.style = 'currency';
      formatOptions.currency = currencyCode;
      if (showCode) {
        formatOptions.currencyDisplay = 'code';
      }
    }

    return new Intl.NumberFormat(locale, formatOptions).format(numAmount);
  } catch {
    // Fallback for unsupported locales
    const formatted = numAmount.toFixed(decimals);
    if (showSymbol) {
      return config.symbolPosition === 'before'
        ? `${config.symbol}${formatted}`
        : `${formatted} ${config.symbol}`;
    }
    return formatted;
  }
}

/**
 * Parse a price string to a number
 * 
 * @param value - The string value to parse
 * @param currency - Currency code for parsing rules
 * @returns Parsed number or NaN if invalid
 * 
 * @example
 * parsePrice("$1,234.56", "USD") // 1234.56
 * parsePrice("1.234,56 €", "EUR") // 1234.56
 * parsePrice("¥1,234", "JPY") // 1234
 */
export function parsePrice(value: string, currency: string = defaultCurrency): number {
  if (!value || typeof value !== 'string') {
    return NaN;
  }

  const currencyCode = isValidCurrency(currency) ? currency : defaultCurrency;
  const config = currencies[currencyCode];

  // Remove currency symbols and whitespace
  let cleaned = value
    .replace(/[^\d.,\-]/g, '')
    .trim();

  // Handle different decimal separators
  if (config.decimalSeparator === ',') {
    // European format: 1.234,56 -> 1234.56
    cleaned = cleaned
      .replace(/\./g, '') // Remove thousands separator
      .replace(',', '.'); // Convert decimal separator
  } else {
    // US format: 1,234.56 -> 1234.56
    cleaned = cleaned.replace(/,/g, ''); // Remove thousands separator
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? NaN : parsed;
}

/**
 * Convert an amount between currencies
 * 
 * @param amount - The amount to convert
 * @param from - Source currency code
 * @param to - Target currency code
 * @param rates - Exchange rates object (rates relative to a base currency)
 * @returns Converted amount
 * 
 * @example
 * const rates = { USD: 1, EUR: 0.85, GBP: 0.73 };
 * convertCurrency(100, 'USD', 'EUR', rates) // 85
 */
export function convertCurrency(
  amount: number | string,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 0;
  }

  if (from === to) {
    return numAmount;
  }

  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    console.warn(`Missing exchange rate for ${from} or ${to}`);
    return numAmount;
  }

  // Convert to base currency, then to target currency
  const inBaseCurrency = numAmount / fromRate;
  const converted = inBaseCurrency * toRate;

  // Round to appropriate decimal places
  const toConfig = getCurrencyConfig(to);
  const decimals = toConfig?.decimals ?? 2;
  
  return Math.round(converted * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Get the symbol for a currency
 * 
 * @param currency - Currency code
 * @returns Currency symbol
 * 
 * @example
 * getCurrencySymbol('USD') // "$"
 * getCurrencySymbol('EUR') // "€"
 */
export function getCurrencySymbol(currency: string): string {
  const config = getCurrencyConfig(currency);
  return config?.symbol ?? currency;
}

/**
 * Get the number of decimal places for a currency
 * 
 * @param currency - Currency code
 * @returns Number of decimal places
 * 
 * @example
 * getDecimalPlaces('USD') // 2
 * getDecimalPlaces('JPY') // 0
 */
export function getDecimalPlaces(currency: string): number {
  const config = getCurrencyConfig(currency);
  return config?.decimals ?? 2;
}

/**
 * Get the default locale for a currency
 * 
 * @param currency - Currency code
 * @returns Locale string
 */
export function getCurrencyLocale(currency: string): string {
  if (isValidCurrency(currency)) {
    return currencyToLocale[currency];
  }
  return 'en-US';
}

/**
 * Format a price range
 * 
 * @param min - Minimum price
 * @param max - Maximum price
 * @param currency - Currency code
 * @returns Formatted price range string
 * 
 * @example
 * formatPriceRange(10, 50, 'USD') // "$10 - $50"
 * formatPriceRange(10, 10, 'USD') // "$10"
 */
export function formatPriceRange(
  min: number | string,
  max: number | string,
  currency: string = defaultCurrency
): string {
  const minNum = typeof min === 'string' ? parseFloat(min) : min;
  const maxNum = typeof max === 'string' ? parseFloat(max) : max;

  if (minNum === maxNum || isNaN(maxNum)) {
    return formatPrice(minNum, currency);
  }

  return `${formatPrice(minNum, currency)} - ${formatPrice(maxNum, currency)}`;
}

/**
 * Format a price with discount
 * 
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @param currency - Currency code
 * @returns Object with formatted prices and discount percentage
 */
export function formatPriceWithDiscount(
  originalPrice: number | string,
  discountedPrice: number | string,
  currency: string = defaultCurrency
): {
  original: string;
  discounted: string;
  percentage: number;
  hasDiscount: boolean;
} {
  const original = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
  const discounted = typeof discountedPrice === 'string' ? parseFloat(discountedPrice) : discountedPrice;

  const hasDiscount = discounted < original && discounted > 0;
  const percentage = hasDiscount ? Math.round(((original - discounted) / original) * 100) : 0;

  return {
    original: formatPrice(original, currency),
    discounted: formatPrice(discounted, currency),
    percentage,
    hasDiscount,
  };
}

/**
 * Round a price to the currency's decimal places
 * 
 * @param amount - Amount to round
 * @param currency - Currency code
 * @returns Rounded amount
 */
export function roundPrice(amount: number | string, currency: string = defaultCurrency): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return 0;
  }

  const decimals = getDecimalPlaces(currency);
  const multiplier = Math.pow(10, decimals);
  
  return Math.round(numAmount * multiplier) / multiplier;
}

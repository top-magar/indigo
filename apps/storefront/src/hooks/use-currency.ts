"use client";

/**
 * Currency Hooks
 * 
 * React hooks for currency formatting and conversion.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  formatPrice,
  convertCurrency,
  getCurrencySymbol,
  getDecimalPlaces,
  type CurrencyCode,
  type FormatPriceOptions,
  defaultCurrency,
  isValidCurrency,
} from "@/shared/currency";
import {
  useCurrencyContextSafe,
  type CurrencyContextValue,
} from '@/shared/currency/context';
import {
  getExchangeRates,
  fallbackRates,
} from '@/shared/currency/exchange-rates';

/**
 * Hook to get the current currency from context or fallback
 * 
 * @param fallback - Fallback currency if not in context
 * @returns Currency code
 * 
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const currency = useCurrency();
 *   return <span>{formatPrice(product.price, currency)}</span>;
 * }
 * ```
 */
export function useCurrency(fallback?: string): CurrencyCode {
  const ctx = useCurrencyContextSafe();
  
  if (ctx) {
    return ctx.currency;
  }
  
  if (fallback && isValidCurrency(fallback)) {
    return fallback as CurrencyCode;
  }
  
  return defaultCurrency;
}

/**
 * Hook to format a price with the current currency
 * 
 * @param amount - Amount to format
 * @param options - Formatting options
 * @returns Formatted price string
 * 
 * @example
 * ```tsx
 * function ProductPrice({ price }) {
 *   const formattedPrice = useFormatPrice(price);
 *   return <span className="font-bold">{formattedPrice}</span>;
 * }
 * ```
 */
export function useFormatPrice(
  amount: number | string,
  options?: FormatPriceOptions
): string {
  const currency = useCurrency();
  
  return useMemo(() => {
    return formatPrice(amount, currency, options);
  }, [amount, currency, options]);
}

/**
 * Hook to get a price formatter function
 * 
 * @param currency - Optional currency override
 * @returns Formatter function
 * 
 * @example
 * ```tsx
 * function OrderSummary({ items }) {
 *   const format = usePriceFormatter();
 *   
 *   return (
 *     <ul>
 *       {items.map(item => (
 *         <li key={item.id}>
 *           {item.name}: {format(item.price)}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function usePriceFormatter(currency?: string) {
  const contextCurrency = useCurrency();
  const currencyToUse = currency || contextCurrency;
  
  return useCallback(
    (amount: number | string, options?: FormatPriceOptions) => {
      return formatPrice(amount, currencyToUse, options);
    },
    [currencyToUse]
  );
}

/**
 * Currency converter hook return type
 */
export interface UseCurrencyConverterReturn {
  /** Convert an amount between currencies */
  convert: (amount: number | string, from: CurrencyCode, to: CurrencyCode) => number;
  /** Current exchange rates */
  rates: Record<string, number>;
  /** Whether rates are loading */
  isLoading: boolean;
  /** Error if rates failed to load */
  error: Error | null;
  /** Refresh exchange rates */
  refresh: () => Promise<void>;
}

/**
 * Hook for currency conversion
 * 
 * @returns Currency converter utilities
 * 
 * @example
 * ```tsx
 * function CurrencyConverter() {
 *   const { convert, rates, isLoading } = useCurrencyConverter();
 *   const [amount, setAmount] = useState(100);
 *   const [from, setFrom] = useState<CurrencyCode>('USD');
 *   const [to, setTo] = useState<CurrencyCode>('EUR');
 *   
 *   const converted = convert(amount, from, to);
 *   
 *   return (
 *     <div>
 *       <input value={amount} onChange={e => setAmount(Number(e.target.value))} />
 *       <span>{formatPrice(converted, to)}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrencyConverter(): UseCurrencyConverterReturn {
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedRates = await getExchangeRates('USD');
      setRates(fetchedRates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rates'));
      // Keep using fallback rates
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const convert = useCallback(
    (amount: number | string, from: CurrencyCode, to: CurrencyCode) => {
      return convertCurrency(amount, from, to, rates);
    },
    [rates]
  );

  return {
    convert,
    rates,
    isLoading,
    error,
    refresh: fetchRates,
  };
}

/**
 * Hook to get currency metadata
 * 
 * @param currency - Optional currency override
 * @returns Currency metadata
 * 
 * @example
 * ```tsx
 * function CurrencyInfo() {
 *   const { symbol, decimals, code } = useCurrencyInfo();
 *   
 *   return (
 *     <div>
 *       <span>Symbol: {symbol}</span>
 *       <span>Decimals: {decimals}</span>
 *       <span>Code: {code}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrencyInfo(currency?: string) {
  const contextCurrency = useCurrency();
  const currencyToUse = currency || contextCurrency;
  
  return useMemo(() => ({
    code: currencyToUse,
    symbol: getCurrencySymbol(currencyToUse),
    decimals: getDecimalPlaces(currencyToUse),
  }), [currencyToUse]);
}

/**
 * Hook that provides all currency context values with fallbacks
 * 
 * @param fallbackCurrency - Fallback currency if not in context
 * @returns Currency context value or fallback
 */
export function useCurrencyWithFallback(
  fallbackCurrency: string = defaultCurrency
): CurrencyContextValue {
  const ctx = useCurrencyContextSafe();
  const currency = useCurrency(fallbackCurrency);
  
  return useMemo(() => {
    if (ctx) return ctx;
    
    return {
      currency,
      config: {
        code: currency,
        symbol: getCurrencySymbol(currency),
        name: currency,
        decimals: getDecimalPlaces(currency),
        symbolPosition: 'before' as const,
        thousandsSeparator: ',',
        decimalSeparator: '.',
        defaultLocale: 'en-US',
      },
      format: (amount, options) => formatPrice(amount, currency, options),
      symbol: getCurrencySymbol(currency),
      decimals: getDecimalPlaces(currency),
      locale: 'en-US',
    };
  }, [ctx, currency]);
}

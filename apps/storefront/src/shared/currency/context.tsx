"use client";

/**
 * Currency Context
 * 
 * Provides tenant currency settings to components throughout the application.
 * Uses React Context for efficient prop drilling avoidance.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  type CurrencyCode,
  type CurrencyConfig,
  currencies,
  defaultCurrency,
  isValidCurrency,
} from './config';
import { formatPrice, type FormatPriceOptions } from './index';

/**
 * Currency context value
 */
export interface CurrencyContextValue {
  /** Current currency code */
  currency: CurrencyCode;
  /** Currency configuration */
  config: CurrencyConfig;
  /** Format a price with the current currency */
  format: (amount: number | string, options?: FormatPriceOptions) => string;
  /** Currency symbol */
  symbol: string;
  /** Number of decimal places */
  decimals: number;
  /** Default locale for the currency */
  locale: string;
}

/**
 * Currency context
 */
const CurrencyContext = createContext<CurrencyContextValue | null>(null);

/**
 * Currency provider props
 */
export interface CurrencyProviderProps {
  /** Currency code to use */
  currency?: string;
  /** Child components */
  children: ReactNode;
}

/**
 * Currency Provider
 * 
 * Wraps components to provide currency context.
 * 
 * @example
 * ```tsx
 * // In layout or page
 * <CurrencyProvider currency={tenant.currency}>
 *   <ProductList />
 * </CurrencyProvider>
 * 
 * // In component
 * function ProductPrice({ price }) {
 *   const { format } = useCurrencyContext();
 *   return <span>{format(price)}</span>;
 * }
 * ```
 */
export function CurrencyProvider({ currency, children }: CurrencyProviderProps) {
  const value = useMemo<CurrencyContextValue>(() => {
    const currencyCode = (isValidCurrency(currency || '') ? currency : defaultCurrency) as CurrencyCode;
    const config = currencies[currencyCode];

    return {
      currency: currencyCode,
      config,
      format: (amount, options) => formatPrice(amount, currencyCode, options),
      symbol: config.symbol,
      decimals: config.decimals,
      locale: config.defaultLocale,
    };
  }, [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to access currency context
 * 
 * @throws Error if used outside CurrencyProvider
 * 
 * @example
 * ```tsx
 * function PriceDisplay({ amount }) {
 *   const { format, symbol, currency } = useCurrencyContext();
 *   
 *   return (
 *     <div>
 *       <span>{format(amount)}</span>
 *       <span className="text-muted-foreground">({currency})</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrencyContext(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  
  return context;
}

/**
 * Hook to safely access currency context (returns null if not in provider)
 * 
 * Useful for components that may be used both inside and outside a CurrencyProvider.
 * 
 * @example
 * ```tsx
 * function PriceDisplay({ amount, currency }) {
 *   const ctx = useCurrencyContextSafe();
 *   const currencyToUse = ctx?.currency || currency || 'USD';
 *   
 *   return <span>{formatPrice(amount, currencyToUse)}</span>;
 * }
 * ```
 */
export function useCurrencyContextSafe(): CurrencyContextValue | null {
  return useContext(CurrencyContext);
}

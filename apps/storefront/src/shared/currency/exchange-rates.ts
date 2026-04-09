/**
 * Exchange Rate Service
 * 
 * Provides exchange rate fetching with caching and fallback support.
 * Uses an in-memory cache with 1-hour TTL.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */

import { type CurrencyCode, supportedCurrencies } from './config';

/**
 * Exchange rate provider interface
 */
export interface ExchangeRateProvider {
  /** Provider name */
  name: string;
  /** Fetch rates from the provider */
  fetchRates(baseCurrency: CurrencyCode): Promise<Record<string, number>>;
}

/**
 * Cached exchange rates
 */
interface CachedRates {
  rates: Record<string, number>;
  baseCurrency: CurrencyCode;
  timestamp: number;
}

/**
 * Cache TTL in milliseconds (1 hour)
 */
const CACHE_TTL = 60 * 60 * 1000;

/**
 * In-memory cache for exchange rates
 */
let ratesCache: CachedRates | null = null;

/**
 * Static fallback rates (relative to USD)
 * These are approximate rates and should only be used as a last resort
 * Updated: 2024
 */
export const fallbackRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  NPR: 133.50,
  AUD: 1.53,
  CAD: 1.36,
  BRL: 4.97,
};

/**
 * Check if cached rates are still valid
 */
function isCacheValid(): boolean {
  if (!ratesCache) return false;
  return Date.now() - ratesCache.timestamp < CACHE_TTL;
}

/**
 * Get cached rates if valid
 */
export function getCachedRates(): Record<string, number> | null {
  if (isCacheValid() && ratesCache) {
    return ratesCache.rates;
  }
  return null;
}

/**
 * Set rates in cache
 */
export function setCachedRates(rates: Record<string, number>, baseCurrency: CurrencyCode): void {
  ratesCache = {
    rates,
    baseCurrency,
    timestamp: Date.now(),
  };
}

/**
 * Clear the rates cache
 */
export function clearRatesCache(): void {
  ratesCache = null;
}

/**
 * Get the age of cached rates in minutes
 */
export function getCacheAge(): number | null {
  if (!ratesCache) return null;
  return Math.floor((Date.now() - ratesCache.timestamp) / (60 * 1000));
}

/**
 * Convert rates to a different base currency
 */
export function rebaseRates(
  rates: Record<string, number>,
  fromBase: CurrencyCode,
  toBase: CurrencyCode
): Record<string, number> {
  if (fromBase === toBase) return rates;

  const conversionFactor = rates[toBase];
  if (!conversionFactor) return rates;

  const rebased: Record<string, number> = {};
  for (const [currency, rate] of Object.entries(rates)) {
    rebased[currency] = rate / conversionFactor;
  }
  rebased[toBase] = 1;

  return rebased;
}

/**
 * Fetch exchange rates with caching and fallback
 * 
 * @param baseCurrency - Base currency for rates (default: USD)
 * @param forceRefresh - Force refresh even if cache is valid
 * @returns Exchange rates relative to base currency
 * 
 * @example
 * const rates = await getExchangeRates('USD');
 * // { USD: 1, EUR: 0.92, GBP: 0.79, ... }
 */
export async function getExchangeRates(
  baseCurrency: CurrencyCode = 'USD',
  forceRefresh = false
): Promise<Record<string, number>> {
  // Return cached rates if valid and not forcing refresh
  if (!forceRefresh && isCacheValid() && ratesCache) {
    // Rebase if needed
    if (ratesCache.baseCurrency !== baseCurrency) {
      return rebaseRates(ratesCache.rates, ratesCache.baseCurrency, baseCurrency);
    }
    return ratesCache.rates;
  }

  try {
    // Try to fetch from API
    const rates = await fetchRatesFromAPI(baseCurrency);
    setCachedRates(rates, baseCurrency);
    return rates;
  } catch (error) {
    console.warn('Failed to fetch exchange rates, using fallback:', error);
    
    // Use fallback rates, rebased if needed
    if (baseCurrency !== 'USD') {
      return rebaseRates(fallbackRates, 'USD', baseCurrency);
    }
    return fallbackRates;
  }
}

/**
 * Fetch rates from external API
 * 
 * This is a placeholder implementation. In production, you would:
 * 1. Use a real exchange rate API (e.g., Open Exchange Rates, Fixer.io)
 * 2. Store API keys securely in environment variables
 * 3. Handle rate limiting and errors appropriately
 */
async function fetchRatesFromAPI(baseCurrency: CurrencyCode): Promise<Record<string, number>> {
  // Check for API configuration
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const apiUrl = process.env.EXCHANGE_RATE_API_URL;

  if (!apiKey || !apiUrl) {
    // No API configured, use fallback rates
    console.info('Exchange rate API not configured, using fallback rates');
    if (baseCurrency !== 'USD') {
      return rebaseRates(fallbackRates, 'USD', baseCurrency);
    }
    return fallbackRates;
  }

  // Fetch from API
  const url = `${apiUrl}?base=${baseCurrency}&symbols=${supportedCurrencies.join(',')}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    next: { revalidate: CACHE_TTL / 1000 }, // Next.js cache
  });

  if (!response.ok) {
    throw new Error(`Exchange rate API error: ${response.status}`);
  }

  const data = await response.json();
  return data.rates || fallbackRates;
}

/**
 * Get exchange rate between two currencies
 * 
 * @param from - Source currency
 * @param to - Target currency
 * @param rates - Optional pre-fetched rates
 * @returns Exchange rate
 * 
 * @example
 * const rate = await getExchangeRate('USD', 'EUR');
 * // 0.92
 */
export async function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode,
  rates?: Record<string, number>
): Promise<number> {
  if (from === to) return 1;

  const exchangeRates = rates || await getExchangeRates('USD');
  
  const fromRate = exchangeRates[from] || 1;
  const toRate = exchangeRates[to] || 1;

  // Convert: amount in 'from' -> USD -> 'to'
  return toRate / fromRate;
}

/**
 * Create a custom exchange rate provider
 */
export function createExchangeRateProvider(
  name: string,
  fetchFn: (baseCurrency: CurrencyCode) => Promise<Record<string, number>>
): ExchangeRateProvider {
  return {
    name,
    fetchRates: fetchFn,
  };
}

/**
 * Exchange rate service singleton
 */
export const exchangeRateService = {
  getExchangeRates,
  getExchangeRate,
  getCachedRates,
  clearRatesCache,
  getCacheAge,
  fallbackRates,
};

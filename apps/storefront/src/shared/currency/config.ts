/**
 * Currency Configuration
 * 
 * Defines supported currencies with symbols, decimal places, and formatting options.
 * Used throughout the platform for consistent currency display.
 * 
 * @see SYSTEM-ARCHITECTURE.md Section 5.2.1
 */

export interface CurrencyConfig {
  /** ISO 4217 currency code */
  code: string;
  /** Currency symbol (e.g., $, €, £) */
  symbol: string;
  /** Full currency name */
  name: string;
  /** Number of decimal places */
  decimals: number;
  /** Symbol position: 'before' or 'after' the amount */
  symbolPosition: 'before' | 'after';
  /** Thousands separator */
  thousandsSeparator: string;
  /** Decimal separator */
  decimalSeparator: string;
  /** Default locale for formatting */
  defaultLocale: string;
}

/**
 * Supported currencies configuration
 */
export const currencies: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    symbolPosition: 'after',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    defaultLocale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'en-GB',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    decimals: 0,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'ja-JP',
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'zh-CN',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'en-IN',
  },
  NPR: {
    code: 'NPR',
    symbol: 'रू',
    name: 'Nepalese Rupee',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'ne-NP',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'en-AU',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    defaultLocale: 'en-CA',
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    decimals: 2,
    symbolPosition: 'before',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    defaultLocale: 'pt-BR',
  },
} as const;

/**
 * Currency code type
 */
export type CurrencyCode = keyof typeof currencies;

/**
 * List of all supported currency codes
 */
export const supportedCurrencies = Object.keys(currencies) as CurrencyCode[];

/**
 * Default currency for the platform
 */
export const defaultCurrency: CurrencyCode = 'NPR';

/**
 * Locale to currency mapping
 */
export const localeToCurrency: Record<string, CurrencyCode> = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'en-AU': 'AUD',
  'en-CA': 'CAD',
  'en-IN': 'INR',
  'de-DE': 'EUR',
  'fr-FR': 'EUR',
  'es-ES': 'EUR',
  'it-IT': 'EUR',
  'ja-JP': 'JPY',
  'zh-CN': 'CNY',
  'pt-BR': 'BRL',
  'ne-NP': 'NPR',
};

/**
 * Currency to locale mapping (reverse lookup)
 */
export const currencyToLocale: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
  INR: 'en-IN',
  NPR: 'ne-NP',
  AUD: 'en-AU',
  CAD: 'en-CA',
  BRL: 'pt-BR',
};

/**
 * Check if a currency code is valid
 */
export function isValidCurrency(code: string): code is CurrencyCode {
  return code in currencies;
}

/**
 * Get currency configuration by code
 */
export function getCurrencyConfig(code: string): CurrencyConfig | undefined {
  return currencies[code as CurrencyCode];
}

/**
 * Currency options for select dropdowns
 */
export const currencyOptions = supportedCurrencies.map((code) => ({
  value: code,
  label: `${currencies[code].name} (${currencies[code].symbol})`,
  symbol: currencies[code].symbol,
}));

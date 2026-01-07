/**
 * Internationalization Configuration
 * 
 * Defines supported locales and default settings for the platform.
 * Each tenant can override the default locale in their settings.
 * 
 * @see https://nextjs.org/docs/app/guides/internationalization
 */

export const i18nConfig = {
  /** Default locale for the platform */
  defaultLocale: 'en' as const,
  
  /** All supported locales */
  locales: ['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'] as const,
  
  /** Locale display names */
  localeNames: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    pt: 'Português',
    ja: '日本語',
    zh: '中文',
  } as const,
  
  /** Locale to currency mapping (defaults) */
  localeCurrency: {
    en: 'USD',
    es: 'EUR',
    fr: 'EUR',
    de: 'EUR',
    pt: 'BRL',
    ja: 'JPY',
    zh: 'CNY',
  } as const,
} as const

export type Locale = (typeof i18nConfig.locales)[number]

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return i18nConfig.locales.includes(locale as Locale)
}

/**
 * Get locale from Accept-Language header
 */
export function getLocaleFromHeaders(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return i18nConfig.defaultLocale
  
  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, qValue] = lang.trim().split(';q=')
      return {
        code: code.split('-')[0].toLowerCase(), // Get base language code
        quality: qValue ? parseFloat(qValue) : 1,
      }
    })
    .sort((a, b) => b.quality - a.quality)
  
  // Find first matching supported locale
  for (const { code } of languages) {
    if (isValidLocale(code)) {
      return code
    }
  }
  
  return i18nConfig.defaultLocale
}

/**
 * Format number for locale
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format currency for locale
 */
export function formatCurrency(
  value: number, 
  locale: Locale, 
  currency?: string
): string {
  const currencyCode = currency || i18nConfig.localeCurrency[locale]
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value)
}

/**
 * Format date for locale
 */
export function formatDate(
  date: Date | string, 
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

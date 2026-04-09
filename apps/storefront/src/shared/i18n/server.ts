/**
 * Server-side i18n utilities
 * 
 * Use these in Server Components to get the current locale
 * and load dictionaries.
 */
import 'server-only'
import { headers, cookies } from 'next/headers'
import { i18nConfig, type Locale, isValidLocale, getLocaleFromHeaders } from './config'
import { getDictionary } from './dictionaries'

/**
 * Get the current locale from request headers/cookies
 * Use in Server Components
 * 
 * @example
 * ```tsx
 * import { getLocale, getDictionary } from '@/shared/i18n/server'
 * 
 * export default async function Page() {
 *   const locale = await getLocale()
 *   const dict = await getDictionary(locale)
 *   return <h1>{dict.nav.home}</h1>
 * }
 * ```
 */
export async function getLocale(): Promise<Locale> {
  // Try cookie first (user preference)
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }
  
  // Try x-locale header set by middleware
  const headersList = await headers()
  const headerLocale = headersList.get('x-locale')
  if (headerLocale && isValidLocale(headerLocale)) {
    return headerLocale
  }
  
  // Fall back to Accept-Language
  const acceptLanguage = headersList.get('accept-language')
  return getLocaleFromHeaders(acceptLanguage)
}

/**
 * Get dictionary for the current request locale
 * Convenience function that combines getLocale and getDictionary
 * 
 * @example
 * ```tsx
 * import { getRequestDictionary } from '@/shared/i18n/server'
 * 
 * export default async function Page() {
 *   const dict = await getRequestDictionary()
 *   return <h1>{dict.nav.home}</h1>
 * }
 * ```
 */
export async function getRequestDictionary() {
  const locale = await getLocale()
  return getDictionary(locale)
}

// Re-export for convenience
export { getDictionary } from './dictionaries'
export type { Dictionary } from './dictionaries'

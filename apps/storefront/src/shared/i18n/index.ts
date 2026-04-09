/**
 * Internationalization Module
 * 
 * Provides i18n utilities for the multi-tenant e-commerce platform.
 * 
 * Usage in Server Components:
 * ```tsx
 * import { getDictionary } from "@/shared/i18n"
 * 
 * export default async function Page({ params }: { params: { lang: string } }) {
 *   const dict = await getDictionary(params.lang as Locale)
 *   return <h1>{dict.nav.home}</h1>
 * }
 * ```
 * 
 * Usage for formatting:
 * ```tsx
 * import { formatCurrency, formatDate } from "@/shared/i18n"
 * 
 * formatCurrency(99.99, 'en', 'USD') // "$99.99"
 * formatDate(new Date(), 'es') // "29 dic 2025"
 * ```
 * 
 * @see https://nextjs.org/docs/app/guides/internationalization
 */

export {
  i18nConfig,
  type Locale,
  isValidLocale,
  getLocaleFromHeaders,
  formatNumber,
  formatCurrency,
  formatDate,
} from './config'

export { getDictionary, type Dictionary } from './dictionaries'

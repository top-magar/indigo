"use client"

import { useState, useEffect, useCallback } from 'react'
import { i18nConfig, type Locale, isValidLocale } from '@/shared/i18n/config'

const LOCALE_COOKIE = 'NEXT_LOCALE'

/**
 * Get locale from cookie on client side
 */
function getLocaleFromCookie(): Locale {
  if (typeof document === 'undefined') return i18nConfig.defaultLocale
  
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === LOCALE_COOKIE && isValidLocale(value)) {
      return value
    }
  }
  return i18nConfig.defaultLocale
}

/**
 * Set locale cookie
 */
function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return
  
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  document.cookie = `${LOCALE_COOKIE}=${locale};max-age=${maxAge};path=/;samesite=lax`
}

/**
 * Hook for accessing and changing the current locale
 * 
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { locale, setLocale, locales } = useLocale()
 *   
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
 *       {locales.map(l => (
 *         <option key={l} value={l}>{l}</option>
 *       ))}
 *     </select>
 *   )
 * }
 * ```
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(i18nConfig.defaultLocale)
  
  // Initialize from cookie on mount
  useEffect(() => {
    setLocaleState(getLocaleFromCookie())
  }, [])
  
  // Change locale and persist to cookie
  const setLocale = useCallback((newLocale: Locale) => {
    if (!isValidLocale(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`)
      return
    }
    
    setLocaleCookie(newLocale)
    setLocaleState(newLocale)
    
    // Reload page to apply new locale
    window.location.reload()
  }, [])
  
  return {
    locale,
    setLocale,
    locales: i18nConfig.locales,
    localeNames: i18nConfig.localeNames,
    defaultLocale: i18nConfig.defaultLocale,
  }
}

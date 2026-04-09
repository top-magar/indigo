/**
 * Dictionary Loading System
 * 
 * Loads translation dictionaries for the requested locale.
 * Dictionaries are loaded server-side only to keep client bundle small.
 * 
 * @see https://nextjs.org/docs/app/guides/internationalization#localization
 */
import 'server-only'
import type { Locale } from './config'

/**
 * Dictionary type definition
 * Add new keys here as translations are added
 */
export interface Dictionary {
  // Common
  common: {
    loading: string
    error: string
    retry: string
    cancel: string
    save: string
    delete: string
    edit: string
    add: string
    search: string
    filter: string
    sort: string
    noResults: string
    viewAll: string
    backTo: string
  }
  
  // Navigation
  nav: {
    home: string
    products: string
    categories: string
    cart: string
    checkout: string
    account: string
    orders: string
    settings: string
  }
  
  // Store
  store: {
    addToCart: string
    buyNow: string
    outOfStock: string
    inStock: string
    quantity: string
    price: string
    total: string
    subtotal: string
    shipping: string
    tax: string
    discount: string
    freeShipping: string
    relatedProducts: string
    productDetails: string
    reviews: string
    writeReview: string
  }
  
  // Cart
  cart: {
    title: string
    empty: string
    continueShopping: string
    proceedToCheckout: string
    removeItem: string
    updateQuantity: string
    itemsInCart: string
  }
  
  // Checkout
  checkout: {
    title: string
    shippingInfo: string
    paymentInfo: string
    orderSummary: string
    placeOrder: string
    processing: string
    email: string
    fullName: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    phone: string
  }
  
  // Auth
  auth: {
    login: string
    logout: string
    signup: string
    email: string
    password: string
    forgotPassword: string
    resetPassword: string
    createAccount: string
    alreadyHaveAccount: string
    dontHaveAccount: string
  }
  
  // Errors
  errors: {
    notFound: string
    serverError: string
    unauthorized: string
    invalidInput: string
    networkError: string
  }
}

/**
 * Dictionary loaders - dynamically import to enable code splitting
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en.json').then(m => m.default),
  es: () => import('./dictionaries/es.json').then(m => m.default),
  fr: () => import('./dictionaries/fr.json').then(m => m.default),
  de: () => import('./dictionaries/de.json').then(m => m.default),
  pt: () => import('./dictionaries/pt.json').then(m => m.default),
  ja: () => import('./dictionaries/ja.json').then(m => m.default),
  zh: () => import('./dictionaries/zh.json').then(m => m.default),
}

/**
 * Get dictionary for a locale
 * Falls back to English if locale dictionary is not found
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    return await dictionaries[locale]()
  } catch {
    // Fallback to English
    console.warn(`Dictionary not found for locale: ${locale}, falling back to English`)
    return await dictionaries.en()
  }
}

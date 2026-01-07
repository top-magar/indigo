import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * 
 * Supports two call signatures:
 * 1. formatCurrency(amount, currency) - Simple signature for dashboard components
 * 2. formatCurrency(amount, options) - Full options object for advanced usage
 */
export function formatCurrency(
    amount: number | string,
    currencyOrOptions?: string | {
        currency?: string;
        locale?: string;
        showSymbol?: boolean;
        maximumFractionDigits?: number;
    }
): string {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return "$0";

    // Handle simple string currency parameter (e.g., "USD", "INR", "EUR")
    if (typeof currencyOrOptions === "string") {
        const currency = currencyOrOptions;
        const locale = currency === "INR" ? "en-IN" : currency === "EUR" ? "de-DE" : "en-US";
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(numAmount);
    }

    // Handle options object
    const { 
        currency = "USD", 
        locale, 
        showSymbol = true,
        maximumFractionDigits = 0 
    } = currencyOrOptions || {};
    
    const resolvedLocale = locale || (currency === "INR" ? "en-IN" : currency === "EUR" ? "de-DE" : "en-US");

    if (showSymbol) {
        return new Intl.NumberFormat(resolvedLocale, {
            style: "currency",
            currency,
            maximumFractionDigits,
        }).format(numAmount);
    }

    return numAmount.toLocaleString(resolvedLocale);
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return then.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string, maxLength = 2): string {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, maxLength);
}

/**
 * Slugify a string for URLs
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Check if we're running on the server
 */
export const isServer = typeof window === "undefined";

/**
 * Check if we're running on the client
 */
export const isClient = !isServer;

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(length = 8): string {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

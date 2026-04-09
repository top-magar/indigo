import type { FlagStrategy, FlagValue } from "./types";

/**
 * Feature Flag Resolver
 * Combines multiple strategies with priority-based resolution
 */
export class FlagResolver {
  private strategies: FlagStrategy[];
  private cache: Record<string, FlagValue> = {};
  private resolved = false;

  constructor(strategies: FlagStrategy[]) {
    // Sort by priority (lowest first, so higher priority overwrites)
    this.strategies = [...strategies].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Fetch all flags from all strategies and combine them
   */
  async resolve(): Promise<Record<string, FlagValue>> {
    const combined: Record<string, FlagValue> = {};

    for (const strategy of this.strategies) {
      try {
        const flags = await strategy.fetchFlags();
        Object.assign(combined, flags);
      } catch (error) {
        console.warn(`Failed to fetch flags from ${strategy.name}:`, error);
      }
    }

    this.cache = combined;
    this.resolved = true;
    return combined;
  }

  /**
   * Get a specific flag value
   */
  getFlag<T extends FlagValue>(name: string, defaultValue: T): T {
    if (!this.resolved) {
      console.warn("Flags not resolved yet. Call resolve() first.");
      return defaultValue;
    }

    const value = this.cache[name];
    if (value === undefined) {
      return defaultValue;
    }

    return value as T;
  }

  /**
   * Check if a flag is enabled (boolean flags)
   */
  isEnabled(name: string): boolean {
    return this.getFlag(name, false) as boolean === true;
  }

  /**
   * Get all resolved flags
   */
  getAllFlags(): Record<string, FlagValue> {
    return { ...this.cache };
  }

  /**
   * Force re-resolution of flags
   */
  async refresh(): Promise<Record<string, FlagValue>> {
    this.resolved = false;
    return this.resolve();
  }
}

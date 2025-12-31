/**
 * Feature Flag Types
 * Inspired by Saleor's feature flag system
 */

export interface FeatureFlag {
  /** Unique identifier for the flag */
  name: string;
  /** Whether the flag is enabled */
  enabled: boolean;
  /** Optional description */
  description?: string;
  /** When the flag was last updated */
  updatedAt?: Date;
}

export type FlagValue = boolean | string | number;

export interface FlagDefinition {
  name: string;
  defaultValue: FlagValue;
  description?: string;
}

export interface FlagStrategy {
  /** Strategy name for identification */
  name: string;
  /** Fetch flags from this strategy */
  fetchFlags(): Promise<Record<string, FlagValue>>;
  /** Priority (higher = more important) */
  priority: number;
}

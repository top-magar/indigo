"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { FlagValue, FlagStrategy } from "./types";
import { FlagResolver } from "./resolver";
import {
  EnvVarsStrategy,
  LocalStorageStrategy,
  StaticStrategy,
} from "./strategies";

interface FeatureFlagsContextValue {
  /** All resolved flags */
  flags: Record<string, FlagValue>;
  /** Check if a flag is enabled */
  isEnabled: (name: string) => boolean;
  /** Get a flag value with default */
  getFlag: <T extends FlagValue>(name: string, defaultValue: T) => T;
  /** Whether flags are still loading */
  isLoading: boolean;
  /** Refresh flags from all sources */
  refresh: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  /** Custom strategies (optional) */
  strategies?: FlagStrategy[];
  /** Default flags (optional) */
  defaultFlags?: Record<string, FlagValue>;
}

/**
 * Feature Flags Provider
 * Inspired by Saleor's FeatureFlagsProvider
 * 
 * @example
 * ```tsx
 * // In app layout
 * <FeatureFlagsProvider defaultFlags={{ new_checkout: false }}>
 *   {children}
 * </FeatureFlagsProvider>
 * 
 * // In component
 * const { isEnabled } = useFeatureFlags();
 * 
 * if (isEnabled('new_checkout')) {
 *   return <NewCheckout />;
 * }
 * return <OldCheckout />;
 * ```
 */
export function FeatureFlagsProvider({
  children,
  strategies,
  defaultFlags = {},
}: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<Record<string, FlagValue>>(defaultFlags);
  const [isLoading, setIsLoading] = useState(true);
  const [resolver] = useState(() => {
    const defaultStrategies: FlagStrategy[] = [
      new StaticStrategy(defaultFlags),
      new EnvVarsStrategy(),
      new LocalStorageStrategy(),
    ];
    return new FlagResolver(strategies || defaultStrategies);
  });

  useEffect(() => {
    resolver
      .resolve()
      .then(setFlags)
      .finally(() => setIsLoading(false));
  }, [resolver]);

  const isEnabled = (name: string): boolean => {
    return flags[name] === true;
  };

  const getFlag = <T extends FlagValue>(name: string, defaultValue: T): T => {
    const value = flags[name];
    if (value === undefined) return defaultValue;
    return value as T;
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      const newFlags = await resolver.refresh();
      setFlags(newFlags);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FeatureFlagsContext.Provider
      value={{ flags, isEnabled, getFlag, isLoading, refresh }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook to access feature flags
 */
export function useFeatureFlags(): FeatureFlagsContextValue {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider"
    );
  }
  return context;
}

/**
 * Hook to check a specific flag
 */
export function useFeatureFlag(name: string, defaultValue: boolean = false): boolean {
  const { getFlag, isLoading } = useFeatureFlags();
  if (isLoading) return defaultValue;
  return getFlag(name, defaultValue);
}

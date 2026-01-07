import type { FlagStrategy, FlagValue } from "./types";

/**
 * Environment Variables Strategy
 * Reads flags from process.env
 */
export class EnvVarsStrategy implements FlagStrategy {
  name = "env-vars";
  priority = 1;

  async fetchFlags(): Promise<Record<string, FlagValue>> {
    const flags: Record<string, FlagValue> = {};
    
    // Look for NEXT_PUBLIC_FF_* environment variables
    if (typeof process !== "undefined" && process.env) {
      Object.entries(process.env).forEach(([key, value]) => {
        if (key.startsWith("NEXT_PUBLIC_FF_") && value !== undefined) {
          const flagName = key.replace("NEXT_PUBLIC_FF_", "").toLowerCase();
          flags[flagName] = this.parseValue(value);
        }
      });
    }

    return flags;
  }

  private parseValue(value: string): FlagValue {
    if (value === "true") return true;
    if (value === "false") return false;
    const num = Number(value);
    if (!isNaN(num)) return num;
    return value;
  }
}

/**
 * Local Storage Strategy
 * Reads flags from localStorage (client-side only)
 */
export class LocalStorageStrategy implements FlagStrategy {
  name = "local-storage";
  priority = 2;
  private storageKey: string;

  constructor(storageKey = "feature-flags") {
    this.storageKey = storageKey;
  }

  async fetchFlags(): Promise<Record<string, FlagValue>> {
    if (typeof window === "undefined") return {};

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to read feature flags from localStorage:", error);
    }

    return {};
  }

  setFlag(name: string, value: FlagValue): void {
    if (typeof window === "undefined") return;

    try {
      const flags = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
      flags[name] = value;
      localStorage.setItem(this.storageKey, JSON.stringify(flags));
    } catch (error) {
      console.warn("Failed to save feature flag to localStorage:", error);
    }
  }

  removeFlag(name: string): void {
    if (typeof window === "undefined") return;

    try {
      const flags = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
      delete flags[name];
      localStorage.setItem(this.storageKey, JSON.stringify(flags));
    } catch (error) {
      console.warn("Failed to remove feature flag from localStorage:", error);
    }
  }
}

/**
 * User Metadata Strategy
 * Reads flags from user metadata (for per-user flags)
 */
export class UserMetadataStrategy implements FlagStrategy {
  name = "user-metadata";
  priority = 3;
  private metadata: Record<string, unknown>[];

  constructor(metadata: Record<string, unknown>[] = []) {
    this.metadata = metadata;
  }

  async fetchFlags(): Promise<Record<string, FlagValue>> {
    const flags: Record<string, FlagValue> = {};

    this.metadata.forEach((item) => {
      if (
        typeof item.key === "string" &&
        item.key.startsWith("ff_") &&
        item.value !== undefined
      ) {
        const flagName = item.key.replace("ff_", "");
        flags[flagName] = item.value as FlagValue;
      }
    });

    return flags;
  }

  updateMetadata(metadata: Record<string, unknown>[]): void {
    this.metadata = metadata;
  }
}

/**
 * Static Strategy
 * For hardcoded default flags
 */
export class StaticStrategy implements FlagStrategy {
  name = "static";
  priority = 0;
  private flags: Record<string, FlagValue>;

  constructor(flags: Record<string, FlagValue> = {}) {
    this.flags = flags;
  }

  async fetchFlags(): Promise<Record<string, FlagValue>> {
    return { ...this.flags };
  }
}

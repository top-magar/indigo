/**
 * Shared Autosave Types
 * 
 * Common type definitions for autosave functionality used by
 * both Block Builder and Visual Editor.
 */

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error"

export interface AutosaveConfig {
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs: number
  /** Maximum retry attempts on failure (default: 3) */
  maxRetries: number
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelayMs: number
  /** Whether autosave is enabled (default: true) */
  enabled: boolean
}

export interface AutosaveState {
  status: AutosaveStatus
  lastSavedAt: Date | null
  error: string | null
  retryCount: number
}

export interface AutosaveCallbacks {
  /** Function to perform the save operation */
  onSave: () => Promise<void>
  /** Called when autosave state changes */
  onStatusChange?: (state: AutosaveState) => void
  /** Called when save succeeds */
  onSaveSuccess?: () => void
  /** Called when save fails after all retries */
  onSaveError?: (error: string) => void
}

export const DEFAULT_AUTOSAVE_CONFIG: AutosaveConfig = {
  debounceMs: 2000,
  maxRetries: 3,
  retryDelayMs: 1000,
  enabled: true,
}

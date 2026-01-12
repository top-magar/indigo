/**
 * Shared Autosave Service
 * 
 * Class-based autosave service that can be used by both Block Builder
 * and Visual Editor. Provides debounced saving with retry logic.
 */

import type {
  AutosaveConfig,
  AutosaveState,
  AutosaveCallbacks,
} from "./types"
import { DEFAULT_AUTOSAVE_CONFIG } from "./types"

export class AutosaveService {
  private config: AutosaveConfig
  private callbacks: AutosaveCallbacks
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private state: AutosaveState = {
    status: "idle",
    lastSavedAt: null,
    error: null,
    retryCount: 0,
  }
  private isStopped = false

  constructor(
    callbacks: AutosaveCallbacks,
    config: Partial<AutosaveConfig> = {}
  ) {
    this.callbacks = callbacks
    this.config = { ...DEFAULT_AUTOSAVE_CONFIG, ...config }
  }

  /**
   * Get current autosave state
   */
  getState(): AutosaveState {
    return { ...this.state }
  }

  /**
   * Start or restart the debounce timer.
   * Called when changes are detected.
   */
  trigger(): void {
    if (this.isStopped || !this.config.enabled) return

    // Cancel any existing timer and restart
    this.clearDebounceTimer()

    // Set status to pending
    this.updateState({ status: "pending", error: null })

    // Start new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.executeSave()
    }, this.config.debounceMs)
  }

  /**
   * Manually trigger a save immediately (bypasses debounce)
   */
  async saveNow(): Promise<void> {
    this.clearDebounceTimer()
    await this.executeSave()
  }

  /**
   * Stop the autosave service entirely.
   * Used when component unmounts.
   */
  stop(): void {
    this.isStopped = true
    this.clearDebounceTimer()
    this.updateState({ status: "idle" })
  }

  /**
   * Resume the autosave service after stopping.
   */
  resume(): void {
    this.isStopped = false
  }

  /**
   * Cancel any pending autosave without stopping the service.
   * Used when manual save is triggered.
   */
  cancel(): void {
    this.clearDebounceTimer()
    this.state.retryCount = 0
    if (this.state.status === "pending") {
      this.updateState({ status: "idle" })
    }
  }

  /**
   * Retry a failed save operation.
   */
  async retry(): Promise<void> {
    if (this.state.status !== "error") return
    this.state.retryCount = 0
    await this.executeSave()
  }

  /**
   * Check if there's a pending autosave
   */
  isPending(): boolean {
    return this.state.status === "pending" || this.debounceTimer !== null
  }

  /**
   * Check if currently saving
   */
  isSaving(): boolean {
    return this.state.status === "saving"
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutosaveConfig>): void {
    this.config = { ...this.config, ...config }
  }

  private clearDebounceTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  private updateState(updates: Partial<AutosaveState>): void {
    this.state = { ...this.state, ...updates }
    this.callbacks.onStatusChange?.(this.getState())
  }

  /**
   * Execute the save operation with retry logic.
   */
  private async executeSave(): Promise<void> {
    if (this.isStopped) return

    this.updateState({ status: "saving", error: null })

    try {
      await this.callbacks.onSave()

      // Success
      this.state.retryCount = 0
      this.updateState({
        status: "saved",
        lastSavedAt: new Date(),
        error: null,
        retryCount: 0,
      })
      this.callbacks.onSaveSuccess?.()
    } catch (error) {
      this.state.retryCount++

      if (this.state.retryCount < this.config.maxRetries) {
        // Schedule retry with exponential backoff
        const delay =
          this.config.retryDelayMs * Math.pow(2, this.state.retryCount - 1)
        setTimeout(() => {
          if (!this.isStopped) {
            this.executeSave()
          }
        }, delay)
      } else {
        // Max retries reached - set error state
        const errorMessage =
          error instanceof Error ? error.message : "Auto-save failed"
        this.updateState({
          status: "error",
          error: errorMessage,
          retryCount: 0,
        })
        this.callbacks.onSaveError?.(errorMessage)
      }
    }
  }
}

/**
 * Factory function to create an AutosaveService instance
 */
export function createAutosaveService(
  callbacks: AutosaveCallbacks,
  config?: Partial<AutosaveConfig>
): AutosaveService {
  return new AutosaveService(callbacks, config)
}

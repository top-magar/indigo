// Autosave Service - Handles automatic saving with debounce logic
// Requirements: 1.1, 1.2, 1.3, 1.7

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export interface AutosaveConfig {
  debounceMs: number      // Default: 3000
  maxRetries: number      // Default: 3
  retryDelayMs: number    // Default: 1000
}

export interface AutosaveState {
  status: AutosaveStatus
  lastSavedAt: Date | null
  error: string | null
}

export interface AutosaveCallbacks {
  onSave: () => Promise<void>
  onStatusChange: (state: AutosaveState) => void
}

const DEFAULT_CONFIG: AutosaveConfig = {
  debounceMs: 3000,
  maxRetries: 3,
  retryDelayMs: 1000,
}

/**
 * AutosaveService manages automatic saving with debounce logic.
 * 
 * Behavior:
 * - When changes are detected, starts a debounce timer (default 3s)
 * - If more changes occur during debounce, timer resets
 * - When timer expires, triggers save
 * - Supports retry with exponential backoff on failure
 * - Manual save cancels any pending autosave
 */
export class AutosaveService {
  private config: AutosaveConfig
  private callbacks: AutosaveCallbacks
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private retryCount: number = 0
  private state: AutosaveState = {
    status: 'idle',
    lastSavedAt: null,
    error: null,
  }
  private isStopped: boolean = false

  constructor(callbacks: AutosaveCallbacks, config: Partial<AutosaveConfig> = {}) {
    this.callbacks = callbacks
    this.config = { ...DEFAULT_CONFIG, ...config }
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
   * Requirements: 1.1, 1.3
   */
  start(): void {
    if (this.isStopped) return

    // Cancel any existing timer and restart
    this.clearDebounceTimer()
    
    // Set status to pending
    this.updateState({ status: 'pending', error: null })
    
    // Start new debounce timer
    this.debounceTimer = setTimeout(() => {
      this.executeSave()
    }, this.config.debounceMs)
  }

  /**
   * Stop the autosave service entirely.
   * Used when component unmounts.
   */
  stop(): void {
    this.isStopped = true
    this.clearDebounceTimer()
    this.updateState({ status: 'idle' })
  }

  /**
   * Cancel any pending autosave without stopping the service.
   * Used when manual save is triggered.
   * Requirements: 1.7
   */
  cancel(): void {
    this.clearDebounceTimer()
    this.retryCount = 0
    // Only reset to idle if we were pending
    if (this.state.status === 'pending') {
      this.updateState({ status: 'idle' })
    }
  }

  /**
   * Retry a failed save operation.
   * Requirements: 1.6
   */
  async retry(): Promise<void> {
    if (this.state.status !== 'error') return
    this.retryCount = 0
    await this.executeSave()
  }

  /**
   * Check if there's a pending autosave
   */
  isPending(): boolean {
    return this.state.status === 'pending' || this.debounceTimer !== null
  }

  /**
   * Check if currently saving
   */
  isSaving(): boolean {
    return this.state.status === 'saving'
  }

  private clearDebounceTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  private updateState(updates: Partial<AutosaveState>): void {
    this.state = { ...this.state, ...updates }
    this.callbacks.onStatusChange(this.getState())
  }

  /**
   * Execute the save operation with retry logic.
   * Requirements: 1.2, 1.6
   */
  private async executeSave(): Promise<void> {
    if (this.isStopped) return

    this.updateState({ status: 'saving', error: null })

    try {
      await this.callbacks.onSave()
      
      // Success
      this.retryCount = 0
      this.updateState({
        status: 'saved',
        lastSavedAt: new Date(),
        error: null,
      })
    } catch (error) {
      this.retryCount++
      
      if (this.retryCount < this.config.maxRetries) {
        // Schedule retry with exponential backoff
        const delay = this.config.retryDelayMs * Math.pow(2, this.retryCount - 1)
        setTimeout(() => {
          if (!this.isStopped) {
            this.executeSave()
          }
        }, delay)
      } else {
        // Max retries reached - set error state
        this.updateState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Auto-save failed',
        })
        this.retryCount = 0
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

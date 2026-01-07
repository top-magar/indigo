/**
 * useResponsivePanel Hook - Manages responsive panel behavior including
 * state management, auto-collapse, resize support, and floating mode.
 *
 * Features:
 * - Panel states: expanded, collapsed, floating, hidden
 * - Auto-collapse when viewport width < 1200px
 * - User preference persistence to localStorage
 * - Manual resize between min and max widths
 * - Snap to preset widths
 * - Double-click to reset to default
 * - Floating mode with position, drag, and z-index management
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type PanelState = 'expanded' | 'collapsed' | 'floating' | 'hidden'

export interface UseResponsivePanelOptions {
  panelId: string
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  defaultState?: PanelState
}

export interface UseResponsivePanelReturn {
  // State
  panelState: PanelState
  setPanelState: (state: PanelState) => void
  width: number
  setWidth: (width: number) => void

  // Floating mode
  floatingPosition: { x: number; y: number }
  setFloatingPosition: (pos: { x: number; y: number }) => void

  // Actions
  collapse: () => void
  expand: () => void
  toggleCollapse: () => void
  float: () => void
  dock: () => void
  hide: () => void
  show: () => void
  resetWidth: () => void

  // Computed
  isCollapsed: boolean
  isFloating: boolean
  isHidden: boolean

  // Resize handlers
  onResizeStart: () => void
  onResize: (delta: number) => void
  onResizeEnd: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Full width panel */
const EXPANDED_WIDTH = 240

/** Icon-only sidebar */
const COLLAPSED_WIDTH = 48

/** Default minimum width for resizing */
const DEFAULT_MIN_WIDTH = 180

/** Default maximum width for resizing */
const DEFAULT_MAX_WIDTH = 400

/** Viewport width threshold for auto-collapse */
const AUTO_COLLAPSE_BREAKPOINT = 1200

/** Preset widths for snapping during resize */
const PRESET_WIDTHS = [180, 200, 240, 280, 320, 360, 400]

/** Snap threshold in pixels */
const SNAP_THRESHOLD = 10

/** Default floating position */
const DEFAULT_FLOATING_POSITION = { x: 100, y: 100 }

/** Base z-index for floating panels */
const FLOATING_Z_INDEX_BASE = 1000

// =============================================================================
// LOCALSTORAGE HELPERS
// =============================================================================

function getStorageKey(panelId: string, suffix: string): string {
  return `panel-${panelId}-${suffix}`
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      return JSON.parse(stored) as T
    }
  } catch {
    // localStorage not available or invalid JSON
  }

  return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage not available
  }
}

function loadPanelState(panelId: string, defaultState: PanelState): PanelState {
  const key = getStorageKey(panelId, 'state')
  const stored = loadFromStorage<string>(key, '')

  if (['expanded', 'collapsed', 'floating', 'hidden'].includes(stored)) {
    return stored as PanelState
  }

  return defaultState
}

function savePanelState(panelId: string, state: PanelState): void {
  const key = getStorageKey(panelId, 'state')
  saveToStorage(key, state)
}

function loadPanelWidth(panelId: string, defaultWidth: number): number {
  const key = getStorageKey(panelId, 'width')
  return loadFromStorage<number>(key, defaultWidth)
}

function savePanelWidth(panelId: string, width: number): void {
  const key = getStorageKey(panelId, 'width')
  saveToStorage(key, width)
}

function loadFloatingPosition(panelId: string): { x: number; y: number } {
  const key = getStorageKey(panelId, 'floating-position')
  return loadFromStorage(key, DEFAULT_FLOATING_POSITION)
}

function saveFloatingPosition(panelId: string, position: { x: number; y: number }): void {
  const key = getStorageKey(panelId, 'floating-position')
  saveToStorage(key, position)
}

function loadUserPreference(panelId: string): PanelState | null {
  const key = getStorageKey(panelId, 'user-preference')
  const stored = loadFromStorage<string>(key, '')

  if (['expanded', 'collapsed', 'floating', 'hidden'].includes(stored)) {
    return stored as PanelState
  }

  return null
}

function saveUserPreference(panelId: string, state: PanelState): void {
  const key = getStorageKey(panelId, 'user-preference')
  saveToStorage(key, state)
}

// =============================================================================
// SNAP TO PRESET HELPER
// =============================================================================

/**
 * Snap a width value to the nearest preset width if within threshold.
 */
function snapToPreset(width: number, minWidth: number, maxWidth: number): number {
  // Clamp to min/max first
  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width))

  // Find the nearest preset width within threshold
  for (const preset of PRESET_WIDTHS) {
    if (preset >= minWidth && preset <= maxWidth) {
      if (Math.abs(clampedWidth - preset) <= SNAP_THRESHOLD) {
        return preset
      }
    }
  }

  return clampedWidth
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useResponsivePanel(options: UseResponsivePanelOptions): UseResponsivePanelReturn {
  const {
    panelId,
    defaultWidth = EXPANDED_WIDTH,
    minWidth = DEFAULT_MIN_WIDTH,
    maxWidth = DEFAULT_MAX_WIDTH,
    defaultState = 'expanded',
  } = options

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [panelState, setPanelStateInternal] = useState<PanelState>(defaultState)
  const [width, setWidthInternal] = useState<number>(defaultWidth)
  const [floatingPosition, setFloatingPositionInternal] = useState<{ x: number; y: number }>(
    DEFAULT_FLOATING_POSITION
  )
  const [isResizing, setIsResizing] = useState(false)

  // Track the width before resize started for delta calculations
  const resizeStartWidth = useRef<number>(defaultWidth)

  // Track if auto-collapse was triggered (to restore when viewport expands)
  const wasAutoCollapsed = useRef(false)

  // Track if initial load has happened
  const isInitialized = useRef(false)

  // ==========================================================================
  // LOAD FROM LOCALSTORAGE ON MOUNT
  // ==========================================================================

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const storedState = loadPanelState(panelId, defaultState)
    const storedWidth = loadPanelWidth(panelId, defaultWidth)
    const storedPosition = loadFloatingPosition(panelId)

    setPanelStateInternal(storedState)
    setWidthInternal(storedWidth)
    setFloatingPositionInternal(storedPosition)
  }, [panelId, defaultState, defaultWidth])

  // ==========================================================================
  // STATE SETTERS WITH PERSISTENCE
  // ==========================================================================

  const setPanelState = useCallback(
    (state: PanelState) => {
      setPanelStateInternal(state)
      savePanelState(panelId, state)
      saveUserPreference(panelId, state)
    },
    [panelId]
  )

  const setWidth = useCallback(
    (newWidth: number) => {
      const snappedWidth = snapToPreset(newWidth, minWidth, maxWidth)
      setWidthInternal(snappedWidth)
      savePanelWidth(panelId, snappedWidth)
    },
    [panelId, minWidth, maxWidth]
  )

  const setFloatingPosition = useCallback(
    (pos: { x: number; y: number }) => {
      // Ensure position is within viewport bounds
      const boundedPos = {
        x: Math.max(0, pos.x),
        y: Math.max(0, pos.y),
      }
      setFloatingPositionInternal(boundedPos)
      saveFloatingPosition(panelId, boundedPos)
    },
    [panelId]
  )

  // ==========================================================================
  // AUTO-COLLAPSE ON VIEWPORT RESIZE
  // ==========================================================================

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const viewportWidth = window.innerWidth

      if (viewportWidth < AUTO_COLLAPSE_BREAKPOINT) {
        // Auto-collapse if currently expanded
        if (panelState === 'expanded') {
          wasAutoCollapsed.current = true
          setPanelStateInternal('collapsed')
          savePanelState(panelId, 'collapsed')
        }
      } else {
        // Restore to expanded if was auto-collapsed
        if (wasAutoCollapsed.current && panelState === 'collapsed') {
          const userPreference = loadUserPreference(panelId)

          // Only restore if user hasn't explicitly set a preference
          // or if their preference was expanded
          if (!userPreference || userPreference === 'expanded') {
            wasAutoCollapsed.current = false
            setPanelStateInternal('expanded')
            savePanelState(panelId, 'expanded')
          }
        }
      }
    }

    // Check on mount
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [panelId, panelState])

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  const collapse = useCallback(() => {
    wasAutoCollapsed.current = false
    setPanelState('collapsed')
  }, [setPanelState])

  const expand = useCallback(() => {
    wasAutoCollapsed.current = false
    setPanelState('expanded')
  }, [setPanelState])

  const toggleCollapse = useCallback(() => {
    wasAutoCollapsed.current = false
    if (panelState === 'collapsed') {
      setPanelState('expanded')
    } else if (panelState === 'expanded') {
      setPanelState('collapsed')
    } else if (panelState === 'floating') {
      // From floating, toggle goes to collapsed
      setPanelState('collapsed')
    } else if (panelState === 'hidden') {
      // From hidden, toggle goes to expanded
      setPanelState('expanded')
    }
  }, [panelState, setPanelState])

  const float = useCallback(() => {
    wasAutoCollapsed.current = false
    setPanelState('floating')
  }, [setPanelState])

  const dock = useCallback(() => {
    wasAutoCollapsed.current = false
    setPanelState('expanded')
  }, [setPanelState])

  const hide = useCallback(() => {
    wasAutoCollapsed.current = false
    setPanelState('hidden')
  }, [setPanelState])

  const show = useCallback(() => {
    wasAutoCollapsed.current = false
    const userPreference = loadUserPreference(panelId)
    // Restore to user's preferred state, or expanded by default
    const targetState = userPreference && userPreference !== 'hidden' ? userPreference : 'expanded'
    setPanelState(targetState)
  }, [panelId, setPanelState])

  const resetWidth = useCallback(() => {
    setWidth(defaultWidth)
  }, [defaultWidth, setWidth])

  // ==========================================================================
  // RESIZE HANDLERS
  // ==========================================================================

  const onResizeStart = useCallback(() => {
    setIsResizing(true)
    resizeStartWidth.current = width
  }, [width])

  const onResize = useCallback(
    (delta: number) => {
      if (!isResizing) return

      const newWidth = resizeStartWidth.current + delta
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidthInternal(clampedWidth)
    },
    [isResizing, minWidth, maxWidth]
  )

  const onResizeEnd = useCallback(() => {
    setIsResizing(false)

    // Snap to preset and persist
    const snappedWidth = snapToPreset(width, minWidth, maxWidth)
    setWidthInternal(snappedWidth)
    savePanelWidth(panelId, snappedWidth)
  }, [panelId, width, minWidth, maxWidth])

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const isCollapsed = useMemo(() => panelState === 'collapsed', [panelState])
  const isFloating = useMemo(() => panelState === 'floating', [panelState])
  const isHidden = useMemo(() => panelState === 'hidden', [panelState])

  // Calculate effective width based on state
  const effectiveWidth = useMemo(() => {
    switch (panelState) {
      case 'collapsed':
        return COLLAPSED_WIDTH
      case 'hidden':
        return 0
      case 'expanded':
      case 'floating':
      default:
        return width
    }
  }, [panelState, width])

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    panelState,
    setPanelState,
    width: effectiveWidth,
    setWidth,

    // Floating mode
    floatingPosition,
    setFloatingPosition,

    // Actions
    collapse,
    expand,
    toggleCollapse,
    float,
    dock,
    hide,
    show,
    resetWidth,

    // Computed
    isCollapsed,
    isFloating,
    isHidden,

    // Resize handlers
    onResizeStart,
    onResize,
    onResizeEnd,
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { EXPANDED_WIDTH, COLLAPSED_WIDTH, PRESET_WIDTHS, FLOATING_Z_INDEX_BASE }

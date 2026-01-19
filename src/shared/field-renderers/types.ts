/**
 * Shared Field Renderer Types
 * 
 * Common type definitions used by the Visual Editor
 * field renderers. This consolidates duplicate type definitions.
 */

// =============================================================================
// BASE FIELD PROPS
// =============================================================================

export interface BaseFieldProps {
  /** Field label */
  label: string
  /** Optional help text / description */
  description?: string
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether the field is required */
  required?: boolean
  /** Additional class name */
  className?: string
}

// =============================================================================
// TEXT FIELD
// =============================================================================

export interface TextFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  minLength?: number
}

// =============================================================================
// TEXTAREA FIELD
// =============================================================================

export interface TextareaFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
}

// =============================================================================
// NUMBER FIELD
// =============================================================================

export interface NumberFieldProps extends BaseFieldProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  suffix?: string
}

// =============================================================================
// SELECT FIELD
// =============================================================================

export interface SelectOption {
  label: string
  value: string
}

export interface SelectFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

// =============================================================================
// TOGGLE / BOOLEAN FIELD
// =============================================================================

export interface ToggleFieldProps extends BaseFieldProps {
  value: boolean
  onChange: (value: boolean) => void
}

// =============================================================================
// SLIDER FIELD
// =============================================================================

export interface SliderFieldProps extends BaseFieldProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  showValue?: boolean
}

// =============================================================================
// COLOR FIELD
// =============================================================================

export interface ColorFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  presets?: string[]
  showInput?: boolean
}

// =============================================================================
// IMAGE FIELD
// =============================================================================

export interface ImageFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onMediaLibraryClick?: () => void
  showPreview?: boolean
  previewAspectRatio?: string
  maxSize?: number // in MB
}

// =============================================================================
// LINK / URL FIELD
// =============================================================================

export interface LinkFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowInternal?: boolean
}

// =============================================================================
// DEFAULT PRESETS
// =============================================================================

export const DEFAULT_COLOR_PRESETS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

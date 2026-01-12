/**
 * Shared Field Renderers
 * 
 * Consolidated field components used by both Block Builder and Visual Editor.
 * This eliminates duplicate implementations and ensures consistent behavior.
 * 
 * Usage:
 * - Block Builder: Import directly for settings panel
 * - Visual Editor: Import and wrap with config-based props
 */

// Types
export type {
  BaseFieldProps,
  TextFieldProps,
  TextareaFieldProps,
  NumberFieldProps,
  SelectFieldProps,
  SelectOption,
  ToggleFieldProps,
  SliderFieldProps,
  ColorFieldProps,
  ImageFieldProps,
  LinkFieldProps,
} from "./types"

export { DEFAULT_COLOR_PRESETS } from "./types"

// Components
export { TextField } from "./text-field"
export { TextareaField } from "./textarea-field"
export { NumberField } from "./number-field"
export { SelectField } from "./select-field"
export { ToggleField } from "./toggle-field"
export { SliderField } from "./slider-field"
export { ColorField } from "./color-field"
export { ImageField } from "./image-field"
export { LinkField } from "./link-field"

/** 8px-based spacing scale for consistent layout rhythm */
export const SPACING_SCALE = [0, 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120] as const

/** Standard section padding presets */
export const SECTION_PADDING = { sm: 24, md: 48, lg: 64, xl: 80 } as const

/** Standard gap presets */
export const GAP = { tight: 8, normal: 16, loose: 24, wide: 32 } as const

/** Grid system constants */
export const GRID = { columns: 12, gutter: 24, minMargin: 16 } as const

/** Slider step for all spacing controls — ensures 4px grid alignment */
export const SPACING_STEP = 4

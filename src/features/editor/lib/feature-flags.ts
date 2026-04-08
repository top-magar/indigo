/** Feature flags — toggle experimental features without code changes */
export const FEATURE_FLAGS = {
  /** AI content generation (rewrite headings, product copy, CTA text) */
  AI_ENABLED: false,
  /** AI layout suggestions (alternative section arrangements) */
  AI_LAYOUTS: false,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

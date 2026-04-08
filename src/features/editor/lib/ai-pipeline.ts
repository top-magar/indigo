/**
 * AI Pipeline — Stub interfaces and functions.
 * When ready to integrate, swap the stub implementation in generateContent()
 * with an actual LLM API call (Anthropic, OpenAI, etc.).
 */

export interface AIContentRequest {
  /** The current text to rewrite */
  prompt: string
  /** Block type context (e.g., "Hero", "Newsletter") */
  blockType: string
  /** Which field is being rewritten (e.g., "heading", "ctaText") */
  fieldName: string
  /** Surrounding context — adjacent block types, store name, etc. */
  context?: {
    storeName?: string
    industry?: string
    adjacentBlocks?: string[]
  }
}

export interface AIContentResponse {
  /** Generated text suggestions (typically 3) */
  suggestions: string[]
  /** Model used (or "none" for stub) */
  model: string
  /** Whether AI is actually enabled */
  enabled: boolean
}

export interface AILayoutRequest {
  /** Current block type */
  blockType: string
  /** Current props (content to preserve) */
  currentProps: Record<string, unknown>
}

export interface AILayoutResponse {
  /** Suggested layout presets */
  suggestions: Array<{
    label: string
    description: string
    props: Record<string, unknown>
  }>
  model: string
  enabled: boolean
}

/**
 * Stub: Generate content suggestions.
 * Replace this body with an actual LLM call when AI_ENABLED is true.
 */
export async function generateContent(_req: AIContentRequest): Promise<AIContentResponse> {
  return { suggestions: [], model: "none", enabled: false }
}

/**
 * Stub: Generate layout suggestions.
 * Replace this body with an actual LLM call when AI_LAYOUTS is true.
 */
export async function generateLayouts(_req: AILayoutRequest): Promise<AILayoutResponse> {
  return { suggestions: [], model: "none", enabled: false }
}

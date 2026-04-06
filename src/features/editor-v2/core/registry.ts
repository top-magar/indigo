/**
 * Block Registry — Central catalog of all registered blocks.
 * Blocks register via plugins or direct import.
 * The inspector, block panel, and renderer all read from here.
 */

import type { BlockSchema, FieldMap, InferProps } from "./schema"
import { getDefaults } from "./schema"

interface RegisteredBlock {
  readonly schema: BlockSchema
  readonly defaults: Record<string, unknown>
}

const blocks = new Map<string, RegisteredBlock>()

/** Register a block schema. Throws on duplicate names. */
export function registerBlock<M extends FieldMap>(schema: BlockSchema<M>): void {
  if (blocks.has(schema.name)) {
    throw new Error(`Block "${schema.name}" is already registered`)
  }
  blocks.set(schema.name, {
    schema: schema as BlockSchema,
    defaults: getDefaults(schema.fields) as Record<string, unknown>,
  })
}

/** Unregister a block (used by plugin unload) */
export function unregisterBlock(name: string): void {
  blocks.delete(name)
}

/** Get a block schema by name. Throws if not found. */
export function getBlock(name: string): RegisteredBlock {
  const block = blocks.get(name)
  if (!block) throw new Error(`Block "${name}" is not registered`)
  return block
}

/** Get a block schema or null */
export function getBlockOrNull(name: string): RegisteredBlock | null {
  return blocks.get(name) ?? null
}

/** List all registered blocks */
export function listBlocks(): RegisteredBlock[] {
  return Array.from(blocks.values())
}

/** List blocks grouped by category */
export function listByCategory(): Map<string, RegisteredBlock[]> {
  const categories = new Map<string, RegisteredBlock[]>()
  for (const block of blocks.values()) {
    const cat = block.schema.category
    if (!categories.has(cat)) categories.set(cat, [])
    categories.get(cat)!.push(block)
  }
  return categories
}

/** Validate props against a block's schema. Returns error messages or empty array. */
export function validateProps(name: string, props: Record<string, unknown>): string[] {
  const block = getBlockOrNull(name)
  if (!block) return [`Unknown block type: ${name}`]
  const errors: string[] = []
  for (const [key, field] of Object.entries(block.schema.fields)) {
    const value = props[key]
    if (value === undefined) continue
    if (field.type === "number" || field.type === "spacing") {
      if (typeof value !== "number") errors.push(`${key}: expected number, got ${typeof value}`)
    }
    if (field.type === "text" || field.type === "color" || field.type === "image") {
      if (typeof value !== "string") errors.push(`${key}: expected string, got ${typeof value}`)
    }
    if (field.type === "boolean") {
      if (typeof value !== "boolean") errors.push(`${key}: expected boolean, got ${typeof value}`)
    }
    if (field.type === "enum") {
      const valid = field.options.map((o) => o.value)
      if (!valid.includes(value as string)) errors.push(`${key}: "${value}" not in [${valid.join(", ")}]`)
    }
  }
  return errors
}

/** Clear all registrations (for testing) */
export function clearRegistry(): void {
  blocks.clear()
}

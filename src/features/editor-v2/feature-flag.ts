/**
 * Editor Version Feature Flag.
 * Controls which editor loads: v1 (Craft.js) or v2 (schema-driven).
 * Default: v1. Set NEXT_PUBLIC_EDITOR_VERSION=v2 to opt in.
 */

export type EditorVersion = "v1" | "v2"

export function getEditorVersion(): EditorVersion {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_EDITOR_VERSION === "v2") return "v2"
  return "v1"
}

export function isEditorV2(): boolean {
  return getEditorVersion() === "v2"
}

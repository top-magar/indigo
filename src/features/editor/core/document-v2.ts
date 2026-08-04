import { z } from "zod"
import type { CSSProperties } from "react"
import type { El } from "./types"

export const editorDevices = ["desktop", "tablet", "mobile"] as const
export type EditorDevice = (typeof editorDevices)[number]

const styleSchema = z.record(z.string(), z.unknown()).transform((value) => value as CSSProperties)
const contentSchema = z.record(z.string(), z.string())

const bindingSchema = z.discriminatedUnion("source", [
  z.object({ source: z.literal("product"), field: z.string().min(1), resourceId: z.string().optional() }),
  z.object({ source: z.literal("collection"), field: z.string().min(1), resourceId: z.string().optional() }),
  z.object({ source: z.literal("store"), field: z.string().min(1) }),
  z.object({ source: z.literal("cart"), field: z.string().min(1) }),
  z.object({ source: z.literal("navigation"), field: z.string().min(1), resourceId: z.string().optional() }),
])

export type EditorBinding = z.infer<typeof bindingSchema>

export const editorElementSchema: z.ZodType<El> = z.lazy(() => z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  styles: styleSchema,
  responsiveStyles: z.object({
    desktop: styleSchema.optional(),
    tablet: styleSchema.optional(),
    mobile: styleSchema.optional(),
  }).partial().optional(),
  content: z.union([z.array(editorElementSchema), contentSchema]),
  binding: bindingSchema.optional(),
  repeat: z.object({
    source: z.literal("collection"),
    resourceId: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }).optional(),
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
}))

export const editorDocumentV2Schema = z.object({
  schemaVersion: z.literal(2),
  page: z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(120),
    slug: z.string().max(160),
    seoTitle: z.string().nullable().optional(),
    seoDescription: z.string().nullable().optional(),
    ogImage: z.string().nullable().optional(),
  }),
  root: z.array(editorElementSchema).min(1),
  settings: z.object({
    currency: z.string().trim().min(3).max(3).default("NPR"),
    locale: z.string().trim().min(2).max(24).default("en-NP"),
  }),
})

export type EditorDocumentV2 = z.infer<typeof editorDocumentV2Schema>

type LegacyElement = Omit<El, "responsiveStyles" | "binding" | "repeat" | "content"> & {
  responsiveStyles?: Record<string, CSSProperties>
  binding?: { source: "product"; field: string; productId?: string }
  repeat?: { source: "products"; collectionId?: string; limit?: number }
  content: LegacyElement[] | Record<string, string>
}

function migrateElement(element: LegacyElement): El {
  const responsiveStyles = element.responsiveStyles
    ? {
        desktop: element.responsiveStyles.desktop ?? element.responsiveStyles.Desktop,
        tablet: element.responsiveStyles.tablet ?? element.responsiveStyles.Tablet,
        mobile: element.responsiveStyles.mobile ?? element.responsiveStyles.Mobile,
      }
    : undefined

  return {
    ...element,
    responsiveStyles,
    binding: element.binding
      ? { source: "product", field: element.binding.field, resourceId: element.binding.productId }
      : undefined,
    repeat: element.repeat
      ? { source: "collection", resourceId: element.repeat.collectionId, limit: element.repeat.limit }
      : undefined,
    content: Array.isArray(element.content)
      ? element.content.map(migrateElement)
      : element.content,
  }
}

export function migrateEditorDocument(input: unknown, page: EditorDocumentV2["page"], currency = "NPR"): EditorDocumentV2 {
  const current = editorDocumentV2Schema.safeParse(input)
  if (current.success) return current.data

  const legacyRoot = Array.isArray(input) ? input : []
  const root = legacyRoot.map((element) => migrateElement(element as LegacyElement))
  const result = editorDocumentV2Schema.safeParse({
    schemaVersion: 2,
    page,
    root,
    settings: { currency, locale: "en-NP" },
  })

  if (!result.success) {
    throw new Error(`Editor document migration failed: ${z.prettifyError(result.error)}`)
  }
  return result.data
}

export function parseEditorDocument(input: unknown): EditorDocumentV2 {
  return editorDocumentV2Schema.parse(input)
}

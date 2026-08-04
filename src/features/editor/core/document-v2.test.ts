import { describe, expect, it } from "vitest"
import { migrateEditorDocument, parseEditorDocument } from "./document-v2"

const page = { id: "4e6736b4-87c8-4a0f-bf6f-a38891929d22", name: "Home", slug: "" }

describe("EditorDocumentV2", () => {
  it("migrates legacy device keys and commerce bindings", () => {
    const document = migrateEditorDocument([{
      id: "body",
      type: "__body",
      name: "Body",
      styles: { width: "100%" },
      responsiveStyles: { Tablet: { padding: "24px" }, Mobile: { padding: "16px" } },
      content: [{
        id: "title",
        type: "text",
        name: "Product name",
        styles: {},
        content: { innerText: "Product" },
        binding: { source: "product", field: "name", productId: "product-1" },
      }],
    }], page)

    expect(document.schemaVersion).toBe(2)
    expect(document.root[0].responsiveStyles?.tablet).toEqual({ padding: "24px" })
    expect(document.root[0].responsiveStyles?.mobile).toEqual({ padding: "16px" })
    const title = Array.isArray(document.root[0].content) ? document.root[0].content[0] : null
    expect(title?.binding).toEqual({ source: "product", field: "name", resourceId: "product-1" })
  })

  it("rejects documents without a valid root", () => {
    expect(() => parseEditorDocument({ schemaVersion: 2, page, root: [], settings: { currency: "NPR", locale: "en-NP" } })).toThrow()
  })
})

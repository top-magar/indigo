"use client"
import { useEffect, useState } from "react"
import { useEditorV3Store } from "@/features/editor-v3"
import { EditorShell } from "@/features/editor-v3/ui/shell/editor-shell"
import { loadFromLocalStorage, startAutoSave } from "@/features/editor-v3/stores/persistence"

/** Bootstrap a demo page with a basic instance tree */
function useBootstrap() {
  const [ready, setReady] = useState(false)
  const store = useEditorV3Store

  useEffect(() => {
    const s = store.getState()
    // Only bootstrap once
    if (s.pages.size > 0) { setReady(true); return }

    // Try loading from localStorage first
    if (loadFromLocalStorage()) { setReady(true); return }

    // Create root Box (acts as <body>)
    const rootId = s.addInstance(null, 0, "Box", "div")
    s.setInstanceLabel(rootId, "Page Root")

    // Header
    const headerId = s.addInstance(rootId, 0, "Box", "header")
    s.setInstanceLabel(headerId, "Header")
    const headerStyle = s.createLocalStyleSource(headerId)
    s.setStyleDeclaration(headerStyle, "bp-base", "display", { type: "keyword", value: "flex" })
    s.setStyleDeclaration(headerStyle, "bp-base", "alignItems", { type: "keyword", value: "center" })
    s.setStyleDeclaration(headerStyle, "bp-base", "justifyContent", { type: "keyword", value: "space-between" })
    s.setStyleDeclaration(headerStyle, "bp-base", "padding", { type: "unit", value: 16, unit: "px" })
    s.setStyleDeclaration(headerStyle, "bp-base", "borderBottom", { type: "unparsed", value: "1px solid #e5e7eb" })

    const logoId = s.addInstance(headerId, 0, "Heading")
    s.setProp(logoId, "level", "number", 1)
    s.addTextChild(logoId, "My Store")
    const logoStyle = s.createLocalStyleSource(logoId)
    s.setStyleDeclaration(logoStyle, "bp-base", "fontSize", { type: "unit", value: 20, unit: "px" })

    const navId = s.addInstance(headerId, 1, "Box", "nav")
    s.setInstanceLabel(navId, "Nav")
    const navStyle = s.createLocalStyleSource(navId)
    s.setStyleDeclaration(navStyle, "bp-base", "display", { type: "keyword", value: "flex" })
    s.setStyleDeclaration(navStyle, "bp-base", "gap", { type: "unit", value: 16, unit: "px" })

    for (const label of ["Shop", "About", "Contact"]) {
      const linkId = s.addInstance(navId, navId.length, "Link")
      s.setProp(linkId, "href", "string", "#")
      s.addTextChild(linkId, label)
    }

    // Hero section
    const heroId = s.addInstance(rootId, 1, "Box", "section")
    s.setInstanceLabel(heroId, "Hero")
    const heroStyle = s.createLocalStyleSource(heroId)
    s.setStyleDeclaration(heroStyle, "bp-base", "padding", { type: "unit", value: 64, unit: "px" })
    s.setStyleDeclaration(heroStyle, "bp-base", "textAlign", { type: "keyword", value: "center" })

    const h1Id = s.addInstance(heroId, 0, "Heading")
    s.setProp(h1Id, "level", "number", 1)
    s.addTextChild(h1Id, "Welcome to My Store")
    const h1Style = s.createLocalStyleSource(h1Id)
    s.setStyleDeclaration(h1Style, "bp-base", "fontSize", { type: "unit", value: 48, unit: "px" })
    s.setStyleDeclaration(h1Style, "bp-base", "fontWeight", { type: "keyword", value: "700" })

    const pId = s.addInstance(heroId, 1, "Text")
    s.addTextChild(pId, "Discover amazing products at great prices.")
    const pStyle = s.createLocalStyleSource(pId)
    s.setStyleDeclaration(pStyle, "bp-base", "fontSize", { type: "unit", value: 18, unit: "px" })
    s.setStyleDeclaration(pStyle, "bp-base", "color", { type: "rgb", r: 107, g: 114, b: 128, a: 1 })

    const btnId = s.addInstance(heroId, 2, "Button")
    s.addTextChild(btnId, "Shop Now")
    const btnStyle = s.createLocalStyleSource(btnId)
    s.setStyleDeclaration(btnStyle, "bp-base", "padding", { type: "unparsed", value: "12px 32px" })
    s.setStyleDeclaration(btnStyle, "bp-base", "backgroundColor", { type: "rgb", r: 0, g: 0, b: 0, a: 1 })
    s.setStyleDeclaration(btnStyle, "bp-base", "color", { type: "rgb", r: 255, g: 255, b: 255, a: 1 })
    s.setStyleDeclaration(btnStyle, "bp-base", "borderRadius", { type: "unit", value: 8, unit: "px" })
    s.setStyleDeclaration(btnStyle, "bp-base", "fontSize", { type: "unit", value: 16, unit: "px" })
    s.setStyleDeclaration(btnStyle, "bp-base", "border", { type: "keyword", value: "none" })

    // Create page
    const pageId = s.addPage("Home", "/", rootId)
    s.setPage(pageId)

    setReady(true)
  }, [store])

  return ready
}

export default function EditorV3Page() {
  const ready = useBootstrap()

  // Start auto-save once ready
  useEffect(() => {
    if (!ready) return
    return startAutoSave(1000)
  }, [ready])

  if (!ready) return <div className="flex items-center justify-center h-screen text-sm text-gray-400">Loading editor...</div>
  return <EditorShell />
}

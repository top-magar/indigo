"use client"
import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEditorV3Store } from "@/features/editor-v3"
import { EditorShell } from "@/features/editor-v3/ui/shell/editor-shell"
import {
  loadFromLocalStorage, startAutoSave,
  loadFromDatabase, createProject, startDatabaseAutoSave, listProjects,
  saveVersion, listVersions, restoreVersion,
} from "@/features/editor-v3/stores/persistence"

function bootstrapDemo(): void {
  const s = useEditorV3Store.getState()
  const rootId = s.addInstance(null, 0, "Box", "div")
  s.setInstanceLabel(rootId, "Page Root")

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

  const pageId = s.addPage("Home", "/", rootId)
  s.setPage(pageId)
}

function EditorLoader() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)

  useEffect(() => {
    const pid = searchParams.get("project")
    const s = useEditorV3Store.getState()
    if (s.pages.size > 0) { setProjectId(pid); setReady(true); return }

    if (pid) {
      loadFromDatabase(pid).then((ok) => {
        if (ok) { setProjectId(pid); setReady(true) }
        else { console.error("Project not found:", pid); bootstrapDemo(); setReady(true) }
      })
      return
    }

    if (loadFromLocalStorage()) { setReady(true); return }
    bootstrapDemo()
    setReady(true)
  }, [searchParams])

  // Auto-save: localStorage always, database if project loaded
  useEffect(() => {
    if (!ready) return
    const unsubs = [startAutoSave(1000)]
    if (projectId) unsubs.push(startDatabaseAutoSave(projectId, 3000))
    return () => unsubs.forEach((u) => u())
  }, [ready, projectId])

  const handleSaveNew = useCallback(async () => {
    const name = prompt("Project name:")
    if (!name) return
    const id = await createProject(name)
    setProjectId(id)
    router.replace(`/editor-v3?project=${id}`)
  }, [router])

  const handleOpen = useCallback(async () => {
    const projects = await listProjects()
    if (projects.length === 0) { alert("No saved projects"); return }
    const choice = prompt(
      `Open project:\n${projects.map((p, i) => `${i + 1}. ${p.name}`).join("\n")}\n\nEnter number:`
    )
    if (!choice) return
    const idx = parseInt(choice, 10) - 1
    const p = projects[idx]
    if (!p) { alert("Invalid selection"); return }
    router.push(`/editor-v3?project=${p.id}`)
    window.location.href = `/editor-v3?project=${p.id}`
  }, [router])

  const handleSaveVersion = useCallback(async () => {
    if (!projectId) return
    const label = prompt("Version label (optional):")
    await saveVersion(projectId, label || undefined)
    alert("Version saved!")
  }, [projectId])

  const handleRestoreVersion = useCallback(async () => {
    if (!projectId) return
    const versions = await listVersions(projectId)
    if (versions.length === 0) { alert("No saved versions"); return }
    const choice = prompt(
      `Restore version:\n${versions.map((v, i) => `${i + 1}. v${v.version}${v.label ? ` — ${v.label}` : ""} (${new Date(v.createdAt).toLocaleString()})`).join("\n")}\n\nEnter number:`
    )
    if (!choice) return
    const idx = parseInt(choice, 10) - 1
    const v = versions[idx]
    if (!v) { alert("Invalid selection"); return }
    if (!confirm(`Restore to v${v.version}? Current changes will be overwritten.`)) return
    const ok = await restoreVersion(projectId, v.id)
    if (ok) alert("Restored!"); else alert("Failed to restore")
  }, [projectId])

  if (!ready) return <div className="flex items-center justify-center h-screen text-sm text-gray-400">Loading editor...</div>

  return <EditorShell projectId={projectId} onSaveNew={handleSaveNew} onOpen={handleOpen} onSaveVersion={handleSaveVersion} onRestoreVersion={handleRestoreVersion} />
}

export default function EditorV3Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-sm text-gray-400">Loading editor...</div>}>
      <EditorLoader />
    </Suspense>
  )
}

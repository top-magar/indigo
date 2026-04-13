import { useEditorV3Store } from "../stores/store"
import type { EditorV3Store } from "../stores/store"

const STORAGE_KEY = "editor-v3-data"

interface SerializedData {
  instances: [string, unknown][]
  props: [string, unknown][]
  styleSources: [string, unknown][]
  styleSourceSelections: [string, unknown][]
  styleDeclarations: [string, unknown][]
  breakpoints: [string, unknown][]
  pages: [string, unknown][]
  assets: [string, unknown][]
  site?: { headerInstanceId: string | null; footerInstanceId: string | null }
}

function serialize(s: EditorV3Store): SerializedData {
  return {
    instances: [...s.instances],
    props: [...s.props],
    styleSources: [...s.styleSources],
    styleSourceSelections: [...s.styleSourceSelections],
    styleDeclarations: [...s.styleDeclarations],
    breakpoints: [...s.breakpoints],
    pages: [...s.pages],
    assets: [...s.assets],
    site: s.site,
  }
}

/** Validate that data has the expected shape before deserializing */
function isValidSerializedData(data: unknown): data is SerializedData {
  if (!data || typeof data !== "object") return false
  const d = data as Record<string, unknown>
  const requiredArrays = ["instances", "props", "styleSources", "styleSourceSelections", "styleDeclarations", "breakpoints", "pages"]
  for (const key of requiredArrays) {
    if (!Array.isArray(d[key])) return false
  }
  // Must have at least one page and one breakpoint
  if ((d.pages as unknown[]).length === 0) return false
  if ((d.breakpoints as unknown[]).length === 0) return false
  return true
}

function deserialize(data: unknown): void {
  if (!isValidSerializedData(data)) {
    throw new Error("Invalid editor data: missing required fields")
  }
  useEditorV3Store.setState((s) => {
    s.instances = new Map(data.instances) as typeof s.instances
    s.props = new Map(data.props) as typeof s.props
    s.styleSources = new Map(data.styleSources) as typeof s.styleSources
    s.styleSourceSelections = new Map(data.styleSourceSelections) as typeof s.styleSourceSelections
    s.styleDeclarations = new Map(data.styleDeclarations) as typeof s.styleDeclarations
    s.breakpoints = new Map(data.breakpoints) as typeof s.breakpoints
    s.pages = new Map(data.pages) as typeof s.pages
    s.assets = new Map(data.assets ?? []) as typeof s.assets
    if (data.site) s.site = data.site
  })
  const firstPage = [...useEditorV3Store.getState().pages.values()][0]
  if (firstPage) useEditorV3Store.getState().setPage(firstPage.id)
}

// --- localStorage ---

export function saveToLocalStorage(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize(useEditorV3Store.getState())))
}

export function loadFromLocalStorage(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  try { deserialize(JSON.parse(raw)); return true } catch { return false }
}

// --- Database ---

interface ProjectListItem {
  id: string
  name: string
  updatedAt: string
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const res = await fetch("/api/editor-v3/projects")
  if (!res.ok) throw new Error(`Failed to list projects: ${res.status}`)
  return res.json()
}

export async function saveToDatabase(projectId: string): Promise<void> {
  const data = serialize(useEditorV3Store.getState())
  const res = await fetch(`/api/editor-v3/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  })
  if (!res.ok) throw new Error(`Failed to save project: ${res.status}`)
}

export async function createProject(name: string): Promise<string> {
  const data = serialize(useEditorV3Store.getState())
  const res = await fetch("/api/editor-v3/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, data }),
  })
  if (!res.ok) throw new Error(`Failed to create project: ${res.status}`)
  const row = await res.json() as { id: string }
  return row.id
}

export async function loadFromDatabase(projectId: string): Promise<boolean> {
  const res = await fetch(`/api/editor-v3/projects/${projectId}`)
  if (!res.ok) return false
  const row = await res.json() as { data: SerializedData }
  deserialize(row.data)
  return true
}

// --- Version History ---

interface VersionListItem {
  id: string
  version: number
  label: string | null
  createdAt: string
}

export async function listVersions(projectId: string): Promise<VersionListItem[]> {
  const res = await fetch(`/api/editor-v3/projects/${projectId}/versions`)
  if (!res.ok) throw new Error(`Failed to list versions: ${res.status}`)
  return res.json()
}

export async function saveVersion(projectId: string, label?: string): Promise<void> {
  const res = await fetch(`/api/editor-v3/projects/${projectId}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label }),
  })
  if (!res.ok) throw new Error(`Failed to save version: ${res.status}`)
}

export async function restoreVersion(projectId: string, versionId: string): Promise<boolean> {
  const res = await fetch(`/api/editor-v3/projects/${projectId}/versions/${versionId}`)
  if (!res.ok) return false
  const row = await res.json() as { data: SerializedData }
  deserialize(row.data)
  // Also save restored data as current project state
  await saveToDatabase(projectId).catch(console.error)
  return true
}

/** Auto-save on every store change (debounced) */
export function startAutoSave(delayMs = 1000): () => void {
  let timer: ReturnType<typeof setTimeout>
  const unsub = useEditorV3Store.subscribe(() => {
    clearTimeout(timer)
    timer = setTimeout(saveToLocalStorage, delayMs)
  })
  return () => { clearTimeout(timer); unsub() }
}

/** Auto-save to database on every store change (debounced) */
export function startDatabaseAutoSave(projectId: string, delayMs = 3000): () => void {
  let timer: ReturnType<typeof setTimeout>
  const unsub = useEditorV3Store.subscribe(() => {
    clearTimeout(timer)
    timer = setTimeout(() => { saveToDatabase(projectId).catch(console.error) }, delayMs)
  })
  return () => { clearTimeout(timer); unsub() }
}

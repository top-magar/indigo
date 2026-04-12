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
}

function serialize(s: EditorV3Store): string {
  const data: SerializedData = {
    instances: [...s.instances],
    props: [...s.props],
    styleSources: [...s.styleSources],
    styleSourceSelections: [...s.styleSourceSelections],
    styleDeclarations: [...s.styleDeclarations],
    breakpoints: [...s.breakpoints],
    pages: [...s.pages],
    assets: [...s.assets],
  }
  return JSON.stringify(data)
}

export function saveToLocalStorage(): void {
  const data = serialize(useEditorV3Store.getState())
  localStorage.setItem(STORAGE_KEY, data)
}

export function loadFromLocalStorage(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  try {
    const data: SerializedData = JSON.parse(raw)
    useEditorV3Store.setState((s) => {
      s.instances = new Map(data.instances) as typeof s.instances
      s.props = new Map(data.props) as typeof s.props
      s.styleSources = new Map(data.styleSources) as typeof s.styleSources
      s.styleSourceSelections = new Map(data.styleSourceSelections) as typeof s.styleSourceSelections
      s.styleDeclarations = new Map(data.styleDeclarations) as typeof s.styleDeclarations
      s.breakpoints = new Map(data.breakpoints) as typeof s.breakpoints
      s.pages = new Map(data.pages) as typeof s.pages
      s.assets = new Map(data.assets) as typeof s.assets
    })
    // Set first page as current
    const firstPage = [...useEditorV3Store.getState().pages.values()][0]
    if (firstPage) useEditorV3Store.getState().setPage(firstPage.id)
    return true
  } catch { return false }
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

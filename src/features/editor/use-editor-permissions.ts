import { createContext, useContext } from "react"

export type EditorRole = "owner" | "admin" | "editor" | "viewer"

export interface EditorPermissions {
  role: EditorRole
  canEdit: boolean
  canPublish: boolean
  canDelete: boolean
  canEditTheme: boolean
}

const PERMISSION_MAP: Record<EditorRole, Omit<EditorPermissions, "role">> = {
  owner: { canEdit: true, canPublish: true, canDelete: true, canEditTheme: true },
  admin: { canEdit: true, canPublish: true, canDelete: true, canEditTheme: true },
  editor: { canEdit: true, canPublish: false, canDelete: false, canEditTheme: false },
  viewer: { canEdit: false, canPublish: false, canDelete: false, canEditTheme: false },
}

export function resolvePermissions(role: string): EditorPermissions {
  const r = (role || "viewer") as EditorRole
  return { role: r, ...(PERMISSION_MAP[r] ?? PERMISSION_MAP.viewer) }
}

const EditorPermissionsContext = createContext<EditorPermissions>(resolvePermissions("owner"))

export const EditorPermissionsProvider = EditorPermissionsContext.Provider
export const useEditorPermissions = () => useContext(EditorPermissionsContext)

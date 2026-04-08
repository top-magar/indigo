"use client"

/**
 * Editor presence hook — wraps the dashboard PresenceIndicator's room convention.
 * Room ID format: `editor:{pageId}`
 * The actual WebSocket connection is handled by PresenceIndicator internally.
 * This file exists as a convenience for components that need the room ID.
 */
export function editorRoomId(pageId: string): string {
  return `editor:${pageId}`
}

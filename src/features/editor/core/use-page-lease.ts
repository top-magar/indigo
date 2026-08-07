"use client"

import { useCallback, useEffect, useState } from "react"
import { acquirePageLease, releasePageLease } from "../lib/session-actions"
import { trackEditorEvent } from "../lib/editor-analytics"

type LeaseState =
  | { status: "acquiring" }
  | { status: "held"; expiresAt: string }
  | { status: "blocked"; holderName: string; expiresAt: string }
  | { status: "error"; message: string }

export function usePageLease(projectId: string, pageId: string | null) {
  const [sessionId] = useState(() => crypto.randomUUID())
  const [state, setState] = useState<LeaseState>({ status: "acquiring" })

  const acquire = useCallback(async (takeover = false) => {
    if (!pageId) return
    const result = await acquirePageLease({ projectId, pageId, sessionId, takeover })
    if (result.ok) {
      setState({ status: "held", expiresAt: result.lease.expiresAt })
      if (takeover) trackEditorEvent({ name: "page_lease_taken_over" })
    }
    else if (result.code === "conflict") setState({ status: "blocked", holderName: result.holder?.name || "Another editor", expiresAt: result.holder?.expiresAt || "" })
    else setState({ status: "error", message: result.message })
  }, [pageId, projectId, sessionId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void acquire()
    const heartbeat = window.setInterval(() => void acquire(), 30_000)
    return () => {
      window.clearInterval(heartbeat)
      if (pageId) void releasePageLease({ projectId, pageId, sessionId })
    }
  }, [acquire, pageId, projectId, sessionId])

  return { state, takeover: () => acquire(true), retry: () => acquire(false) }
}

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { acquireBlockLock, releaseBlockLock, renewBlockLock } from "./block-lock-actions"

/** Acquires a lock when blockId is set, renews every 30s, releases on deselect/unmount. */
export function useBlockLock(tenantId: string, layoutId: string | null, blockId: string | null) {
  const [holder, setHolder] = useState<string | null>(null)
  const lockedRef = useRef<string | null>(null)
  const renewRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const release = useCallback(async () => {
    if (lockedRef.current && layoutId) {
      await releaseBlockLock(tenantId, layoutId, lockedRef.current).catch(() => {})
      lockedRef.current = null
    }
    clearInterval(renewRef.current)
  }, [tenantId, layoutId])

  useEffect(() => {
    if (!blockId || !layoutId) { release(); setHolder(null); return }

    let cancelled = false
    acquireBlockLock(tenantId, layoutId, blockId).then((res) => {
      if (cancelled) return
      if (res.acquired) {
        lockedRef.current = blockId
        setHolder(null)
        // Renew every 30s
        renewRef.current = setInterval(() => {
          renewBlockLock(tenantId, layoutId, blockId).catch(() => {})
        }, 30_000)
      } else {
        setHolder(res.holder)
      }
    })

    return () => { cancelled = true; release() }
  }, [tenantId, layoutId, blockId, release])

  // Release on unmount
  useEffect(() => () => { release() }, [release])

  return { isLocked: !!holder, holder }
}

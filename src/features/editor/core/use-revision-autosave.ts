"use client"

import { useCallback, useEffect, useRef } from "react"
import { saveDraft } from "../lib/session-actions"
import type { EditorDocumentV2 } from "./document-v2"
import { useDocumentStore } from "./document-store"
import { trackEditorEvent } from "../lib/editor-analytics"

type RevisionAutosaveOptions = {
  projectId: string
  pageId: string | null
  pageName: string
  pageSlug: string
  currency: string
  delay?: number
}

export function useRevisionAutosave({
  projectId,
  pageId,
  pageName,
  pageSlug,
  currency,
  delay = 1500,
}: RevisionAutosaveOptions) {
  const localRevision = useDocumentStore((state) => state.localRevision)
  const acknowledgedLocalRevision = useDocumentStore((state) => state.acknowledgedLocalRevision)
  const saveStatus = useDocumentStore((state) => state.saveStatus)
  const saveError = useDocumentStore((state) => state.saveError)
  const optionsRef = useRef({ projectId, pageId, pageName, pageSlug, currency })
  const savePromiseRef = useRef<Promise<boolean> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    optionsRef.current = { projectId, pageId, pageName, pageSlug, currency }
  }, [currency, pageId, pageName, pageSlug, projectId])

  const drainQueue = useCallback((): Promise<boolean> => {
    if (savePromiseRef.current) return savePromiseRef.current

    const run = async () => {
      while (true) {
        const state = useDocumentStore.getState()
        const options = optionsRef.current
        if (!options.pageId || state.localRevision <= state.acknowledgedLocalRevision) return true

        const capturedLocalRevision = state.localRevision
        const capturedServerRevision = state.serverRevision
        const document: EditorDocumentV2 = {
          schemaVersion: 2,
          page: { id: options.pageId, name: options.pageName.trim() || "Untitled page", slug: options.pageSlug },
          root: state.elements,
          settings: { currency: options.currency, locale: "en-NP" },
        }

        state.markSaving()
        const result = await saveDraft({
          projectId: options.projectId,
          pageId: options.pageId,
          baseServerRevision: capturedServerRevision,
          localRevision: capturedLocalRevision,
          document,
        })

        if (!result.ok) {
          useDocumentStore.getState().failSave(result.message, result.code === "conflict")
          trackEditorEvent({ name: "save_failed", reason: result.code })
          return false
        }

        useDocumentStore.getState().acknowledgeSave(result.acknowledgedLocalRevision, result.serverRevision)
      }
    }

    savePromiseRef.current = run().finally(() => {
      savePromiseRef.current = null
    })
    return savePromiseRef.current
  }, [])

  useEffect(() => {
    if (localRevision <= acknowledgedLocalRevision || saveStatus === "saving" || saveStatus === "conflict") return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => void drainQueue(), delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [acknowledgedLocalRevision, delay, drainQueue, localRevision, saveStatus])

  useEffect(() => {
    const warnForPendingRevisions = (event: BeforeUnloadEvent) => {
      const state = useDocumentStore.getState()
      if (state.localRevision <= state.acknowledgedLocalRevision) return
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warnForPendingRevisions)
    return () => window.removeEventListener("beforeunload", warnForPendingRevisions)
  }, [])

  return {
    saveStatus,
    saveError,
    hasPendingRevisions: localRevision > acknowledgedLocalRevision,
    saveNow: drainQueue,
    retrySave: drainQueue,
  }
}

"use client"

import { useCallback } from "react"
import { v4 } from "uuid"
import { isContainer, makeEl } from "./registry"
import type { El } from "./types"
import { useEditor } from "./provider"
import { trackEditorEvent } from "../lib/editor-analytics"

function renewIds(element: El): El {
  return {
    ...element,
    id: v4(),
    content: Array.isArray(element.content) ? element.content.map(renewIds) : element.content,
  }
}

export function useInsertElement() {
  const { state, dispatch } = useEditor()

  return useCallback((type: string, savedElement?: El) => {
    const element = savedElement ? renewIds(savedElement) : makeEl(type)
    if (!element) return false
    const body = state.editor.elements[0]
    if (!body) return false
    const selected = state.editor.selected
    const sectionLevel = ["hero", "cta", "features", "pricing", "testimonial", "stats", "productGrid", "navbar", "footer"].includes(type)
    const containerId = !sectionLevel && selected && isContainer(selected.type) ? selected.id : body.id
    dispatch({ type: "ADD_ELEMENT", payload: { containerId, element } })
    dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { element } })
    trackEditorEvent({ name: "section_inserted", sectionType: type, method: "click" })
    return true
  }, [dispatch, state.editor.elements, state.editor.selected])
}

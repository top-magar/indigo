"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import { createRoot, type Root } from "react-dom/client"
import { Editor, Frame, Element } from "@craftjs/core"
import { resolver } from "../resolver"
import { RenderNode } from "./render-node"
import { Container } from "../blocks/container"
import { EditorErrorBoundary } from "../components/editor-error-boundary"
import { EmptyCanvasState } from "./empty-canvas-state"
import { IframeBridgeReceiver } from "./iframe-bridge-receiver"
import { BreakpointProvider } from "../breakpoint-context"
import { themeToVars } from "../lib/theme-to-vars"
import type { Viewport } from "../hooks/use-viewport-zoom"

interface IframeCanvasProps {
  craftJson: string | null
  theme: Record<string, unknown>
  editorKey: string
  viewport: Viewport
  zoom: number
  defaultPageJson: () => string
}

const VIEWPORT_PX: Record<Viewport, number> = { desktop: 1280, tablet: 768, mobile: 375 }

export function IframeCanvas({ craftJson, theme, editorKey, viewport, zoom, defaultPageJson }: IframeCanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const rootRef = useRef<Root | null>(null)
  const [ready, setReady] = useState(false)

  const themeVars = useMemo(() => themeToVars(theme), [theme])
  const breakpoint = viewport === "mobile" ? "mobile" : viewport === "tablet" ? "tablet" : "desktop"

  // Mount React root inside iframe on first load
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const onLoad = () => {
      const doc = iframe.contentDocument
      if (!doc) return

      // Inject base styles
      doc.head.innerHTML = `
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: var(--store-font-body, Inter, system-ui, sans-serif); color: var(--store-text, #111827); background: var(--store-bg, #fff); }
          [data-craft-node-id] h1,[data-craft-node-id] h2,[data-craft-node-id] h3,[data-craft-node-id] h4 {
            letter-spacing: var(--store-heading-tracking, 0em);
            font-size: calc(1em * var(--store-heading-scale, 100) / 100);
          }
          [data-craft-node-id] { line-height: var(--store-body-leading, 1.6); }
          [data-craft-node-id] > [data-craft-node-id] {
            margin-bottom: var(--store-section-gap-v, 48px);
            padding-left: var(--store-section-gap-h, 24px);
            padding-right: var(--store-section-gap-h, 24px);
          }
          [data-craft-node-id] [data-craft-node-id] > div { max-width: var(--store-max-width, none); margin-left: auto; margin-right: auto; }
        </style>
      `

      // Create mount point
      let mount = doc.getElementById("editor-root")
      if (!mount) {
        mount = doc.createElement("div")
        mount.id = "editor-root"
        doc.body.appendChild(mount)
      }

      rootRef.current = createRoot(mount)
      setReady(true)
    }

    iframe.addEventListener("load", onLoad)
    // Trigger load for srcDoc
    if (iframe.contentDocument?.readyState === "complete") onLoad()

    return () => {
      iframe.removeEventListener("load", onLoad)
      rootRef.current?.unmount()
      rootRef.current = null
      setReady(false)
    }
  }, [])

  // Render/update the React tree inside the iframe
  useEffect(() => {
    if (!ready || !rootRef.current) return

    rootRef.current.render(
      <BreakpointProvider value={breakpoint}>
        <Editor key={editorKey} resolver={resolver} onRender={RenderNode}>
          <IframeBridgeReceiver />
          <EditorErrorBoundary>
            <Frame json={craftJson ?? defaultPageJson()}>
              <Element canvas is={Container as React.ElementType} />
            </Frame>
          </EditorErrorBoundary>
          <EmptyCanvasState onAddSection={() => window.parent.postMessage({ type: "section:add" }, "*")} />
        </Editor>
      </BreakpointProvider>
    )
  }, [ready, editorKey, craftJson, breakpoint, defaultPageJson])

  // Sync theme CSS vars to iframe body
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const body = doc.body
    Object.entries(themeVars).forEach(([k, v]) => { body.style.setProperty(k, v as string) })

    // Load fonts
    const headingFont = theme.headingFont as string | undefined
    const bodyFont = theme.bodyFont as string | undefined
    const fonts = [headingFont, bodyFont].filter((f): f is string => !!f && f !== "System UI")
    if (fonts.length > 0) {
      const params = fonts.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")
      const href = `https://fonts.googleapis.com/css2?${params}&display=swap`
      if (!doc.querySelector(`link[href="${href}"]`)) {
        const link = doc.createElement("link")
        link.rel = "stylesheet"
        link.href = href
        doc.head.appendChild(link)
      }
    }

    // Custom CSS
    const customCss = theme.customCss as string | undefined
    let styleEl = doc.getElementById("custom-css") as HTMLStyleElement | null
    if (customCss) {
      if (!styleEl) { styleEl = doc.createElement("style"); styleEl.id = "custom-css"; doc.head.appendChild(styleEl) }
      styleEl.textContent = customCss
    } else {
      styleEl?.remove()
    }
  }, [themeVars, theme])

  return (
    <iframe
      ref={iframeRef}
      srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
      data-editor-iframe
      title="Editor canvas"
      style={{
        width: VIEWPORT_PX[viewport],
        maxWidth: "100%",
        height: "100%",
        border: "none",
        display: "block",
        background: "var(--store-bg, #fff)",
      }}
    />
  )
}

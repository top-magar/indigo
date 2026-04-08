"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import type { Viewport } from "../hooks/use-viewport-zoom"

interface IframePortalProps {
  viewport: Viewport
  theme: Record<string, unknown>
  themeVars: React.CSSProperties
  children: ReactNode
}

const VIEWPORT_PX: Record<Viewport, number> = { desktop: 1280, tablet: 768, mobile: 375 }

/**
 * Renders children into an iframe document via React portal.
 * Craft.js <Frame> stays in the parent React tree (so useEditor works),
 * but its DOM output appears inside the iframe for style isolation.
 */
export function IframePortal({ viewport, theme, themeVars, children }: IframePortalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const setup = () => {
      const doc = iframe.contentDocument
      if (!doc) return

      // Base styles
      doc.head.innerHTML = `<style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--store-font-body, Inter, system-ui, sans-serif); }
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
      </style>`

      let mount = doc.getElementById("portal-root")
      if (!mount) {
        mount = doc.createElement("div")
        mount.id = "portal-root"
        doc.body.appendChild(mount)
      }
      setMountNode(mount)
    }

    iframe.addEventListener("load", setup)
    if (iframe.contentDocument?.readyState === "complete") setup()
    return () => { iframe.removeEventListener("load", setup); setMountNode(null) }
  }, [])

  // Sync theme vars to iframe body
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    const body = doc.body
    Object.entries(themeVars).forEach(([k, v]) => body.style.setProperty(k, String(v)))
    body.style.backgroundColor = "var(--store-bg, #fff)"
    body.style.color = "var(--store-text, #111827)"
    body.style.fontFamily = "var(--store-font-body, Inter)"

    // Load fonts
    const fonts = [theme.headingFont, theme.bodyFont].filter((f): f is string => typeof f === "string" && f !== "System UI")
    if (fonts.length > 0) {
      const params = fonts.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")
      const href = `https://fonts.googleapis.com/css2?${params}&display=swap`
      if (!doc.querySelector(`link[href="${href}"]`)) {
        const link = doc.createElement("link"); link.rel = "stylesheet"; link.href = href; doc.head.appendChild(link)
      }
    }

    // Custom CSS
    const customCss = theme.customCss as string | undefined
    let styleEl = doc.getElementById("custom-css") as HTMLStyleElement | null
    if (customCss) {
      if (!styleEl) { styleEl = doc.createElement("style"); styleEl.id = "custom-css"; doc.head.appendChild(styleEl) }
      styleEl.textContent = customCss
    } else { styleEl?.remove() }
  }, [themeVars, theme])

  return (
    <>
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
        }}
      />
      {mountNode && createPortal(children, mountNode)}
    </>
  )
}

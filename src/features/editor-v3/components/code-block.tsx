import { forwardRef, useMemo } from "react"

type Props = {
  html?: string
  css?: string
  js?: string
  style?: React.CSSProperties
}

function buildSrcdoc(html: string, css: string, js: string): string {
  return `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`
}

export const CodeBlock = forwardRef<HTMLDivElement, Props>(
  ({ html = "", css = "", js = "", style }, ref) => {
    const srcdoc = useMemo(() => buildSrcdoc(html, css, js), [html, css, js])
    const hasContent = html || css || js

    return (
      <div ref={ref} style={{ position: "relative", minHeight: 60, ...style }}>
        {hasContent ? (
          <iframe
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            style={{ width: "100%", minHeight: 60, border: "none", display: "block" }}
            title="Code Block"
          />
        ) : (
          <div style={{ padding: 16, border: "2px dashed #d1d5db", borderRadius: 4, fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
            Code Block — add HTML/CSS/JS in Settings
          </div>
        )}
      </div>
    )
  }
)
CodeBlock.displayName = "CodeBlock"

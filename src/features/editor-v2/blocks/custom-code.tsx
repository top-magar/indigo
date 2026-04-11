interface CustomCodeProps { html: string; css: string; _sectionId?: string }

export function CustomCode({ html, css, _sectionId }: CustomCodeProps) {
  if (_sectionId) {
    return (
      <div className="rounded border bg-gray-50 p-4">
        <p className="mb-2 text-xs font-semibold text-gray-400">Custom Code Preview</p>
        {html && <pre className="mb-2 overflow-auto rounded bg-gray-900 p-3 text-xs text-green-400">{html}</pre>}
        {css && <pre className="overflow-auto rounded bg-gray-900 p-3 text-xs text-blue-400">{css}</pre>}
      </div>
    )
  }
  return (
    <>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div dangerouslySetInnerHTML={{ __html: html || "" }} />
    </>
  )
}

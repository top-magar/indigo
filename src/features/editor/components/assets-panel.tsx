"use client"

import { Image, Upload } from "lucide-react"

/** Placeholder media browser — will connect to store media API */
export function AssetsPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 12px 8px', fontSize: 13, fontWeight: 600, color: 'var(--editor-text)' }}>
        Assets
      </div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center',
      }}>
        <Image style={{ width: 32, height: 32, color: 'var(--editor-text-disabled)' }} />
        <p style={{ fontSize: 13, color: 'var(--editor-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Upload images and media to use across your store.
        </p>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 14px', borderRadius: 6,
          border: '1px solid var(--editor-border)', background: 'var(--editor-surface)',
          fontSize: 13, fontWeight: 500, color: 'var(--editor-text)', cursor: 'pointer',
        }}>
          <Upload style={{ width: 14, height: 14 }} />
          Upload
        </button>
      </div>
    </div>
  )
}

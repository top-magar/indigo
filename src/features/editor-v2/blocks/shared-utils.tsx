/** Safely parse a JSON string, returning fallback on failure. */
export function safeParseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) } catch { return fallback }
}

/** Social platform SVG paths (24x24 viewBox). */
export const socialPaths: Record<string, string> = {
  facebook: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  instagram: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6",
  twitter: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z",
  x: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.3l13.31 17.41z",
  youtube: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  linkedin: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 013.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77A1.75 1.75 0 000 1.73v20.54A1.75 1.75 0 001.77 24h20.45A1.76 1.76 0 0024 22.27V1.73A1.76 1.76 0 0022.22 0z",
  tiktok: "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.07a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.01-.5z",
  pinterest: "M12 0a12 12 0 00-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.96s-.36-.72-.36-1.78c0-1.66.97-2.9 2.17-2.9 1.02 0 1.52.77 1.52 1.7 0 1.03-.66 2.58-1 4.01-.28 1.2.6 2.17 1.78 2.17 2.14 0 3.78-2.26 3.78-5.52 0-2.89-2.08-4.9-5.04-4.9-3.44 0-5.46 2.57-5.46 5.24 0 1.04.4 2.15.9 2.75a.36.36 0 01.08.35l-.34 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.43-2.9-2.43-4.66 0-3.78 2.75-7.26 7.93-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.6 7.46-6.23 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.86c-.27 1.04-1 2.35-1.49 3.15A12 12 0 1012 0z",
}

/** Render a social icon with SVG. Falls back to first-letter circle for unknown platforms. */
export function SocialIcon({ platform, url, color }: { platform: string; url: string; color: string }) {
  const key = platform.toLowerCase()
  const path = socialPaths[key]
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={platform}
      className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
      style={{ background: `color-mix(in srgb, ${color} 10%, transparent)` }}>
      {path
        ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill={color}><path d={path} /></svg>
        : <span className="text-xs font-bold" style={{ color }}>{platform[0]?.toUpperCase()}</span>
      }
    </a>
  )
}

/** Loads Google Fonts for the current theme */
export function ThemeFontLoader({ headingFont, bodyFont }: { headingFont?: string; bodyFont?: string }) {
  const fonts = [headingFont, bodyFont].filter((f): f is string => !!f && f !== "System UI")
  if (fonts.length === 0) return null
  const params = fonts.map((f) => `family=${f.replace(/ /g, "+")}`).join("&")
  // eslint-disable-next-line @next/next/no-page-custom-font
  return <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${params}&display=swap`} />
}

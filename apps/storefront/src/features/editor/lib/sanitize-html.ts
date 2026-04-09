/** Strip dangerous HTML: scripts, event handlers, javascript: URIs */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*["']?\s*javascript:/gi, 'href="')
    .replace(/src\s*=\s*["']?\s*javascript:/gi, 'src="')
}

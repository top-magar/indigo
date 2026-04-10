import DOMPurify from "isomorphic-dompurify";

/** Sanitize HTML — allowlist-based via DOMPurify */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "b", "i", "u", "strong", "em", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "span", "div", "blockquote", "img", "sub", "sup"],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "width", "height", "class", "style"],
    ALLOW_DATA_ATTR: false,
  });
}

/** Sanitize CSS — strip anything that could escape the style tag or execute JS */
export function sanitizeCss(css: string): string {
  return css
    .replace(/<\/?[^>]*>/g, "")           // strip all HTML tags
    .replace(/expression\s*\(/gi, "")      // IE expression()
    .replace(/url\s*\(\s*["']?\s*javascript:/gi, "url(") // javascript: in url()
    .replace(/@import\s+url\s*\(\s*["']?\s*javascript:/gi, "@import url(") // @import javascript:
    .replace(/behavior\s*:/gi, "")         // IE behavior
    .replace(/-moz-binding\s*:/gi, "");    // Firefox XBL
}

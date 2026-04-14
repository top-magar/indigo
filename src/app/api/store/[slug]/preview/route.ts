import { NextRequest, NextResponse } from "next/server"
import type { SectionConfig } from "@/features/store/section-registry"

/**
 * Preview API — renders section HTML from POST body without saving.
 * Used by the section builder iframe for live preview.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json() as { sections: SectionConfig[]; primaryColor: string }

  // Build a minimal HTML page with the section content
  const sectionsHtml = body.sections
    .filter(s => s.visible && s.type !== "header" && s.type !== "footer" && s.type !== "announcement")
    .sort((a, b) => a.order - b.order)
    .map(s => renderSectionPreview(s, slug, body.primaryColor))
    .join("")

  const announcement = body.sections.find(s => s.type === "announcement" && s.visible)

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"><\/script>
<style>body{font-family:'Inter',sans-serif;margin:0}</style>
</head><body class="bg-white">
${announcement ? `<div style="background:${body.primaryColor};color:#fff" class="text-center py-2 px-4 text-sm font-medium">${esc(announcement.content.text || "")}</div>` : ""}
<header class="border-b px-6 py-4 flex items-center justify-between">
  <span class="font-bold text-lg">${esc(slug)}</span>
  <nav class="flex gap-4 text-sm text-gray-500"><span>Home</span><span>Products</span><span>Categories</span></nav>
</header>
${sectionsHtml}
<footer class="border-t px-6 py-8 text-center text-sm text-gray-400 mt-8">© ${new Date().getFullYear()} ${esc(slug)}</footer>
</body></html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function renderSectionPreview(s: SectionConfig, slug: string, color: string): string {
  const c = s.content

  switch (s.type) {
    case "hero": {
      const title = esc(c.title || "Welcome")
      const subtitle = esc(c.subtitle || "")
      const cta = esc(c.cta || "Shop Now")
      const img = c.imageUrl

      if (s.variant === "hero-split") {
        return `<section class="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div><h1 class="text-4xl font-bold tracking-tight">${title}</h1>
          ${subtitle ? `<p class="mt-4 text-lg text-gray-500">${subtitle}</p>` : ""}
          <a href="#" class="inline-block mt-8 px-6 py-3 rounded-md text-white text-sm font-medium" style="background:${color}">${cta}</a></div>
          ${img ? `<div class="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"><img src="${esc(img)}" class="w-full h-full object-cover"/></div>` : ""}
        </section>`
      }
      if (s.variant === "hero-minimal") {
        return `<section class="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 class="text-5xl font-bold tracking-tight">${title}</h1>
          ${subtitle ? `<p class="mt-6 text-xl text-gray-500">${subtitle}</p>` : ""}
          <a href="#" class="inline-block mt-10 px-6 py-3 rounded-md text-white text-sm font-medium" style="background:${color}">${cta}</a>
        </section>`
      }
      // fullwidth
      return `<section class="relative overflow-hidden py-24" style="background:${img ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url(${esc(img)});background-size:cover;background-position:center` : color}">
        <div class="max-w-6xl mx-auto px-6 text-white">
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">${title}</h1>
          ${subtitle ? `<p class="mt-6 text-lg text-white/80 max-w-xl">${subtitle}</p>` : ""}
          <a href="#" class="inline-block mt-10 px-6 py-3 rounded-md bg-white text-black text-sm font-medium">${cta}</a>
        </div>
      </section>`
    }

    case "product-grid":
      return `<section class="max-w-6xl mx-auto px-6 py-12">
        <h2 class="text-2xl font-bold mb-8">${esc(c.title || "Featured Products")}</h2>
        <div class="grid ${s.variant === "products-grid-4" ? "grid-cols-4" : "grid-cols-3"} gap-6">
          ${Array.from({ length: Number(c.limit) || 4 }, (_, i) => `
            <div class="group"><div class="aspect-square rounded-xl bg-gray-100 mb-3"></div>
            <p class="text-sm font-medium">Product ${i + 1}</p>
            <p class="text-sm" style="color:${color}">Rs ${(Math.random() * 500 + 100).toFixed(0)}</p></div>
          `).join("")}
        </div>
      </section>`

    case "categories":
      return `<section class="max-w-6xl mx-auto px-6 py-12">
        <h2 class="text-2xl font-bold mb-8">${esc(c.title || "Shop by Category")}</h2>
        <div class="grid grid-cols-4 gap-4">
          ${["Clothing", "Electronics", "Home", "Beauty"].map(cat => `
            <div class="rounded-xl border p-4 text-center">
              <div class="w-12 h-12 rounded-full mx-auto mb-3" style="background:${color}15"></div>
              <p class="text-sm font-medium">${cat}</p>
            </div>
          `).join("")}
        </div>
      </section>`

    case "banner":
      return `<section class="py-12" style="background:${color}">
        <div class="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 class="text-2xl font-bold">${esc(c.title || "")}</h2>
          ${c.subtitle ? `<p class="mt-3 text-white/80">${esc(c.subtitle)}</p>` : ""}
          ${c.cta ? `<a href="#" class="inline-block mt-6 px-6 py-3 rounded-md bg-white text-black text-sm font-medium">${esc(c.cta)}</a>` : ""}
        </div>
      </section>`

    case "testimonials":
      return `<section class="max-w-6xl mx-auto px-6 py-12">
        <h2 class="text-2xl font-bold text-center mb-10">${esc(c.title || "What Our Customers Say")}</h2>
        <div class="grid grid-cols-3 gap-6">
          ${["Great quality!", "Fast delivery!", "Love it!"].map((t, i) => `
            <div class="rounded-xl border p-6">
              <p class="text-sm text-gray-500">${t}</p>
              <div class="mt-4 flex items-center gap-2">
                <div class="w-8 h-8 rounded-full text-white text-xs flex items-center justify-center" style="background:${color}">C</div>
                <span class="text-sm font-medium">Customer ${i + 1}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </section>`

    default:
      return ""
  }
}

import { NextRequest, NextResponse } from "next/server"
import type { SectionConfig } from "@/features/store/section-registry"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const body = await request.json() as { sections: SectionConfig[]; primaryColor: string }
  const color = body.primaryColor || "#3b82f6"

  const content = body.sections
    .filter(s => s.visible && s.type !== "header" && s.type !== "footer" && s.type !== "announcement")
    .sort((a, b) => a.order - b.order)
    .map(s => renderSection(s, slug, color))
    .join("")

  const ann = body.sections.find(s => s.type === "announcement" && s.visible)

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;color:#111;background:#fff}
a{text-decoration:none;color:inherit}
.container{max-width:1100px;margin:0 auto;padding:0 24px}
.grid{display:grid;gap:20px}
.g2{grid-template-columns:repeat(2,1fr)}
.g3{grid-template-columns:repeat(3,1fr)}
.g4{grid-template-columns:repeat(4,1fr)}
.flex{display:flex;align-items:center}
.between{justify-content:space-between}
.center{text-align:center}
.rounded{border-radius:12px}
.border{border:1px solid #e5e7eb}
.muted{color:#6b7280}
.small{font-size:13px}
.btn{display:inline-block;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer}
.img-placeholder{aspect-ratio:1;background:#f3f4f6;border-radius:12px;display:flex;align-items:center;justify-content:center}
.img-placeholder svg{width:32px;height:32px;color:#d1d5db}
img{width:100%;height:100%;object-fit:cover}
@media(max-width:640px){.g3,.g4{grid-template-columns:repeat(2,1fr)}}
</style>
</head><body>
${ann ? `<div style="background:${e(color)};color:#fff;text-align:center;padding:8px 16px;font-size:13px;font-weight:500">${e(ann.content.text || "")}</div>` : ""}
<header style="border-bottom:1px solid #e5e7eb;padding:16px 24px" class="flex between">
  <div style="font-weight:700;font-size:18px">${e(slug.split("-")[0])}</div>
  <nav class="flex" style="gap:20px;font-size:14px" class="muted"><a href="#">Home</a><a href="#">Products</a><a href="#">Categories</a></nav>
</header>
${content}
<footer style="border-top:1px solid #e5e7eb;padding:32px 24px;text-align:center;color:#9ca3af;font-size:13px;margin-top:40px">&copy; ${new Date().getFullYear()} ${e(slug.split("-")[0])}</footer>
</body></html>`

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } })
}

function e(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

const placeholder = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`

function renderSection(s: SectionConfig, slug: string, color: string): string {
  const c = s.content

  switch (s.type) {
    case "hero": {
      const title = e(c.title || "Welcome to our store")
      const subtitle = e(c.subtitle || "")
      const cta = e(c.cta || "Shop Now")
      const img = c.imageUrl

      if (s.variant === "hero-split") {
        return `<section class="container" style="padding-top:64px;padding-bottom:64px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center">
          <div>
            <h1 style="font-size:40px;font-weight:700;line-height:1.1">${title}</h1>
            ${subtitle ? `<p style="margin-top:16px;font-size:18px;color:#6b7280">${subtitle}</p>` : ""}
            <a href="#" class="btn" style="margin-top:32px;background:${e(color)};color:#fff">${cta}</a>
          </div>
          <div style="aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:#f3f4f6">
            ${img ? `<img src="${e(img)}" alt="">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">${placeholder}</div>`}
          </div>
        </section>`
      }
      if (s.variant === "hero-minimal") {
        return `<section style="padding:80px 24px;text-align:center;max-width:700px;margin:0 auto">
          <h1 style="font-size:48px;font-weight:700;line-height:1.1">${title}</h1>
          ${subtitle ? `<p style="margin-top:20px;font-size:20px;color:#6b7280">${subtitle}</p>` : ""}
          <a href="#" class="btn" style="margin-top:40px;background:${e(color)};color:#fff">${cta}</a>
        </section>`
      }
      // fullwidth
      const bg = img ? `background:linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)),url(${e(img)});background-size:cover;background-position:center` : `background:${e(color)}`
      return `<section style="${bg};padding:80px 24px;color:#fff">
        <div class="container">
          <h1 style="font-size:44px;font-weight:700;line-height:1.1;max-width:600px">${title}</h1>
          ${subtitle ? `<p style="margin-top:20px;font-size:18px;opacity:0.8;max-width:500px">${subtitle}</p>` : ""}
          <a href="#" class="btn" style="margin-top:40px;background:#fff;color:#111">${cta}</a>
        </div>
      </section>`
    }

    case "product-grid": {
      const title = e(c.title || "Featured Products")
      const count = Math.min(Number(c.limit) || 4, 8)
      const cols = s.variant === "products-grid-4" ? "g4" : "g3"
      return `<section class="container" style="padding:48px 24px">
        <div class="flex between" style="margin-bottom:28px">
          <h2 style="font-size:24px;font-weight:700">${title}</h2>
          <a href="#" style="font-size:13px;font-weight:500;color:${e(color)}">View all →</a>
        </div>
        <div class="grid ${cols}">
          ${Array.from({ length: count }, (_, i) => `<div>
            <div class="img-placeholder">${placeholder}</div>
            <p style="font-weight:500;font-size:14px;margin-top:10px">Product ${i + 1}</p>
            <p style="font-size:14px;color:${e(color)};margin-top:2px">Rs ${(Math.random() * 900 + 100).toFixed(0)}</p>
          </div>`).join("")}
        </div>
      </section>`
    }

    case "categories": {
      const title = e(c.title || "Shop by Category")
      const cats = ["Clothing", "Electronics", "Home", "Beauty", "Footwear", "Accessories"]
      const count = s.variant === "categories-full-bg" ? 3 : 6

      if (s.variant === "categories-full-bg") {
        return `<section class="container" style="padding:48px 24px">
          <h2 style="font-size:24px;font-weight:700;margin-bottom:28px">${title}</h2>
          <div class="grid g3">
            ${cats.slice(0, count).map(cat => `<div style="position:relative;height:180px;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,${e(color)}22,${e(color)}44)">
              <div style="position:absolute;bottom:16px;left:16px">
                <div style="font-weight:600;font-size:16px">${cat}</div>
                <div style="font-size:12px;color:#6b7280">Browse →</div>
              </div>
            </div>`).join("")}
          </div>
        </section>`
      }

      return `<section class="container" style="padding:48px 24px">
        <h2 style="font-size:24px;font-weight:700;margin-bottom:28px">${title}</h2>
        <div class="grid ${s.variant === "categories-icons" ? "g4" : "g3"}" style="gap:12px">
          ${cats.slice(0, count).map(cat => `<div class="border rounded" style="padding:20px;text-align:center">
            <div style="width:44px;height:44px;border-radius:50%;background:${e(color)}15;margin:0 auto 10px;display:flex;align-items:center;justify-content:center">
              <div style="width:20px;height:20px;border-radius:4px;background:${e(color)}30"></div>
            </div>
            <div style="font-weight:500;font-size:13px">${cat}</div>
          </div>`).join("")}
        </div>
      </section>`
    }

    case "banner": {
      if (!c.title) return ""
      if (s.variant === "banner-split") {
        return `<section class="container" style="padding:48px 24px">
          <div style="display:grid;grid-template-columns:1fr 1fr;border-radius:16px;overflow:hidden;background:${e(color)}08">
            <div style="aspect-ratio:16/9;background:${e(color)}15;display:flex;align-items:center;justify-content:center">${placeholder}</div>
            <div style="padding:40px;display:flex;flex-direction:column;justify-content:center">
              <h2 style="font-size:24px;font-weight:700">${e(c.title)}</h2>
              ${c.subtitle ? `<p style="margin-top:10px;color:#6b7280">${e(c.subtitle)}</p>` : ""}
              ${c.cta ? `<a href="#" class="btn" style="margin-top:20px;background:${e(color)};color:#fff;width:fit-content">${e(c.cta)}</a>` : ""}
            </div>
          </div>
        </section>`
      }
      return `<section style="background:${e(color)};padding:48px 24px;text-align:center;color:#fff">
        <h2 style="font-size:24px;font-weight:700">${e(c.title)}</h2>
        ${c.subtitle ? `<p style="margin-top:10px;opacity:0.8">${e(c.subtitle)}</p>` : ""}
        ${c.cta ? `<a href="#" class="btn" style="margin-top:20px;background:#fff;color:#111">${e(c.cta)}</a>` : ""}
      </section>`
    }

    case "testimonials": {
      const title = e(c.title || "What Our Customers Say")
      const reviews = [
        { name: "Sita R.", text: "Amazing quality and fast delivery!" },
        { name: "Rajesh K.", text: "Best online shopping experience." },
        { name: "Anita S.", text: "Great products at affordable prices." },
      ]
      return `<section class="container" style="padding:48px 24px">
        <h2 style="font-size:24px;font-weight:700;text-align:center;margin-bottom:36px">${title}</h2>
        <div class="grid g3">
          ${reviews.map(r => `<div class="border rounded" style="padding:24px">
            <p style="font-size:14px;color:#6b7280;font-style:italic">"${r.text}"</p>
            <div class="flex" style="margin-top:16px;gap:10px">
              <div style="width:32px;height:32px;border-radius:50%;background:${e(color)};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600">${r.name[0]}</div>
              <span style="font-size:13px;font-weight:500">${r.name}</span>
            </div>
          </div>`).join("")}
        </div>
      </section>`
    }

    default: return ""
  }
}

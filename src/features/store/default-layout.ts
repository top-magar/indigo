import type { PageLayout } from "@/types/blocks"

/** Placeholder — will be rebuilt with Craft.js blocks */
export function createDefaultHomepageLayout(_storeSlug: string): PageLayout {
  return {
    id: "default-homepage",
    name: "Homepage",
    slug: "/",
    isHomepage: true,
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [],
  }
}

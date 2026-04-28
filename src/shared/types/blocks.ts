// Block types — will be rebuilt for Craft.js editor
// Minimal stubs to keep layout-service compiling

export interface StoreBlock {
  id: string
  type: string
  [key: string]: unknown
}

export interface PageLayout {
  id: string
  name: string
  slug: string
  blocks: StoreBlock[]
  isHomepage: boolean
  status: "draft" | "published"
  createdAt: string
  updatedAt: string
}

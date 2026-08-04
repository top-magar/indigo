import "server-only"

import { and, eq } from "drizzle-orm"
import { editorProjects } from "@/db/schema/editor-projects"
import { editorProjectVersions } from "@/db/schema/editor-project-versions"
import { products } from "@/db/schema/products"
import { collectionProducts } from "@/db/schema/collections"
import { tenants } from "@/db/schema/tenants"
import { withTenant } from "@/infrastructure/db"
import { isPublicationSnapshot, type StorefrontRenderContext } from "./storefront-renderer"

export async function loadPublishedStorefront(tenantId: string, pageSlug?: string) {
  return withTenant(tenantId, async (tx) => {
    const [project] = await tx.select({
      id: editorProjects.id,
      activePublishedVersionId: editorProjects.activePublishedVersionId,
    }).from(editorProjects).where(and(
      eq(editorProjects.tenantId, tenantId),
      eq(editorProjects.published, true),
    )).limit(1)
    if (!project?.activePublishedVersionId) return null

    const [[version], [tenant], productRows, collectionRows] = await Promise.all([
      tx.select({ data: editorProjectVersions.data }).from(editorProjectVersions).where(and(
        eq(editorProjectVersions.id, project.activePublishedVersionId),
        eq(editorProjectVersions.projectId, project.id),
        eq(editorProjectVersions.tenantId, tenantId),
      )).limit(1),
      tx.select({ name: tenants.name, slug: tenants.slug, currency: tenants.displayCurrency })
        .from(tenants).where(eq(tenants.id, tenantId)).limit(1),
      tx.select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        images: products.images,
      }).from(products).where(and(eq(products.tenantId, tenantId), eq(products.status, "active"))).limit(100),
      tx.select({ collectionId: collectionProducts.collectionId, productId: collectionProducts.productId })
        .from(collectionProducts).where(eq(collectionProducts.tenantId, tenantId)),
    ])
    if (!version || !tenant || !isPublicationSnapshot(version.data)) return null

    const page = pageSlug === undefined
      ? version.data.pages.find((item) => item.isHomepage && item.visible) ?? version.data.pages.find((item) => item.visible)
      : version.data.pages.find((item) => item.slug === pageSlug && item.visible)
    if (!page) return null

    const collections = collectionRows.reduce<Record<string, string[]>>((result, item) => {
      ;(result[item.collectionId] ??= []).push(item.productId)
      return result
    }, {})
    const context: StorefrontRenderContext = {
      store: { name: tenant.name, slug: tenant.slug },
      currency: tenant.currency || page.document.settings.currency,
      products: productRows,
      collections,
      navigation: version.data.pages.filter((item) => item.visible).map((item) => ({
        id: item.id,
        label: item.name,
        href: item.isHomepage ? `/store/${tenant.slug}` : `/store/${tenant.slug}/${item.slug}`,
      })),
    }
    return { page, context, project: version.data.project }
  })
}

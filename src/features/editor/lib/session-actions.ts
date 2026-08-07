"use server"

import { and, asc, desc, eq, inArray, lt, or, sql } from "drizzle-orm"
import { z } from "zod"
import { plans, subscriptions } from "@/db/schema/billing"
import { collections } from "@/db/schema/collections"
import { editorPageLeases } from "@/db/schema/editor-page-leases"
import { editorPages } from "@/db/schema/editor-pages"
import { editorProjects } from "@/db/schema/editor-projects"
import { editorProjectVersions } from "@/db/schema/editor-project-versions"
import { products } from "@/db/schema/products"
import { tenants } from "@/db/schema/tenants"
import { users } from "@/db/schema/users"
import { authorizedAction, requireTenantUser } from "@/lib/auth"
import type { Transaction } from "@/infrastructure/db"
import { editorDocumentV2Schema, migrateEditorDocument, type EditorDocumentV2 } from "../core/document-v2";
import { safeUrl } from "@/shared/utils/safe-url";
import { recordEditorError, withEditorSpan } from "./telemetry";
import type {
  LoadEditorSessionResult,
  PageLeaseResult,
  PublicationIssue,
  PublishSiteResult,
  RollbackPublicationResult,
  SaveDraftResult,
  ValidatePublicationResult,
} from "./contracts"

const idSchema = z.string().uuid()
const loadSchema = z.object({ projectId: idSchema, pageId: idSchema.optional() })
const saveSchema = z.object({
  projectId: idSchema,
  pageId: idSchema,
  baseServerRevision: z.number().int().min(0),
  localRevision: z.number().int().min(1),
  document: editorDocumentV2Schema,
})
const leaseSchema = z.object({
  projectId: idSchema,
  pageId: idSchema,
  sessionId: z.string().min(16).max(160),
  takeover: z.boolean().optional(),
})

type SnapshotPage = {
  id: string
  name: string
  slug: string
  order: number
  isHomepage: boolean | null
  visible: boolean
  seoTitle: string | null
  seoDescription: string | null
  ogImage: string | null
  document: EditorDocumentV2
}

async function loadOwnedProject(tx: Transaction, tenantId: string, projectId: string) {
  const [project] = await tx.select().from(editorProjects).where(and(
    eq(editorProjects.id, projectId),
    eq(editorProjects.tenantId, tenantId),
  )).limit(1)
  return project
}

async function loadPublicationDocuments(tx: Transaction, tenantId: string, projectId: string) {
  const [project, tenant] = await Promise.all([
    loadOwnedProject(tx, tenantId, projectId),
    tx.select({ currency: tenants.displayCurrency }).from(tenants).where(eq(tenants.id, tenantId)).limit(1),
  ])
  if (!project) return null

  const pageRows = await tx.select().from(editorPages).where(and(
    eq(editorPages.projectId, projectId),
    eq(editorPages.tenantId, tenantId),
  )).orderBy(asc(editorPages.order))

  const pages: SnapshotPage[] = pageRows.map((page) => ({
    id: page.id,
    name: page.name,
    slug: page.slug,
    order: page.order,
    isHomepage: page.isHomepage,
    visible: page.visible,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    ogImage: page.ogImage,
    document: migrateEditorDocument(
      page.data,
      { id: page.id, name: page.name, slug: page.slug, seoTitle: page.seoTitle, seoDescription: page.seoDescription, ogImage: page.ogImage },
      tenant[0]?.currency ?? "NPR",
    ),
  }))

  return { project, pages }
}

function walkDocument(document: EditorDocumentV2, visitor: (element: EditorDocumentV2["root"][number]) => void) {
  const walk = (elements: EditorDocumentV2["root"]) => {
    for (const element of elements) {
      visitor(element)
      if (Array.isArray(element.content)) walk(element.content)
    }
  }
  walk(document.root)
}

async function getPublicationIssues(
  tx: Transaction,
  tenantId: string,
  projectId: string,
): Promise<{ issues: PublicationIssue[]; warnings: PublicationIssue[]; loaded: Awaited<ReturnType<typeof loadPublicationDocuments>> }> {
  const issues: PublicationIssue[] = []
  const warnings: PublicationIssue[] = []

  const [subscription] = await tx.select({ name: plans.name, status: subscriptions.status })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.tenantId, tenantId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1)

  if (!subscription || subscription.name.toLowerCase() === "free" || !["active", "grace"].includes(subscription.status)) {
    issues.push({ code: "entitlement", message: "Publishing requires an active paid plan." })
  }

  let loaded: Awaited<ReturnType<typeof loadPublicationDocuments>> = null
  try {
    loaded = await loadPublicationDocuments(tx, tenantId, projectId)
  } catch {
    issues.push({ code: "migration", message: "One or more pages could not be migrated to the current editor format." })
    return { issues, warnings, loaded }
  }

  if (!loaded) {
    issues.push({ code: "content", message: "The storefront project could not be found." })
    return { issues, warnings, loaded }
  }
  if (loaded.pages.length === 0) issues.push({ code: "content", message: "Add at least one page before publishing." })
  if (!loaded.pages.some((page) => page.isHomepage)) issues.push({ code: "content", message: "Choose a homepage before publishing." })

  const pageSlugs = new Set(loaded.pages.map((page) => page.slug))
  const productIds = new Set<string>()
  const collectionIds = new Set<string>()

  for (const page of loaded.pages) {
    if (page.document.root.length === 0) {
      issues.push({ code: "content", pageId: page.id, message: `${page.name} has no content.` })
    }
    walkDocument(page.document, (element) => {
      if (element.binding?.source === "product" && element.binding.resourceId) productIds.add(element.binding.resourceId)
      if (element.binding?.source === "collection" && element.binding.resourceId) collectionIds.add(element.binding.resourceId)
      if (element.repeat?.resourceId) collectionIds.add(element.repeat.resourceId)
      if (!Array.isArray(element.content)) {
        const href = element.content.href
        if (href?.startsWith("#page:") && !pageSlugs.has(href.slice(6))) {
          issues.push({ code: "link", pageId: page.id, elementId: element.id, message: `Fix the broken page link in ${element.name}.` })
        }
        // URL scheme validation for every URL-like content field. This covers
        // built-in href/src values and plugin endpoints/actions/URLs.
        for (const [field, value] of Object.entries(element.content)) {
          if (!/^(href|src|url|endpoint|action)$/i.test(field) || !value) continue
          if (!safeUrl(value)) {
            issues.push({ code: "link", pageId: page.id, elementId: element.id, message: `The ${field} in ${element.name} uses an unsafe URL scheme.` })
          }
        }
      }
    })
  }

  const [boundProducts, boundCollections] = await Promise.all([
    productIds.size
      ? tx.select({ id: products.id }).from(products).where(and(eq(products.tenantId, tenantId), inArray(products.id, [...productIds])))
      : [],
    collectionIds.size
      ? tx.select({ id: collections.id }).from(collections).where(and(eq(collections.tenantId, tenantId), inArray(collections.id, [...collectionIds])))
      : [],
  ])
  const foundProducts = new Set(boundProducts.map((item) => item.id))
  const foundCollections = new Set(boundCollections.map((item) => item.id))
  for (const id of productIds) if (!foundProducts.has(id)) issues.push({ code: "binding", message: "A connected product is no longer available." })
  for (const id of collectionIds) if (!foundCollections.has(id)) issues.push({ code: "binding", message: "A connected collection is no longer available." })

  return { issues, warnings, loaded }
}

export async function loadEditorSession(input: z.infer<typeof loadSchema>): Promise<LoadEditorSessionResult> {
  const parsed = loadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: "invalid_input", message: "Invalid editor session request." }

  return authorizedAction(async (tx, tenantId) => {
    const project = await loadOwnedProject(tx, tenantId, parsed.data.projectId)
    if (!project) return { ok: false, code: "not_found", message: "Storefront project not found." }

    const [pageRows, tenant] = await Promise.all([
      tx.select().from(editorPages).where(and(
        eq(editorPages.projectId, project.id),
        eq(editorPages.tenantId, tenantId),
      )).orderBy(asc(editorPages.order)),
      tx.select({ currency: tenants.displayCurrency }).from(tenants).where(eq(tenants.id, tenantId)).limit(1),
    ])
    const page = parsed.data.pageId
      ? pageRows.find((candidate) => candidate.id === parsed.data.pageId)
      : pageRows.find((candidate) => candidate.isHomepage) ?? pageRows[0]
    if (!page) return { ok: false, code: "not_found", message: "Storefront page not found." }

    let document: EditorDocumentV2
    try {
      document = migrateEditorDocument(page.data, { id: page.id, name: page.name, slug: page.slug, seoTitle: page.seoTitle, seoDescription: page.seoDescription, ogImage: page.ogImage }, tenant[0]?.currency ?? "NPR")
    } catch {
      return { ok: false, code: "blocked", message: "This page could not be migrated safely." }
    }

    return {
      ok: true,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        published: project.published ?? false,
        activePublishedVersionId: project.activePublishedVersionId,
        publicationVersion: project.publicationVersion,
        themeConfig: project.themeConfig as Record<string, string> | null,
      },
      page: {
        id: page.id,
        name: page.name,
        slug: page.slug,
        serverRevision: page.serverRevision,
        documentVersion: page.documentVersion,
        document,
      },
      pages: pageRows.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        order: item.order,
        isHomepage: item.isHomepage,
        visible: item.visible,
      })),
    }
  })
}

export async function saveDraft(input: z.infer<typeof saveSchema>): Promise<SaveDraftResult> {
  const parsed = saveSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: "invalid_input", message: "The draft contains invalid editor data." }
  if (parsed.data.document.page.id !== parsed.data.pageId) {
    return { ok: false, code: "invalid_input", message: "The draft page identity does not match the active page." }
  }

  const user = await requireTenantUser()
  return withEditorSpan(
    "editor.save_draft",
    {
      "editor.project_id": parsed.data.projectId,
      "editor.page_id": parsed.data.pageId,
      "editor.base_revision": parsed.data.baseServerRevision,
      "editor.local_revision": parsed.data.localRevision,
    },
    async () => {
      try {
        return await authorizedAction(async (tx, tenantId) => {
          const [updated] = await tx.update(editorPages).set({
            data: parsed.data.document,
            documentVersion: 2,
            serverRevision: sql`${editorPages.serverRevision} + 1`,
            lastSavedBy: user.id,
            name: parsed.data.document.page.name,
            slug: parsed.data.document.page.slug,
            seoTitle: parsed.data.document.page.seoTitle,
            seoDescription: parsed.data.document.page.seoDescription,
            ogImage: parsed.data.document.page.ogImage,
            updatedAt: new Date(),
          }).where(and(
            eq(editorPages.id, parsed.data.pageId),
            eq(editorPages.projectId, parsed.data.projectId),
            eq(editorPages.tenantId, tenantId),
            eq(editorPages.serverRevision, parsed.data.baseServerRevision),
          )).returning({ revision: editorPages.serverRevision, savedAt: editorPages.updatedAt })

          if (!updated) {
            const [current] = await tx.select({ revision: editorPages.serverRevision }).from(editorPages).where(and(
              eq(editorPages.id, parsed.data.pageId),
              eq(editorPages.projectId, parsed.data.projectId),
              eq(editorPages.tenantId, tenantId),
            )).limit(1)
            return current
              ? { ok: false, code: "conflict", message: "This page changed in another editor. Reload before saving.", serverRevision: current.revision }
              : { ok: false, code: "not_found", message: "The page is no longer available." }
          }

          await tx.update(editorProjects).set({ updatedAt: new Date() }).where(and(
            eq(editorProjects.id, parsed.data.projectId),
            eq(editorProjects.tenantId, tenantId),
          ))
          return {
            ok: true,
            acknowledgedLocalRevision: parsed.data.localRevision,
            serverRevision: updated.revision,
            savedAt: updated.savedAt.toISOString(),
          }
        })
      } catch (error) {
        // The friendly result is unchanged; the throw used to vanish entirely.
        recordEditorError(error)
        return { ok: false, code: "save_failed", message: "Couldn’t save. Retry." }
      }
    },
    (result) => (result.ok
      ? { "editor.outcome": "saved", "editor.server_revision": result.serverRevision }
      : { "editor.outcome": result.code }) as Record<string, string | number | boolean>,
  )
}

export async function validatePublication(projectId: string): Promise<ValidatePublicationResult> {
  if (!idSchema.safeParse(projectId).success) return { ok: false, code: "invalid_input", message: "Invalid project." }
  return authorizedAction(async (tx, tenantId) => {
    const validation = await getPublicationIssues(tx, tenantId, projectId)
    return validation.issues.length
      ? { ok: true, ready: false, issues: validation.issues }
      : { ok: true, ready: true, warnings: validation.warnings }
  })
}

export async function publishSite(projectId: string): Promise<PublishSiteResult> {
  if (!idSchema.safeParse(projectId).success) return { ok: false, code: "invalid_input", message: "Invalid project." }
  const user = await requireTenantUser()
  try {
    return await authorizedAction(async (tx, tenantId) => {
      const validation = await getPublicationIssues(tx, tenantId, projectId)
      if (validation.issues.length || !validation.loaded) {
        return { ok: false, code: "blocked", message: "Resolve the publication checklist before publishing.", issues: validation.issues }
      }

      const { project, pages } = validation.loaded
      const version = project.publicationVersion + 1
      const publishedAt = new Date()
      const [snapshot] = await tx.insert(editorProjectVersions).values({
        projectId,
        tenantId,
        version,
        label: `Published ${publishedAt.toISOString()}`,
        documentVersion: 2,
        publishedBy: user.id,
        data: {
          schemaVersion: 2,
          publishedAt: publishedAt.toISOString(),
          project: {
            id: project.id,
            name: project.name,
            slug: project.slug,
            navConfig: project.navConfig,
            themeConfig: project.themeConfig,
            headerData: project.headerData,
            footerData: project.footerData,
          },
          pages,
        },
      }).returning({ id: editorProjectVersions.id })

      const slug = project.slug || project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || project.id
      await tx.update(editorProjects).set({
        activePublishedVersionId: snapshot.id,
        publicationVersion: version,
        published: true,
        slug,
        updatedAt: publishedAt,
      }).where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)))

      const { revalidatePath } = await import("next/cache")
      const [tenant] = await tx.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.id, tenantId)).limit(1)
      if (tenant?.slug) {
        revalidatePath(`/store/${tenant.slug}`, "layout")
      }

      return { ok: true, versionId: snapshot.id, version, publishedAt: publishedAt.toISOString(), slug }
    })
  } catch {
    return { ok: false, code: "publish_failed", message: "Publishing failed. No changes went live." }
  }
}

export async function rollbackPublication(projectId: string, versionId: string): Promise<RollbackPublicationResult> {
  if (!idSchema.safeParse(projectId).success || !idSchema.safeParse(versionId).success) {
    return { ok: false, code: "invalid_input", message: "Invalid publication version." }
  }
  return authorizedAction(async (tx, tenantId) => {
    const [version] = await tx.select().from(editorProjectVersions).where(and(
      eq(editorProjectVersions.id, versionId),
      eq(editorProjectVersions.projectId, projectId),
      eq(editorProjectVersions.tenantId, tenantId),
    )).limit(1)
    if (!version) return { ok: false, code: "not_found", message: "Publication version not found." }
    const restoredAt = new Date()
    await tx.update(editorProjects).set({
      activePublishedVersionId: version.id,
      publicationVersion: version.version,
      published: true,
      updatedAt: restoredAt,
    }).where(and(eq(editorProjects.id, projectId), eq(editorProjects.tenantId, tenantId)))

    const { revalidatePath } = await import("next/cache")
    const [tenant] = await tx.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.id, tenantId)).limit(1)
    if (tenant?.slug) {
      revalidatePath(`/store/${tenant.slug}`, "layout")
    }

    return { ok: true, versionId: version.id, version: version.version, restoredAt: restoredAt.toISOString() }
  })
}

export async function acquirePageLease(input: z.infer<typeof leaseSchema>): Promise<PageLeaseResult> {
  const parsed = leaseSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: "invalid_input", message: "Invalid editor lease." }
  const user = await requireTenantUser()
  return withEditorSpan(
    "editor.acquire_lease",
    {
      "editor.project_id": parsed.data.projectId,
      "editor.page_id": parsed.data.pageId,
      "editor.takeover": Boolean(parsed.data.takeover),
    },
    () => authorizedAction(async (tx, tenantId) => {
      const [page] = await tx.select({ id: editorPages.id }).from(editorPages).where(and(
        eq(editorPages.id, parsed.data.pageId),
        eq(editorPages.projectId, parsed.data.projectId),
        eq(editorPages.tenantId, tenantId),
      )).limit(1)
      if (!page) return { ok: false, code: "not_found", message: "The page is no longer available." }
      const expiresAt = new Date(Date.now() + 90_000)
      const [lease] = await tx.insert(editorPageLeases).values({
        tenantId,
        projectId: parsed.data.projectId,
        pageId: parsed.data.pageId,
        userId: user.id,
        sessionId: parsed.data.sessionId,
        expiresAt,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: editorPageLeases.pageId,
        set: { userId: user.id, sessionId: parsed.data.sessionId, expiresAt, updatedAt: new Date() },
        setWhere: or(
          lt(editorPageLeases.expiresAt, new Date()),
          and(eq(editorPageLeases.userId, user.id), eq(editorPageLeases.sessionId, parsed.data.sessionId)),
          parsed.data.takeover ? sql`true` : sql`false`,
        ),
      }).returning()
      if (lease) return { ok: true, lease: { pageId: lease.pageId, sessionId: lease.sessionId, expiresAt: lease.expiresAt.toISOString() } }

      const [holder] = await tx.select({ name: users.fullName, email: users.email, expiresAt: editorPageLeases.expiresAt })
        .from(editorPageLeases)
        .innerJoin(users, eq(users.id, editorPageLeases.userId))
        .where(and(eq(editorPageLeases.pageId, parsed.data.pageId), eq(editorPageLeases.tenantId, tenantId)))
        .limit(1)
      return {
        ok: false,
        code: "conflict",
        message: "This page is open in another editor.",
        holder: holder ? { name: holder.name || holder.email, expiresAt: holder.expiresAt.toISOString() } : undefined,
      }
    }),
    (result) => (result.ok
      ? { "editor.outcome": "acquired" }
      : { "editor.outcome": result.code, "editor.lease_contended": result.code === "conflict" }) as Record<string, string | number | boolean>,
  )
}

export async function releasePageLease(input: Omit<z.infer<typeof leaseSchema>, "takeover">): Promise<{ ok: true } | { ok: false }> {
  const parsed = leaseSchema.omit({ takeover: true }).safeParse(input)
  if (!parsed.success) return { ok: false }
  const user = await requireTenantUser()
  return authorizedAction(async (tx, tenantId) => {
    await tx.delete(editorPageLeases).where(and(
      eq(editorPageLeases.pageId, parsed.data.pageId),
      eq(editorPageLeases.projectId, parsed.data.projectId),
      eq(editorPageLeases.tenantId, tenantId),
      eq(editorPageLeases.userId, user.id),
      eq(editorPageLeases.sessionId, parsed.data.sessionId),
    ))
    return { ok: true }
  })
}

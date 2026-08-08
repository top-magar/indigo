"use server"

import { asc, eq } from "drizzle-orm"
import { v4 } from "uuid"
import { editorPages } from "@/db/schema/editor-pages"
import { editorProjects } from "@/db/schema/editor-projects"
import { tenants } from "@/db/schema/tenants"
import { authorizedAction } from "@/infrastructure/auth"
import type { EditorDocumentV2 } from "../core/document-v2"
import type { El } from "../core/types"

function starterPage(pageId: string, storeName: string, currency: string): EditorDocumentV2 {
  const body: El = {
    id: v4(),
    type: "__body",
    name: "Body",
    styles: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      width: "100%",
      fontFamily: "Inter, system-ui, sans-serif",
      backgroundColor: "#ffffff",
      color: "#18181b",
    },
    content: [
      {
        id: v4(),
        type: "container",
        name: "Store introduction",
        styles: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "20px",
          minHeight: "520px",
          padding: "80px 6vw",
          width: "100%",
          backgroundColor: "#f4f4f5",
        },
        responsiveStyles: {
          tablet: { minHeight: "440px", padding: "64px 32px" },
          mobile: { minHeight: "380px", padding: "48px 20px" },
        },
        content: [
          {
            id: v4(),
            type: "text",
            name: "Store name",
            styles: { fontSize: "56px", fontWeight: "700", lineHeight: "1.05", maxWidth: "760px" },
            responsiveStyles: { tablet: { fontSize: "44px" }, mobile: { fontSize: "36px" } },
            content: { innerText: storeName },
            binding: { source: "store", field: "name" },
          },
          {
            id: v4(),
            type: "text",
            name: "Introduction",
            styles: { fontSize: "18px", lineHeight: "1.6", maxWidth: "600px", color: "#52525b" },
            content: { innerText: "Introduce your store and what customers can discover here." },
          },
          {
            id: v4(),
            type: "button",
            name: "Shop action",
            styles: { width: "fit-content", padding: "12px 20px", borderRadius: "6px", backgroundColor: "#18181b", color: "#ffffff", fontWeight: "600" },
            content: { innerText: "Shop products", href: "#" },
          },
        ],
      },
      {
        id: v4(),
        type: "productGrid",
        name: "Featured products",
        styles: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "24px", padding: "64px 6vw", width: "100%" },
        responsiveStyles: {
          tablet: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", padding: "48px 32px" },
          mobile: { gridTemplateColumns: "1fr", padding: "40px 20px" },
        },
        content: [],
        repeat: { source: "collection", limit: 8 },
      },
    ],
  }

  return {
    schemaVersion: 2,
    page: { id: pageId, name: "Home", slug: "" },
    root: [body],
    settings: { currency, locale: "en-NP" },
  }
}

/** Ensure a tenant has one storefront project and a V2 starter page. */
export async function ensureTenantSite() {
  return authorizedAction(async (tx, tenantId) => {
    const [existing] = await tx.select({ id: editorProjects.id }).from(editorProjects)
      .where(eq(editorProjects.tenantId, tenantId)).limit(1)
    if (existing) return existing.id

    const [tenant] = await tx.select({
      name: tenants.name,
      slug: tenants.slug,
      currency: tenants.displayCurrency,
    }).from(tenants).where(eq(tenants.id, tenantId)).limit(1)

    const projectId = v4()
    const pageId = v4()
    const storeName = tenant?.name || "My Store"
    const currency = tenant?.currency || "NPR"
    const [created] = await tx.insert(editorProjects).values({
      id: projectId,
      tenantId,
      name: storeName,
      slug: tenant?.slug || null,
      data: [],
      navConfig: [{ id: v4(), label: "Home", pageId }],
      headerData: [],
      footerData: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoNothing().returning({ id: editorProjects.id })

    if (!created) {
      const [winner] = await tx.select({ id: editorProjects.id }).from(editorProjects)
        .where(eq(editorProjects.tenantId, tenantId)).limit(1)
      if (!winner) throw new Error("Could not create storefront project")
      return winner.id
    }

    await tx.insert(editorPages).values({
      id: pageId,
      projectId,
      tenantId,
      name: "Home",
      slug: "",
      order: 0,
      data: starterPage(pageId, storeName, currency),
      documentVersion: 2,
      serverRevision: 0,
      isHomepage: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return projectId
  })
}

export async function getTenantSiteId() {
  return authorizedAction(async (tx, tenantId) => {
    const [site] = await tx.select({ id: editorProjects.id }).from(editorProjects)
      .where(eq(editorProjects.tenantId, tenantId)).limit(1)
    return site?.id ?? null
  })
}

export async function getTenantSitePages() {
  return authorizedAction(async (tx, tenantId) => {
    const [site] = await tx.select({
      id: editorProjects.id,
      name: editorProjects.name,
      published: editorProjects.published,
      slug: editorProjects.slug,
    }).from(editorProjects).where(eq(editorProjects.tenantId, tenantId)).limit(1)
    if (!site) return { site: null, pages: [], tenantSlug: "" }

    const [tenant, pages] = await Promise.all([
      tx.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.id, tenantId)).limit(1),
      tx.select().from(editorPages).where(eq(editorPages.projectId, site.id)).orderBy(asc(editorPages.order)),
    ])
    return { site, pages, tenantSlug: tenant[0]?.slug || "" }
  })
}

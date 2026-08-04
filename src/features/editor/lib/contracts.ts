import type { EditorDocumentV2 } from "../core/document-v2"

export type EditorContractErrorCode =
  | "invalid_input"
  | "not_found"
  | "conflict"
  | "forbidden"
  | "blocked"
  | "save_failed"
  | "publish_failed"

export type ContractFailure = {
  ok: false
  code: EditorContractErrorCode
  message: string
}

export type LoadEditorSessionResult =
  | {
      ok: true
      project: {
        id: string
        name: string
        slug: string | null
        published: boolean
        activePublishedVersionId: string | null
        publicationVersion: number
        themeConfig: Record<string, string> | null
      }
      page: {
        id: string
        name: string
        slug: string
        serverRevision: number
        documentVersion: number
        document: EditorDocumentV2
      }
      pages: Array<{
        id: string
        name: string
        slug: string
        order: number
        isHomepage: boolean | null
        visible: boolean
      }>
    }
  | ContractFailure

export type SaveDraftResult =
  | {
      ok: true
      acknowledgedLocalRevision: number
      serverRevision: number
      savedAt: string
    }
  | (ContractFailure & { serverRevision?: number })

export type PublicationIssue = {
  code: "entitlement" | "document" | "binding" | "link" | "content" | "migration"
  message: string
  pageId?: string
  elementId?: string
}

export type ValidatePublicationResult =
  | { ok: true; ready: true; warnings: PublicationIssue[] }
  | { ok: true; ready: false; issues: PublicationIssue[] }
  | ContractFailure

export type PublishSiteResult =
  | { ok: true; versionId: string; version: number; publishedAt: string; slug: string }
  | (ContractFailure & { issues?: PublicationIssue[] })

export type RollbackPublicationResult =
  | { ok: true; versionId: string; version: number; restoredAt: string }
  | ContractFailure

export type PageLeaseResult =
  | { ok: true; lease: { pageId: string; sessionId: string; expiresAt: string } }
  | (ContractFailure & { holder?: { name: string; expiresAt: string } })

export type EditorAnalyticsEvent =
  | { name: "editor_entered" }
  | { name: "section_inserted"; sectionType: string; method: "click" | "drag" | "keyboard" }
  | { name: "save_failed"; reason: EditorContractErrorCode }
  | { name: "storefront_previewed"; viewport: "desktop" | "tablet" | "mobile" }
  | { name: "publication_validation_failed"; issueCount: number }
  | { name: "site_published"; version: number }
  | { name: "page_lease_taken_over" }
  | { name: "publication_rolled_back"; version: number }

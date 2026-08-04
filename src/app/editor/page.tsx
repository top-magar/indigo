import EditorClient from "@/features/editor/editor-client";
import type { EditorProps } from "@/features/editor/core/types";
import { redirect } from "next/navigation";
import { requireTenantUser } from "@/lib/auth";
import { ensureTenantSite } from "@/features/editor/lib/site";
import { loadEditorSession } from "@/features/editor/lib/session-actions";

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ project?: string; page?: string }> }) {
  const user = await requireTenantUser();
  const params = await searchParams;

  // Ensure tenant has a site, get its ID
  const siteId = params.project || await ensureTenantSite();
  if (!params.project) redirect(`/editor?project=${siteId}`);

  const session = await loadEditorSession({ projectId: siteId, pageId: params.page });
  if (!session.ok) redirect('/dashboard/pages');

  const props: EditorProps = {
    pageId: session.project.id,
    pageName: session.project.name,
    tenantId: user.tenantId,
    userId: user.id,
    initialContent: JSON.stringify(session.page.document),
    activePageId: session.page.id,
    activePageName: session.page.name,
    activePageSlug: session.page.slug,
    initialServerRevision: session.page.serverRevision,
    initialDocumentVersion: session.page.documentVersion,
    themeConfig: session.project.themeConfig,
    siteSlug: session.project.slug,
    currency: session.page.document.settings.currency,
  };

  return <EditorClient {...props} />;
}

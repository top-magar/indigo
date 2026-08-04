import EditorClient from "@/features/editor/editor-client";
import type { EditorProps } from "@/features/editor/core/types";
import { redirect } from "next/navigation";
import { requireTenantUser } from "@/lib/auth";
import { ensureTenantSite } from "@/features/editor/lib/site";
import { loadEditorSession } from "@/features/editor/lib/session-actions";
import { createClient } from "@/infrastructure/supabase/server";
import type { StorefrontProduct } from "@/features/editor/renderer/storefront-renderer";

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ project?: string; page?: string }> }) {
  const user = await requireTenantUser();
  const params = await searchParams;

  // Ensure tenant has a site, get its ID
  const siteId = params.project || await ensureTenantSite();
  if (!params.project) redirect(`/editor?project=${siteId}`);

  const session = await loadEditorSession({ projectId: siteId, pageId: params.page });
  if (!session.ok) redirect('/dashboard/pages');

  let sampleProduct: StorefrontProduct | undefined;
  if (session.page.slug === "template-product") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, description, price, compare_at_price, images")
      .eq("tenant_id", user.tenantId)
      .limit(1)
      .maybeSingle();
      
    if (data) {
      sampleProduct = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compare_at_price,
        images: Array.isArray(data.images)
          ? data.images.map((img: any) => ({ url: img.url || img, alt: img.alt || data.name }))
          : [],
      };
    }
  }

  const props: EditorProps = {
    pageId: session.project.id,
    pageName: session.project.name,
    tenantId: user.tenantId,
    userId: user.id,
    initialContent: JSON.stringify(session.page.document),
    activePageId: session.page.id,
    activePageName: session.page.name,
    activePageSlug: session.page.slug,
    activePageSeoTitle: session.page.document.page.seoTitle,
    activePageSeoDescription: session.page.document.page.seoDescription,
    activePageOgImage: session.page.document.page.ogImage,
    initialServerRevision: session.page.serverRevision,
    initialDocumentVersion: session.page.documentVersion,
    themeConfig: session.project.themeConfig,
    siteSlug: session.project.slug,
    currency: session.page.document.settings.currency,
    sampleProduct,
  };

  return <EditorClient {...props} />;
}

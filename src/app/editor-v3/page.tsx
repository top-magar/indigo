import dynamic from "next/dynamic";
import type { EditorProps } from "@/features/editor/core/types";

const FunnelEditor = dynamic(() => import("@/features/editor/editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen text-sm text-gray-400">
      Loading editor...
    </div>
  ),
});

// TODO: Replace with actual DB fetch
async function getPageData(pageId: string) {
  return { id: pageId, name: "Untitled Page", content: null as string | null, funnelId: "default" };
}

export default async function EditorPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const params = await searchParams;
  const pageId = params.project || "demo";
  const page = await getPageData(pageId);

  const props: EditorProps = {
    pageId: page.id,
    pageName: page.name,
    funnelId: page.funnelId,
    subAccountId: "default",
    agencyId: "default",
    initialContent: page.content || undefined,
  };

  return <FunnelEditor {...props} />;
}

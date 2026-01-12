import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { SRAnnouncerProvider } from "@/components/ui/sr-announcer";
import { MediaLibrary } from "@/features/media/components";
import { getAssets, getFolders, getStorageUsage } from "./actions";
import type { FileTypeFilter, AssetSortOption } from "@/features/media/types";

export const metadata: Metadata = {
  title: "Media Library | Indigo Dashboard",
  description: "Manage your images, videos, and files.",
};

interface SearchParams {
  folder?: string;
  search?: string;
  type?: string;
  sort?: string;
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) redirect("/login");

  // Fetch data in parallel
  const [assetsResult, folders, storageUsage] = await Promise.all([
    getAssets({
      folderId: params.folder || null,
      search: params.search,
      fileType: (params.type as FileTypeFilter) || "all",
      sort: (params.sort as AssetSortOption) || "newest",
      limit: 50,
    }),
    getFolders(),
    getStorageUsage(),
  ]);

  return (
    <SRAnnouncerProvider>
      <MediaLibrary
        initialAssets={assetsResult.assets}
        initialHasMore={assetsResult.hasMore}
        initialNextCursor={assetsResult.nextCursor}
        totalAssets={assetsResult.total}
        folders={folders}
        storageUsage={storageUsage}
        currentFolderId={params.folder || null}
        initialSearch={params.search || ""}
        initialFileType={(params.type as FileTypeFilter) || "all"}
        initialSort={(params.sort as AssetSortOption) || "newest"}
      />
    </SRAnnouncerProvider>
  );
}

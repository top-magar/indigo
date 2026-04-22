import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { getAssets } from "./actions";
import { MediaPageClient } from "./media-page-client";

export const metadata: Metadata = {
  title: "Media | Dashboard",
  description: "Manage your images, videos, and files.",
};

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  if (!userData?.tenant_id) redirect("/login");

  const result = await getAssets({ limit: 50 });

  return <MediaPageClient initialAssets={result.assets} totalAssets={result.total} />;
}

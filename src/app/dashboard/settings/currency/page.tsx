import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { CurrencySettingsClient } from "./currency-settings-client";

export const metadata: Metadata = {
  title: "Currency Settings | Dashboard",
  description: "Configure your store's currency and pricing display options.",
};

export default async function CurrencySettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!userData?.tenant_id) redirect("/auth/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", userData.tenant_id)
    .single();

  if (!tenant) redirect("/auth/login");

  return (
    <CurrencySettingsClient
      tenant={tenant}
      userRole={userData.role as "owner" | "admin" | "staff"}
    />
  );
}

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { AccountSettingsClient } from "./account-settings-client";

export const metadata: Metadata = {
    title: "Account Settings | Dashboard",
    description: "Manage your account and security settings.",
};

export default async function AccountSettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!userData) redirect("/login");

    return (
        <AccountSettingsClient 
            user={{
                id: user.id,
                email: user.email || "",
                fullName: userData.full_name,
                avatarUrl: userData.avatar_url,
                role: userData.role,
                createdAt: userData.created_at,
            }}
        />
    );
}

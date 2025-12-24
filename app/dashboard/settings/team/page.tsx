import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamSettingsClient } from "./team-settings-client";

export const metadata: Metadata = {
    title: "Team Settings | Dashboard",
    description: "Manage your team members and permissions.",
};

export default async function TeamSettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, role")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Get all team members
    const { data: teamMembers } = await supabase
        .from("users")
        .select("id, email, full_name, avatar_url, role, created_at")
        .eq("tenant_id", userData.tenant_id)
        .order("created_at", { ascending: true });

    return (
        <TeamSettingsClient 
            currentUserId={user.id}
            currentUserRole={userData.role}
            teamMembers={teamMembers || []}
        />
    );
}

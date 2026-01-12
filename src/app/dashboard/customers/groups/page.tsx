import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"
import { CustomerGroupsClient } from "./customer-groups-client"

export const metadata = {
  title: "Customer Groups | Dashboard",
  description: "Manage customer groups and segments",
}

export default async function CustomerGroupsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single()

  if (!userData?.tenant_id) redirect("/login")

  const tenantId = userData.tenant_id

  // Try to get customer groups - table may not exist yet
  let groups: unknown[] = []

  try {
    const { data, error } = await supabase
      .from("customer_groups")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      // Get member counts for each group
      const groupIds = data.map(g => g.id)
      if (groupIds.length > 0) {
        const { data: memberCounts } = await supabase
          .from("customer_group_members")
          .select("group_id")
          .in("group_id", groupIds)

        const countMap: Record<string, number> = {}
        memberCounts?.forEach(m => {
          countMap[m.group_id] = (countMap[m.group_id] || 0) + 1
        })

        groups = data.map(g => ({
          ...g,
          members_count: countMap[g.id] || 0,
        }))
      } else {
        groups = data
      }
    }
  } catch {
    // Table doesn't exist yet
  }

  return (
    <CustomerGroupsClient
      groups={groups as never[]}
      tenantId={tenantId}
    />
  )
}

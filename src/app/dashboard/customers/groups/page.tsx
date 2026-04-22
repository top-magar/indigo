import { auth, getCustomerGroups } from "../_lib/queries";
import { CustomerGroupsClient } from "./customer-groups-client";

export const metadata = {
  title: "Customer Groups | Dashboard",
  description: "Manage customer groups and segments",
};

export default async function CustomerGroupsPage() {
  const { supabase, tenantId } = await auth();
  const groups = await getCustomerGroups(tenantId, supabase);

  return <CustomerGroupsClient groups={groups as never[]} tenantId={tenantId} />;
}

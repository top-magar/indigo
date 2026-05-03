"use server"

import { z } from "zod"
import { getAuthenticatedClient } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function getAuthenticatedTenant() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId };
}

const createGroupSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  discountPercentage: z.number().min(0).max(100),
})

const updateGroupSchema = createGroupSchema.extend({
  groupId: z.string().uuid(),
})

const memberSchema = z.object({
  customerId: z.string().uuid(),
  groupId: z.string().uuid(),
})

export async function createCustomerGroup(formData: FormData) {
  try {
  const { supabase, tenantId } = await getAuthenticatedTenant()
  
  const parsed = createGroupSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    discountPercentage: formData.get("discountPercentage")
      ? parseFloat(formData.get("discountPercentage") as string)
      : 0,
  })

  const { name, description, discountPercentage } = parsed

  const { data, error } = await supabase
    .from("customer_groups")
    .insert({
      tenant_id: tenantId,
      name,
      description,
      discount_percentage: discountPercentage,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/customers/groups")
  return { data }
  } catch (err) {
    return { success: false, error: err instanceof z.ZodError ? err.issues[0].message : err instanceof Error ? err.message : "Failed to create group" }
  }
}

export async function updateCustomerGroup(formData: FormData) {
  const { supabase, tenantId } = await getAuthenticatedTenant()
  
  const parsed = updateGroupSchema.parse({
    groupId: formData.get("groupId"),
    name: formData.get("name"),
    description: formData.get("description") || null,
    discountPercentage: formData.get("discountPercentage")
      ? parseFloat(formData.get("discountPercentage") as string)
      : 0,
  })

  const { groupId, name, description, discountPercentage } = parsed

  const { error } = await supabase
    .from("customer_groups")
    .update({
      name,
      description,
      discount_percentage: discountPercentage,
    })
    .eq("id", groupId).eq("tenant_id", tenantId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

export async function deleteCustomerGroup(groupId: string) {
  const validId = z.string().uuid().parse(groupId)
  const { supabase, tenantId } = await getAuthenticatedTenant()

  const { error } = await supabase
    .from("customer_groups")
    .delete()
    .eq("id", validId)
    .eq("tenant_id", tenantId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

export async function addCustomerToGroup(formData: FormData) {
  const { supabase, tenantId } = await getAuthenticatedTenant()
  
  const { customerId, groupId } = memberSchema.parse({
    customerId: formData.get("customerId"),
    groupId: formData.get("groupId"),
  })

  // Verify both belong to this tenant
  const [{ data: customer }, { data: group }] = await Promise.all([
    supabase.from("customers").select("id").eq("id", customerId).eq("tenant_id", tenantId).single(),
    supabase.from("customer_groups").select("id").eq("id", groupId).eq("tenant_id", tenantId).single(),
  ])
  if (!customer || !group) return { success: false, error: "Customer or group not found" }

  const { error } = await supabase
    .from("customer_group_members")
    .insert({
      customer_id: customerId,
      group_id: groupId,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

export async function removeCustomerFromGroup(formData: FormData) {
  const { supabase, tenantId } = await getAuthenticatedTenant()
  
  const { customerId, groupId } = memberSchema.parse({
    customerId: formData.get("customerId"),
    groupId: formData.get("groupId"),
  })

  // Verify both belong to this tenant
  const [{ data: customer }, { data: group }] = await Promise.all([
    supabase.from("customers").select("id").eq("id", customerId).eq("tenant_id", tenantId).single(),
    supabase.from("customer_groups").select("id").eq("id", groupId).eq("tenant_id", tenantId).single(),
  ])
  if (!customer || !group) return { success: false, error: "Customer or group not found" }

  const { error } = await supabase
    .from("customer_group_members")
    .delete()
    .eq("customer_id", customerId)
    .eq("group_id", groupId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

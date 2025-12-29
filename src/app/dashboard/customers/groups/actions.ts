"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCustomerGroup(formData: FormData) {
  const supabase = await createClient()
  
  const tenantId = formData.get("tenantId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string || null
  const discountPercentage = formData.get("discountPercentage") 
    ? parseFloat(formData.get("discountPercentage") as string) 
    : 0

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
    return { error: error.message }
  }

  revalidatePath("/dashboard/customers/groups")
  return { data }
}

export async function updateCustomerGroup(formData: FormData) {
  const supabase = await createClient()
  
  const groupId = formData.get("groupId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string || null
  const discountPercentage = formData.get("discountPercentage") 
    ? parseFloat(formData.get("discountPercentage") as string) 
    : 0

  const { error } = await supabase
    .from("customer_groups")
    .update({
      name,
      description,
      discount_percentage: discountPercentage,
    })
    .eq("id", groupId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

export async function deleteCustomerGroup(groupId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("customer_groups")
    .delete()
    .eq("id", groupId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

export async function addCustomerToGroup(formData: FormData) {
  const supabase = await createClient()
  
  const customerId = formData.get("customerId") as string
  const groupId = formData.get("groupId") as string

  const { error } = await supabase
    .from("customer_group_members")
    .insert({
      customer_id: customerId,
      group_id: groupId,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

export async function removeCustomerFromGroup(formData: FormData) {
  const supabase = await createClient()
  
  const customerId = formData.get("customerId") as string
  const groupId = formData.get("groupId") as string

  const { error } = await supabase
    .from("customer_group_members")
    .delete()
    .eq("customer_id", customerId)
    .eq("group_id", groupId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/customers")
  revalidatePath("/dashboard/customers/groups")
  return { success: true }
}

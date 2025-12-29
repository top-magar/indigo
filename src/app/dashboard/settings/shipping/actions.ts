"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ============================================================================
// SHIPPING ZONES
// ============================================================================

export async function getShippingZones(tenantId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("shipping_zones")
    .select(`
      *,
      shipping_zone_countries (*),
      shipping_rates (*)
    `)
    .eq("tenant_id", tenantId)
    .order("created_at")

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createShippingZone(formData: FormData) {
  const supabase = await createClient()
  
  const tenantId = formData.get("tenantId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string || null
  const isActive = formData.get("isActive") !== "false"
  const countriesJson = formData.get("countries") as string

  // Create zone
  const { data: zone, error: zoneError } = await supabase
    .from("shipping_zones")
    .insert({
      tenant_id: tenantId,
      name,
      description,
      is_active: isActive,
    })
    .select()
    .single()

  if (zoneError) {
    return { error: zoneError.message }
  }

  // Add countries if provided
  if (countriesJson) {
    try {
      const countries = JSON.parse(countriesJson) as { code: string; name: string }[]
      if (countries.length > 0) {
        const countryInserts = countries.map(c => ({
          zone_id: zone.id,
          country_code: c.code,
          country_name: c.name,
        }))

        const { error: countryError } = await supabase
          .from("shipping_zone_countries")
          .insert(countryInserts)

        if (countryError) {
          // Rollback zone creation
          await supabase.from("shipping_zones").delete().eq("id", zone.id)
          return { error: countryError.message }
        }
      }
    } catch {
      // Invalid JSON, skip countries
    }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { data: zone }
}

export async function updateShippingZone(formData: FormData) {
  const supabase = await createClient()
  
  const zoneId = formData.get("zoneId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string || null
  const isActive = formData.get("isActive") !== "false"
  const countriesJson = formData.get("countries") as string

  // Update zone
  const { error: zoneError } = await supabase
    .from("shipping_zones")
    .update({
      name,
      description,
      is_active: isActive,
    })
    .eq("id", zoneId)

  if (zoneError) {
    return { error: zoneError.message }
  }

  // Update countries if provided
  if (countriesJson) {
    try {
      const countries = JSON.parse(countriesJson) as { code: string; name: string }[]
      
      // Delete existing countries
      await supabase
        .from("shipping_zone_countries")
        .delete()
        .eq("zone_id", zoneId)

      // Insert new countries
      if (countries.length > 0) {
        const countryInserts = countries.map(c => ({
          zone_id: zoneId,
          country_code: c.code,
          country_name: c.name,
        }))

        await supabase
          .from("shipping_zone_countries")
          .insert(countryInserts)
      }
    } catch {
      // Invalid JSON, skip countries
    }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { success: true }
}

export async function deleteShippingZone(zoneId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("shipping_zones")
    .delete()
    .eq("id", zoneId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { success: true }
}

// ============================================================================
// SHIPPING RATES
// ============================================================================

export async function createShippingRate(formData: FormData) {
  const supabase = await createClient()
  
  const tenantId = formData.get("tenantId") as string
  const zoneId = formData.get("zoneId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string || null
  const rateType = formData.get("rateType") as "flat" | "weight" | "price" | "item" || "flat"
  const price = parseFloat(formData.get("price") as string) || 0
  const minWeight = formData.get("minWeight") ? parseFloat(formData.get("minWeight") as string) : null
  const maxWeight = formData.get("maxWeight") ? parseFloat(formData.get("maxWeight") as string) : null
  const minOrderTotal = formData.get("minOrderTotal") ? parseFloat(formData.get("minOrderTotal") as string) : null
  const maxOrderTotal = formData.get("maxOrderTotal") ? parseFloat(formData.get("maxOrderTotal") as string) : null
  const pricePerKg = formData.get("pricePerKg") ? parseFloat(formData.get("pricePerKg") as string) : null
  const pricePerItem = formData.get("pricePerItem") ? parseFloat(formData.get("pricePerItem") as string) : null
  const freeShippingThreshold = formData.get("freeShippingThreshold") ? parseFloat(formData.get("freeShippingThreshold") as string) : null
  const estimatedDaysMin = formData.get("estimatedDaysMin") ? parseInt(formData.get("estimatedDaysMin") as string) : null
  const estimatedDaysMax = formData.get("estimatedDaysMax") ? parseInt(formData.get("estimatedDaysMax") as string) : null
  const isActive = formData.get("isActive") !== "false"
  const position = parseInt(formData.get("position") as string) || 0

  const { data, error } = await supabase
    .from("shipping_rates")
    .insert({
      tenant_id: tenantId,
      zone_id: zoneId,
      name,
      description,
      rate_type: rateType,
      price,
      min_weight: minWeight,
      max_weight: maxWeight,
      min_order_total: minOrderTotal,
      max_order_total: maxOrderTotal,
      price_per_kg: pricePerKg,
      price_per_item: pricePerItem,
      free_shipping_threshold: freeShippingThreshold,
      estimated_days_min: estimatedDaysMin,
      estimated_days_max: estimatedDaysMax,
      is_active: isActive,
      position,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { data }
}

export async function updateShippingRate(formData: FormData) {
  const supabase = await createClient()
  
  const rateId = formData.get("rateId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string || null
  const rateType = formData.get("rateType") as "flat" | "weight" | "price" | "item" || "flat"
  const price = parseFloat(formData.get("price") as string) || 0
  const minWeight = formData.get("minWeight") ? parseFloat(formData.get("minWeight") as string) : null
  const maxWeight = formData.get("maxWeight") ? parseFloat(formData.get("maxWeight") as string) : null
  const minOrderTotal = formData.get("minOrderTotal") ? parseFloat(formData.get("minOrderTotal") as string) : null
  const maxOrderTotal = formData.get("maxOrderTotal") ? parseFloat(formData.get("maxOrderTotal") as string) : null
  const pricePerKg = formData.get("pricePerKg") ? parseFloat(formData.get("pricePerKg") as string) : null
  const pricePerItem = formData.get("pricePerItem") ? parseFloat(formData.get("pricePerItem") as string) : null
  const freeShippingThreshold = formData.get("freeShippingThreshold") ? parseFloat(formData.get("freeShippingThreshold") as string) : null
  const estimatedDaysMin = formData.get("estimatedDaysMin") ? parseInt(formData.get("estimatedDaysMin") as string) : null
  const estimatedDaysMax = formData.get("estimatedDaysMax") ? parseInt(formData.get("estimatedDaysMax") as string) : null
  const isActive = formData.get("isActive") !== "false"
  const position = parseInt(formData.get("position") as string) || 0

  const { error } = await supabase
    .from("shipping_rates")
    .update({
      name,
      description,
      rate_type: rateType,
      price,
      min_weight: minWeight,
      max_weight: maxWeight,
      min_order_total: minOrderTotal,
      max_order_total: maxOrderTotal,
      price_per_kg: pricePerKg,
      price_per_item: pricePerItem,
      free_shipping_threshold: freeShippingThreshold,
      estimated_days_min: estimatedDaysMin,
      estimated_days_max: estimatedDaysMax,
      is_active: isActive,
      position,
    })
    .eq("id", rateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { success: true }
}

export async function deleteShippingRate(rateId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("shipping_rates")
    .delete()
    .eq("id", rateId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { success: true }
}

// ============================================================================
// SHIPPING SETTINGS
// ============================================================================

export async function updateShippingSettings(formData: FormData) {
  const supabase = await createClient()
  
  const tenantId = formData.get("tenantId") as string
  const freeShippingEnabled = formData.get("freeShippingEnabled") === "true"
  const freeShippingThreshold = formData.get("freeShippingThreshold") ? parseFloat(formData.get("freeShippingThreshold") as string) : null
  const defaultHandlingTime = parseInt(formData.get("defaultHandlingTime") as string) || 1

  // Get current settings
  const { data: tenant } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", tenantId)
    .single()

  const currentSettings = (tenant?.settings || {}) as Record<string, unknown>

  // Update settings
  const { error } = await supabase
    .from("tenants")
    .update({
      settings: {
        ...currentSettings,
        shipping: {
          free_shipping_enabled: freeShippingEnabled,
          free_shipping_threshold: freeShippingThreshold,
          default_handling_time: defaultHandlingTime,
        },
      },
    })
    .eq("id", tenantId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { success: true }
}

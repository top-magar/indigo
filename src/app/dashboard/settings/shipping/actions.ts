"use server"

import { z } from "zod"
import { createClient } from "@/infrastructure/supabase/server"
import { revalidatePath } from "next/cache"

// ============================================================================
// SHIPPING ZONES
// ============================================================================

export async function getShippingZones(tenantId: string) {
  const validTenantId = z.string().uuid().parse(tenantId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("shipping_zones")
    .select(`
      *,
      shipping_zone_countries (*),
      shipping_rates (*)
    `)
    .eq("tenant_id", validTenantId)
    .order("created_at")

  if (error) {
    return { error: error.message }
  }

  return { data }
}

const shippingZoneSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  isActive: z.boolean(),
})

export async function createShippingZone(formData: FormData) {
  const supabase = await createClient()
  
  const parsed = shippingZoneSchema.parse({
    tenantId: formData.get("tenantId"),
    name: formData.get("name"),
    description: formData.get("description") || null,
    isActive: formData.get("isActive") !== "false",
  })

  const { tenantId, name, description, isActive } = parsed
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

const updateZoneSchema = z.object({
  zoneId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  isActive: z.boolean(),
})

export async function updateShippingZone(formData: FormData) {
  const supabase = await createClient()
  
  const parsed = updateZoneSchema.parse({
    zoneId: formData.get("zoneId"),
    name: formData.get("name"),
    description: formData.get("description") || null,
    isActive: formData.get("isActive") !== "false",
  })

  const { zoneId, name, description, isActive } = parsed
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
  const validId = z.string().uuid().parse(zoneId)
  const supabase = await createClient()

  const { error } = await supabase
    .from("shipping_zones")
    .delete()
    .eq("id", validId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { success: true }
}

// ============================================================================
// SHIPPING RATES
// ============================================================================

const shippingRateSchema = z.object({
  tenantId: z.string().uuid(),
  zoneId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  rateType: z.enum(["flat", "weight", "price", "item"]).default("flat"),
  price: z.number().min(0),
  isActive: z.boolean(),
  position: z.number().int().min(0),
})

export async function createShippingRate(formData: FormData) {
  const supabase = await createClient()
  
  const parsed = shippingRateSchema.parse({
    tenantId: formData.get("tenantId"),
    zoneId: formData.get("zoneId"),
    name: formData.get("name"),
    description: formData.get("description") || null,
    rateType: formData.get("rateType") || "flat",
    price: parseFloat(formData.get("price") as string) || 0,
    isActive: formData.get("isActive") !== "false",
    position: parseInt(formData.get("position") as string) || 0,
  })

  const { tenantId, zoneId, name, description, rateType, price, isActive, position } = parsed
  const minWeight = formData.get("minWeight") ? parseFloat(formData.get("minWeight") as string) : null
  const maxWeight = formData.get("maxWeight") ? parseFloat(formData.get("maxWeight") as string) : null
  const minOrderTotal = formData.get("minOrderTotal") ? parseFloat(formData.get("minOrderTotal") as string) : null
  const maxOrderTotal = formData.get("maxOrderTotal") ? parseFloat(formData.get("maxOrderTotal") as string) : null
  const pricePerKg = formData.get("pricePerKg") ? parseFloat(formData.get("pricePerKg") as string) : null
  const pricePerItem = formData.get("pricePerItem") ? parseFloat(formData.get("pricePerItem") as string) : null
  const freeShippingThreshold = formData.get("freeShippingThreshold") ? parseFloat(formData.get("freeShippingThreshold") as string) : null
  const estimatedDaysMin = formData.get("estimatedDaysMin") ? parseInt(formData.get("estimatedDaysMin") as string) : null
  const estimatedDaysMax = formData.get("estimatedDaysMax") ? parseInt(formData.get("estimatedDaysMax") as string) : null

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

const updateRateSchema = z.object({
  rateId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  rateType: z.enum(["flat", "weight", "price", "item"]).default("flat"),
  price: z.number().min(0),
  isActive: z.boolean(),
  position: z.number().int().min(0),
})

export async function updateShippingRate(formData: FormData) {
  const supabase = await createClient()
  
  const parsed = updateRateSchema.parse({
    rateId: formData.get("rateId"),
    name: formData.get("name"),
    description: formData.get("description") || null,
    rateType: formData.get("rateType") || "flat",
    price: parseFloat(formData.get("price") as string) || 0,
    isActive: formData.get("isActive") !== "false",
    position: parseInt(formData.get("position") as string) || 0,
  })

  const { rateId, name, description, rateType, price, isActive, position } = parsed
  const minWeight = formData.get("minWeight") ? parseFloat(formData.get("minWeight") as string) : null
  const maxWeight = formData.get("maxWeight") ? parseFloat(formData.get("maxWeight") as string) : null
  const minOrderTotal = formData.get("minOrderTotal") ? parseFloat(formData.get("minOrderTotal") as string) : null
  const maxOrderTotal = formData.get("maxOrderTotal") ? parseFloat(formData.get("maxOrderTotal") as string) : null
  const pricePerKg = formData.get("pricePerKg") ? parseFloat(formData.get("pricePerKg") as string) : null
  const pricePerItem = formData.get("pricePerItem") ? parseFloat(formData.get("pricePerItem") as string) : null
  const freeShippingThreshold = formData.get("freeShippingThreshold") ? parseFloat(formData.get("freeShippingThreshold") as string) : null
  const estimatedDaysMin = formData.get("estimatedDaysMin") ? parseInt(formData.get("estimatedDaysMin") as string) : null
  const estimatedDaysMax = formData.get("estimatedDaysMax") ? parseInt(formData.get("estimatedDaysMax") as string) : null

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
  const validId = z.string().uuid().parse(rateId)
  const supabase = await createClient()

  const { error } = await supabase
    .from("shipping_rates")
    .delete()
    .eq("id", validId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/settings/shipping")
  return { success: true }
}

// ============================================================================
// SHIPPING SETTINGS
// ============================================================================

const shippingSettingsSchema = z.object({
  tenantId: z.string().uuid(),
  freeShippingEnabled: z.boolean(),
  freeShippingThreshold: z.number().min(0).nullable(),
  defaultHandlingTime: z.number().int().min(1),
})

export async function updateShippingSettings(formData: FormData) {
  const supabase = await createClient()
  
  const parsed = shippingSettingsSchema.parse({
    tenantId: formData.get("tenantId"),
    freeShippingEnabled: formData.get("freeShippingEnabled") === "true",
    freeShippingThreshold: formData.get("freeShippingThreshold") ? parseFloat(formData.get("freeShippingThreshold") as string) : null,
    defaultHandlingTime: parseInt(formData.get("defaultHandlingTime") as string) || 1,
  })

  const { tenantId, freeShippingEnabled, freeShippingThreshold, defaultHandlingTime } = parsed

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

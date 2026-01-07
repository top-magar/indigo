"use server"

import { createClient } from "@/infrastructure/supabase/server"
import { revalidatePath } from "next/cache"
import type { ProductOption, ProductOptionValue, ProductVariant } from "@/infrastructure/supabase/types"

// ============================================================================
// PRODUCT OPTIONS
// ============================================================================

export async function createProductOption(formData: FormData) {
  const supabase = await createClient()
  
  const productId = formData.get("productId") as string
  const tenantId = formData.get("tenantId") as string
  const name = formData.get("name") as string
  const position = parseInt(formData.get("position") as string) || 0

  const { data, error } = await supabase
    .from("product_options")
    .insert({
      product_id: productId,
      tenant_id: tenantId,
      name,
      position,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/products/${productId}`)
  return { data }
}

export async function updateProductOption(formData: FormData) {
  const supabase = await createClient()
  
  const optionId = formData.get("optionId") as string
  const name = formData.get("name") as string
  const position = parseInt(formData.get("position") as string) || 0

  const { error } = await supabase
    .from("product_options")
    .update({ name, position })
    .eq("id", optionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/products")
  return { success: true }
}

export async function deleteProductOption(optionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("product_options")
    .delete()
    .eq("id", optionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/products")
  return { success: true }
}

// ============================================================================
// OPTION VALUES
// ============================================================================

export async function createOptionValue(formData: FormData) {
  const supabase = await createClient()
  
  const optionId = formData.get("optionId") as string
  const tenantId = formData.get("tenantId") as string
  const value = formData.get("value") as string
  const position = parseInt(formData.get("position") as string) || 0

  const { data, error } = await supabase
    .from("product_option_values")
    .insert({
      option_id: optionId,
      tenant_id: tenantId,
      value,
      position,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/products")
  return { data }
}

export async function deleteOptionValue(valueId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("product_option_values")
    .delete()
    .eq("id", valueId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/products")
  return { success: true }
}

// ============================================================================
// PRODUCT VARIANTS
// ============================================================================

export async function getProductVariants(productId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("product_variants")
    .select(`
      *,
      variant_option_values (
        id,
        option_value_id,
        product_option_values (
          id,
          value,
          option_id,
          product_options (
            id,
            name
          )
        )
      )
    `)
    .eq("product_id", productId)
    .order("position")

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function createProductVariant(formData: FormData) {
  const supabase = await createClient()
  
  const productId = formData.get("productId") as string
  const tenantId = formData.get("tenantId") as string
  const title = formData.get("title") as string
  const sku = formData.get("sku") as string || null
  const barcode = formData.get("barcode") as string || null
  const price = parseFloat(formData.get("price") as string) || 0
  const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null
  const costPrice = formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null
  const quantity = parseInt(formData.get("quantity") as string) || 0
  const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null
  const weightUnit = formData.get("weightUnit") as string || "kg"
  const requiresShipping = formData.get("requiresShipping") === "true"
  const isDefault = formData.get("isDefault") === "true"
  const position = parseInt(formData.get("position") as string) || 0
  const imageUrl = formData.get("imageUrl") as string || null
  const optionValueIds = formData.get("optionValueIds") as string

  // Create the variant
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      tenant_id: tenantId,
      title,
      sku,
      barcode,
      price,
      compare_at_price: compareAtPrice,
      cost_price: costPrice,
      quantity,
      weight,
      weight_unit: weightUnit,
      requires_shipping: requiresShipping,
      is_default: isDefault,
      position,
      image_url: imageUrl,
    })
    .select()
    .single()

  if (variantError) {
    return { error: variantError.message }
  }

  // Link option values to variant
  if (optionValueIds) {
    const valueIds = optionValueIds.split(",").filter(Boolean)
    const variantOptionValues = valueIds.map(valueId => ({
      variant_id: variant.id,
      option_value_id: valueId,
    }))

    const { error: linkError } = await supabase
      .from("variant_option_values")
      .insert(variantOptionValues)

    if (linkError) {
      // Rollback variant creation
      await supabase.from("product_variants").delete().eq("id", variant.id)
      return { error: linkError.message }
    }
  }

  // Update product to has_variants = true
  await supabase
    .from("products")
    .update({ has_variants: true })
    .eq("id", productId)

  revalidatePath(`/dashboard/products/${productId}`)
  return { data: variant }
}

export async function updateProductVariant(formData: FormData) {
  const supabase = await createClient()
  
  const variantId = formData.get("variantId") as string
  const title = formData.get("title") as string
  const sku = formData.get("sku") as string || null
  const barcode = formData.get("barcode") as string || null
  const price = parseFloat(formData.get("price") as string) || 0
  const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null
  const costPrice = formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null
  const quantity = parseInt(formData.get("quantity") as string) || 0
  const weight = formData.get("weight") ? parseFloat(formData.get("weight") as string) : null
  const weightUnit = formData.get("weightUnit") as string || "kg"
  const requiresShipping = formData.get("requiresShipping") === "true"
  const isDefault = formData.get("isDefault") === "true"
  const position = parseInt(formData.get("position") as string) || 0
  const imageUrl = formData.get("imageUrl") as string || null

  const { error } = await supabase
    .from("product_variants")
    .update({
      title,
      sku,
      barcode,
      price,
      compare_at_price: compareAtPrice,
      cost_price: costPrice,
      quantity,
      weight,
      weight_unit: weightUnit,
      requires_shipping: requiresShipping,
      is_default: isDefault,
      position,
      image_url: imageUrl,
    })
    .eq("id", variantId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/products")
  return { success: true }
}

export async function deleteProductVariant(variantId: string, productId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)

  if (error) {
    return { error: error.message }
  }

  // Check if product still has variants
  const { count } = await supabase
    .from("product_variants")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId)

  if (count === 0) {
    await supabase
      .from("products")
      .update({ has_variants: false })
      .eq("id", productId)
  }

  revalidatePath(`/dashboard/products/${productId}`)
  return { success: true }
}

// ============================================================================
// BULK VARIANT GENERATION
// ============================================================================

interface OptionWithValues {
  name: string
  values: string[]
}

export async function generateVariants(
  productId: string,
  tenantId: string,
  options: OptionWithValues[],
  basePrice: number
) {
  const supabase = await createClient()

  // First, create options and their values
  const createdOptions: { optionId: string; name: string; values: { id: string; value: string }[] }[] = []

  for (let i = 0; i < options.length; i++) {
    const option = options[i]
    
    // Create option
    const { data: optionData, error: optionError } = await supabase
      .from("product_options")
      .insert({
        product_id: productId,
        tenant_id: tenantId,
        name: option.name,
        position: i,
      })
      .select()
      .single()

    if (optionError) {
      return { error: `Failed to create option ${option.name}: ${optionError.message}` }
    }

    // Create option values
    const valueInserts = option.values.map((value, j) => ({
      option_id: optionData.id,
      tenant_id: tenantId,
      value,
      position: j,
    }))

    const { data: valuesData, error: valuesError } = await supabase
      .from("product_option_values")
      .insert(valueInserts)
      .select()

    if (valuesError) {
      return { error: `Failed to create values for ${option.name}: ${valuesError.message}` }
    }

    createdOptions.push({
      optionId: optionData.id,
      name: option.name,
      values: valuesData.map(v => ({ id: v.id, value: v.value })),
    })
  }

  // Generate all combinations
  function cartesian<T>(...arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
      (acc, arr) => acc.flatMap(x => arr.map(y => [...x, y])),
      [[]]
    )
  }

  const valueCombinations = cartesian(...createdOptions.map(o => o.values))

  // Create variants for each combination
  let position = 0
  for (const combination of valueCombinations) {
    const title = combination.map(v => v.value).join(" / ")
    
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        tenant_id: tenantId,
        title,
        price: basePrice,
        quantity: 0,
        position: position++,
        is_default: position === 1,
      })
      .select()
      .single()

    if (variantError) {
      return { error: `Failed to create variant ${title}: ${variantError.message}` }
    }

    // Link option values
    const links = combination.map(v => ({
      variant_id: variant.id,
      option_value_id: v.id,
    }))

    const { error: linkError } = await supabase
      .from("variant_option_values")
      .insert(links)

    if (linkError) {
      return { error: `Failed to link values for ${title}: ${linkError.message}` }
    }
  }

  // Update product
  await supabase
    .from("products")
    .update({ has_variants: true })
    .eq("id", productId)

  revalidatePath(`/dashboard/products/${productId}`)
  return { success: true, variantCount: valueCombinations.length }
}

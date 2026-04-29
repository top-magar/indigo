import { notFound } from "next/navigation";
import { auth, getProductDetail, getTenantCurrency } from "../_lib/queries";
import { ProductDetailClient } from "./product-detail-client";
import type { Product, ProductMedia, ProductVariant } from "@/features/products/types";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, tenantId } = await auth();
  const [result, currency] = await Promise.all([
    getProductDetail(tenantId, supabase, id),
    getTenantCurrency(supabase, tenantId),
  ]);
  if (!result) notFound();

  const { product, variants, collectionLinks } = result;

  const productData: Product = {
    id: product.id,
    tenantId: product.tenantId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    descriptionHtml: (product as Record<string, unknown>).descriptionHtml as string | undefined,
    price: parseFloat(product.price || "0"),
    compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
    costPrice: product.costPrice ? parseFloat(product.costPrice) : null,
    currency: currency || "NPR",
    sku: product.sku,
    barcode: product.barcode,
    quantity: product.quantity || 0,
    trackQuantity: product.trackQuantity ?? true,
    allowBackorder: product.allowBackorder ?? false,
    status: product.status || "draft",
    categoryId: product.categoryId,
    categoryName: product.categories?.name || null,
    collectionIds: collectionLinks.map(cl => cl.collection_id),
    collectionNames: collectionLinks.map(cl => {
      const collection = cl.collections;
      if (Array.isArray(collection)) return collection[0]?.name;
      return (collection as { name: string } | null)?.name;
    }).filter(Boolean) as string[],
    productTypeId: product.productType || null,
    productTypeName: null,
    media: (typeof product.images === "string" ? (() => { try { return JSON.parse(product.images as string); } catch { return []; } })() : product.images || []).map((img: { url: string; alt?: string } | string, index: number): ProductMedia => ({
      id: `media-${index}`,
      url: typeof img === "string" ? img : img.url,
      alt: typeof img === "string" ? product.name : (img.alt || product.name),
      type: "image",
      position: index,
    })),
    hasVariants: variants.length > 0,
    variants: variants.map((v): ProductVariant => ({
      id: v.id,
      productId: v.productId,
      title: v.name,
      sku: v.sku,
      barcode: v.barcode,
      price: v.price ? parseFloat(v.price) : null,
      compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : null,
      costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
      quantity: v.inventory_levels?.[0]?.quantity || 0,
      trackQuantity: (v as Record<string, unknown>).trackQuantity as boolean ?? true,
      allowBackorder: (v as Record<string, unknown>).allowBackorder as boolean ?? false,
      weight: v.weight ? parseFloat(v.weight) : null,
      weightUnit: (v.weightUnit || "g") as "g" | "kg" | "lb" | "oz",
      options: (Array.isArray(v.options) ? v.options : Object.entries(v.options || {}).map(([name, value]) => ({ name, value }))) as ProductVariant["options"],
      imageId: (v as Record<string, unknown>).imageId as string | undefined,
      position: v.position || 0,
      createdAt: v.created_at,
      updatedAt: v.updated_at || v.created_at,
    })),
    attributes: ((product as Record<string, unknown>).attributes || []) as Product["attributes"],
    shipping: {
      requiresShipping: (product as Record<string, unknown>).requiresShipping as boolean ?? true,
      weight: product.weight ? parseFloat(product.weight) : null,
      weightUnit: (product.weightUnit || "g") as "g" | "kg" | "lb" | "oz",
      dimensions: ((product as Record<string, unknown>).dimensions || {}) as Record<string, unknown>,
    },
    seo: {
      metaTitle: (product as Record<string, unknown>).metaTitle as string | undefined,
      metaDescription: (product as Record<string, unknown>).metaDescription as string | undefined,
      slug: product.slug,
    },
    brand: (product as Record<string, unknown>).brand as string | undefined,
    tags: ((product as Record<string, unknown>).tags || []) as string[],
    metadata: product.metadata as Record<string, unknown> | null,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };

  return <ProductDetailClient initialProduct={productData} />;
}

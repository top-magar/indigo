import { notFound } from "next/navigation";
import { auth, getProductDetail } from "../_lib/queries";
import { ProductDetailClient } from "./product-detail-client";
import type { Product, ProductMedia, ProductVariant } from "@/features/products/types";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, tenantId } = await auth();

  const result = await getProductDetail(tenantId, supabase, id);
  if (!result) notFound();

  const { product, variants, collectionLinks } = result;

  const productData: Product = {
    id: product.id,
    tenantId: product.tenant_id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    descriptionHtml: product.description_html,
    price: parseFloat(product.price || "0"),
    compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
    costPrice: product.cost_price ? parseFloat(product.cost_price) : null,
    currency: product.currency || "USD",
    sku: product.sku,
    barcode: product.barcode,
    quantity: product.quantity || 0,
    trackQuantity: product.track_quantity ?? true,
    allowBackorder: product.allow_backorder ?? false,
    status: product.status || "draft",
    categoryId: product.category_id,
    categoryName: product.categories?.name || null,
    collectionIds: collectionLinks.map(cl => cl.collection_id),
    collectionNames: collectionLinks.map(cl => {
      const collection = cl.collections;
      if (Array.isArray(collection)) return collection[0]?.name;
      return (collection as { name: string } | null)?.name;
    }).filter(Boolean) as string[],
    productTypeId: product.product_type_id,
    productTypeName: null,
    media: (product.images || []).map((url: string, index: number): ProductMedia => ({
      id: `media-${index}`,
      url,
      alt: product.name,
      type: "image",
      position: index,
    })),
    hasVariants: variants.length > 0,
    variants: variants.map((v): ProductVariant => ({
      id: v.id,
      productId: v.product_id,
      title: v.name,
      sku: v.sku,
      barcode: v.barcode,
      price: v.price ? parseFloat(v.price) : null,
      compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
      costPrice: v.cost_price ? parseFloat(v.cost_price) : null,
      quantity: v.inventory_levels?.[0]?.quantity || 0,
      trackQuantity: v.track_quantity ?? true,
      allowBackorder: v.allow_backorder ?? false,
      weight: v.weight ? parseFloat(v.weight) : null,
      weightUnit: v.weight_unit || "g",
      options: v.options || [],
      imageId: v.image_id,
      position: v.position || 0,
      createdAt: v.created_at,
      updatedAt: v.updated_at || v.created_at,
    })),
    attributes: product.attributes || [],
    shipping: {
      requiresShipping: product.requires_shipping ?? true,
      weight: product.weight ? parseFloat(product.weight) : null,
      weightUnit: product.weight_unit || "g",
      dimensions: product.dimensions || {},
    },
    seo: {
      metaTitle: product.meta_title,
      metaDescription: product.meta_description,
      slug: product.slug,
    },
    brand: product.brand,
    tags: product.tags || [],
    metadata: product.metadata,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };

  return <ProductDetailClient initialProduct={productData} />;
}

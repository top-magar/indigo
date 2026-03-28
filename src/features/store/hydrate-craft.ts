import { getCollectionProducts, getLatestProducts, getProduct } from "./product-data"
import type { StorefrontProduct } from "./product-data"

/**
 * Walk the serialized Craft.js JSON and inject live product data
 * into ProductGridBlock and FeaturedProductBlock nodes.
 *
 * This runs server-side before passing JSON to the client renderer.
 */
export async function hydrateCraftJson(
  craftJson: string,
  tenantId: string
): Promise<string> {
  let tree: Record<string, any>
  try {
    tree = JSON.parse(craftJson)
  } catch {
    return craftJson
  }

  const promises: Promise<void>[] = []

  for (const [nodeId, node] of Object.entries(tree)) {
    const name = node?.type?.resolvedName
    const props = node?.props

    if (name === "ProductGridBlock" && props) {
      const limit = (props.columns ?? 3) * (props.rows ?? 2)
      promises.push(
        (props.collectionId
          ? getCollectionProducts(tenantId, props.collectionId, limit)
          : getLatestProducts(tenantId, limit)
        ).then((products) => {
          tree[nodeId].props._products = products
        })
      )
    }

    if (name === "FeaturedProductBlock" && props?.productId) {
      promises.push(
        getProduct(tenantId, props.productId).then((product) => {
          if (product) {
            tree[nodeId].props.productName = product.name
            tree[nodeId].props.price = `Rs. ${(product.price / 100).toLocaleString()}`
            tree[nodeId].props.imageUrl = product.images?.[0]?.url ?? props.imageUrl
          }
        })
      )
    }
  }

  if (promises.length === 0) return craftJson

  await Promise.all(promises)
  return JSON.stringify(tree)
}

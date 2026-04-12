import dynamic from "next/dynamic"
import React from "react"
import { registerBlock } from "../registry"
import { BlockSkeleton } from "./block-skeleton"
import { ShoppingBag, LayoutGrid, Star, FolderOpen } from "lucide-react"

registerBlock("ctProductDetails", {
  component: dynamic(() => import("@/components/creative-tim/blocks/simple-product-details-01").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Product Name", type: "text" },
  ],
  defaultProps: { heading: "Pink Blouse" },
  icon: ShoppingBag,
  category: "ecommerce",
})

registerBlock("ctProductList", {
  component: dynamic(() => import("@/components/creative-tim/blocks/simple-product-list").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Section Title", type: "text" },
  ],
  defaultProps: { heading: "Latest Products" },
  icon: LayoutGrid,
  category: "ecommerce",
})

registerBlock("ctCustomerReviews", {
  component: dynamic(() => import("@/components/creative-tim/blocks/customer-overview-example-1").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Section Title", type: "text" },
  ],
  defaultProps: { heading: "Our Customer's Opinion" },
  icon: Star,
  category: "sections",
})

registerBlock("ctCategories", {
  component: dynamic(() => import("@/components/creative-tim/blocks/categories-with-full-background").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Section Title", type: "text" },
  ],
  defaultProps: { heading: "Our Product Categories" },
  icon: FolderOpen,
  category: "sections",
})

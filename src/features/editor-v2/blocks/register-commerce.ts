import dynamic from "next/dynamic"
import React from "react"
import { BlockSkeleton } from "./block-skeleton"
import { registerBlock } from "../registry"
import { ShoppingBag, Grid3x3, Star, Package, ShoppingCart, DollarSign, Table, LayoutGrid } from "lucide-react"


registerBlock("productCard", {
  component: dynamic(() => import("./product-card").then(m => ({ default: m.ProductCard })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "image", label: "Image", type: "image" },
    { name: "name", label: "Name", type: "text" },
    { name: "price", label: "Price", type: "text" },
    { name: "compareAtPrice", label: "Compare At Price", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "badge", label: "Badge", type: "select", options: [{ value: "none", label: "None" }, { value: "Sale", label: "Sale" }, { value: "New", label: "New" }, { value: "Hot", label: "Hot" }] },
  ],
  defaultProps: { image: "", name: "Product Name", price: "$29.99", compareAtPrice: "$49.99", buttonText: "Add to Cart", badge: "Sale" },
  icon: ShoppingBag,
  category: "commerce",
})

registerBlock("productGrid", {
  component: dynamic(() => import("./product-grid").then(m => ({ default: m.ProductGrid })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "columns", label: "Columns", type: "number" },
    { name: "limit", label: "Limit", type: "number" },
    { name: "categoryFilter", label: "Category Filter", type: "text" },
    { name: "sortBy", label: "Sort By", type: "select", options: [{ value: "newest", label: "Newest" }, { value: "price-asc", label: "Price: Low to High" }, { value: "price-desc", label: "Price: High to Low" }, { value: "popular", label: "Popular" }] },
    { name: "products", label: "Products (editor)", type: "list", listFields: [{ key: "name", label: "Name", type: "text" }, { key: "price", label: "Price", type: "text" }, { key: "image", label: "Image URL", type: "text" }] },
  ],
  defaultProps: { heading: "Our Products", columns: 3, limit: 12, categoryFilter: "", sortBy: "newest", products: JSON.stringify([{ image: "https://placehold.co/400x400/f3f4f6/9ca3af?text=Product+1", name: "Product 1", price: "$19.99" }, { image: "https://placehold.co/400x400/f3f4f6/9ca3af?text=Product+2", name: "Product 2", price: "$29.99" }, { image: "https://placehold.co/400x400/f3f4f6/9ca3af?text=Product+3", name: "Product 3", price: "$39.99" }]) },
  icon: Grid3x3,
  category: "commerce",
})

registerBlock("featuredProduct", {
  component: dynamic(() => import("./featured-product").then(m => ({ default: m.FeaturedProduct })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "productId", label: "Product ID", type: "text" },
    { name: "image", label: "Fallback Image", type: "image" },
    { name: "name", label: "Fallback Name", type: "text" },
    { name: "price", label: "Fallback Price", type: "text" },
    { name: "description", label: "Fallback Description", type: "textarea" },
    { name: "buttonText", label: "Button Text", type: "text" },
  ],
  defaultProps: { productId: "", image: "", name: "Featured Product", price: "$99.99", description: "This is our best-selling product.", buttonText: "Buy Now", badge: "New" },
  icon: Star,
  category: "commerce",
})

registerBlock("collectionList", {
  component: dynamic(() => import("./collection-list").then(m => ({ default: m.CollectionList })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "columns", label: "Columns", type: "number" },
    { name: "limit", label: "Limit", type: "number" },
    { name: "collections", label: "Collections (editor)", type: "list", listFields: [{ key: "name", label: "Name", type: "text" }, { key: "image", label: "Image URL", type: "text" }] },
  ],
  defaultProps: { heading: "Shop by Collection", columns: 3, limit: 6, collections: JSON.stringify([{ image: "", name: "Summer" }, { image: "", name: "Winter" }, { image: "", name: "Sale" }]) },
  icon: Package,
  category: "commerce",
})

registerBlock("cartSummary", {
  component: dynamic(() => import("./cart-summary").then(m => ({ default: m.CartSummary })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "itemCount", label: "Item Count", type: "number" },
    { name: "subtotal", label: "Subtotal", type: "text" },
    { name: "currency", label: "Currency Symbol", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
  ],
  defaultProps: { itemCount: 3, subtotal: "89.97", currency: "$", checkoutUrl: "#", buttonText: "Checkout" },
  icon: ShoppingCart,
  category: "commerce",
})

registerBlock("pricingTable", {
  component: dynamic(() => import("./pricing-table").then(m => ({ default: m.PricingTable })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "tiers", label: "Tiers (JSON)", type: "textarea" },
  ],
  defaultProps: { heading: "Choose Your Plan", tiers: JSON.stringify([{ name: "Basic", price: "$9/mo", features: ["1 Product", "Basic Support"], highlighted: false }, { name: "Pro", price: "$29/mo", features: ["Unlimited Products", "Priority Support", "Analytics"], highlighted: true }, { name: "Enterprise", price: "$99/mo", features: ["Everything in Pro", "Custom Domain", "API Access"], highlighted: false }]) },
  icon: DollarSign,
  category: "commerce",
})

registerBlock("comparisonTable", {
  component: dynamic(() => import("./comparison-table").then(m => ({ default: m.ComparisonTable })), { loading: () => React.createElement(BlockSkeleton) }),
  category: "commerce",
  icon: Table,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "columns", label: "Columns (JSON)", type: "textarea" },
    { name: "rows", label: "Rows (JSON)", type: "textarea" },
  ],
  defaultProps: { heading: "Compare Plans", columns: JSON.stringify([{ name: "Basic", highlighted: false }, { name: "Pro", highlighted: true }, { name: "Enterprise", highlighted: false }]), rows: JSON.stringify([{ feature: "Products", values: [true, true, true] }, { feature: "Analytics", values: [false, true, true] }, { feature: "Support", values: [false, true, true] }, { feature: "Custom Domain", values: [false, false, true] }, { feature: "API Access", values: [false, false, true] }]) },
})

registerBlock("ctProductDetails", {
  component: dynamic(() => import("@/components/creative-tim/blocks/simple-product-details-01").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Product Name", type: "text" },
  ],
  defaultProps: { heading: "Pink Blouse" },
  icon: ShoppingBag,
  category: "commerce",
})

registerBlock("ctProductList", {
  component: dynamic(() => import("@/components/creative-tim/blocks/simple-product-list").then(m => ({ default: m.default })), { loading: () => React.createElement(BlockSkeleton) }),
  fields: [
    { name: "heading", label: "Section Title", type: "text" },
  ],
  defaultProps: { heading: "Latest Products" },
  icon: LayoutGrid,
  category: "commerce",
})

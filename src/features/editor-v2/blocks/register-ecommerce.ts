import dynamic from "next/dynamic"
import { registerBlock } from "../registry"
import { ShoppingBag, Grid3x3, Star, Package, Tag, Store, LayoutGrid, ShoppingCart, Megaphone, DollarSign, Shield, Timer } from "lucide-react"

registerBlock("productCard", {
  component: dynamic(() => import("./product-card").then(m => ({ default: m.ProductCard }))),
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
  category: "ecommerce",
})

registerBlock("productGrid", {
  component: dynamic(() => import("./product-grid").then(m => ({ default: m.ProductGrid }))),
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
  category: "ecommerce",
})

registerBlock("featuredProduct", {
  component: dynamic(() => import("./featured-product").then(m => ({ default: m.FeaturedProduct }))),
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
  category: "ecommerce",
})

registerBlock("collectionList", {
  component: dynamic(() => import("./collection-list").then(m => ({ default: m.CollectionList }))),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "columns", label: "Columns", type: "number" },
    { name: "limit", label: "Limit", type: "number" },
    { name: "collections", label: "Collections (editor)", type: "list", listFields: [{ key: "name", label: "Name", type: "text" }, { key: "image", label: "Image URL", type: "text" }] },
  ],
  defaultProps: { heading: "Shop by Collection", columns: 3, limit: 6, collections: JSON.stringify([{ image: "", name: "Summer" }, { image: "", name: "Winter" }, { image: "", name: "Sale" }]) },
  icon: Package,
  category: "ecommerce",
})

registerBlock("promoBanner", {
  component: dynamic(() => import("./promo-banner").then(m => ({ default: m.PromoBanner }))),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
    { name: "dismissible", label: "Dismissible", type: "toggle" },
  ],
  defaultProps: { text: "Summer Sale — 20% off everything!", buttonText: "Shop Now", buttonUrl: "#", backgroundColor: "#000000", textColor: "#ffffff", dismissible: false },
  icon: Tag,
  category: "ecommerce",
})

registerBlock("header", {
  component: dynamic(() => import("./header").then(m => ({ default: m.Header }))),
  fields: [
    { name: "logo", label: "Logo", type: "image" },
    { name: "storeName", label: "Store Name", type: "text" },
    { name: "navLinks", label: "Nav Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "sticky", label: "Sticky", type: "toggle" },
    { name: "borderBottom", label: "Border Bottom", type: "toggle" },
    { name: "showSearch", label: "Show Search", type: "toggle" },
    { name: "showCart", label: "Show Cart", type: "toggle" },
    { name: "showAccount", label: "Show Account", type: "toggle" },
    { name: "announcementText", label: "Announcement", type: "text" },
    { name: "announcementBg", label: "Announcement BG", type: "color" },
  ],
  defaultProps: { logo: "", storeName: "My Store", navLinks: JSON.stringify([{ label: "Shop", url: "#" }, { label: "About", url: "#" }, { label: "Contact", url: "#" }]), backgroundColor: "#ffffff", sticky: true, borderBottom: true, showSearch: true, showCart: true, showAccount: false, announcementText: "", announcementBg: "" },
  icon: Store,
  category: "ecommerce",
})

registerBlock("footer", {
  component: dynamic(() => import("./footer").then(m => ({ default: m.Footer }))),
  fields: [
    { name: "logo", label: "Logo", type: "image" },
    { name: "storeName", label: "Store Name", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "columns", label: "Columns", type: "list", listFields: [{ key: "title", label: "Title", type: "text" }, { key: "links", label: "Links (one per line)", type: "text" }] },
    { name: "copyright", label: "Copyright", type: "text" },
    { name: "showNewsletter", label: "Show Newsletter", type: "toggle" },
    { name: "newsletterHeading", label: "Newsletter Heading", type: "text" },
    { name: "newsletterDescription", label: "Newsletter Description", type: "text" },
    { name: "socialLinks", label: "Social Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "showPaymentIcons", label: "Show Payment Icons", type: "toggle" },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
  ],
  defaultProps: { logo: "", storeName: "My Store", description: "Your one-stop shop for amazing products.", columns: JSON.stringify([{ title: "Shop", links: "All Products\nNew Arrivals\nSale" }, { title: "Help", links: "FAQ\nContact\nShipping" }, { title: "Company", links: "About\nBlog\nCareers" }]), copyright: "© 2026 My Store. All rights reserved.", showNewsletter: true, newsletterHeading: "Newsletter", newsletterDescription: "Stay updated with our latest products.", socialLinks: JSON.stringify([{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }, { platform: "facebook", url: "#" }]), showPaymentIcons: true, backgroundColor: "#111827", textColor: "#f9fafb" },
  icon: LayoutGrid,
  category: "ecommerce",
})

registerBlock("cartSummary", {
  component: dynamic(() => import("./cart-summary").then(m => ({ default: m.CartSummary }))),
  fields: [
    { name: "itemCount", label: "Item Count", type: "number" },
    { name: "subtotal", label: "Subtotal", type: "text" },
    { name: "currency", label: "Currency Symbol", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
  ],
  defaultProps: { itemCount: 3, subtotal: "89.97", currency: "$", checkoutUrl: "#", buttonText: "Checkout" },
  icon: ShoppingCart,
  category: "ecommerce",
})

registerBlock("announcementBar", {
  component: dynamic(() => import("./announcement-bar").then(m => ({ default: m.AnnouncementBar }))),
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
    { name: "linkText", label: "Link Text", type: "text" },
    { name: "closeable", label: "Closeable", type: "toggle" },
  ],
  defaultProps: { text: "Free shipping on orders over $50", backgroundColor: "#000000", textColor: "#ffffff", link: "#", linkText: "Learn more", closeable: false },
  icon: Megaphone,
  category: "ecommerce",
})

registerBlock("pricingTable", {
  component: dynamic(() => import("./pricing-table").then(m => ({ default: m.PricingTable }))),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "tiers", label: "Tiers (JSON)", type: "textarea" },
  ],
  defaultProps: { heading: "Choose Your Plan", tiers: JSON.stringify([{ name: "Basic", price: "$9/mo", features: ["1 Product", "Basic Support"], highlighted: false }, { name: "Pro", price: "$29/mo", features: ["Unlimited Products", "Priority Support", "Analytics"], highlighted: true }, { name: "Enterprise", price: "$99/mo", features: ["Everything in Pro", "Custom Domain", "API Access"], highlighted: false }]) },
  icon: DollarSign,
  category: "ecommerce",
})

registerBlock("trustBadges", {
  component: dynamic(() => import("./trust-badges").then(m => ({ default: m.TrustBadges }))),
  fields: [
    { name: "badges", label: "Badges", type: "list", listFields: [{ key: "icon", label: "Icon (emoji)", type: "text" }, { key: "label", label: "Label", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "icons", label: "Icons" }, { value: "text", label: "Text" }] },
  ],
  defaultProps: { badges: JSON.stringify([{ icon: "🚚", label: "Free Shipping" }, { icon: "🔒", label: "Secure Payment" }, { icon: "↩️", label: "Easy Returns" }, { icon: "⭐", label: "5-Star Reviews" }]), variant: "icons" },
  icon: Shield,
  category: "ecommerce",
})

registerBlock("countdownTimer", {
  component: dynamic(() => import("./countdown-timer").then(m => ({ default: m.CountdownTimer }))),
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "targetDate", label: "Target Date (ISO)", type: "text" },
    { name: "expiredText", label: "Expired Text", type: "text" },
  ],
  defaultProps: { heading: "Sale Ends In", targetDate: "2026-12-31T23:59:59", expiredText: "This offer has expired." },
  icon: Timer,
  category: "ecommerce",
})

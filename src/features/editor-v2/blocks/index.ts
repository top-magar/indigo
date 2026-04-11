import { registerBlock } from "../registry"
import { Hero } from "./hero"
import { Text } from "./text"
import { Image } from "./image"
import { Button } from "./button"
import { Divider } from "./divider"
import { RichText } from "./rich-text"
import { FAQ } from "./faq"
import { Newsletter } from "./newsletter"
import { Testimonials } from "./testimonials"
import { Columns } from "./columns"
import { ProductCard } from "./product-card"
import { ProductGrid } from "./product-grid"
import { FeaturedProduct } from "./featured-product"
import { CollectionList } from "./collection-list"
import { PromoBanner } from "./promo-banner"
import { Header } from "./header"
import { Footer } from "./footer"
import { CartSummary } from "./cart-summary"
import { AnnouncementBar } from "./announcement-bar"
import { PricingTable } from "./pricing-table"
import { TrustBadges } from "./trust-badges"
import { CountdownTimer } from "./countdown-timer"
import { Form } from "./form"
import { Video } from "./video"
import { CustomCode } from "./custom-code"
import { Heading, Type, ImageIcon, MousePointerClick, Minus, FileText, HelpCircle, Mail, Quote, LayoutGrid, ShoppingBag, Package, Star, Grid3x3, Tag, Store, ShoppingCart, Megaphone, DollarSign, Shield, Timer, Play, Code } from "lucide-react"

registerBlock("hero", {
  component: Hero,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "backgroundImage", label: "Background Image", type: "image" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "full", label: "Full" }, { value: "split", label: "Split" }] },
  ],
  defaultProps: { heading: "Welcome to our store", subheading: "Discover amazing products", buttonText: "Shop Now", buttonUrl: "#", backgroundImage: "", variant: "full" },
  icon: Heading,
  category: "sections",
})

registerBlock("text", {
  component: Text,
  fields: [
    { name: "text", label: "Text", type: "textarea" },
    { name: "fontSize", label: "Font Size", type: "number" },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
    { name: "tagName", label: "Tag", type: "select", options: [{ value: "p", label: "Paragraph" }, { value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }] },
  ],
  defaultProps: { text: "Edit this text", fontSize: 16, fontWeight: 400, color: "#000000", alignment: "left", tagName: "p" },
  icon: Type,
  category: "basic",
})

registerBlock("image", {
  component: Image,
  fields: [
    { name: "src", label: "Image URL", type: "image" },
    { name: "alt", label: "Alt Text", type: "text" },
    { name: "objectFit", label: "Fit", type: "select", options: [{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }] },
    { name: "borderRadius", label: "Corner Radius", type: "number" },
  ],
  defaultProps: { src: "", alt: "", objectFit: "cover", borderRadius: 8, maxHeight: 400, caption: "" },
  icon: ImageIcon,
  category: "basic",
})

registerBlock("button", {
  component: Button,
  fields: [
    { name: "text", label: "Label", type: "text" },
    { name: "href", label: "URL", type: "text" },
    { name: "variant", label: "Style", type: "select", options: [{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }, { value: "ghost", label: "Ghost" }] },
    { name: "size", label: "Size", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
    { name: "color", label: "Color", type: "color" },
  ],
  defaultProps: { text: "Click me", href: "#", variant: "solid", size: "md", color: "#000000" },
  icon: MousePointerClick,
  category: "basic",
})

registerBlock("divider", {
  component: Divider,
  fields: [
    { name: "height", label: "Height", type: "number" },
    { name: "showLine", label: "Show Line", type: "toggle" },
    { name: "lineColor", label: "Line Color", type: "color" },
  ],
  defaultProps: { height: 48, showLine: true, lineColor: "#e5e7eb", lineWidth: 1 },
  icon: Minus,
  category: "basic",
})

registerBlock("richText", {
  component: RichText,
  fields: [
    { name: "content", label: "HTML Content", type: "textarea" },
    { name: "maxWidth", label: "Max Width", type: "number" },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
    { name: "fontSize", label: "Font Size", type: "number" },
  ],
  defaultProps: { content: "<h2>About Us</h2><p>Write your story here.</p>", maxWidth: 700, alignment: "left", fontSize: 16 },
  icon: FileText,
  category: "basic",
})

registerBlock("faq", {
  component: FAQ,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "items", label: "Items (JSON)", type: "textarea" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "accordion", label: "Accordion" }, { value: "list", label: "List" }] },
  ],
  defaultProps: { heading: "Frequently Asked Questions", items: JSON.stringify([{ q: "Question?", a: "Answer." }]), variant: "accordion" },
  icon: HelpCircle,
  category: "sections",
})

registerBlock("newsletter", {
  component: Newsletter,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "subheading", label: "Subheading", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "inline", label: "Inline" }, { value: "stacked", label: "Stacked" }, { value: "card", label: "Card" }] },
  ],
  defaultProps: { heading: "Stay in the loop", subheading: "Get updates on new products and sales.", buttonText: "Subscribe", variant: "stacked" },
  icon: Mail,
  category: "sections",
})

registerBlock("testimonials", {
  component: Testimonials,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "items", label: "Items", type: "list", listFields: [{ key: "quote", label: "Quote", type: "text" }, { key: "author", label: "Author", type: "text" }, { key: "role", label: "Role", type: "text" }] },
    { name: "columns", label: "Columns", type: "number" },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "cards", label: "Cards" }, { value: "minimal", label: "Minimal" }] },
  ],
  defaultProps: { heading: "What our customers say", items: JSON.stringify([{ quote: "Amazing!", author: "Sarah M.", role: "Buyer" }]), columns: 3, variant: "cards" },
  icon: Quote,
  category: "sections",
})

registerBlock("columns", {
  component: Columns,
  fields: [
    { name: "columns", label: "Columns", type: "number" },
    { name: "gap", label: "Gap", type: "number" },
  ],
  defaultProps: { columns: 2, gap: 16 },
  icon: LayoutGrid,
  category: "layout",
})

registerBlock("productCard", {
  component: ProductCard,
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
  component: ProductGrid,
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
  component: FeaturedProduct,
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
  component: CollectionList,
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
  component: PromoBanner,
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
  component: Header,
  fields: [
    { name: "logo", label: "Logo", type: "image" },
    { name: "storeName", label: "Store Name", type: "text" },
    { name: "navLinks", label: "Nav Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "sticky", label: "Sticky", type: "toggle" },
  ],
  defaultProps: { logo: "", storeName: "My Store", navLinks: JSON.stringify([{ label: "Shop", url: "#" }, { label: "About", url: "#" }, { label: "Contact", url: "#" }]), backgroundColor: "#ffffff", sticky: false },
  icon: Store,
  category: "ecommerce",
})

registerBlock("footer", {
  component: Footer,
  fields: [
    { name: "columns", label: "Columns (JSON)", type: "textarea" },
    { name: "copyright", label: "Copyright", type: "text" },
    { name: "backgroundColor", label: "Background", type: "color" },
  ],
  defaultProps: { columns: JSON.stringify([{ title: "Shop", links: [{ label: "All Products", url: "#" }] }, { title: "Help", links: [{ label: "FAQ", url: "#" }, { label: "Contact", url: "#" }] }]), copyright: "© 2026 My Store. All rights reserved.", backgroundColor: "#f9fafb" },
  icon: LayoutGrid,
  category: "ecommerce",
})

registerBlock("cartSummary", {
  component: CartSummary,
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
  component: AnnouncementBar,
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
  component: PricingTable,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "tiers", label: "Tiers (JSON)", type: "textarea" },
  ],
  defaultProps: { heading: "Choose Your Plan", tiers: JSON.stringify([{ name: "Basic", price: "$9/mo", features: ["1 Product", "Basic Support"], highlighted: false }, { name: "Pro", price: "$29/mo", features: ["Unlimited Products", "Priority Support", "Analytics"], highlighted: true }, { name: "Enterprise", price: "$99/mo", features: ["Everything in Pro", "Custom Domain", "API Access"], highlighted: false }]) },
  icon: DollarSign,
  category: "ecommerce",
})

registerBlock("trustBadges", {
  component: TrustBadges,
  fields: [
    { name: "badges", label: "Badges", type: "list", listFields: [{ key: "icon", label: "Icon (emoji)", type: "text" }, { key: "label", label: "Label", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "icons", label: "Icons" }, { value: "text", label: "Text" }] },
  ],
  defaultProps: { badges: JSON.stringify([{ icon: "🚚", label: "Free Shipping" }, { icon: "🔒", label: "Secure Payment" }, { icon: "↩️", label: "Easy Returns" }, { icon: "⭐", label: "5-Star Reviews" }]), variant: "icons" },
  icon: Shield,
  category: "ecommerce",
})

registerBlock("countdownTimer", {
  component: CountdownTimer,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "targetDate", label: "Target Date (ISO)", type: "text" },
    { name: "expiredText", label: "Expired Text", type: "text" },
  ],
  defaultProps: { heading: "Sale Ends In", targetDate: "2026-12-31T23:59:59", expiredText: "This offer has expired." },
  icon: Timer,
  category: "ecommerce",
})

registerBlock("form", {
  category: "sections",
  icon: Mail,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "successMessage", label: "Success Message", type: "text" },
    { name: "recipientEmail", label: "Recipient Email", type: "text" },
    { name: "fields", label: "Form Fields", type: "list", listFields: [
      { key: "label", label: "Label", type: "text" },
      { key: "type", label: "Type", type: "text" },
    ]},
  ],
  defaultProps: { heading: "Contact Us", buttonText: "Send Message", successMessage: "Thanks! We'll be in touch.", recipientEmail: "", fields: JSON.stringify([{label:"Name",type:"text"},{label:"Email",type:"email"},{label:"Message",type:"textarea"}]) },
  component: Form,
})

registerBlock("video", {
  category: "sections",
  icon: Play,
  fields: [
    { name: "url", label: "Video URL", type: "text" },
    { name: "aspectRatio", label: "Aspect Ratio", type: "select", options: [{ value: "16:9", label: "16:9" }, { value: "4:3", label: "4:3" }, { value: "1:1", label: "1:1" }] },
    { name: "autoplay", label: "Autoplay", type: "toggle" },
    { name: "muted", label: "Muted", type: "toggle" },
  ],
  defaultProps: { url: "", aspectRatio: "16:9", autoplay: false, muted: false },
  component: Video,
})

registerBlock("customCode", {
  category: "sections",
  icon: Code,
  fields: [
    { name: "html", label: "HTML", type: "textarea" },
    { name: "css", label: "CSS", type: "textarea" },
  ],
  defaultProps: { html: "", css: "" },
  component: CustomCode,
})

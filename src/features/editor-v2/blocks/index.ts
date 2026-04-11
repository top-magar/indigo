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
import { LogoCloud } from "./logo-cloud"
import { Tabs } from "./tabs"
import { Popup } from "./popup"
import { Map } from "./map"
import { ScrollProgress } from "./scroll-progress"
import { SocialLinks } from "./social-links"
import { ComparisonTable } from "./comparison-table"
import { Marquee } from "./marquee"
import { Spacer } from "./spacer"
import { HeadingBlock } from "./heading"
import { ParagraphBlock } from "./paragraph"
import { NavLinks } from "./nav-links"
import { IconButton } from "./icon-button"
import { Logo } from "./logo"
import { LinkGroup } from "./link-group"
import { NewsletterForm } from "./newsletter-form"
import { SocialIcons } from "./social-icons"
import { CopyrightBar } from "./copyright-bar"
import { Announcement } from "./announcement"
import { HeroContainer } from "./hero-container"
import { HeaderContainer } from "./header-container"
import { FooterContainer } from "./footer-container"
import { Heading, Type, ImageIcon, MousePointerClick, Minus, FileText, HelpCircle, Mail, Quote, LayoutGrid, ShoppingBag, Package, Star, Grid3x3, Tag, Store, ShoppingCart, Megaphone, DollarSign, Shield, Timer, Play, Code, Building2, PanelTop, MessageSquare, MapPin, Share2, Table, MoveHorizontal, Pilcrow, Navigation, MousePointer, Image as ImageLucide, List, Newspaper, CircleDot, Copyright, Bell, Rows3, PanelTopDashed, PanelBottomDashed } from "lucide-react"

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
  component: Footer,
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

registerBlock("logoCloud", {
  category: "sections",
  icon: Building2,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "logos", label: "Logos", type: "list", listFields: [{ key: "name", label: "Name", type: "text" }, { key: "imageUrl", label: "Image URL", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "grid", label: "Grid" }, { value: "marquee", label: "Marquee" }] },
    { name: "columns", label: "Columns", type: "number" },
  ],
  defaultProps: { heading: "Trusted by leading brands", logos: JSON.stringify([{ name: "Brand 1", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+1" }, { name: "Brand 2", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+2" }, { name: "Brand 3", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+3" }, { name: "Brand 4", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+4" }, { name: "Brand 5", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+5" }, { name: "Brand 6", imageUrl: "https://placehold.co/120x40/f3f4f6/9ca3af?text=Brand+6" }]), variant: "grid", columns: 4 },
  component: LogoCloud,
})

registerBlock("tabs", {
  category: "sections",
  icon: PanelTop,
  fields: [
    { name: "tabs", label: "Tabs", type: "list", listFields: [{ key: "title", label: "Title", type: "text" }, { key: "content", label: "Content", type: "text" }] },
  ],
  defaultProps: { tabs: JSON.stringify([{ title: "Tab 1", content: "Content for tab 1." }, { title: "Tab 2", content: "Content for tab 2." }, { title: "Tab 3", content: "Content for tab 3." }]) },
  component: Tabs,
})

registerBlock("popup", {
  category: "sections",
  icon: MessageSquare,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "content", label: "Content", type: "textarea" },
    { name: "buttonText", label: "Button Text", type: "text" },
    { name: "trigger", label: "Trigger", type: "select", options: [{ value: "button", label: "Button" }, { value: "timer", label: "Timer" }, { value: "scroll", label: "Scroll" }] },
    { name: "timerDelay", label: "Timer Delay (s)", type: "number" },
    { name: "scrollPercent", label: "Scroll %", type: "number" },
  ],
  defaultProps: { heading: "Special Offer!", content: "<p>Don't miss out on our exclusive deal.</p>", buttonText: "Learn More", trigger: "button", timerDelay: 3, scrollPercent: 50 },
  component: Popup,
})

registerBlock("map", {
  category: "sections",
  icon: MapPin,
  fields: [
    { name: "address", label: "Address", type: "text" },
    { name: "zoom", label: "Zoom", type: "number" },
    { name: "height", label: "Height", type: "number" },
  ],
  defaultProps: { address: "", zoom: 14, height: 300 },
  component: Map,
})

registerBlock("scrollProgress", {
  category: "sections",
  icon: Minus,
  fields: [
    { name: "color", label: "Color", type: "color" },
    { name: "height", label: "Height", type: "number" },
    { name: "position", label: "Position", type: "select", options: [{ value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }] },
  ],
  defaultProps: { color: "#000000", height: 3, position: "top" },
  component: ScrollProgress,
})

registerBlock("socialLinks", {
  category: "sections",
  icon: Share2,
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "variant", label: "Variant", type: "select", options: [{ value: "icons", label: "Icons" }, { value: "pills", label: "Pills" }, { value: "text", label: "Text" }] },
    { name: "size", label: "Size", type: "select", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
  ],
  defaultProps: { links: JSON.stringify([{ platform: "facebook", url: "#" }, { platform: "instagram", url: "#" }, { platform: "twitter", url: "#" }]), variant: "icons", size: "md" },
  component: SocialLinks,
})

registerBlock("comparisonTable", {
  category: "sections",
  icon: Table,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "columns", label: "Columns (JSON)", type: "textarea" },
    { name: "rows", label: "Rows (JSON)", type: "textarea" },
  ],
  defaultProps: { heading: "Compare Plans", columns: JSON.stringify([{ name: "Basic", highlighted: false }, { name: "Pro", highlighted: true }, { name: "Enterprise", highlighted: false }]), rows: JSON.stringify([{ feature: "Products", values: [true, true, true] }, { feature: "Analytics", values: [false, true, true] }, { feature: "Support", values: [false, true, true] }, { feature: "Custom Domain", values: [false, false, true] }, { feature: "API Access", values: [false, false, true] }]) },
  component: ComparisonTable,
})

registerBlock("marquee", {
  category: "sections",
  icon: MoveHorizontal,
  fields: [
    { name: "items", label: "Items", type: "list", listFields: [{ key: "text", label: "Text", type: "text" }] },
    { name: "speed", label: "Speed (seconds)", type: "number" },
    { name: "direction", label: "Direction", type: "select", options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }] },
    { name: "pauseOnHover", label: "Pause on Hover", type: "toggle" },
  ],
  defaultProps: { items: JSON.stringify([{ text: "Free Shipping" }, { text: "New Arrivals" }, { text: "Summer Sale" }, { text: "Shop Now" }]), speed: 30, direction: "left", pauseOnHover: true },
  component: Marquee,
})

registerBlock("spacer", {
  category: "layout",
  icon: Minus,
  fields: [
    { name: "height", label: "Height (px)", type: "number" },
    { name: "mobileHeight", label: "Mobile Height (px)", type: "number" },
  ],
  defaultProps: { height: 64, mobileHeight: 32 },
  component: Spacer,
})

// ── Primitive Blocks ──────────────────────────────────────────────

registerBlock("headingBlock", {
  component: HeadingBlock,
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "level", label: "Level", type: "select", options: [{ value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }, { value: "h4", label: "H4" }] },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
  ],
  defaultProps: { text: "Heading", level: "h2", alignment: "left" },
  icon: Heading,
  category: "primitives",
})

registerBlock("paragraphBlock", {
  component: ParagraphBlock,
  fields: [
    { name: "text", label: "Text", type: "textarea" },
    { name: "alignment", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
  ],
  defaultProps: { text: "Paragraph text", alignment: "left" },
  icon: Pilcrow,
  category: "primitives",
})

registerBlock("navLinks", {
  component: NavLinks,
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
    { name: "direction", label: "Direction", type: "select", options: [{ value: "horizontal", label: "Horizontal" }, { value: "vertical", label: "Vertical" }] },
    { name: "gap", label: "Gap", type: "number" },
  ],
  defaultProps: { links: JSON.stringify([{ label: "Home", url: "#" }, { label: "Shop", url: "#" }, { label: "About", url: "#" }]), direction: "horizontal", gap: 16 },
  icon: Navigation,
  category: "primitives",
})

registerBlock("iconButton", {
  component: IconButton,
  fields: [
    { name: "icon", label: "Icon", type: "select", options: [{ value: "search", label: "Search" }, { value: "user", label: "User" }, { value: "shopping-bag", label: "Shopping Bag" }, { value: "menu", label: "Menu" }, { value: "x", label: "Close" }, { value: "heart", label: "Heart" }] },
    { name: "size", label: "Size", type: "number" },
    { name: "label", label: "Label", type: "text" },
  ],
  defaultProps: { icon: "search", size: 20, label: "" },
  icon: MousePointer,
  category: "primitives",
})

registerBlock("logo", {
  component: Logo,
  fields: [
    { name: "src", label: "Logo Image", type: "image" },
    { name: "alt", label: "Store Name", type: "text" },
    { name: "height", label: "Height", type: "number" },
  ],
  defaultProps: { src: "", alt: "My Store", height: 32 },
  icon: ImageLucide,
  category: "primitives",
})

registerBlock("linkGroup", {
  component: LinkGroup,
  fields: [
    { name: "title", label: "Title", type: "text" },
    { name: "links", label: "Links", type: "list", listFields: [{ key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }] },
  ],
  defaultProps: { title: "Links", links: JSON.stringify([{ label: "Link 1", url: "#" }, { label: "Link 2", url: "#" }]) },
  icon: List,
  category: "primitives",
})

registerBlock("newsletterForm", {
  component: NewsletterForm,
  fields: [
    { name: "heading", label: "Heading", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "buttonText", label: "Button Text", type: "text" },
  ],
  defaultProps: { heading: "Newsletter", description: "Stay updated.", buttonText: "Subscribe" },
  icon: Newspaper,
  category: "primitives",
})

registerBlock("socialIcons", {
  component: SocialIcons,
  fields: [
    { name: "links", label: "Links", type: "list", listFields: [{ key: "platform", label: "Platform", type: "text" }, { key: "url", label: "URL", type: "text" }] },
  ],
  defaultProps: { links: JSON.stringify([{ platform: "twitter", url: "#" }, { platform: "instagram", url: "#" }]) },
  icon: CircleDot,
  category: "primitives",
})

registerBlock("copyrightBar", {
  component: CopyrightBar,
  fields: [
    { name: "text", label: "Text", type: "text" },
  ],
  defaultProps: { text: "© 2026 My Store. All rights reserved." },
  icon: Copyright,
  category: "primitives",
})

registerBlock("announcement", {
  component: Announcement,
  fields: [
    { name: "text", label: "Text", type: "text" },
    { name: "dismissible", label: "Dismissible", type: "toggle" },
  ],
  defaultProps: { text: "Free shipping on orders over $50!", dismissible: true },
  icon: Bell,
  category: "primitives",
})

// ── Container Blocks ──────────────────────────────────────────────

registerBlock("heroContainer", {
  component: HeroContainer,
  fields: [
    { name: "variant", label: "Variant", type: "select", options: [{ value: "full", label: "Full" }, { value: "split", label: "Split" }] },
    { name: "backgroundImage", label: "Background Image", type: "image" },
    { name: "overlay", label: "Overlay", type: "toggle" },
  ],
  defaultProps: { variant: "full", backgroundImage: "", overlay: false },
  icon: Rows3,
  category: "containers",
})

registerBlock("headerContainer", {
  component: HeaderContainer,
  fields: [
    { name: "sticky", label: "Sticky", type: "toggle" },
    { name: "borderBottom", label: "Border Bottom", type: "toggle" },
    { name: "backgroundColor", label: "Background", type: "color" },
  ],
  defaultProps: { sticky: true, borderBottom: true, backgroundColor: "#ffffff" },
  icon: PanelTopDashed,
  category: "containers",
})

registerBlock("footerContainer", {
  component: FooterContainer,
  fields: [
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
  ],
  defaultProps: { backgroundColor: "#111827", textColor: "#f9fafb" },
  icon: PanelBottomDashed,
  category: "containers",
})

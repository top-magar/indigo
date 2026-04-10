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
import { Heading, Type, ImageIcon, MousePointerClick, Minus, FileText, HelpCircle, Mail, Quote, LayoutGrid } from "lucide-react"

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
    { name: "items", label: "Items (JSON)", type: "textarea" },
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

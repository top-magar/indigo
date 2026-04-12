import dynamic from "next/dynamic"
import { registerBlock } from "../registry"
import { Rows3, PanelTopDashed, PanelBottomDashed } from "lucide-react"

registerBlock("heroContainer", {
  component: dynamic(() => import("./hero-container").then(m => ({ default: m.HeroContainer }))),
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
  component: dynamic(() => import("./header-container").then(m => ({ default: m.HeaderContainer }))),
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
  component: dynamic(() => import("./footer-container").then(m => ({ default: m.FooterContainer }))),
  fields: [
    { name: "backgroundColor", label: "Background", type: "color" },
    { name: "textColor", label: "Text Color", type: "color" },
  ],
  defaultProps: { backgroundColor: "#111827", textColor: "#f9fafb" },
  icon: PanelBottomDashed,
  category: "containers",
})

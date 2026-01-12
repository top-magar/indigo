// Block Icons - Maps block types to Lucide React icons
import {
  Menu,
  Image,
  Heart,
  Grid3X3,
  Megaphone,
  MessageSquare,
  Shield,
  Mail,
  PanelBottom,
  AlignLeft,
  Square,
  Columns2,
  MousePointer,
  Video,
  HelpCircle,
  Images,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { BlockType } from "@/types/blocks"

export function getBlockIcon(type: BlockType): LucideIcon {
  const icons: Record<BlockType, LucideIcon> = {
    header: Menu,
    hero: Image,
    "featured-product": Heart,
    "product-grid": Grid3X3,
    "promotional-banner": Megaphone,
    testimonials: MessageSquare,
    "trust-signals": Shield,
    newsletter: Mail,
    footer: PanelBottom,
    "rich-text": AlignLeft,
    image: Image,
    button: MousePointer,
    video: Video,
    faq: HelpCircle,
    gallery: Images,
    // Container blocks
    section: Square,
    columns: Columns2,
    column: Square,
  }
  
  return icons[type] || Square
}

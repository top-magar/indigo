import { registerBlock } from "../core/registry"
import { HeroSchema } from "./hero.schema"
import { TextSchema } from "./text.schema"
import { ImageSchema } from "./image.schema"
import { ButtonSchema } from "./button.schema"
import { ColumnsSchema } from "./columns.schema"
import { HeaderSchema } from "./header.schema"
import { FooterSchema } from "./footer.schema"
import { ProductGridSchema } from "./product-grid.schema"
import { FeaturedProductSchema } from "./featured-product.schema"
import { CollectionListSchema } from "./collection-list.schema"
import { NewsletterSchema } from "./newsletter.schema"
import { FAQSchema } from "./faq.schema"
import { TestimonialsSchema } from "./testimonials.schema"

export function registerBuiltInBlocks(): void {
  registerBlock(HeroSchema)
  registerBlock(TextSchema)
  registerBlock(ImageSchema)
  registerBlock(ButtonSchema)
  registerBlock(ColumnsSchema)
  registerBlock(HeaderSchema)
  registerBlock(FooterSchema)
  registerBlock(ProductGridSchema)
  registerBlock(FeaturedProductSchema)
  registerBlock(CollectionListSchema)
  registerBlock(NewsletterSchema)
  registerBlock(FAQSchema)
  registerBlock(TestimonialsSchema)
}

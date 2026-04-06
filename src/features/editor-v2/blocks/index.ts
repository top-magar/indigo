/**
 * Block Registration — Import this file to register all built-in blocks.
 * Plugins register their own blocks via the plugin API.
 */

import { registerBlock } from "../core/registry"
import { HeroSchema } from "./hero.schema"
import { TextSchema } from "./text.schema"
import { ImageSchema } from "./image.schema"
import { ButtonSchema } from "./button.schema"
import { ColumnsSchema } from "./columns.schema"

export function registerBuiltInBlocks(): void {
  registerBlock(HeroSchema)
  registerBlock(TextSchema)
  registerBlock(ImageSchema)
  registerBlock(ButtonSchema)
  registerBlock(ColumnsSchema)
}

export { HeroSchema, TextSchema, ImageSchema, ButtonSchema, ColumnsSchema }

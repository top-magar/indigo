import { registerComponent } from "../registry/registry"

import { Box } from "./box"
import { meta as boxMeta } from "./box.meta"
import { Text } from "./text"
import { meta as textMeta } from "./text.meta"
import { Heading } from "./heading"
import { meta as headingMeta } from "./heading.meta"
import { Image } from "./image"
import { meta as imageMeta } from "./image.meta"
import { Link } from "./link"
import { meta as linkMeta } from "./link.meta"
import { Button } from "./button"
import { meta as buttonMeta } from "./button.meta"
import { Slot } from "./slot"
import { meta as slotMeta } from "./slot.meta"
import { List } from "./list"
import { meta as listMeta } from "./list.meta"
import { Form } from "./form"
import { meta as formMeta } from "./form.meta"
import { Input } from "./input"
import { meta as inputMeta } from "./input.meta"

registerComponent("Box", Box, boxMeta)
registerComponent("Text", Text, textMeta)
registerComponent("Heading", Heading, headingMeta)
registerComponent("Image", Image, imageMeta)
registerComponent("Link", Link, linkMeta)
registerComponent("Button", Button, buttonMeta)
registerComponent("Slot", Slot, slotMeta)
registerComponent("List", List, listMeta)
registerComponent("Form", Form, formMeta)
registerComponent("Input", Input, inputMeta)

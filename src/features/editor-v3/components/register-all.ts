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
import { CodeBlock } from "./code-block"
import { meta as codeBlockMeta } from "./code-block.meta"
import { Container } from "./container"
import { meta as containerMeta } from "./container.meta"
import { Section } from "./section"
import { meta as sectionMeta } from "./section.meta"
import { Navbar } from "./navbar"
import { meta as navbarMeta } from "./navbar.meta"
import { Paragraph } from "./paragraph"
import { meta as paragraphMeta } from "./paragraph.meta"
import { Video } from "./video"
import { meta as videoMeta } from "./video.meta"
import { Label } from "./label"
import { meta as labelMeta } from "./label.meta"
import { Textarea } from "./textarea"
import { meta as textareaMeta } from "./textarea.meta"
import { Checkbox } from "./checkbox"
import { meta as checkboxMeta } from "./checkbox.meta"
import { Radio } from "./radio"
import { meta as radioMeta } from "./radio.meta"
import { SelectField } from "./select-field"
import { meta as selectFieldMeta } from "./select-field.meta"
import { Separator } from "./separator"
import { meta as separatorMeta } from "./separator.meta"

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
registerComponent("CodeBlock", CodeBlock, codeBlockMeta)
registerComponent("Container", Container, containerMeta)
registerComponent("Section", Section, sectionMeta)
registerComponent("Navbar", Navbar, navbarMeta)
registerComponent("Paragraph", Paragraph, paragraphMeta)
registerComponent("Video", Video, videoMeta)
registerComponent("Label", Label, labelMeta)
registerComponent("Textarea", Textarea, textareaMeta)
registerComponent("Checkbox", Checkbox, checkboxMeta)
registerComponent("Radio", Radio, radioMeta)
registerComponent("SelectField", SelectField, selectFieldMeta)
registerComponent("Separator", Separator, separatorMeta)

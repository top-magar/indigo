import type { Meta, StoryObj } from "@storybook/react"
import { EditorShell } from "../components/editor-shell"
import { defaultPageJson } from "../lib/default-page"

const meta: Meta = {
  title: "Editor/EditorShell",
  parameters: { layout: "fullscreen" },
}
export default meta

/**
 * Full editor shell with mock props.
 * NOTE: May fail if server action imports (publishAction, loadPageAction, saveDraftAction)
 * are not stubbed by Storybook — those use "use server" and cannot run in the browser.
 */
export const Default: StoryObj = {
  render: () => (
    <EditorShell
      tenantId="t_mock"
      storeSlug="my-store"
      craftJson={defaultPageJson()}
      themeOverrides={null}
      seoInitial={{ title: "Home", description: "Welcome", ogImage: "" }}
      pageId="p_mock"
    />
  ),
}

import type { Meta, StoryObj } from "@storybook/react"
import { Editor } from "@craftjs/core"
import { resolver } from "../resolver"
import { EditorActiveProvider } from "../hooks/use-node-safe"
import { EditorProvider } from "../editor-context"
import { ViewportZoomProvider } from "../hooks/use-viewport-zoom"
import { EditorPanelsProvider } from "../hooks/use-editor-panels"
import { PageManagerProvider } from "../hooks/use-page-manager"
import { TopBar } from "../components/top-bar"
import { useRef } from "react"

function TopBarWrapper() {
  const canvasRef = useRef<HTMLDivElement>(null)
  return (
    <PageManagerProvider tenantId="t_mock" initialPageId="p_mock" initialCraftJson={null}>
      <EditorPanelsProvider>
        <ViewportZoomProvider canvasRef={canvasRef}>
          <Editor resolver={resolver}>
            <EditorActiveProvider>
              <EditorProvider tenantId="t_mock" storeSlug="my-store" pageId="p_mock" seoInitial={{ title: "", description: "", ogImage: "" }}>
                <div ref={canvasRef}>
                  <TopBar />
                </div>
              </EditorProvider>
            </EditorActiveProvider>
          </Editor>
        </ViewportZoomProvider>
      </EditorPanelsProvider>
    </PageManagerProvider>
  )
}

const meta: Meta = { title: "Editor/TopBar" }
export default meta

export const Default: StoryObj = {
  render: () => <TopBarWrapper />,
}

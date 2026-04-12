import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { enableMapSet } from "immer"
import { temporal } from "zundo"

enableMapSet()
import { createInstancesSlice, type InstancesSlice } from "./instances"
import { createPropsSlice, type PropsSlice } from "./props"
import { createStylesSlice, type StylesSlice } from "./styles"
import { createBreakpointsSlice, type BreakpointsSlice } from "./breakpoints"
import { createPagesSlice, type PagesSlice } from "./pages"
import { createAssetsSlice, type AssetsSlice } from "./assets"
import { createEditorSlice, type EditorSlice } from "./editor"

export type EditorV3Store = InstancesSlice & PropsSlice & StylesSlice & BreakpointsSlice & PagesSlice & AssetsSlice & EditorSlice

export const useEditorV3Store = create<EditorV3Store>()(
  temporal(
    immer((set, get, api) => ({
      ...createInstancesSlice(set as never, get as never, api as never),
      ...createPropsSlice(set as never, get as never, api as never),
      ...createStylesSlice(set as never, get as never, api as never),
      ...createBreakpointsSlice(set as never, get as never, api as never),
      ...createPagesSlice(set as never, get as never, api as never),
      ...createAssetsSlice(set as never, get as never, api as never),
      ...createEditorSlice(set as never, get as never, api as never),
    })),
    {
      partialize: (state) => {
        const { selectedInstanceId, hoveredInstanceId, currentBreakpointId, currentPageId, ...data } = state
        return data
      },
    }
  )
)

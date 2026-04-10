import { Render } from "@puckeditor/core/rsc"
import type { Data } from "@puckeditor/core"
import { puckConfig } from "./puck-config"

export function PuckRender({ data }: { data: Data }) {
  return <Render config={puckConfig} data={data} />
}

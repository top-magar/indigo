"use client";

import { Render } from "@measured/puck";
import type { Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck/config";

interface PuckRenderProps {
    data: Data;
}

/**
 * Renders Puck page data on the storefront
 * Use this component to display pages created with the Puck editor
 */
export function PuckRender({ data }: PuckRenderProps) {
    return <Render config={puckConfig} data={data} />;
}

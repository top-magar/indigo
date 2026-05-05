"use client";

import dynamic from "next/dynamic";

const InsetWebGL = dynamic(
  () => import("@/components/landing/torch/inset-webgl").then(m => ({ default: m.InsetWebGL })),
  { ssr: false }
);

export function WebGLWrapper() {
  return <InsetWebGL />;
}

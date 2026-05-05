"use client";

import dynamic from "next/dynamic";

const ParticleField = dynamic(
  () => import("@/components/landing/torch/particle-field").then(m => ({ default: m.ParticleField })),
  { ssr: false }
);

export function ParticleFieldWrapper() {
  return <ParticleField />;
}

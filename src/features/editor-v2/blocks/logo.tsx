interface LogoProps {
  src: string; alt: string; height: number
}

export function Logo({ src, alt, height = 32 }: LogoProps) {
  if (!src) return <span style={{ fontFamily: "var(--store-font-heading)", fontWeight: 700, fontSize: height * 0.6, color: "var(--store-color-text)" }}>{alt || "Store"}</span>
  return <img src={src} alt={alt || ""} style={{ height, width: "auto" }} />
}

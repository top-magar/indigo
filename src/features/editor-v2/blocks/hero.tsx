import NextImage from "next/image"
import { InlineEditable } from "../components/inline-editable"

interface HeroProps {
  heading: string; subheading: string; buttonText: string; buttonUrl: string
  backgroundImage: string; variant: "full" | "split"; _sectionId?: string
}

export function Hero({ heading, subheading, buttonText, buttonUrl, backgroundImage, variant, _sectionId }: HeroProps) {
  const H1 = _sectionId
    ? (p: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) => <InlineEditable sectionId={_sectionId} propKey="heading" value={heading} tag="h1" className={p.className} />
    : (p: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) => <h1 className={p.className} style={p.style}>{p.children}</h1>

  const Sub = _sectionId
    ? (p: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) => <InlineEditable sectionId={_sectionId} propKey="subheading" value={subheading} tag="p" className={p.className} />
    : (p: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) => <p className={p.className} style={p.style}>{p.children}</p>

  if (variant === "split") {
    return (
      <div className="grid min-h-[400px] grid-cols-1 sm:grid-cols-2 py-12 sm:py-16">
        <div className="flex flex-col justify-center p-6 sm:p-12">
          <H1 className="text-3xl sm:text-4xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{heading}</H1>
          {subheading && <Sub className="mt-4 text-sm sm:text-base md:text-lg" style={{ color: "var(--store-color-muted)" }}>{subheading}</Sub>}
          {buttonText && <a href={buttonUrl} className="mt-6 inline-block px-6 py-3 text-white" style={{ backgroundColor: "var(--store-color-primary)", borderRadius: "var(--store-btn-radius)" }}>{buttonText}</a>}
        </div>
        {backgroundImage && <div className="relative min-h-[300px]"><NextImage src={backgroundImage} alt="" fill sizes="50vw" loading="lazy" unoptimized className="object-cover" /></div>}
      </div>
    )
  }
  return (
    <div className="relative flex min-h-[400px] items-center justify-center py-12 sm:py-16 md:py-20 text-center" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
      {backgroundImage && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 max-w-2xl px-4 sm:px-6">
        <H1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: backgroundImage ? "white" : "var(--store-color-text)" }}>{heading}</H1>
        {subheading && <Sub className="mt-4 text-sm sm:text-base md:text-lg" style={{ color: backgroundImage ? "rgba(255,255,255,0.8)" : "var(--store-color-muted)" }}>{subheading}</Sub>}
        {buttonText && <a href={buttonUrl} className="mt-6 inline-block px-6 py-3 font-semibold" style={{ backgroundColor: backgroundImage ? "white" : "var(--store-color-primary)", color: backgroundImage ? "black" : "white", borderRadius: "var(--store-btn-radius)" }}>{buttonText}</a>}
      </div>
    </div>
  )
}

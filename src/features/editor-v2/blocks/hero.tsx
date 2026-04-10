import { InlineEditable } from "../components/inline-editable"

interface HeroProps {
  heading: string; subheading: string; buttonText: string; buttonUrl: string
  backgroundImage: string; variant: "full" | "split"; _sectionId?: string
}

export function Hero({ heading, subheading, buttonText, buttonUrl, backgroundImage, variant, _sectionId }: HeroProps) {
  const H1 = _sectionId
    ? (p: { className?: string; children?: React.ReactNode }) => <InlineEditable sectionId={_sectionId} propKey="heading" value={heading} tag="h1" className={p.className} />
    : (p: { className?: string; children?: React.ReactNode }) => <h1 className={p.className}>{p.children}</h1>

  const Sub = _sectionId
    ? (p: { className?: string; children?: React.ReactNode }) => <InlineEditable sectionId={_sectionId} propKey="subheading" value={subheading} tag="p" className={p.className} />
    : (p: { className?: string; children?: React.ReactNode }) => <p className={p.className}>{p.children}</p>

  if (variant === "split") {
    return (
      <div className="grid min-h-[400px] grid-cols-2">
        <div className="flex flex-col justify-center p-12">
          <H1 className="text-4xl font-bold text-gray-900">{heading}</H1>
          {subheading && <Sub className="mt-4 text-lg text-gray-600">{subheading}</Sub>}
          {buttonText && <a href={buttonUrl} className="mt-6 inline-block rounded bg-black px-6 py-3 text-white">{buttonText}</a>}
        </div>
        {backgroundImage && <img src={backgroundImage} alt="" className="h-full w-full object-cover" />}
      </div>
    )
  }
  return (
    <div className="relative flex min-h-[400px] items-center justify-center text-center" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
      {backgroundImage && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 max-w-2xl px-6">
        <H1 className={`text-5xl font-bold ${backgroundImage ? "text-white" : "text-gray-900"}`}>{heading}</H1>
        {subheading && <Sub className={`mt-4 text-lg ${backgroundImage ? "text-white/80" : "text-gray-600"}`}>{subheading}</Sub>}
        {buttonText && <a href={buttonUrl} className={`mt-6 inline-block rounded px-6 py-3 font-semibold ${backgroundImage ? "bg-white text-black" : "text-white"}`} style={{ backgroundColor: backgroundImage ? undefined : "var(--store-color-primary, #000)" }}>{buttonText}</a>}
      </div>
    </div>
  )
}

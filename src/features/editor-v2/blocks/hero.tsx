interface HeroProps {
  heading: string; subheading: string; buttonText: string; buttonUrl: string
  backgroundImage: string; variant: "full" | "split"
}

export function Hero({ heading, subheading, buttonText, buttonUrl, backgroundImage, variant }: HeroProps) {
  if (variant === "split") {
    return (
      <div className="grid min-h-[400px] grid-cols-2">
        <div className="flex flex-col justify-center p-12">
          <h1 className="text-4xl font-bold">{heading}</h1>
          {subheading && <p className="mt-4 text-lg text-gray-600">{subheading}</p>}
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
        <h1 className={`text-5xl font-bold ${backgroundImage ? "text-white" : ""}`}>{heading}</h1>
        {subheading && <p className={`mt-4 text-lg ${backgroundImage ? "text-white/80" : "text-gray-600"}`}>{subheading}</p>}
        {buttonText && <a href={buttonUrl} className="mt-6 inline-block rounded bg-white px-6 py-3 font-semibold text-black">{buttonText}</a>}
      </div>
    </div>
  )
}

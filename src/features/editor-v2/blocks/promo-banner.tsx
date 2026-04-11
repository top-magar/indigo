interface PromoBannerProps {
  text: string; buttonText: string; buttonUrl: string
  backgroundColor: string; textColor: string; dismissible: boolean
}

export function PromoBanner({ text, buttonText, buttonUrl, backgroundColor, textColor, dismissible }: PromoBannerProps) {
  return (
    <div className="relative flex items-center justify-center gap-4 px-6 py-8 text-center" style={{ backgroundColor, color: textColor }}>
      <p className="text-lg font-semibold">{text}</p>
      {buttonText && <a href={buttonUrl} className="border-2 border-current px-5 py-2 font-medium transition-opacity hover:opacity-80" style={{ borderRadius: "var(--store-btn-radius)" }}>{buttonText}</a>}
      {dismissible && <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100" aria-label="Dismiss">✕</button>}
    </div>
  )
}

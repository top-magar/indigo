interface AnnouncementBarProps {
  text: string; backgroundColor: string; textColor: string
  link: string; linkText: string; closeable: boolean
}

export function AnnouncementBar({ text, backgroundColor, textColor, link, linkText, closeable }: AnnouncementBarProps) {
  return (
    <div className="relative flex items-center justify-center gap-2 px-4 py-2 text-center text-sm" style={{ backgroundColor, color: textColor }}>
      <span>{text}</span>
      {linkText && <a href={link} className="font-semibold underline">{linkText}</a>}
      {closeable && <button className="absolute right-2 opacity-60 hover:opacity-100" aria-label="Close">✕</button>}
    </div>
  )
}

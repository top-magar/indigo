interface AnnouncementBarProps {
  text: string; backgroundColor: string; textColor: string
  link: string; linkText: string; closeable: boolean
}

export function AnnouncementBar({ text, backgroundColor, textColor, link, linkText }: AnnouncementBarProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-center text-sm" style={{ backgroundColor, color: textColor }}>
      <span>{text}</span>
      {linkText && <a href={link} className="font-semibold underline">{linkText}</a>}
    </div>
  )
}

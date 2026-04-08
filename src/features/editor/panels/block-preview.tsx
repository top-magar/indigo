"use client"

import { Play, ImageIcon, MapPin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const bar = "h-1 rounded-full bg-muted"
const box = "rounded bg-muted"

export function BlockPreview({ name }: { name: string }) {
  switch (name) {
    case "Hero": case "Hero + CTA": case "Hero — Split": case "Hero — Dark":
      return <div className="flex w-full flex-col items-center gap-1 p-2"><div className={`${bar} w-12`} /><div className={`${bar} w-8`} /><div className="mt-0.5 h-2 w-8 rounded bg-blue-200" /></div>
    case "Header":
      return <div className="flex w-full items-center gap-2 px-2"><div className="h-2 w-2 rounded bg-blue-200" /><div className={`${bar} w-6`} /><div className="ml-auto flex gap-1"><div className={`${bar} w-3`} /><div className={`${bar} w-3`} /></div></div>
    case "Footer":
      return <div className="flex w-full gap-3 px-2"><div className="flex flex-col gap-0.5"><div className={`${bar} w-6`} /><div className={`${bar} w-4`} /></div><div className="flex flex-col gap-0.5"><div className={`${bar} w-5`} /><div className={`${bar} w-4`} /></div></div>
    case "Product Grid": case "Product Showcase": case "Collection List":
      return <div className="grid w-full grid-cols-3 gap-1 px-2"><div className={`${box} h-6`} /><div className={`${box} h-6`} /><div className={`${box} h-6`} /></div>
    case "Featured Product":
      return <div className="flex w-full gap-2 px-2"><div className={`${box} h-8 w-8`} /><div className="flex flex-col gap-0.5"><div className={`${bar} w-8`} /><div className={`${bar} w-5`} /><div className="mt-0.5 h-1.5 w-6 rounded bg-blue-200" /></div></div>
    case "Columns":
      return <div className="grid w-full grid-cols-2 gap-1 px-2"><div className={`${box} h-8`} /><div className={`${box} h-8`} /></div>
    case "Container":
      return <div className="mx-2 flex h-8 w-full items-center justify-center rounded border border-dashed border-border"><span className="text-[8px] text-muted-foreground">{"{ }"}</span></div>
    case "Testimonials": case "Social Proof": case "Testimonials — Cards":
      return <div className="flex w-full gap-1 px-2">{[0,1,2].map(i => <div key={i} className="flex flex-1 flex-col items-center gap-0.5"><div className="h-2 w-2 rounded-full bg-muted" /><div className={`${bar} w-full`} /></div>)}</div>
    case "Trust Signals":
      return <div className="flex w-full justify-center gap-2 px-2">{[0,1,2,3].map(i => <div key={i} className="h-3 w-3 rounded bg-muted" />)}</div>
    case "Newsletter": case "Newsletter CTA": case "Newsletter — Card":
      return <div className="flex w-full flex-col items-center gap-1 p-2"><div className={`${bar} w-10`} /><div className="flex gap-1"><div className="h-2 w-12 rounded bg-muted ring-1 ring-gray-200" /><div className="h-2 w-4 rounded bg-blue-200" /></div></div>
    case "FAQ": case "FAQ Section":
      return <div className="flex w-full flex-col gap-0.5 px-2">{[0,1,2].map(i => <div key={i} className="flex items-center gap-1"><div className="h-0.5 w-0.5 rounded-full bg-muted" /><div className={`${bar} flex-1`} /></div>)}</div>
    case "Video": case "Video Feature":
      return <div className="flex h-8 w-full items-center justify-center rounded bg-muted mx-2"><Play className="h-3 w-3 text-muted-foreground" /></div>
    case "Gallery": case "Collage":
      return <div className="grid w-full grid-cols-3 gap-0.5 px-2"><div className={`${box} col-span-2 row-span-2 h-8`} /><div className={`${box} h-[15px]`} /><div className={`${box} h-[15px]`} /></div>
    case "Promo Banner":
      return <div className="flex w-full items-center justify-between rounded bg-blue-50 px-2 py-1"><div className={`${bar} w-10`} /><div className="h-1.5 w-4 rounded bg-blue-200" /></div>
    case "Text":
      return <div className="flex w-full flex-col gap-0.5 px-2"><div className={`${bar} w-12`} /><div className={`${bar} w-full`} /><div className={`${bar} w-10`} /></div>
    case "Rich Text":
      return <div className="flex w-full flex-col gap-0.5 px-2"><div className={`${bar} w-8`} /><div className={`${bar} w-full`} /><div className={`${bar} w-full`} /><div className={`${bar} w-6`} /></div>
    case "Image": case "Image with Text": case "Slideshow":
      return <div className="flex h-8 w-full items-center justify-center rounded bg-muted mx-2"><ImageIcon className="h-3 w-3 text-muted-foreground" /></div>
    case "Button":
      return <div className="flex w-full justify-center p-2"><div className="h-3 w-14 rounded bg-blue-200" /></div>
    case "Contact Info":
      return <div className="flex w-full flex-col gap-0.5 px-2"><div className="flex items-center gap-1"><MapPin className="h-2 w-2 text-muted-foreground" /><div className={`${bar} w-10`} /></div><div className="flex items-center gap-1"><Mail className="h-2 w-2 text-muted-foreground" /><div className={`${bar} w-12`} /></div></div>
    case "Divider":
      return <div className="flex w-full items-center px-3 py-2"><div className="h-px w-full bg-muted" /></div>
    default:
      return <div className="flex h-8 w-full items-center justify-center"><span className="text-[9px] text-muted-foreground">Preview</span></div>
  }
}

export function CategoryTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <Button variant={active ? "default" : "ghost"} className="h-7 text-xs px-2.5 shrink-0" onClick={onClick}>
      {label}
    </Button>
  )
}

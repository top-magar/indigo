"use client"

import { useState, useCallback, useEffect } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { useNodeOptional as useNode } from "../use-node-safe"
import { craftRef } from "../craft-ref"
import { ImagePickerField } from "../components/image-picker-field"
import { Section, TextField, TextAreaField, ColorField, SliderField, SelectField, ToggleField } from "../components/editor-fields"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  image: string
  heading: string
  subheading: string
  ctaText: string
  ctaHref: string
}

interface SlideshowProps {
  _v: number
  slides: string // JSON stringified Slide[]
  minHeight: number
  autoplay: boolean
  autoplayInterval: number
  overlayOpacity: number
  textColor: string
  showArrows: boolean
  showDots: boolean
}

const defaultSlides: Slide[] = [
  { image: "", heading: "Slide 1", subheading: "Add your message here", ctaText: "Shop Now", ctaHref: "/products" },
  { image: "", heading: "Slide 2", subheading: "Another great offer", ctaText: "Learn More", ctaHref: "#" },
]

const parseSlides = (raw: string): Slide[] => {
  try { return JSON.parse(raw) } catch { return defaultSlides }
}

export const SlideshowBlock = (props: SlideshowProps) => {
  const { connectors: { connect, drag } } = useNode()
  const { slides: slidesJson, minHeight, autoplay, autoplayInterval, overlayOpacity, textColor, showArrows, showDots } = props
  const slides = parseSlides(slidesJson)

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    return () => { emblaApi.off("select", onSelect) }
  }, [emblaApi])

  // Autoplay
  useEffect(() => {
    if (!emblaApi || !autoplay) return
    const interval = setInterval(() => emblaApi.scrollNext(), autoplayInterval * 1000)
    return () => clearInterval(interval)
  }, [emblaApi, autoplay, autoplayInterval])

  return (
    <div ref={craftRef(connect, drag)} style={{ position: "relative", minHeight }}>
      <div ref={emblaRef} style={{ overflow: "hidden", height: "100%" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {slides.map((slide, i) => (
            <div key={i} style={{ flex: "0 0 100%", minWidth: 0, position: "relative", minHeight }}>
              {/* Background */}
              <div style={{ position: "absolute", inset: 0, backgroundColor: "#1f2937" }}>
                {slide.image && <img src={slide.image} alt={slide.heading} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }} />
              </div>
              {/* Content */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 48, minHeight, color: textColor }}>
                <h2 style={{ fontSize: 42, fontWeight: 700, margin: 0, lineHeight: 1.1, fontFamily: "var(--store-font-heading)" }}>{slide.heading}</h2>
                <p style={{ fontSize: 18, marginTop: 16, opacity: 0.85, maxWidth: 600 }}>{slide.subheading}</p>
                {slide.ctaText && (
                  <button style={{ marginTop: 24, padding: "12px 32px", fontSize: 14, fontWeight: 600, borderRadius: "var(--store-radius, 8px)", backgroundColor: textColor, color: "#000", border: "none", cursor: "pointer" }}>
                    {slide.ctaText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {showArrows && (
        <>
          <button onClick={scrollPrev} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: textColor, backdropFilter: "blur(4px)" }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={scrollNext} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: textColor, backdropFilter: "blur(4px)" }}>
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && (
        <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)} style={{ width: i === selectedIndex ? 24 : 8, height: 8, borderRadius: 4, border: "none", backgroundColor: i === selectedIndex ? textColor : `${textColor}50`, cursor: "pointer", transition: "width 0.2s" }} />
          ))}
        </div>
      )}
    </div>
  )
}

const SlideshowSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as SlideshowProps }))
  if (!props) return null
  const slides = parseSlides(props.slides)
  const [activeSlide, setActiveSlide] = useState(0)

  const updateSlide = (index: number, key: keyof Slide, value: string) => {
    const updated = [...slides]
    updated[index] = { ...updated[index], [key]: value }
    setProp((p: SlideshowProps) => { p.slides = JSON.stringify(updated) })
  }

  const addSlide = () => {
    const updated = [...slides, { image: "", heading: `Slide ${slides.length + 1}`, subheading: "Your message", ctaText: "", ctaHref: "" }]
    setProp((p: SlideshowProps) => { p.slides = JSON.stringify(updated) })
    setActiveSlide(updated.length - 1)
  }

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return
    const updated = slides.filter((_, i) => i !== index)
    setProp((p: SlideshowProps) => { p.slides = JSON.stringify(updated) })
    setActiveSlide(Math.min(activeSlide, updated.length - 1))
  }

  const set = <K extends keyof SlideshowProps>(k: K, v: SlideshowProps[K]) => setProp((p: SlideshowProps) => { (p as unknown as Record<string, unknown>)[k] = v })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
      <Section title={`Slides (${slides.length})`}>
        <div className="flex flex-wrap gap-1 mb-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setActiveSlide(i)} className={`rounded px-2 py-1 text-[10px] font-medium ${i === activeSlide ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={addSlide} className="rounded px-2 py-1 text-[10px] font-medium bg-muted text-muted-foreground hover:bg-accent">+</button>
        </div>
        {slides[activeSlide] && (
          <>
            <ImagePickerField label="Image" value={slides[activeSlide].image} onChange={(v) => updateSlide(activeSlide, "image", v)} />
            <TextField label="Heading" value={slides[activeSlide].heading} onChange={(v) => updateSlide(activeSlide, "heading", v)} />
            <TextAreaField label="Subheading" value={slides[activeSlide].subheading} onChange={(v) => updateSlide(activeSlide, "subheading", v)} />
            <TextField label="Button Text" value={slides[activeSlide].ctaText} onChange={(v) => updateSlide(activeSlide, "ctaText", v)} />
            <TextField label="Button Link" value={slides[activeSlide].ctaHref} onChange={(v) => updateSlide(activeSlide, "ctaHref", v)} />
            {slides.length > 1 && (
              <button onClick={() => removeSlide(activeSlide)} className="mt-1 w-full rounded bg-destructive/10 px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/20">
                Remove Slide
              </button>
            )}
          </>
        )}
      </Section>
      <Section title="Settings">
        <SliderField label="Min Height" value={props.minHeight} onChange={(v) => set("minHeight", v)} min={200} max={800} />
        <SliderField label="Overlay" value={props.overlayOpacity} onChange={(v) => set("overlayOpacity", v)} min={0} max={80} />
        <ToggleField label="Autoplay" checked={props.autoplay} onChange={(v) => set("autoplay", v)} />
        {props.autoplay && <SliderField label="Interval (s)" value={props.autoplayInterval} onChange={(v) => set("autoplayInterval", v)} min={2} max={10} />}
        <ToggleField label="Show Arrows" checked={props.showArrows} onChange={(v) => set("showArrows", v)} />
        <ToggleField label="Show Dots" checked={props.showDots} onChange={(v) => set("showDots", v)} />
      </Section>
      <Section title="Colors">
        <ColorField label="Text" value={props.textColor} onChange={(v) => set("textColor", v)} />
      </Section>
    </div>
  )
}

SlideshowBlock.craft = {
  displayName: "Slideshow",
  props: { _v: 1, slides: JSON.stringify(defaultSlides), minHeight: 500, autoplay: false, autoplayInterval: 5, overlayOpacity: 40, textColor: "#ffffff", showArrows: true, showDots: true } as SlideshowProps,
  rules: { canMoveIn: () => false },
  related: { settings: SlideshowSettings },
}

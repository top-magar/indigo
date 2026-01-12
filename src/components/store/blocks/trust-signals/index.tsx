import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
  Truck,
  RefreshCw,
  ShieldCheck,
  Headphones,
  CreditCard,
  Package,
  type LucideIcon,
} from "lucide-react"
import type { TrustSignalsBlock as TrustSignalsBlockType } from "@/types/blocks"

interface TrustSignalsBlockProps {
  block: TrustSignalsBlockType
}

const ICON_MAP: Record<string, LucideIcon> = {
  Truck01Icon: Truck,
  RefreshIcon: RefreshCw,
  SecurityCheckIcon: ShieldCheck,
  HeadphonesIcon: Headphones,
  CreditCardIcon: CreditCard,
  PackageIcon: Package,
}

export function TrustSignalsBlock({ block }: TrustSignalsBlockProps) {
  switch (block.variant) {
    case "icon-row":
      return <IconRow settings={block.settings} />
    case "feature-cards":
      return <FeatureCards settings={block.settings} />
    case "logo-cloud":
      return <LogoCloud settings={block.settings} />
    case "guarantee":
      return <GuaranteeBanner settings={block.settings} />
    case "stats":
      return <StatsDisplay settings={block.settings} />
    default:
      return <IconRow settings={block.settings} />
  }
}

function IconRow({ settings }: { settings: TrustSignalsBlockType["settings"] }) {
  const items = (settings.items || []).filter(item => item != null)
  
  return (
    <section
      className="border-y py-8"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || ShieldCheck
            return (
              <div key={index} className="flex flex-col items-center text-center">
                <Icon className="h-8 w-8 text-primary" />
                <h3 className="mt-3 font-medium">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeatureCards({ settings }: { settings: TrustSignalsBlockType["settings"] }) {
  const items = (settings.items || []).filter(item => item != null)
  
  return (
    <section
      className="py-16"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.icon] || ShieldCheck
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function LogoCloud({ settings }: { settings: TrustSignalsBlockType["settings"] }) {
  const logos = (settings.logos || []).filter(logo => logo != null)

  return (
    <section
      className="py-12"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Trusted by leading brands
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 grayscale opacity-70">
          {logos.map((logo, index) => (
            <Image
              key={index}
              src={logo}
              alt={`Partner ${index + 1}`}
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function GuaranteeBanner({ settings }: { settings: TrustSignalsBlockType["settings"] }) {
  return (
    <section className="py-12 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
          {settings.guaranteeText || "100% Satisfaction Guaranteed"}
        </h2>
        <p className="mt-4 text-primary-foreground/80">
          We stand behind every product we sell. If you&apos;re not completely satisfied,
          we&apos;ll make it right.
        </p>
      </div>
    </section>
  )
}

function StatsDisplay({ settings }: { settings: TrustSignalsBlockType["settings"] }) {
  const stats = (settings.stats || []).filter(stat => stat != null)

  return (
    <section
      className="py-16"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary sm:text-5xl">
                {stat.value}
              </div>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

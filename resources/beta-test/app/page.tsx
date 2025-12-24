import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, CheckCircle, ShoppingCart, LineChart, Shield, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">StoreCraft</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Launch your online store in minutes
          </h1>
          <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
            StoreCraft is the all-in-one e-commerce platform that helps SMBs and enterprises create beautiful online
            stores, manage products, process orders, and grow their business.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start free trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to sell online</h2>
            <p className="mt-4 text-lg text-muted-foreground">Powerful features designed for businesses of all sizes</p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Store,
                title: "Customizable Storefront",
                description: "Create a unique brand experience with customizable themes and layouts.",
              },
              {
                icon: ShoppingCart,
                title: "Order Management",
                description: "Track orders, manage inventory, and fulfill shipments with ease.",
              },
              {
                icon: LineChart,
                title: "Analytics & Insights",
                description: "Make data-driven decisions with comprehensive sales analytics.",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Accept payments securely with Stripe integration and PCI compliance.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border bg-background p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Start free, upgrade as you grow</p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$0",
                description: "Perfect for getting started",
                features: ["Up to 10 products", "Basic analytics", "Email support"],
              },
              {
                name: "Growth",
                price: "$29",
                description: "For growing businesses",
                features: ["Unlimited products", "Advanced analytics", "Priority support", "Custom domain"],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations",
                features: ["Everything in Growth", "Dedicated support", "Custom integrations", "SLA guarantee"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${plan.popular ? "border-primary ring-1 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="mt-4 text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link href="/auth/signup">Get started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Store className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">StoreCraft</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 StoreCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

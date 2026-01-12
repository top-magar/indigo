import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Target,
  Users,
  Award,
  HeartHandshake,
  Store,
  Calendar,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AboutPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .single()

  if (error || !tenant) {
    notFound()
  }

  const values = [
    {
      icon: HeartHandshake,
      title: "Quality First",
      description: "We never compromise on the quality of our products and services.",
    },
    {
      icon: Users,
      title: "Customer Focus",
      description: "Our customers are at the heart of everything we do.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in every aspect of our business.",
    },
  ]

  const milestones = [
    { year: "2020", event: "Founded with a vision to deliver quality products" },
    { year: "2021", event: "Expanded our product catalog to 100+ items" },
    { year: "2022", event: "Reached 10,000 happy customers" },
    { year: "2023", event: "Launched nationwide shipping" },
    { year: "2024", event: "Continuing to grow and serve our community" },
  ]

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About {tenant.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {tenant.description || "Discover our story and what drives us forward."}
          </p>
        </div>

        <Separator className="my-12" />

        {/* Mission Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Our Mission</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                At {tenant.name}, our mission is to provide exceptional products that enhance 
                the lives of our customers. We believe in creating meaningful connections 
                through quality, innovation, and outstanding service. Every product we offer 
                is carefully selected to meet the highest standards of excellence.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Our Values</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <value.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story/Timeline Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Our Journey</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {milestone.year.slice(-2)}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="mt-2 h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium">{milestone.year}</p>
                      <p className="text-sm text-muted-foreground">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Team Section (Placeholder) */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Our Team</h2>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Behind {tenant.name} is a dedicated team of professionals passionate about 
                delivering the best experience to our customers. We work together to ensure 
                every interaction exceeds expectations.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", slug)
    .single()

  if (!tenant) {
    return { title: "About" }
  }

  return {
    title: `About | ${tenant.name}`,
    description: `Learn more about ${tenant.name} - our mission, values, and story.`,
  }
}

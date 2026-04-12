"use client"

import * as React from "react"
import { Armchair, ArrowRight, Home, Lightbulb, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const DATA = [
  {
    caption: "Lighting",
    title:
      "Brighten your space with our stylish and energy-efficient lighting solutions.",
    icon: Lightbulb,
  },
  {
    caption: "Furniture",
    title:
      "Contemporary and classic furniture pieces for a stylish haven living.",
    icon: Home,
  },
  {
    caption: "Kitchen equipment",
    title:
      "Equip your kitchen with the latest appliances, including high-performance tools.",
    icon: Armchair,
  },
  {
    caption: "Outdoor",
    title: "The perfect backyard oasis for relaxation and entertainment",
    icon: Sun,
  },
]

export default function CategoriesWithFullBackground() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            Our Product Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
            Browse through our extensive selection and find exactly what
            you&apos;re looking for.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {DATA.map(({ caption, title, icon: Icon }, key) => (
            <Card
              key={key}
              className="group bg-primary grid grid-cols-1 overflow-hidden p-6 transition-all hover:shadow-lg lg:grid-cols-2 lg:gap-6"
            >
              <CardHeader className="m-0 flex flex-col justify-center p-0">
                <p className="text-primary-foreground/70 text-sm font-semibold tracking-wider uppercase">
                  {caption}
                </p>
                <h3 className="text-primary-foreground my-4 max-w-md text-xl font-bold [text-wrap:_balance]">
                  {title}
                </h3>
                <Button
                  variant="secondary"
                  className="group/btn w-fit"
                  size="lg"
                >
                  Explore All
                  <ArrowRight className="ml-2 h-4 w-4 stroke-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-0">
                <Icon className="text-primary-foreground h-56 w-full opacity-20 transition-opacity group-hover:opacity-30" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

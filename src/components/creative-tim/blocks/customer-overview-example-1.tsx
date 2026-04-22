"use client"

import { Star } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

const DATA = [
  {
    rate: 4,
    desc: "I've been using this for a while now, and it's become an essential part of my daily routine. It's incredibly user-friendly and has greatly improved my productivity.",
    title: "This tool has made my workflow seamless",
    name: "Ryan Samuel",
    date: "03 March 2024",
  },
  {
    rate: 5,
    desc: "This tool has been a game-changer for me. From managing my tasks to collaborating with my team, it's made everything so much easier. Highly recommended!",
    title: "It's made my job so much easier",
    name: "Emma Roberts",
    date: "14 February 2024",
  },
  {
    rate: 3,
    desc: "I've been using this for a while now, and it's become an essential part of my daily routine. It's incredibly user-friendly and has greatly improved my productivity.",
    title: "It's my go-to solution for staying organized.",
    name: "Bruce Mars",
    date: "10 February 2024",
  },
]

function Rating({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`h-5 w-5 ${
            index < value
              ? "fill-yellow-500 text-yellow-500"
              : "fill-gray-300 text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function CustomerOverviewExample1() {
  return (
    <section className="py-16">
      <div className="container mx-auto">
        <div className="mb-16 text-center">
          <p className="text-primary block text-sm font-semibold">Review</p>
          <h2 className="my-4 text-4xl font-bold">Our Customer's Opinion</h2>
          <p className="text-foreground mx-auto max-w-3xl text-lg [text-wrap:_balance]">
            From general feedback to detailed accounts, find out why our users
            love our product.
          </p>
        </div>
        <div className="space-y-4">
          {DATA.map(({ rate, title, desc, name, date }, key) => (
            <Card key={key} className="border-0">
              <CardContent className="pt-6">
                <Rating value={rate} />
                <p className="mt-1 font-semibold">{title}</p>
                <p className="text-foreground my-4">{desc}</p>
                <p className="mb-1 font-semibold">{name}</p>
                <p className="text-foreground">{date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

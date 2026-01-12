"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Search,
  Truck,
  Undo,
  CreditCard,
  Headphones,
  Package,
  ShieldCheck,
} from "lucide-react"

import type { LucideIcon } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  name: string
  icon: LucideIcon
  faqs: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    id: "shipping",
    name: "Shipping & Delivery",
    icon: Truck,
    faqs: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business day delivery. International orders may take 10-14 business days depending on the destination.",
      },
      {
        question: "Do you offer free shipping?",
        answer: "Yes! We offer free standard shipping on all orders over $50. Orders under $50 have a flat rate shipping fee of $5.99.",
      },
      {
        question: "Can I track my order?",
        answer: "Absolutely! Once your order ships, you'll receive an email with a tracking number. You can use this to track your package on our website or the carrier's site.",
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can see the exact cost at checkout.",
      },
    ],
  },
  {
    id: "returns",
    name: "Returns & Exchanges",
    icon: Undo,
    faqs: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all unused items in their original packaging. Simply contact our support team to initiate a return.",
      },
      {
        question: "How do I exchange an item?",
        answer: "To exchange an item, please return the original item and place a new order for the desired item. This ensures the fastest processing time.",
      },
      {
        question: "Who pays for return shipping?",
        answer: "For defective or incorrect items, we cover return shipping costs. For other returns, customers are responsible for return shipping fees.",
      },
    ],
  },
  {
    id: "payment",
    name: "Payment & Billing",
    icon: CreditCard,
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay.",
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.",
      },
      {
        question: "Can I use multiple payment methods?",
        answer: "Currently, we only support one payment method per order. However, you can use gift cards in combination with another payment method.",
      },
    ],
  },
  {
    id: "orders",
    name: "Orders & Products",
    icon: Package,
    faqs: [
      {
        question: "How do I check my order status?",
        answer: "You can check your order status by logging into your account and viewing your order history. You'll also receive email updates as your order progresses.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team and we'll do our best to accommodate your request.",
      },
      {
        question: "What if my item arrives damaged?",
        answer: "If your item arrives damaged, please contact us within 48 hours with photos of the damage. We'll arrange a replacement or refund at no additional cost.",
      },
    ],
  },
  {
    id: "support",
    name: "Customer Support",
    icon: Headphones,
    faqs: [
      {
        question: "How can I contact customer support?",
        answer: "You can reach our support team via email, phone, or live chat. Our team is available Monday-Friday, 9 AM - 6 PM EST.",
      },
      {
        question: "What is your response time?",
        answer: "We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please use our live chat for immediate assistance.",
      },
    ],
  },
  {
    id: "security",
    name: "Privacy & Security",
    icon: ShieldCheck,
    faqs: [
      {
        question: "How do you protect my personal information?",
        answer: "We take data protection seriously. Your information is encrypted and stored securely. We never sell or share your personal data with third parties for marketing purposes.",
      },
      {
        question: "Do you use cookies?",
        answer: "Yes, we use cookies to improve your shopping experience. You can manage your cookie preferences in your browser settings or through our cookie consent banner.",
      },
    ],
  },
]

export default function FAQPage() {
  const params = useParams()
  const slug = params.slug as string

  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim() && !activeCategory) {
      return faqCategories
    }

    const query = searchQuery.toLowerCase().trim()

    return faqCategories
      .filter((category) => {
        // Filter by active category if set
        if (activeCategory && category.id !== activeCategory) {
          return false
        }
        return true
      })
      .map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            !query ||
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.faqs.length > 0)
  }, [searchQuery, activeCategory])

  const totalResults = filteredCategories.reduce(
    (acc, cat) => acc + cat.faqs.length,
    0
  )

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about our products and services.
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-muted-foreground">
                Found {totalResults} result{totalResults !== 1 ? "s" : ""} for &quot;{searchQuery}&quot;
              </p>
            )}
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {faqCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
            >
              <category.icon className="mr-1.5 h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>

        {/* FAQ Categories */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${category.id}-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search
                className="mx-auto h-12 w-12 text-muted-foreground"
              />
              <h3 className="mt-4 text-lg font-semibold">No results found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory(null)
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact CTA */}
        <Card className="mt-8">
          <CardContent className="py-8 text-center">
            <Headphones
              className="mx-auto h-10 w-10 text-primary"
            />
            <h3 className="mt-4 text-lg font-semibold">Still have questions?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <Button className="mt-4" asChild>
              <a href={`/store/${slug}/contact`}>Contact Support</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

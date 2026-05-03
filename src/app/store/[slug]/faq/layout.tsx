import type { Metadata } from "next"
import { FAQJsonLd } from "@/shared/seo/json-ld"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about shipping, returns, payments, and more.",
}

const faqItems = [
  { question: "How long does shipping take?", answer: "Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business day delivery." },
  { question: "Do you offer free shipping?", answer: "Yes! We offer free standard shipping on all orders over a certain amount." },
  { question: "What is your return policy?", answer: "We offer a 30-day return policy for all unused items in their original packaging." },
  { question: "What payment methods do you accept?", answer: "We accept eSewa, Khalti, credit/debit cards, and cash on delivery." },
  { question: "How do I track my order?", answer: "Once your order ships, you'll receive an email with a tracking number." },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FAQJsonLd questions={faqItems} />
      {children}
    </>
  )
}

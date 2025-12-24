"use client";

import { useState } from "react";
import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { FAQSectionSettings } from "../settings/FAQSectionSettings";

export interface FAQItem {
    question: string;
    answer: string;
}

export interface FAQSectionProps {
    heading?: string;
    subheading?: string;
    items?: FAQItem[];
    layout?: "accordion" | "grid" | "two-column";
    backgroundColor?: string;
}

const DEFAULT_FAQS: FAQItem[] = [
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day hassle-free return policy. If you're not satisfied with your purchase, simply return it within 30 days for a full refund.",
    },
    {
        question: "How long does shipping take?",
        answer: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business day delivery. Free shipping on orders over $50.",
    },
    {
        question: "Do you ship internationally?",
        answer: "Yes! We ship to over 100 countries worldwide. International shipping times vary by location, typically 7-14 business days.",
    },
    {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive an email with a tracking number. You can also track your order in your account dashboard.",
    },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-border">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between py-4 text-left"
            >
                <span className="font-medium text-foreground">{item.question}</span>
                <svg
                    className={cn(
                        "size-5 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all",
                    isOpen ? "max-h-96 pb-4" : "max-h-0"
                )}
            >
                <p className="text-muted-foreground">{item.answer}</p>
            </div>
        </div>
    );
}

export function FAQSection({
    heading = "Frequently Asked Questions",
    subheading = "Everything you need to know about our products and services",
    items = DEFAULT_FAQS,
    layout = "accordion",
    backgroundColor = "#ffffff",
}: FAQSectionProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "py-16 lg:py-24",
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ backgroundColor }}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {(heading || subheading) && (
                    <div className="text-center mb-12 lg:mb-16">
                        {heading && (
                            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {heading}
                            </h2>
                        )}
                        {subheading && (
                            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                                {subheading}
                            </p>
                        )}
                    </div>
                )}

                {layout === "accordion" && (
                    <div className="max-w-3xl mx-auto">
                        {items.map((item, index) => (
                            <AccordionItem
                                key={index}
                                item={item}
                                isOpen={openIndex === index}
                                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        ))}
                    </div>
                )}

                {layout === "grid" && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {items.map((item, index) => (
                            <div key={index}>
                                <h3 className="font-semibold text-foreground mb-2">
                                    {item.question}
                                </h3>
                                <p className="text-muted-foreground">
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {layout === "two-column" && (
                    <div className="grid gap-12 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-foreground sticky top-8">
                                {heading}
                            </h2>
                            {subheading && (
                                <p className="mt-4 text-muted-foreground">
                                    {subheading}
                                </p>
                            )}
                        </div>
                        <div className="lg:col-span-3">
                            {items.map((item, index) => (
                                <AccordionItem
                                    key={index}
                                    item={item}
                                    isOpen={openIndex === index}
                                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

FAQSection.craft = {
    displayName: "FAQ",
    props: {
        heading: "Frequently Asked Questions",
        subheading: "Everything you need to know about our products and services",
        items: DEFAULT_FAQS,
        layout: "accordion",
        backgroundColor: "#ffffff",
    },
    related: {
        settings: FAQSectionSettings,
    },
};

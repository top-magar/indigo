"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { TestimonialCarouselSettings } from "../settings/TestimonialCarouselSettings";

export interface Testimonial {
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
    rating?: number;
}

export interface TestimonialCarouselProps {
    heading?: string;
    subheading?: string;
    testimonials?: Testimonial[];
    layout?: "cards" | "simple" | "featured";
    showRating?: boolean;
    backgroundColor?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        quote: "This store has completely transformed my shopping experience. The quality is unmatched!",
        author: "Sarah Johnson",
        role: "Verified Buyer",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
    },
    {
        quote: "Fast shipping, great customer service, and amazing products. Highly recommend!",
        author: "Michael Chen",
        role: "Loyal Customer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        rating: 5,
    },
    {
        quote: "I've been shopping here for years. The consistency in quality keeps me coming back.",
        author: "Emily Davis",
        role: "VIP Member",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 5,
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={cn(
                        "size-4",
                        star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export function TestimonialCarousel({
    heading = "What Our Customers Say",
    subheading = "Don't just take our word for it",
    testimonials = DEFAULT_TESTIMONIALS,
    layout = "cards",
    showRating = true,
    backgroundColor = "#ffffff",
}: TestimonialCarouselProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

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
                            <p className="mt-4 text-lg text-muted-foreground">
                                {subheading}
                            </p>
                        )}
                    </div>
                )}

                {layout === "cards" && (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border bg-card p-6 shadow-sm"
                            >
                                {showRating && testimonial.rating && (
                                    <StarRating rating={testimonial.rating} />
                                )}
                                <blockquote className="mt-4 text-foreground">
                                    &ldquo;{testimonial.quote}&rdquo;
                                </blockquote>
                                <div className="mt-6 flex items-center gap-3">
                                    {testimonial.avatar && (
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.author}
                                            className="size-10 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {testimonial.author}
                                        </p>
                                        {testimonial.role && (
                                            <p className="text-sm text-muted-foreground">
                                                {testimonial.role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {layout === "simple" && (
                    <div className="space-y-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center max-w-3xl mx-auto"
                            >
                                {showRating && testimonial.rating && (
                                    <StarRating rating={testimonial.rating} />
                                )}
                                <blockquote className="mt-4 text-xl text-foreground italic">
                                    &ldquo;{testimonial.quote}&rdquo;
                                </blockquote>
                                <div className="mt-6 flex items-center gap-3">
                                    {testimonial.avatar && (
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.author}
                                            className="size-12 rounded-full object-cover"
                                        />
                                    )}
                                    <div className="text-left">
                                        <p className="font-semibold text-foreground">
                                            {testimonial.author}
                                        </p>
                                        {testimonial.role && (
                                            <p className="text-sm text-muted-foreground">
                                                {testimonial.role}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {layout === "featured" && testimonials[0] && (
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                        <svg
                            className="size-12 text-primary/20 mb-6"
                            fill="currentColor"
                            viewBox="0 0 32 32"
                        >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                        </svg>
                        {showRating && testimonials[0].rating && (
                            <StarRating rating={testimonials[0].rating} />
                        )}
                        <blockquote className="mt-6 text-2xl lg:text-3xl font-medium text-foreground">
                            &ldquo;{testimonials[0].quote}&rdquo;
                        </blockquote>
                        <div className="mt-8 flex items-center gap-4">
                            {testimonials[0].avatar && (
                                <img
                                    src={testimonials[0].avatar}
                                    alt={testimonials[0].author}
                                    className="size-14 rounded-full object-cover"
                                />
                            )}
                            <div className="text-left">
                                <p className="text-lg font-semibold text-foreground">
                                    {testimonials[0].author}
                                </p>
                                {testimonials[0].role && (
                                    <p className="text-muted-foreground">
                                        {testimonials[0].role}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

TestimonialCarousel.craft = {
    displayName: "Testimonials",
    props: {
        heading: "What Our Customers Say",
        subheading: "Don't just take our word for it",
        testimonials: DEFAULT_TESTIMONIALS,
        layout: "cards",
        showRating: true,
        backgroundColor: "#ffffff",
    },
    related: {
        settings: TestimonialCarouselSettings,
    },
};

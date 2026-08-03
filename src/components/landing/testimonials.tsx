"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Indigo transformed our online presence. Sales doubled within three months.",
    author: "Priya Sharma",
    role: "Founder",
    company: "Himalayan Crafts",
    metric: "2x revenue growth",
  },
  {
    quote:
      "The page builder is incredible. Our store looks like it was designed by a premium agency.",
    author: "Rajesh Thapa",
    role: "CEO",
    company: "NepStyle",
    metric: "40% higher conversion",
  },
  {
    quote:
      "Finally, a platform that understands Nepali payments. eSewa and Khalti just work.",
    author: "Sita Gurung",
    role: "Owner",
    company: "Kathmandu Organics",
    metric: "98% payment success",
  },
  {
    quote:
      "Multi-store management saved us hundreds of hours. One dashboard, five brands.",
    author: "Amir Khan",
    role: "COO",
    company: "Metro Retail Group",
    metric: "5 stores, 1 team",
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-background overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-end mb-16">
          <span className="block font-payload-h6 text-muted-foreground">
            What merchants say
          </span>
          <span className="font-payload-body text-muted-foreground">
            0{currentIndex + 1}/0{testimonials.length}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 min-h-[400px]">
          <div className="lg:col-span-8 relative">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`transition-opacity duration-700 absolute inset-0 ${
                  i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className="w-4 h-4 fill-foreground text-foreground"
                    />
                  ))}
                </div>
                <blockquote className="font-payload-h2 text-foreground mb-10">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-payload-h3 text-muted-foreground">
                    {t.author[0]}
                  </div>
                  <div>
                    <div className="font-payload-body font-medium text-foreground">{t.author}</div>
                    <div className="font-payload-body text-muted-foreground">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end">
            <div className="border border-border p-8 rounded-xl bg-secondary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <ArrowRight className="w-5 h-5 text-muted-foreground -rotate-45" />
              </div>
              <span className="block font-payload-h6 text-muted-foreground mb-8">
                Key Result
              </span>
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 absolute bottom-8 left-8 ${
                    i === currentIndex
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  <p className="font-payload-h2">{t.metric}</p>
                </div>
              ))}
              <div className="h-10" />
            </div>

            <div className="flex gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    i === currentIndex
                      ? "w-12 bg-foreground"
                      : "w-4 bg-border"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

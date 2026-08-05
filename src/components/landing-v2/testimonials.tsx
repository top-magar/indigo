"use client";

import { sectionData } from "@/data/landing/section-data";
import { SectionHeading } from "./section-heading";
import { Marquee } from "./marquee";

export function TestimonialsSection() {
  const section = sectionData.testimonials;
  const firstRow = section.testimonials.filter((_, index) => index % 2 === 0);
  const secondRow = section.testimonials.filter((_, index) => index % 2 === 1);

  return (
    <section id="testimonials" className="lv2-section" aria-labelledby="testimonials-title">
      <div className="lv2-container">
        <SectionHeading
          index={section.index}
          total={section.total}
          label={section.label}
          eyebrow={section.eyebrow}
          headline={<>Stories from merchants<br />who switched to Indigo</>}
          body={section.body}
          id="testimonials-title"
        />
      </div>

      <div className="lv2-testimonials" style={{ marginTop: 8 }}>
        <Marquee label="Testimonial row 1" gap={20} duration={58} className="lv2-marquee--flush">
          {firstRow.map((item) => (
            <blockquote key={item.id} className="lv2-tmon">
              <p>“{item.quote}”</p>
              <footer className="lv2-tmon__who">
                <div className="lv2-tmon__avatar">{item.initials}</div>
                <div>
                  <strong>{item.author}</strong>
                  <span>{item.role} · {item.company}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </Marquee>
        <Marquee label="Testimonial row 2" reverse gap={20} duration={72} className="lv2-marquee--flush" style={{ marginTop: 16 }}>
          {secondRow.map((item) => (
            <blockquote key={item.id} className="lv2-tmon">
              <p>“{item.quote}”</p>
              <footer className="lv2-tmon__who">
                <div className="lv2-tmon__avatar">{item.initials}</div>
                <div>
                  <strong>{item.author}</strong>
                  <span>{item.role} · {item.company}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

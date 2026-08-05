"use client";

import { Marquee } from "./marquee";
import { heroLogos } from "@/data/landing/hero";

export function LogoMarquee() {
  return (
    <section className="lv2-marquee-section" aria-labelledby="trusted-heading">
      <div className="lv2-container">
        <h2 className="sr-only" id="trusted-heading">
          Trusted by merchants
        </h2>
        <p className="lv2-marquee__label">Trusted by growing storefronts across Nepal</p>
      </div>
      <Marquee label="Brand logos" gap={48} duration={38} className="lv2-marquee--flush">
        {heroLogos.map((logo) => (
          <span className="lv2-logo" key={logo.name}>
            <span className="lv2-logo__icon" aria-hidden>{logo.initials}</span>
            {logo.name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

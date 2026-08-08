"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { heroContent } from "@/data/landing/hero";
import { StorefrontPreview } from "./storefront-preview";
import { SectionHeading } from "./section-heading";
import { Frame } from "./frame";
import { EASE } from "./motion/reveal";

const stage = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function HeroSection() {
  return (
    <section className="lv2-hero lv2-grid-bg" aria-labelledby="hero-heading">
      <div className="lv2-hero__glow" aria-hidden />
      <div className="lv2-container" style={{ position: "relative" }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        >
          <motion.div variants={stage}>
            <a href={heroContent.badge.href} className="lv2-hero__badge">
              <span className="lv2-dot" aria-hidden />
              {heroContent.badge.label}
            </a>
            <SectionHeading
              index={1}
              total={8}
              label="Overview"
              numbered={false}
              as="h1"
              headline={
                <>
                  {heroContent.headline[0]}
                  <br />
                  {heroContent.headline[1]}
                </>
              }
              body={heroContent.body}
              align="left"
              id="hero-heading"
            />
          </motion.div>
          <motion.div variants={stage} className="lv2-hero__ctas">
            <Link href={heroContent.primary.href} className="lv2-btn lv2-btn--primary lv2-btn--lg">
              {heroContent.primary.label}
              <ArrowRight aria-hidden />
            </Link>
            <Link href={heroContent.secondary.href} className="lv2-btn lv2-btn--ghost lv2-btn--lg">
              {heroContent.secondary.label}
            </Link>
          </motion.div>
          <motion.p variants={stage} className="lv2-hero__note">
            {heroContent.note}
          </motion.p>
        </motion.div>
      </div>

      <motion.div
        className="lv2-container lv2-hero__visual"
        style={{ marginTop: 72 }}
        initial={{ opacity: 0, y: 48, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.45 }}
      >
        <Frame nodes>
          <StorefrontPreview />
        </Frame>
      </motion.div>
    </section>
  );
}

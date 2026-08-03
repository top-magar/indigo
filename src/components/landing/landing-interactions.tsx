"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight, Check, Menu, Minus, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { LandingAnalyticsEvent, LandingContent, LandingLink } from "./landing-content";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function emitLandingEvent(
  event: LandingAnalyticsEvent,
  properties?: Record<string, string>,
) {
  track(event, properties);
}

function attributedHref(href: string) {
  if (typeof window === "undefined" || !href.startsWith("/signup")) return href;

  const destination = new URL(href, window.location.origin);
  for (const key of ATTRIBUTION_KEYS) {
    const value = sessionStorage.getItem(`indigo_${key}`);
    if (value) destination.searchParams.set(key, value);
  }
  return `${destination.pathname}${destination.search}`;
}

export function LandingTelemetry() {
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    for (const key of ATTRIBUTION_KEYS) {
      const value = search.get(key);
      if (value) sessionStorage.setItem(`indigo_${key}`, value);
    }
    emitLandingEvent("landing_view");
  }, []);

  return null;
}

export function CampaignLink({
  link,
  className,
  children,
  event = "start_free_clicked",
}: {
  link: LandingLink;
  className?: string;
  children?: React.ReactNode;
  event?: LandingAnalyticsEvent;
}) {
  const [href, setHref] = useState(link.href);

  useEffect(() => {
    setHref(attributedHref(link.href));
  }, [link.href]);

  return (
    <Link
      href={href}
      className={className}
      onClick={() => emitLandingEvent(event, { destination: link.href })}
    >
      {children ?? link.label}
    </Link>
  );
}

export function LandingNavigation({
  navigation,
}: {
  navigation: LandingContent["navigation"];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <div className="indigo-announcement">
        <span>Indigo commerce preview</span>
        <Link href="#storefront">Explore the storefront system</Link>
      </div>
      <header className="indigo-nav">
        <div className="indigo-frame indigo-nav__inner">
          <Link className="indigo-wordmark" href="/" aria-label="Indigo home">
            <span className="indigo-wordmark__mark" aria-hidden="true">
              <span />
              <span />
            </span>
            Indigo
          </Link>

          <nav className="indigo-nav__links" aria-label="Primary navigation">
            {navigation.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="indigo-nav__actions">
            <Link className="indigo-text-link" href={navigation.login.href}>
              {navigation.login.label}
            </Link>
            <CampaignLink className="indigo-button indigo-button--small" link={navigation.primaryCta} />
            <button
              type="button"
              className="indigo-icon-button indigo-nav__toggle"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="indigo-mobile-navigation"
              aria-label={open ? "Close navigation" : "Open navigation"}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div
          id="indigo-mobile-navigation"
          className={`indigo-nav__mobile ${open ? "is-open" : ""}`}
        >
          <nav aria-label="Mobile navigation">
            {navigation.links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            ))}
            <Link href={navigation.login.href} onClick={() => setOpen(false)}>
              {navigation.login.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </nav>
          <CampaignLink className="indigo-button" link={navigation.primaryCta} />
        </div>
      </header>
    </>
  );
}

export function HeroDemo({
  variants,
}: {
  variants: LandingContent["hero"]["variants"];
}) {
  const [activeId, setActiveId] = useState(variants[0].id);
  const [started, setStarted] = useState(false);
  const active = variants.find((variant) => variant.id === activeId) ?? variants[0];

  const chooseVariant = (id: (typeof variants)[number]["id"]) => {
    if (!started) {
      emitLandingEvent("hero_demo_started");
      setStarted(true);
    }
    setActiveId(id);
    emitLandingEvent("storefront_variant_changed", { variant: id });
  };

  return (
    <div className={`indigo-editor-demo is-${activeId}`}>
      <div className="indigo-editor-demo__bar">
        <div className="indigo-window-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="indigo-editor-demo__address">indigo / storefront / home</div>
        <div className="indigo-live-status"><span /> Live preview</div>
      </div>

      <div className="indigo-editor-demo__workspace">
        <aside className="indigo-editor-demo__rail" aria-label="Storefront style variants">
          <div className="indigo-editor-demo__rail-label">Layout</div>
          <div role="tablist" aria-label="Storefront layout">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                role="tab"
                aria-selected={variant.id === activeId}
                onClick={() => chooseVariant(variant.id)}
              >
                <span className={`indigo-layout-icon indigo-layout-icon--${variant.id}`} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                {variant.label}
              </button>
            ))}
          </div>
          <div className="indigo-editor-demo__layers">
            <span>Page</span>
            <span>Header</span>
            <span className="is-selected">Product hero</span>
            <span>Collection</span>
          </div>
        </aside>

        <div className="indigo-editor-demo__canvas">
          <div className="indigo-store-preview">
            <header>
              <strong>LOOM / 01</strong>
              <nav><span>Objects</span><span>Journal</span><span>Bag (0)</span></nav>
            </header>
            <div className="indigo-store-preview__content">
              <div className="indigo-store-preview__copy">
                <span>HANDWOVEN SERIES / 2026</span>
                <h2>Objects made to travel.</h2>
                <p>{active.description}</p>
                <button type="button">View collection <ArrowRight aria-hidden="true" /></button>
              </div>
              <div className="indigo-store-preview__image">
                <Image
                  src="/landing/indigo-woven-catalog.webp"
                  alt="A woven tote and matching textile in an editorial product composition"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 768px) 88vw, 50vw"
                />
                <span className="indigo-selection-outline" aria-hidden="true"><i /><i /><i /><i /></span>
              </div>
              <div className="indigo-store-preview__product">
                <span>Woven carry / Ink</span>
                <strong>NPR 8,400</strong>
              </div>
            </div>
          </div>
        </div>

        <aside className="indigo-editor-demo__inspector">
          <div className="indigo-editor-demo__inspector-title">Product hero</div>
          <div className="indigo-control-row"><span>Display</span><strong>Grid</strong></div>
          <div className="indigo-control-row"><span>Columns</span><strong>{activeId === "catalog" ? "12" : activeId === "studio" ? "7 / 5" : "5 / 7"}</strong></div>
          <div className="indigo-control-row"><span>Gap</span><strong>{activeId === "catalog" ? "12" : "24"}</strong></div>
          <div className="indigo-control-row indigo-control-row--color"><span>Surface</span><i /></div>
          <div className="indigo-editor-demo__published"><Check aria-hidden="true" /> Changes saved</div>
        </aside>
      </div>
    </div>
  );
}

export function FaqList({ faq }: { faq: LandingContent["faq"] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="indigo-faq__list">
      {faq.map((item, index) => {
        const open = openIndex === index;
        const panelId = `faq-panel-${index}`;
        return (
          <div className="indigo-faq__item" key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              aria-expanded={open}
              aria-controls={panelId}
            >
              <span>{item.question}</span>
              {open ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}
            </button>
            <div id={panelId} className="indigo-faq__answer" hidden={!open}>
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

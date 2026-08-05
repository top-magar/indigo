"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  navigationItems,
  starCount,
  mobileMenu,
} from "@/data/landing/navigation";
import { MegaMenu } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "lv2-header",
        scrolled &&
          "bg-lv2-bg/90 border-lv2-border-strong/60 shadow-sm backdrop-blur-lg",
      )}
      style={{ borderColor: scrolled ? "var(--lv2-border-strong)" : undefined }}
    >
      <div className="lv2-container lv2-header__inner">
        <Link href="/" aria-label="Go to Indigo home" className="lv2-brand">
          <span className="lv2-brand__mark" aria-hidden>
            <Menu />
          </span>
          Indigo
        </Link>

        <nav className="lv2-nav" aria-label="Main">
          {navigationItems.map((item) => (
            <MegaMenu key={item.key} item={item} />
          ))}
          <Link href="#metrics" className="lv2-nav__link">
            Overview
          </Link>
        </nav>

        <div className="lv2-header__actions">
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="lv2-star-btn"
            aria-label={`Star the project on GitHub (${starCount})`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
            <span>{starCount}</span>
          </a>
          <Link href="/signup" className="lv2-btn lv2-btn--primary lv2-btn--sm">
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}

export function NavigationShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "contents" }}>
      <a href="#main-content" className="lv2-skip-link">
        Skip to content
      </a>
      <Header />
      <MobileMenu items={mobileMenu} />
      <main id="main-content">{children}</main>
    </div>
  );
}

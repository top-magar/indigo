"use client"

import Link from "next/link"
import Image from "next/image"
import type { FooterBlock as FooterBlockType } from "@/types/blocks"
import { EditableText } from "../editable-text"

interface FooterBlockProps {
  block: FooterBlockType
  storeName: string
}

export function FooterBlock({ block, storeName }: FooterBlockProps) {
  const blockId = block.id

  switch (block.variant) {
    case "multi-column":
      return <MultiColumnFooter blockId={blockId} settings={block.settings} storeName={storeName} />
    case "centered":
      return <CenteredFooter blockId={blockId} settings={block.settings} storeName={storeName} />
    case "rich":
      return <RichFooter blockId={blockId} settings={block.settings} storeName={storeName} />
    default:
      return <MultiColumnFooter blockId={blockId} settings={block.settings} storeName={storeName} />
  }
}

interface FooterProps {
  blockId: string
  settings: FooterBlockType["settings"]
  storeName: string
}

function SocialLinks({ links }: { links: { platform: string; url: string }[] }) {
  return (
    <div className="flex gap-4">
      {(links || []).filter(link => link?.url).map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="sr-only">{link.platform}</span>
          <div className="h-5 w-5">{link.platform[0]}</div>
        </a>
      ))}
    </div>
  )
}

function PaymentIcons() {
  return (
    <div className="flex gap-2">
      {["Visa", "MC", "Amex", "PayPal"].map((method) => (
        <div
          key={method}
          className="flex h-8 w-12 items-center justify-center rounded border bg-background text-xs font-medium"
        >
          {method}
        </div>
      ))}
    </div>
  )
}

function MultiColumnFooter({ blockId, settings, storeName }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            {settings.logo ? (
              <Image src={settings.logo} alt={storeName} width={120} height={40} className="h-8 w-auto" />
            ) : (
              <EditableText
                blockId={blockId}
                fieldPath="logoText"
                value={settings.logoText || storeName}
                placeholder="Logo text..."
                as="span"
                className="text-xl font-bold"
              />
            )}
            {(settings.socialLinks || []).length > 0 && (
              <div className="mt-6">
                <SocialLinks links={settings.socialLinks} />
              </div>
            )}
          </div>

          {/* Link Columns */}
          {(settings.columns || []).map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {(column.links || []).filter(link => link?.href).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <EditableText
            blockId={blockId}
            fieldPath="copyrightText"
            value={settings.copyrightText || `© ${currentYear} ${storeName}. All rights reserved.`}
            placeholder="Copyright text..."
            as="p"
            className="text-sm text-muted-foreground"
          />
          <div className="flex gap-4">
            {(settings.legalLinks || []).filter(link => link?.href).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function CenteredFooter({ blockId, settings, storeName }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex justify-center">
          {settings.logo ? (
            <Image src={settings.logo} alt={storeName} width={120} height={40} className="h-8 w-auto" />
          ) : (
            <EditableText
              blockId={blockId}
              fieldPath="logoText"
              value={settings.logoText || storeName}
              placeholder="Logo text..."
              as="span"
              className="text-xl font-bold"
            />
          )}
        </div>

        {/* Links */}
        <nav className="mt-8 flex flex-wrap justify-center gap-6">
          {(settings.columns || []).flatMap((col) => col.links || []).filter(link => link?.href).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social */}
        {(settings.socialLinks || []).length > 0 && (
          <div className="mt-8 flex justify-center">
            <SocialLinks links={settings.socialLinks} />
          </div>
        )}

        {/* Copyright */}
        <EditableText
          blockId={blockId}
          fieldPath="copyrightText"
          value={settings.copyrightText || `© ${currentYear} ${storeName}. All rights reserved.`}
          placeholder="Copyright text..."
          as="p"
          className="mt-8 text-sm text-muted-foreground"
        />
      </div>
    </footer>
  )
}

function RichFooter({ blockId, settings, storeName }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            {settings.logo ? (
              <Image src={settings.logo} alt={storeName} width={120} height={40} className="h-8 w-auto" />
            ) : (
              <EditableText
                blockId={blockId}
                fieldPath="logoText"
                value={settings.logoText || storeName}
                placeholder="Logo text..."
                as="span"
                className="text-xl font-bold"
              />
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Quality products delivered to your door.
            </p>
            {(settings.socialLinks || []).length > 0 && (
              <div className="mt-6">
                <SocialLinks links={settings.socialLinks} />
              </div>
            )}
          </div>

          {/* Links */}
          {(settings.columns || []).map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {(column.links || []).filter(link => link?.href).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-6 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <EditableText
              blockId={blockId}
              fieldPath="copyrightText"
              value={settings.copyrightText || `© ${currentYear} ${storeName}. All rights reserved.`}
              placeholder="Copyright text..."
              as="p"
              className="text-sm text-muted-foreground"
            />
            <div className="flex gap-4">
              {(settings.legalLinks || []).filter(link => link?.href).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          {settings.showPaymentIcons && (
            <div className="flex justify-center sm:justify-end">
              <PaymentIcons />
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

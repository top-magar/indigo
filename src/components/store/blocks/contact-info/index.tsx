"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";

interface ContactInfoProps {
  settings: {
    variant?: "card" | "inline" | "split";
    storeName?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
    mapEmbedUrl?: string;
    sectionTitle?: string;
  };
}

export default function ContactInfoBlock({ settings }: ContactInfoProps) {
  const {
    variant = "card",
    storeName,
    address,
    phone,
    email,
    hours,
    mapEmbedUrl,
    sectionTitle = "Visit Us",
  } = settings;

  const contactItems = [
    address && { icon: MapPin, label: "Address", value: address },
    phone && { icon: Phone, label: "Phone", value: phone, href: `tel:${phone}` },
    email && { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    hours && { icon: Clock, label: "Hours", value: hours },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[];

  if (variant === "inline") {
    return (
      <section className="py-8">
        <div className="mx-auto max-w-5xl px-4">
          {sectionTitle && (
            <h2 className="text-lg font-semibold text-foreground mb-4">{sectionTitle}</h2>
          )}
          <div className="flex flex-wrap gap-6">
            {contactItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                {item.href ? (
                  <a href={item.href} className="text-foreground hover:text-primary transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4">
          {sectionTitle && (
            <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">{sectionTitle}</h2>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {storeName && <h3 className="text-lg font-medium text-foreground">{storeName}</h3>}
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-foreground hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {mapEmbedUrl && (
              <div className="rounded-lg overflow-hidden border bg-muted aspect-video">
                <iframe
                  src={mapEmbedUrl}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map showing ${storeName || "store"} location`}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default: card variant
  return (
    <section className="py-12">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          {sectionTitle && (
            <h2 className="text-lg font-semibold text-card-foreground">{sectionTitle}</h2>
          )}
          {storeName && <p className="text-sm font-medium text-card-foreground">{storeName}</p>}
          <div className="space-y-3">
            {contactItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                {item.href ? (
                  <a href={item.href} className="text-sm text-card-foreground hover:text-primary transition-colors">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

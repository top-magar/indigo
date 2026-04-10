"use client";

import type { Config } from "@puckeditor/core";
import { useState, type ReactNode } from "react";

const defaultFaqItems = JSON.stringify([
  { question: "What is your return policy?", answer: "We offer a 30-day return policy on all items." },
  { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 business days within Nepal." },
  { question: "Do you offer international shipping?", answer: "Currently we only ship within Nepal." },
]);

const defaultTestimonialItems = JSON.stringify([
  { quote: "Amazing quality and fast shipping!", author: "Sarah M.", role: "Verified Buyer", rating: 5 },
  { quote: "Best purchase I've made this year.", author: "James K.", role: "Verified Buyer", rating: 5 },
  { quote: "Great customer service and beautiful products.", author: "Emily R.", role: "Verified Buyer", rating: 4 },
]);

type FaqItem = { question: string; answer: string };
type TestimonialItem = { quote: string; author: string; role: string; rating: number };

const parseFaq = (s: string): FaqItem[] => {
  try { return JSON.parse(s); } catch { return []; }
};
const parseTestimonials = (s: string): TestimonialItem[] => {
  try { return JSON.parse(s); } catch { return []; }
};

const stars = (n: number, color: string) => (
  <span style={{ display: "inline-flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} style={{ color: i <= n ? color : "#d1d5db", fontSize: 14 }}>★</span>
    ))}
  </span>
);

const FaqAccordion = ({ items, textColor, accentColor }: { items: FaqItem[]; textColor: string; accentColor: string }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ width: "100%", padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: textColor || "inherit", fontSize: 15, fontWeight: 600, textAlign: "left" }}>
            {item.question}<span style={{ color: accentColor, fontSize: 20 }}>{openIdx === i ? "−" : "+"}</span>
          </button>
          {openIdx === i && <p style={{ fontSize: 14, color: "#6b7280", padding: "0 0 16px", lineHeight: 1.6, margin: 0 }}>{item.answer}</p>}
        </div>
      ))}
    </>
  );
};

export const puckConfig: Config = {
  categories: {
    content: { title: "Content", components: ["Text", "RichText", "Image"] },
    layout: { title: "Layout", components: ["Hero", "Columns", "Divider"] },
    marketing: { title: "Marketing", components: ["Button", "FAQ", "Newsletter", "Testimonials"] },
  },
  root: {
    fields: {
      primaryColor: { type: "text", label: "Primary Color" },
      headingFont: { type: "text", label: "Heading Font" },
      bodyFont: { type: "text", label: "Body Font" },
    },
    defaultProps: { primaryColor: "#000000", headingFont: "Inter", bodyFont: "Inter" },
    render: ({ children, puck: _puck, ...rootProps }: { children: ReactNode; puck: unknown; primaryColor: string; headingFont: string; bodyFont: string }) => (
      <div style={{ "--store-primary": rootProps.primaryColor, "--store-font-heading": rootProps.headingFont, "--store-font-body": rootProps.bodyFont } as React.CSSProperties}>
        {children}
      </div>
    ),
  },
  components: {
    Hero: {
      fields: {
        variant: { type: "select", label: "Variant", options: [{ value: "full", label: "Full" }, { value: "split", label: "Split" }, { value: "minimal", label: "Minimal" }] },
        heading: { type: "text", label: "Heading" },
        subheading: { type: "textarea", label: "Subheading" },
        ctaText: { type: "text", label: "Button Text" },
        ctaHref: { type: "text", label: "Button Link" },
        ctaStyle: { type: "radio", label: "Button Style", options: [{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }] },
        ctaColor: { type: "text", label: "Button Text Color" },
        ctaBackground: { type: "text", label: "Button BG Color" },
        secondCtaText: { type: "text", label: "Secondary Button Text" },
        backgroundImage: { type: "text", label: "Background Image URL" },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        overlayOpacity: { type: "number", label: "Overlay Opacity", min: 0, max: 90 },
        minHeight: { type: "number", label: "Min Height", min: 200, max: 900 },
        contentPosition: { type: "radio", label: "Content Position", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
        headingSize: { type: "number", label: "Heading Size", min: 24, max: 80 },
        subheadingSize: { type: "number", label: "Subheading Size", min: 12, max: 32 },
        paddingTop: { type: "number", label: "Padding Top", min: 0, max: 120 },
        paddingBottom: { type: "number", label: "Padding Bottom", min: 0, max: 120 },
        contentMaxWidth: { type: "number", label: "Content Max Width", min: 400, max: 1000 },
        showBadge: { type: "radio", label: "Show Badge", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
        badgeText: { type: "text", label: "Badge Text" },
      },
      defaultProps: {
        variant: "full", heading: "Welcome to our store", subheading: "Discover amazing products crafted just for you",
        ctaText: "Shop Now", ctaHref: "/products", ctaStyle: "solid", ctaColor: "#ffffff", ctaBackground: "#000000",
        secondCtaText: "", backgroundImage: "", backgroundColor: "#1a1a2e", textColor: "#ffffff",
        overlayOpacity: 40, minHeight: 500, contentPosition: "center", headingSize: 48, subheadingSize: 20,
        paddingTop: 64, paddingBottom: 64, contentMaxWidth: 600, showBadge: "false", badgeText: "New",
      },
      render: ({ heading, subheading, ctaText, ctaStyle, ctaColor, ctaBackground, secondCtaText, backgroundImage, backgroundColor, textColor, overlayOpacity, minHeight, contentPosition, headingSize, subheadingSize, paddingTop, paddingBottom, contentMaxWidth, showBadge, badgeText, variant, puck: _puck }) => {
        const align = contentPosition === "left" ? "flex-start" : contentPosition === "right" ? "flex-end" : "center";
        const textAlign = contentPosition as React.CSSProperties["textAlign"];
        const radius = "8px";
        const btnStyle = (style: string): React.CSSProperties => style === "outline"
          ? { padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: "transparent", color: ctaBackground, border: `2px solid ${ctaBackground}`, borderRadius: radius, cursor: "pointer" }
          : { padding: "12px 32px", fontSize: 16, fontWeight: 600, backgroundColor: ctaBackground, color: ctaColor, border: "none", borderRadius: radius, cursor: "pointer" };
        const badge = showBadge === "true" && badgeText ? <span style={{ display: "inline-block", padding: "4px 14px", fontSize: 12, fontWeight: 600, borderRadius: 20, backgroundColor: "#3b82f6", color: "#fff", marginBottom: 16 }}>{badgeText}</span> : null;
        const primaryBtn = ctaText ? <button style={btnStyle(ctaStyle)}>{ctaText}</button> : null;
        const secondaryBtn = secondCtaText ? <button style={{ ...btnStyle("outline"), marginLeft: 12 }}>{secondCtaText}</button> : null;
        const buttons = (primaryBtn || secondaryBtn) ? <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>{primaryBtn}{secondaryBtn}</div> : null;

        if (variant === "minimal") {
          return (
            <div style={{ padding: `${paddingTop}px 48px ${paddingBottom}px`, textAlign, backgroundColor, color: textColor, minHeight, display: "flex", flexDirection: "column", alignItems: align, justifyContent: "center" }}>
              {badge}
              <h1 style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1, maxWidth: contentMaxWidth }}>{heading}</h1>
              <p style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.8, maxWidth: contentMaxWidth }}>{subheading}</p>
              {buttons}
            </div>
          );
        }
        if (variant === "split") {
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight, backgroundColor }}>
              <div style={{ padding: `${paddingTop}px 48px ${paddingBottom}px`, display: "flex", flexDirection: "column", justifyContent: "center", color: textColor }}>
                {badge}
                <h1 style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{heading}</h1>
                <p style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.8 }}>{subheading}</p>
                {buttons}
              </div>
              <div style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: "cover", backgroundColor: backgroundImage ? undefined : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
                {!backgroundImage && "Add image →"}
              </div>
            </div>
          );
        }
        return (
          <div style={{ position: "relative", minHeight, backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center", backgroundColor, display: "flex", alignItems: align, justifyContent: "center", textAlign }}>
            {backgroundImage && <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }} />}
            <div style={{ position: "relative", zIndex: 1, padding: `${paddingTop}px 48px ${paddingBottom}px`, color: textColor, maxWidth: contentMaxWidth + 96, display: "flex", flexDirection: "column", alignItems: align }}>
              {badge}
              <h1 style={{ fontSize: headingSize, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{heading}</h1>
              <p style={{ fontSize: subheadingSize, marginTop: 16, opacity: 0.9, maxWidth: contentMaxWidth }}>{subheading}</p>
              {buttons}
            </div>
          </div>
        );
      },
    },
    Text: {
      fields: {
        text: { type: "textarea", label: "Text" },
        tagName: { type: "select", label: "Tag", options: [{ value: "p", label: "Paragraph" }, { value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }, { value: "h4", label: "H4" }, { value: "span", label: "Span" }] },
        fontSize: { type: "number", label: "Font Size", min: 10, max: 96 },
        fontWeight: { type: "select", label: "Font Weight", options: [{ value: "400", label: "Regular" }, { value: "500", label: "Medium" }, { value: "600", label: "Semibold" }, { value: "700", label: "Bold" }, { value: "800", label: "Extra Bold" }] },
        color: { type: "text", label: "Color" },
        alignment: { type: "radio", label: "Alignment", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
        lineHeight: { type: "number", label: "Line Height", min: 1, max: 2.5 },
        letterSpacing: { type: "number", label: "Letter Spacing", min: -2, max: 8 },
        maxWidth: { type: "number", label: "Max Width", min: 0, max: 1000 },
        textTransform: { type: "select", label: "Transform", options: [{ value: "none", label: "None" }, { value: "uppercase", label: "Uppercase" }, { value: "capitalize", label: "Capitalize" }] },
        opacity: { type: "number", label: "Opacity", min: 10, max: 100 },
      },
      defaultProps: { text: "Edit this text", fontSize: 16, fontWeight: "400", color: "#000000", alignment: "left", tagName: "p", lineHeight: 1.6, letterSpacing: 0, maxWidth: 0, textTransform: "none", opacity: 100 },
      render: ({ text, fontSize, fontWeight, color, alignment, tagName, lineHeight, letterSpacing, maxWidth, textTransform, opacity, puck: _puck }) => {
        const Tag = tagName as keyof JSX.IntrinsicElements;
        return (
          <div style={{ textAlign: alignment as React.CSSProperties["textAlign"] }}>
            <Tag style={{ fontSize, fontWeight: Number(fontWeight), color, textAlign: alignment as React.CSSProperties["textAlign"], margin: 0, lineHeight, letterSpacing, maxWidth: maxWidth || undefined, textTransform: textTransform as React.CSSProperties["textTransform"], opacity: opacity / 100 }}>{text}</Tag>
          </div>
        );
      },
    },
    Image: {
      fields: {
        src: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
        caption: { type: "text", label: "Caption" },
        objectFit: { type: "radio", label: "Object Fit", options: [{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }] },
        borderRadius: { type: "number", label: "Corner Radius", min: 0, max: 32 },
        maxHeight: { type: "number", label: "Max Height", min: 0, max: 800 },
        width: { type: "radio", label: "Width", options: [{ value: "full", label: "Full" }, { value: "contained", label: "80%" }, { value: "auto", label: "Auto" }] },
        alignment: { type: "radio", label: "Alignment", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
        shadow: { type: "select", label: "Shadow", options: [{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
      },
      defaultProps: { src: "", alt: "", objectFit: "cover", borderRadius: 8, maxHeight: 400, width: "full", alignment: "center", shadow: "none", caption: "" },
      render: ({ src, alt, objectFit, borderRadius, maxHeight, width, alignment, shadow, caption, puck: _puck }) => {
        const widthMap: Record<string, string> = { full: "100%", contained: "80%", auto: "auto" };
        const shadowMap: Record<string, string> = { none: "none", sm: "0 1px 3px rgba(0,0,0,0.1)", md: "0 4px 12px rgba(0,0,0,0.1)", lg: "0 10px 25px rgba(0,0,0,0.15)" };
        return (
          <div style={{ textAlign: alignment as React.CSSProperties["textAlign"] }}>
            <div style={{ display: "inline-block", width: widthMap[width], maxWidth: "100%" }}>
              {src ? (
                <img src={src} alt={alt} style={{ width: "100%", maxHeight: maxHeight || undefined, objectFit: objectFit as React.CSSProperties["objectFit"], borderRadius, boxShadow: shadowMap[shadow] }} />
              ) : (
                <div style={{ height: 200, backgroundColor: "#f3f4f6", borderRadius, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>Add image</div>
              )}
              {caption && <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, textAlign: "center" }}>{caption}</p>}
            </div>
          </div>
        );
      },
    },
    Button: {
      fields: {
        text: { type: "text", label: "Text" },
        href: { type: "text", label: "Link" },
        variant: { type: "select", label: "Variant", options: [{ value: "solid", label: "Solid" }, { value: "outline", label: "Outline" }, { value: "ghost", label: "Ghost" }, { value: "link", label: "Link" }] },
        size: { type: "select", label: "Size", options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }, { value: "xl", label: "Extra Large" }] },
        fullWidth: { type: "radio", label: "Full Width", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
        alignment: { type: "radio", label: "Alignment", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        borderRadius: { type: "number", label: "Corner Radius", min: 0, max: 32 },
        shadow: { type: "select", label: "Shadow", options: [{ value: "none", label: "None" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }] },
      },
      defaultProps: { text: "Click me", href: "#", variant: "solid", size: "md", fullWidth: "false", alignment: "left", backgroundColor: "", textColor: "", borderRadius: 8, shadow: "none" },
      render: ({ text, variant, size, fullWidth, alignment, backgroundColor, textColor, borderRadius, shadow, puck: _puck }) => {
        const sizes: Record<string, { h: number; px: number; fs: number }> = { sm: { h: 32, px: 12, fs: 13 }, md: { h: 40, px: 16, fs: 14 }, lg: { h: 48, px: 24, fs: 16 }, xl: { h: 56, px: 32, fs: 18 } };
        const shadows: Record<string, string> = { none: "none", sm: "0 1px 2px rgba(0,0,0,0.05)", md: "0 4px 6px rgba(0,0,0,0.07)", lg: "0 10px 15px rgba(0,0,0,0.1)" };
        const s = sizes[size];
        const bg = backgroundColor || "#000";
        const fg = textColor || "#fff";
        const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600, borderRadius, boxShadow: shadows[shadow], cursor: "pointer", width: fullWidth === "true" ? "100%" : undefined };
        const style: React.CSSProperties = variant === "solid" ? { ...base, backgroundColor: bg, color: fg, border: "none" } : variant === "outline" ? { ...base, backgroundColor: "transparent", color: bg, border: `2px solid ${bg}` } : variant === "ghost" ? { ...base, backgroundColor: "transparent", color: bg, border: "none" } : { ...base, backgroundColor: "transparent", color: bg, border: "none", textDecoration: "underline", height: "auto", padding: 0 };
        return <div style={{ textAlign: alignment as React.CSSProperties["textAlign"] }}><button style={style}>{text}</button></div>;
      },
    },
    Columns: {
      fields: {
        columns: { type: "select", label: "Columns", options: [{ value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }] },
        gap: { type: "number", label: "Gap", min: 0, max: 48 },
        verticalAlign: { type: "radio", label: "Vertical Align", options: [{ value: "top", label: "Top" }, { value: "center", label: "Center" }, { value: "bottom", label: "Bottom" }] },
      },
      defaultProps: { columns: "2", gap: 16, verticalAlign: "top" },
      render: ({ columns, gap, verticalAlign, puck: _puck }) => {
        const vMap: Record<string, string> = { top: "flex-start", center: "center", bottom: "flex-end" };
        return <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap, alignItems: vMap[verticalAlign], minHeight: 60 }} />;
      },
    },
    RichText: {
      fields: {
        content: { type: "textarea", label: "HTML Content" },
        maxWidth: { type: "number", label: "Max Width", min: 400, max: 1200 },
        alignment: { type: "radio", label: "Alignment", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        fontSize: { type: "number", label: "Font Size", min: 12, max: 24 },
        lineHeight: { type: "number", label: "Line Height", min: 1.2, max: 2.2 },
        paddingTop: { type: "number", label: "Padding Top", min: 0, max: 80 },
        paddingBottom: { type: "number", label: "Padding Bottom", min: 0, max: 80 },
        paddingX: { type: "number", label: "Horizontal Padding", min: 0, max: 80 },
      },
      defaultProps: { content: "<h2>About Us</h2><p>Write your story here. This block supports <strong>bold</strong>, <em>italic</em>, and <a href='#'>links</a>.</p>", maxWidth: 700, alignment: "left", backgroundColor: "", textColor: "", fontSize: 16, lineHeight: 1.7, paddingTop: 32, paddingBottom: 32, paddingX: 24 },
      render: ({ content, maxWidth, alignment, backgroundColor, textColor, fontSize, lineHeight, paddingTop, paddingBottom, paddingX, puck: _puck }) => (
        <div style={{ background: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px`, textAlign: alignment as React.CSSProperties["textAlign"] }}>
          <div style={{ maxWidth, margin: alignment === "center" ? "0 auto" : undefined, fontSize, lineHeight }} dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      ),
    },
    Divider: {
      fields: {
        height: { type: "number", label: "Height", min: 8, max: 200 },
        showLine: { type: "radio", label: "Show Line", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
        lineStyle: { type: "select", label: "Line Style", options: [{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }] },
        lineColor: { type: "text", label: "Line Color" },
        lineWidth: { type: "number", label: "Thickness", min: 1, max: 6 },
        maxWidth: { type: "number", label: "Max Width", min: 0, max: 1200 },
      },
      defaultProps: { height: 48, showLine: "true", lineStyle: "solid", lineColor: "#e5e7eb", lineWidth: 1, maxWidth: 0 },
      render: ({ height, showLine, lineStyle, lineColor, lineWidth, maxWidth, puck: _puck }) => (
        <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {showLine === "true" && <hr style={{ border: "none", borderTop: `${lineWidth}px ${lineStyle} ${lineColor}`, width: "100%", maxWidth: maxWidth || undefined, margin: 0 }} />}
        </div>
      ),
    },
    FAQ: {
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "text", label: "Subheading" },
        items: { type: "textarea", label: "Items (JSON)" },
        variant: { type: "select", label: "Variant", options: [{ value: "accordion", label: "Accordion" }, { value: "two-column", label: "Two Column" }, { value: "cards", label: "Cards" }] },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        accentColor: { type: "text", label: "Accent Color" },
        paddingTop: { type: "number", label: "Padding Top", min: 0, max: 96 },
        paddingBottom: { type: "number", label: "Padding Bottom", min: 0, max: 96 },
      },
      defaultProps: { heading: "Frequently Asked Questions", subheading: "", items: defaultFaqItems, variant: "accordion", backgroundColor: "", textColor: "", accentColor: "#3b82f6", paddingTop: 48, paddingBottom: 48 },
      render: ({ heading, subheading, items, variant, backgroundColor, textColor, accentColor, paddingTop, paddingBottom, puck: _puck }) => {
        const parsed = parseFaq(items);
        if (variant === "cards") {
          return (
            <div style={{ background: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
              <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
                {heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{heading}</h2>}
                {subheading && <p style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>{subheading}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32, textAlign: "left" }}>
                  {parsed.map((item, i) => (
                    <div key={i} style={{ padding: 20, borderRadius: 12, border: "1px solid #e5e7eb", backgroundColor: "#fff" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{item.question}</h4>
                      <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        if (variant === "two-column") {
          return (
            <div style={{ background: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
              <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48 }}>
                <div>{heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{heading}</h2>}{subheading && <p style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>{subheading}</p>}</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {parsed.map((item, i) => (
                    <div key={i} style={{ padding: "20px 0", borderBottom: "1px solid #e5e7eb" }}>
                      <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{item.question}</h4>
                      <p style={{ fontSize: 14, color: "#6b7280", marginTop: 8, lineHeight: 1.6 }}>{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div style={{ background: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
            <div style={{ maxWidth: 700, margin: "0 auto" }}>
              {heading && <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 8px" }}>{heading}</h2>}
              {subheading && <p style={{ fontSize: 16, opacity: 0.7, textAlign: "center", marginBottom: 32 }}>{subheading}</p>}
              <FaqAccordion items={parsed} textColor={textColor} accentColor={accentColor} />
            </div>
          </div>
        );
      },
    },
    Newsletter: {
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "text", label: "Subheading" },
        buttonText: { type: "text", label: "Button Text" },
        placeholderText: { type: "text", label: "Placeholder" },
        variant: { type: "select", label: "Variant", options: [{ value: "inline", label: "Inline" }, { value: "stacked", label: "Stacked" }, { value: "card", label: "Card" }] },
        showName: { type: "radio", label: "Show Name Field", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
        buttonColor: { type: "text", label: "Button Color" },
        buttonTextColor: { type: "text", label: "Button Text Color" },
        paddingTop: { type: "number", label: "Padding Top", min: 0, max: 96 },
        paddingBottom: { type: "number", label: "Padding Bottom", min: 0, max: 96 },
        maxWidth: { type: "number", label: "Max Width", min: 400, max: 1200 },
      },
      defaultProps: { heading: "Stay in the loop", subheading: "Get updates on new products and exclusive offers.", buttonText: "Subscribe", variant: "stacked", backgroundColor: "", textColor: "", buttonColor: "#000000", buttonTextColor: "#ffffff", paddingTop: 48, paddingBottom: 48, maxWidth: 600, showName: "false", placeholderText: "Enter your email" },
      render: ({ heading, subheading, buttonText, variant, backgroundColor, textColor, buttonColor, buttonTextColor, paddingTop, paddingBottom, maxWidth, showName, placeholderText, puck: _puck }) => {
        const inputStyle: React.CSSProperties = { padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, flex: 1, minWidth: 0 };
        const btnStyle: React.CSSProperties = { padding: "10px 24px", borderRadius: 8, backgroundColor: buttonColor, color: buttonTextColor, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };
        const form = variant === "inline" ? (
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {showName === "true" && <input placeholder="Name" style={inputStyle} />}
            <input placeholder={placeholderText} style={inputStyle} />
            <button style={btnStyle}>{buttonText}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, maxWidth: 400, marginInline: variant === "stacked" ? "auto" : undefined }}>
            {showName === "true" && <input placeholder="Name" style={inputStyle} />}
            <input placeholder={placeholderText} style={inputStyle} />
            <button style={btnStyle}>{buttonText}</button>
          </div>
        );
        const content = (
          <>
            {heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{heading}</h2>}
            {subheading && <p style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>{subheading}</p>}
            {form}
          </>
        );
        if (variant === "card") {
          return (
            <div style={{ padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
              <div style={{ maxWidth, margin: "0 auto", background: backgroundColor || undefined, color: textColor || undefined, padding: 48, borderRadius: 16, textAlign: "center" }}>{content}</div>
            </div>
          );
        }
        return (
          <div style={{ background: backgroundColor || undefined, color: textColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: variant === "stacked" ? "center" : "left" }}>
            <div style={{ maxWidth, margin: "0 auto" }}>{content}</div>
          </div>
        );
      },
    },
    Testimonials: {
      fields: {
        heading: { type: "text", label: "Heading" },
        subheading: { type: "text", label: "Subheading" },
        items: { type: "textarea", label: "Items (JSON)" },
        columns: { type: "select", label: "Columns", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }] },
        variant: { type: "select", label: "Variant", options: [{ value: "cards", label: "Cards" }, { value: "minimal", label: "Minimal" }, { value: "large-quote", label: "Large Quote" }] },
        showRating: { type: "radio", label: "Show Rating", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
        showAvatar: { type: "radio", label: "Show Avatar", options: [{ value: "true", label: "Yes" }, { value: "false", label: "No" }] },
        cardStyle: { type: "select", label: "Card Style", options: [{ value: "bordered", label: "Bordered" }, { value: "shadow", label: "Shadow" }, { value: "filled", label: "Filled" }] },
        backgroundColor: { type: "text", label: "Background Color" },
        cardBackgroundColor: { type: "text", label: "Card BG Color" },
        accentColor: { type: "text", label: "Star Color" },
        paddingTop: { type: "number", label: "Padding Top", min: 0, max: 96 },
        paddingBottom: { type: "number", label: "Padding Bottom", min: 0, max: 96 },
      },
      defaultProps: { heading: "What Our Customers Say", subheading: "", items: defaultTestimonialItems, columns: "3", variant: "cards", showRating: "true", showAvatar: "true", cardStyle: "bordered", backgroundColor: "", cardBackgroundColor: "#ffffff", accentColor: "#f59e0b", paddingTop: 48, paddingBottom: 48 },
      render: ({ heading, subheading, items, columns, variant, showRating, showAvatar, cardStyle, backgroundColor, cardBackgroundColor, accentColor, paddingTop, paddingBottom, puck: _puck }) => {
        const parsed = parseTestimonials(items);
        const cardStyles: Record<string, React.CSSProperties> = {
          bordered: { backgroundColor: cardBackgroundColor, border: "1px solid #e5e7eb", borderRadius: 12 },
          shadow: { backgroundColor: cardBackgroundColor, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", borderRadius: 12 },
          filled: { backgroundColor: cardBackgroundColor, borderRadius: 12 },
        };
        const avatarEl = (name: string) => <div style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "#6b7280" }}>{name.charAt(0)}</div>;

        if (variant === "large-quote") {
          const t = parsed[0];
          if (!t) return <div style={{ padding: 48, backgroundColor: backgroundColor || undefined, textAlign: "center" }}>No testimonials</div>;
          return (
            <div style={{ background: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px`, textAlign: "center" }}>
              <div style={{ maxWidth: 700, margin: "0 auto" }}>
                {heading && <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 32px" }}>{heading}</h2>}
                <div style={{ fontSize: 48, lineHeight: 1, color: accentColor, marginBottom: 8 }}>"</div>
                <p style={{ fontSize: 22, lineHeight: 1.6, fontStyle: "italic", color: "#374151" }}>{t.quote}</p>
                <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  {showAvatar === "true" && avatarEl(t.author)}
                  <div><div style={{ fontWeight: 600, fontSize: 15 }}>{t.author}</div>{t.role && <div style={{ fontSize: 13, color: "#9ca3af" }}>{t.role}</div>}</div>
                </div>
                {showRating === "true" && <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>{stars(t.rating, accentColor)}</div>}
              </div>
            </div>
          );
        }
        if (variant === "minimal") {
          return (
            <div style={{ background: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
              <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                {heading && <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", margin: "0 0 32px" }}>{heading}</h2>}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {parsed.map((t, i) => (
                    <div key={i} style={{ padding: "16px 0", borderBottom: i < parsed.length - 1 ? "1px solid #e5e7eb" : undefined }}>
                      <p style={{ fontSize: 15, lineHeight: 1.6, color: "#374151", margin: 0 }}>"{t.quote}"</p>
                      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                        {showRating === "true" && stars(t.rating, accentColor)}
                        <span style={{ fontSize: 14, fontWeight: 600 }}>— {t.author}</span>
                        {t.role && <span style={{ fontSize: 12, color: "#9ca3af" }}>{t.role}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div style={{ background: backgroundColor || undefined, padding: `${paddingTop}px 24px ${paddingBottom}px` }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              {heading && <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", margin: 0 }}>{heading}</h2>}
              {subheading && <p style={{ fontSize: 16, color: "#6b7280", textAlign: "center", marginTop: 8 }}>{subheading}</p>}
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 24, marginTop: 32 }}>
                {parsed.map((t, i) => (
                  <div key={i} style={{ padding: 24, ...cardStyles[cardStyle] }}>
                    {showRating === "true" && stars(t.rating, accentColor)}
                    <p style={{ fontSize: 15, lineHeight: 1.6, margin: "12px 0 16px", color: "#374151" }}>"{t.quote}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {showAvatar === "true" && avatarEl(t.author)}
                      <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t.author}</div>{t.role && <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.role}</div>}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      },
    },
  },
};

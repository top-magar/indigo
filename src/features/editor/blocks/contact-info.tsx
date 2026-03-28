"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface ContactInfoProps {
  heading: string
  email: string
  phone: string
  address: string
  hours: string
  showMap: boolean
  mapQuery: string
  backgroundColor: string
}

export const ContactInfoBlock = ({
  heading, email, phone, address, hours, showMap, mapQuery, backgroundColor,
}: ContactInfoProps) => {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div ref={craftRef(connect, drag)} style={{ backgroundColor, padding: "48px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: showMap ? "1fr 1fr" : "1fr", gap: 48 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 24px" }}>{heading}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15 }}>
            {email && <div><span style={{ fontWeight: 600 }}>Email:</span> {email}</div>}
            {phone && <div><span style={{ fontWeight: 600 }}>Phone:</span> {phone}</div>}
            {address && <div><span style={{ fontWeight: 600 }}>Address:</span> {address}</div>}
            {hours && <div><span style={{ fontWeight: 600 }}>Hours:</span> {hours}</div>}
          </div>
        </div>
        {showMap && (
          <div style={{ borderRadius: 12, overflow: "hidden", minHeight: 300, backgroundColor: "#f3f4f6" }}>
            {mapQuery ? (
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                style={{ width: "100%", height: "100%", border: "none", minHeight: 300 }}
                loading="lazy"
              />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>
                Enter an address to show map
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const ContactInfoSettings = () => {
  const { actions: { setProp }, props } = useNode((n) => ({ props: n.data.props as ContactInfoProps }))
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Heading
        <input type="text" value={props.heading} onChange={(e) => setProp((p: ContactInfoProps) => (p.heading = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Email
        <input type="email" value={props.email} onChange={(e) => setProp((p: ContactInfoProps) => (p.email = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Phone
        <input type="tel" value={props.phone} onChange={(e) => setProp((p: ContactInfoProps) => (p.phone = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Address
        <textarea value={props.address} onChange={(e) => setProp((p: ContactInfoProps) => (p.address = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" rows={2} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Hours
        <input type="text" value={props.hours} onChange={(e) => setProp((p: ContactInfoProps) => (p.hours = e.target.value))} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <input type="checkbox" checked={props.showMap} onChange={(e) => setProp((p: ContactInfoProps) => (p.showMap = e.target.checked))} />
        Show Map
      </label>
      {props.showMap && (
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          Map Search Query
          <input type="text" value={props.mapQuery} onChange={(e) => setProp((p: ContactInfoProps) => (p.mapQuery = e.target.value))} placeholder="123 Main St, City" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Background
        <input type="color" value={props.backgroundColor} onChange={(e) => setProp((p: ContactInfoProps) => (p.backgroundColor = e.target.value))} />
      </label>
    </div>
  )
}

ContactInfoBlock.craft = {
  displayName: "Contact Info",
  props: { heading: "Get in Touch", email: "hello@example.com", phone: "(555) 123-4567", address: "123 Main Street, City, State 12345", hours: "Mon-Fri 9am-5pm", showMap: true, mapQuery: "", backgroundColor: "#ffffff" } satisfies ContactInfoProps,
  related: { settings: ContactInfoSettings },
}

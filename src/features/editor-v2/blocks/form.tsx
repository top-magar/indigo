"use client"
import { useState } from "react"

interface FormField { label: string; type: string }
interface FormProps {
  heading: string; buttonText: string; successMessage: string
  recipientEmail: string; fields: string; _sectionId?: string
}

export function Form({ heading, buttonText, successMessage, recipientEmail, fields, _sectionId }: FormProps) {
  const [sent, setSent] = useState(false)
  const parsed: FormField[] = (() => { try { return JSON.parse(fields) } catch { return [] } })()
  const isEditor = !!_sectionId

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isEditor) return
    const data = Object.fromEntries(new FormData(e.currentTarget))
    await fetch("/api/public/form-submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientEmail, fields: data }),
    })
    setSent(true)
  }

  if (sent) return <div className="py-12 text-center text-lg">{successMessage}</div>

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      {heading && <h2 className="mb-6 text-2xl" style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)", color: "var(--store-color-text)" }}>{heading}</h2>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {parsed.map((f) => (
          <label key={f.label} className="flex flex-col gap-1 text-sm">
            {f.label}
            {f.type === "textarea"
              ? <textarea name={f.label} rows={4} className="rounded border px-3 py-2" readOnly={isEditor} />
              : <input name={f.label} type={f.type} className="rounded border px-3 py-2" readOnly={isEditor} />}
          </label>
        ))}
        <button type="submit" className="mt-2 px-6 py-3 font-semibold text-white" style={{ backgroundColor: "var(--store-color-primary)", borderRadius: "var(--store-btn-radius)" }}>
          {buttonText}
        </button>
      </form>
    </div>
  )
}

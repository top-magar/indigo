"use server"

import { createLogger } from "@/lib/logger"

const log = createLogger("infra:messaging")

// ── Interface ──

export interface MessagePayload {
  to: string          // Phone number (E.164 format: +977XXXXXXXXXX)
  body: string        // Message text
  templateId?: string // For WhatsApp template messages
  templateVars?: Record<string, string>
}

export interface MessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface MessagingProvider {
  readonly channel: "whatsapp" | "sms"
  send(payload: MessagePayload): Promise<MessageResult>
}

// ── WhatsApp Business API Provider ──

const WA_CONFIG = {
  apiUrl: process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
}

export class WhatsAppProvider implements MessagingProvider {
  readonly channel = "whatsapp" as const

  async send(payload: MessagePayload): Promise<MessageResult> {
    if (!WA_CONFIG.accessToken || !WA_CONFIG.phoneNumberId) {
      log.warn("WhatsApp not configured — skipping", { to: payload.to })
      return { success: false, error: "WhatsApp not configured" }
    }

    const phone = payload.to.replace(/[^0-9+]/g, "")

    try {
      // Template message (required for business-initiated conversations)
      const body = payload.templateId
        ? {
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: {
              name: payload.templateId,
              language: { code: "en" },
              components: payload.templateVars
                ? [{ type: "body", parameters: Object.values(payload.templateVars).map(v => ({ type: "text", text: v })) }]
                : undefined,
            },
          }
        : {
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: { body: payload.body },
          }

      const res = await fetch(`${WA_CONFIG.apiUrl}/${WA_CONFIG.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WA_CONFIG.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.text()
        log.error("WhatsApp send failed", { to: phone, status: res.status, err })
        return { success: false, error: err }
      }

      const data = await res.json() as { messages?: Array<{ id: string }> }
      const messageId = data.messages?.[0]?.id
      log.info("WhatsApp sent", { to: phone, messageId })
      return { success: true, messageId }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      log.error("WhatsApp error", { to: phone, error: msg })
      return { success: false, error: msg }
    }
  }
}

// ── Sparrow SMS Provider (Nepal) ──

const SMS_CONFIG = {
  apiUrl: process.env.SPARROW_SMS_API_URL || "http://api.sparrowsms.com/v2/sms/",
  token: process.env.SPARROW_SMS_TOKEN || "",
  from: process.env.SPARROW_SMS_FROM || "InfoAlert",
}

export class SparrowSMSProvider implements MessagingProvider {
  readonly channel = "sms" as const

  async send(payload: MessagePayload): Promise<MessageResult> {
    if (!SMS_CONFIG.token) {
      log.warn("Sparrow SMS not configured — skipping", { to: payload.to })
      return { success: false, error: "Sparrow SMS not configured" }
    }

    const phone = payload.to.replace(/[^0-9]/g, "")

    try {
      const params = new URLSearchParams({
        token: SMS_CONFIG.token,
        from: SMS_CONFIG.from,
        to: phone,
        text: payload.body,
      })

      const res = await fetch(`${SMS_CONFIG.apiUrl}?${params.toString()}`)

      if (!res.ok) {
        const err = await res.text()
        log.error("SMS send failed", { to: phone, status: res.status, err })
        return { success: false, error: err }
      }

      const data = await res.json() as { response_code?: number; request_id?: string }
      if (data.response_code === 200) {
        log.info("SMS sent", { to: phone, requestId: data.request_id })
        return { success: true, messageId: data.request_id }
      }

      return { success: false, error: `Sparrow response code: ${data.response_code}` }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      log.error("SMS error", { to: phone, error: msg })
      return { success: false, error: msg }
    }
  }
}

// ── Factory ──

const whatsapp = new WhatsAppProvider()
const sms = new SparrowSMSProvider()

export function getMessagingProvider(channel: "whatsapp" | "sms"): MessagingProvider {
  return channel === "whatsapp" ? whatsapp : sms
}

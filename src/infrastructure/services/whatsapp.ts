import { createLogger } from '@/lib/logger'

const log = createLogger('services:whatsapp')

interface WhatsAppConfig {
  apiUrl: string
  apiToken: string
}

interface SendMessageInput {
  to: string
  message: string
  config: WhatsAppConfig
}

export async function sendWhatsAppMessage({ to, message, config }: SendMessageInput): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiToken}` },
      body: JSON.stringify({ to, message }),
    })
    if (!res.ok) {
      const text = await res.text()
      log.error('WhatsApp send failed:', text)
      return { success: false, error: text }
    }
    return { success: true }
  } catch (err) {
    log.error('WhatsApp send error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export function orderReceivedMessage(orderNumber: string, total: string, currency: string, customerName: string): string {
  return `🛒 New Order #${orderNumber}\n\nCustomer: ${customerName}\nTotal: ${currency} ${total}\n\nView in dashboard to process.`
}

export function orderShippedMessage(orderNumber: string, trackingNumber?: string): string {
  return `📦 Order #${orderNumber} has been shipped!${trackingNumber ? `\n\nTracking: ${trackingNumber}` : ''}\n\nThank you for your order.`
}

export function orderDeliveredMessage(orderNumber: string): string {
  return `✅ Order #${orderNumber} has been delivered!\n\nWe hope you enjoy your purchase. Please leave a review!`
}

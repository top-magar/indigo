import { NextRequest, NextResponse } from "next/server"
import { getPaymentProvider } from "@/infrastructure/payments"
import { createLogger } from "@/lib/logger"

const log = createLogger("api:checkout:callback")

/**
 * Payment callback handler — eSewa and Khalti redirect here after payment.
 *
 * eSewa: GET with ?data=<base64 JSON> containing transaction_uuid, status, total_amount
 * Khalti: GET with ?pidx=<string>&purchase_order_id=<string>&status=<string>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const url = request.nextUrl
  const gateway = url.searchParams.get("gateway")

  try {
    if (gateway === "esewa") {
      const data = url.searchParams.get("data")
      if (!data) return redirectToStore(slug, "missing_data")

      const decoded = JSON.parse(Buffer.from(data, "base64").toString()) as {
        transaction_uuid: string
        status: string
        total_amount: string
      }

      const provider = getPaymentProvider("esewa")
      const paymentId = `esewa_${decoded.transaction_uuid}`

      if (decoded.status === "COMPLETE") {
        const result = await provider.confirmPayment(paymentId, "")
        if (result.success) {
          log.info("eSewa payment confirmed", { orderId: decoded.transaction_uuid })
          // TODO: update order status to paid via withTenant
          return redirectToStore(slug, null, decoded.transaction_uuid)
        }
      }

      return redirectToStore(slug, "payment_failed")
    }

    if (gateway === "khalti") {
      const pidx = url.searchParams.get("pidx")
      const orderId = url.searchParams.get("purchase_order_id")
      const status = url.searchParams.get("status")

      if (!pidx || !orderId) return redirectToStore(slug, "missing_data")

      if (status === "Completed") {
        const provider = getPaymentProvider("khalti")
        const result = await provider.confirmPayment(`khalti_${pidx}`, "")
        if (result.success) {
          log.info("Khalti payment confirmed", { orderId, pidx })
          // TODO: update order status to paid via withTenant
          return redirectToStore(slug, null, orderId)
        }
      }

      return redirectToStore(slug, "payment_failed")
    }

    return redirectToStore(slug, "unknown_gateway")
  } catch (e) {
    log.error("Payment callback error", { gateway, error: e instanceof Error ? e.message : "unknown" })
    return redirectToStore(slug, "callback_error")
  }
}

function redirectToStore(slug: string, error: string | null, orderId?: string): NextResponse {
  const base = `${process.env.NEXT_PUBLIC_APP_URL}/store/${slug}`
  if (error) return NextResponse.redirect(`${base}/checkout?error=${error}`)
  return NextResponse.redirect(`${base}/order-confirmation?order=${orderId}`)
}

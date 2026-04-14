/**
 * Payment Service — re-exports from infrastructure/payments
 */
export { getPaymentProvider, ManualPaymentProvider, EsewaPaymentProvider, KhaltiPaymentProvider } from "@/infrastructure/payments"
export type { PaymentProvider, PaymentMethod, CreateOrderPayment, PaymentResult } from "@/infrastructure/payments"

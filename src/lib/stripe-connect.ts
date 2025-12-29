import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
})

/**
 * Create a Stripe Connect account for a tenant
 */
export async function createConnectAccount(email: string, tenantId: string) {
  const account = await stripe.accounts.create({
    type: "express",
    email,
    metadata: {
      tenant_id: tenantId,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  })

  return accountLink
}

/**
 * Get account status
 */
export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId)

  return {
    id: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements: account.requirements,
  }
}

/**
 * Create a payment intent with application fee
 */
export async function createPaymentIntent(
  amount: number,
  currency: string,
  connectedAccountId: string,
  applicationFeePercent: number = 5
) {
  const applicationFeeAmount = Math.round(amount * (applicationFeePercent / 100))

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: connectedAccountId,
    },
  })

  return paymentIntent
}

/**
 * Create a login link for the Express dashboard
 */
export async function createLoginLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId)
  return loginLink
}

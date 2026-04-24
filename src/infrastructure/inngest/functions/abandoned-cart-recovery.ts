import { inngest } from '../client'
import { db } from '@/infrastructure/db'
import { carts, cartItems } from '@/db/schema'
import { tenants } from '@/db/schema/tenants'
import { eq, and, lt, isNotNull, sql } from 'drizzle-orm'
import { sendEmail } from '@/infrastructure/services/email/actions'
import { abandonedCartTemplate } from '@/infrastructure/services/email/templates'
import { createLogger } from '@/lib/logger'

const log = createLogger('inngest:abandoned-cart')

export const abandonedCartRecovery = inngest.createFunction(
  { id: 'abandoned-cart-recovery', name: 'Abandoned Cart Recovery' },
  { cron: '0 * * * *' },
  async ({ step }) => {
    const abandonedCarts = await step.run('find-abandoned', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return db.select({
        id: carts.id,
        email: carts.email,
        tenantId: carts.tenantId,
        metadata: carts.metadata,
      })
        .from(carts)
        .where(and(
          eq(carts.status, 'active'),
          lt(carts.updatedAt, oneHourAgo),
          isNotNull(carts.email),
        ))
        .limit(50)
    })

    let sent = 0
    for (const cart of abandonedCarts) {
      const meta = (cart.metadata ?? {}) as Record<string, unknown>
      if (meta.recovery_email_sent) continue
      if (!cart.email) continue

      await step.run(`send-${cart.id}`, async () => {
        const [tenant] = await db
          .select({ name: tenants.name, slug: tenants.slug })
          .from(tenants)
          .where(eq(tenants.id, cart.tenantId))
        if (!tenant) return

        const items = await db
          .select({ productName: cartItems.productName, unitPrice: cartItems.unitPrice })
          .from(cartItems)
          .where(eq(cartItems.cartId, cart.id))

        const cartUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${tenant.slug}/checkout`
        const html = abandonedCartTemplate(
          tenant.name,
          cartUrl,
          items.map(i => ({ name: i.productName, price: String(i.unitPrice) }))
        )

        await sendEmail({
          to: cart.email!,
          subject: `You left items in your cart at ${tenant.name}`,
          template: 'abandoned_cart',
          data: { html },
        })

        await db
          .update(carts)
          .set({ metadata: sql`jsonb_set(COALESCE(metadata, '{}'), '{recovery_email_sent}', 'true')` })
          .where(eq(carts.id, cart.id))

        log.info('Recovery email sent', { cartId: cart.id, email: cart.email })
        sent++
      })
    }

    return { sent, checked: abandonedCarts.length }
  }
)

import { Inngest } from "inngest";

/**
 * Inngest Client
 * 
 * Central client for background job processing in the Indigo Commerce platform.
 * Used for reliable async processing of:
 * - Order confirmation emails
 * - Merchant notification emails
 * - Inventory decrements
 * - Stripe webhook event processing
 * 
 * @see https://www.inngest.com/docs
 */
export const inngest = new Inngest({ 
  id: "indigo-commerce",
  name: "Indigo Commerce Platform"
});

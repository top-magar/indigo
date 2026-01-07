import { serve } from "inngest/next";
import { inngest } from "@/infrastructure/inngest/client";
import { functions } from "@/infrastructure/inngest/functions";

/**
 * Inngest API Route
 * 
 * This route handles all Inngest webhook requests for background job processing.
 * Inngest will call this endpoint to:
 * - Discover available functions
 * - Execute function steps
 * - Handle retries and failures
 * 
 * @see https://www.inngest.com/docs/reference/serve
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});

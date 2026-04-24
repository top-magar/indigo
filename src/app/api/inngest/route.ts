import { serve } from "inngest/next";
import { inngest } from "@/infrastructure/inngest/client";
import { abandonedCartRecovery } from "@/infrastructure/inngest/functions/abandoned-cart-recovery";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [abandonedCartRecovery],
});

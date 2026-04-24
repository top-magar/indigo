/**
 * SSE Endpoint for Real-time Notifications
 * Provides a streaming connection for real-time notification updates
 */

import { NextRequest } from "next/server";
import { notificationEmitter } from "@/infrastructure/services/notification-emitter";
import { createLogger } from "@/lib/logger";
import { createClient } from "@/infrastructure/supabase/server";
const log = createLogger("api:notifications-stream");

/**
 * GET /api/notifications/stream
 * 
 * Establishes an SSE connection for real-time notifications.
 * Requires authentication — tenantId is derived from the session, not query params.
 */
export async function GET(request: NextRequest) {
  // Auth check — derive tenantId from session, not query params
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  if (!userData?.tenant_id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const tenantId = userData.tenant_id;
  const userId = user.id;

  // Create a readable stream for SSE
  let connectionId: string | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Register the connection with the notification emitter
      connectionId = notificationEmitter.registerConnection(
        tenantId,
        controller,
        userId
      );

      log.info(`[SSE] New connection established: ${connectionId}`);
    },
    cancel() {
      // Clean up when the client disconnects
      if (connectionId) {
        notificationEmitter.removeConnection(connectionId);
        log.info(`[SSE] Connection closed: ${connectionId}`);
      }
    },
  });

  // Return the SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Disable nginx buffering
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

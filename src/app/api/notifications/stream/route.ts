/**
 * SSE Endpoint for Real-time Notifications
 * Provides a streaming connection for real-time notification updates
 */

import { NextRequest } from "next/server";
import { notificationEmitter } from "@/infrastructure/services/notification-emitter";

/**
 * GET /api/notifications/stream
 * 
 * Establishes an SSE connection for real-time notifications.
 * 
 * Query Parameters:
 * - tenantId: Required. The tenant ID to scope notifications
 * - userId: Optional. The user ID for user-specific notifications
 * 
 * Headers:
 * - Accept: text/event-stream
 * 
 * Events:
 * - connected: Sent when connection is established
 * - notification: Sent when a new notification arrives
 * - heartbeat: Sent periodically to keep connection alive
 */
export async function GET(request: NextRequest) {
  // Get tenant and user from query params
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get("tenantId");
  const userId = searchParams.get("userId") || undefined;

  // Validate tenant ID
  if (!tenantId) {
    return new Response(
      JSON.stringify({ error: "tenantId is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

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

      console.log(`[SSE] New connection established: ${connectionId}`);
    },
    cancel() {
      // Clean up when the client disconnects
      if (connectionId) {
        notificationEmitter.removeConnection(connectionId);
        console.log(`[SSE] Connection closed: ${connectionId}`);
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
      "Access-Control-Allow-Origin": "*",
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

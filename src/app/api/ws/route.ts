/**
 * WebSocket Upgrade Endpoint
 * Handles WebSocket connection upgrades with JWT token validation
 *
 * Authentication Flow:
 * 1. Token is extracted from query params or Authorization header
 * 2. Token is validated using jose library (JWT verification)
 * 3. User info is extracted from the validated token
 * 4. Connection is established with user context
 *
 * Security:
 * - Production: Requires valid JWT token signed with AUTH_SECRET
 * - Development: Supports dev tokens (dev_{userId}_{tenantId}) as fallback
 * - Query params (userId, tenantId) are only used as fallback in development
 *
 * Note: Next.js App Router doesn't natively support WebSocket upgrades.
 * This route provides a fallback SSE implementation and documents
 * how to set up WebSocket support with a custom server.
 *
 * @see src/lib/auth/websocket-auth.ts for token validation
 * @see src/proxy.ts for the proxy pattern implementation
 */

import { NextRequest, NextResponse } from "next/server";
import { webSocketServer } from "@/infrastructure/services/websocket-server";
import {
  validateWebSocketToken,
  extractUserFromToken,
  type WebSocketUser,
} from "@/infrastructure/auth";

// ============================================================================
// Configuration
// ============================================================================

const isDevelopment = process.env.NODE_ENV === "development";

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Extract token from request (query params or Authorization header)
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first (preferred)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fall back to query param
  return request.nextUrl.searchParams.get("token");
}

/**
 * Extract user info from query params (development fallback only)
 */
function extractUserFromQueryParams(request: NextRequest): WebSocketUser | null {
  if (!isDevelopment) {
    return null;
  }

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const tenantId = searchParams.get("tenantId");
  const userName = searchParams.get("userName") || "Anonymous";

  if (!userId || !tenantId) {
    return null;
  }

  console.warn(
    "[WS Auth] Using query params for authentication (development mode only)"
  );

  return {
    userId,
    tenantId,
    userName,
  };
}

/**
 * Authenticate the WebSocket request
 * Returns user info if authenticated, or an error response
 */
async function authenticateRequest(
  request: NextRequest
): Promise<{ user: WebSocketUser } | { error: NextResponse }> {
  const token = extractToken(request);

  // If no token provided
  if (!token) {
    // In development, allow query param fallback
    if (isDevelopment) {
      const user = extractUserFromQueryParams(request);
      if (user) {
        return { user };
      }
    }

    return {
      error: NextResponse.json(
        {
          error: "Authentication required",
          message: "Provide a valid token via Authorization header or token query param",
        },
        { status: 401 }
      ),
    };
  }

  // Validate the token
  const validationResult = await validateWebSocketToken(token);

  if (!validationResult.valid) {
    // Return appropriate error based on validation result
    if (validationResult.expired) {
      return {
        error: NextResponse.json(
          {
            error: "Token expired",
            message: "Please refresh your authentication token",
          },
          { status: 401 }
        ),
      };
    }

    return {
      error: NextResponse.json(
        {
          error: "Invalid token",
          message: validationResult.error || "Token validation failed",
        },
        { status: 401 }
      ),
    };
  }

  // Extract user info from validated token
  const user = await extractUserFromToken(token);

  if (!user) {
    return {
      error: NextResponse.json(
        {
          error: "Invalid token payload",
          message: "Could not extract user information from token",
        },
        { status: 401 }
      ),
    };
  }

  return { user };
}

// ============================================================================
// SSE Fallback Implementation
// ============================================================================

/**
 * GET handler - SSE fallback for environments without WebSocket support
 */
export async function GET(request: NextRequest) {
  // Authenticate the request
  const authResult = await authenticateRequest(request);

  if ("error" in authResult) {
    return authResult.error;
  }

  const { user } = authResult;
  const userAvatar = request.nextUrl.searchParams.get("userAvatar") || undefined;

  let connectionId: string | null = null;

  const stream = new ReadableStream({
    start(controller) {
      connectionId = webSocketServer.registerConnection(
        user.userId,
        user.userName,
        user.tenantId,
        null,
        controller,
        userAvatar
      );

      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({
            connectionId,
            userId: user.userId,
            tenantId: user.tenantId,
            timestamp: new Date().toISOString(),
          })}\n\n`
        )
      );
    },
    cancel() {
      if (connectionId) {
        webSocketServer.removeConnection(connectionId);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * POST handler - Send messages via HTTP when WebSocket is not available
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, type, roomId, roomType, data } = body;

    // Authenticate using token from body or header
    let user: WebSocketUser;

    if (token) {
      // Validate token from request body
      const validationResult = await validateWebSocketToken(token);

      if (!validationResult.valid) {
        return NextResponse.json(
          {
            error: validationResult.expired ? "Token expired" : "Invalid token",
            message: validationResult.error,
          },
          { status: 401 }
        );
      }

      const extractedUser = await extractUserFromToken(token);
      if (!extractedUser) {
        return NextResponse.json(
          { error: "Invalid token payload" },
          { status: 401 }
        );
      }
      user = extractedUser;
    } else {
      // Try to authenticate from Authorization header
      const headerToken = extractToken(request);

      if (!headerToken) {
        return NextResponse.json(
          { error: "Missing token" },
          { status: 400 }
        );
      }

      const validationResult = await validateWebSocketToken(headerToken);

      if (!validationResult.valid) {
        return NextResponse.json(
          {
            error: validationResult.expired ? "Token expired" : "Invalid token",
            message: validationResult.error,
          },
          { status: 401 }
        );
      }

      const extractedUser = await extractUserFromToken(headerToken);
      if (!extractedUser) {
        return NextResponse.json(
          { error: "Invalid token payload" },
          { status: 401 }
        );
      }
      user = extractedUser;
    }

    // Handle different message types
    switch (type) {
      case "room_join": {
        const { resourceId } = data || {};
        return NextResponse.json({
          success: true,
          roomId: resourceId
            ? `${roomType}:${user.tenantId}:${resourceId}`
            : `${roomType}:${user.tenantId}`,
        });
      }

      case "room_leave": {
        return NextResponse.json({ success: true });
      }

      case "cursor_move": {
        const fullRoomId = roomId || `${roomType}:${user.tenantId}`;
        const users = webSocketServer.getRoomUsers(fullRoomId);
        return NextResponse.json({ success: true, usersInRoom: users.length });
      }

      case "typing_start":
      case "typing_stop": {
        return NextResponse.json({ success: true });
      }

      case "comment": {
        const { comment } = data || {};
        if (comment && roomType) {
          webSocketServer.broadcastComment(
            user.tenantId,
            roomType,
            data.resourceId || "",
            comment
          );
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: "Unknown message type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[WS Route] Error processing message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

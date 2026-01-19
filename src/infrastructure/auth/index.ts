/**
 * Authentication Utilities
 * 
 * Central export point for all authentication-related utilities.
 * Uses Supabase Auth for session management.
 */

// Session management
export {
  getSession,
  requireAuth,
  requireTenant,
  type UserSession,
} from "./session";

// WebSocket authentication
export {
  validateWebSocketToken,
  extractUserFromToken,
  generateDevToken,
  generateWebSocketToken,
  isTokenExpired,
  decodeTokenUnsafe,
  type WebSocketUser,
  type TokenValidationResult,
  type TokenPayload,
} from "./websocket-auth";

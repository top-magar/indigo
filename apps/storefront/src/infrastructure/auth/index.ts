/**
 * Authentication Utilities
 * 
 * Session auth: use @/lib/auth (getUser, requireUser, getAuthenticatedClient, authorizedAction)
 * This module only exports WebSocket authentication utilities.
 */

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

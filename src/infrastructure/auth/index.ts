/**
 * Authentication Utilities
 * 
 * Session auth: use @/infrastructure/auth (getUser, requireUser, getAuthenticatedClient, authorizedAction)
 */

export * from "./session";

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


/**
 * Authentication Utilities
 * 
 * Central export point for all authentication-related utilities.
 * 
 * @see src/auth.ts for NextAuth configuration
 * @see src/auth.config.ts for auth callbacks and JWT handling
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

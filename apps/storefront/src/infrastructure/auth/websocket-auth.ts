/**
 * WebSocket Authentication Module
 * 
 * Provides JWT validation for WebSocket connections using the jose library.
 * Uses the proxy pattern (not middleware) as middleware is deprecated in Next.js.
 * 
 * @see src/proxy.ts for the main proxy pattern implementation
 * @see SYSTEM-ARCHITECTURE.md Section 7.1 (Security)
 */

import * as jose from "jose";

// ============================================================================
// Types
// ============================================================================

export interface WebSocketUser {
  userId: string;
  tenantId: string;
  userName: string;
  email?: string;
  role?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  expired?: boolean;
  error?: string;
}

export interface TokenPayload {
  userId: string;
  tenantId: string;
  userName?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get the JWT secret from environment variables
 * NextAuth uses AUTH_SECRET or NEXTAUTH_SECRET
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error(
      "Missing JWT secret. Set AUTH_SECRET or NEXTAUTH_SECRET environment variable."
    );
  }
  
  return new TextEncoder().encode(secret);
}

/**
 * Check if we're in development mode
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

// ============================================================================
// Token Validation
// ============================================================================

/**
 * Validate a WebSocket authentication token
 * 
 * Supports:
 * - Standard JWT tokens (production)
 * - Development tokens prefixed with "dev_" (development only)
 * - Base64-encoded JSON tokens (development only)
 * 
 * @param token - The JWT token to validate
 * @returns TokenValidationResult indicating if the token is valid
 */
export async function validateWebSocketToken(
  token: string
): Promise<TokenValidationResult> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Token is required" };
  }

  // Handle development tokens (only in development mode)
  if (isDevelopment() && token.startsWith("dev_")) {
    return validateDevToken(token);
  }

  // Handle base64 JSON tokens (development only)
  if (isDevelopment() && isBase64Json(token)) {
    return validateBase64Token(token);
  }

  // Validate standard JWT token
  return validateJwtToken(token);
}

/**
 * Validate a standard JWT token using jose
 */
async function validateJwtToken(token: string): Promise<TokenValidationResult> {
  try {
    const secret = getJwtSecret();
    
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256", "HS384", "HS512"],
    });

    // Check for required claims
    if (!payload.sub && !payload.id) {
      return { valid: false, error: "Token missing user identifier" };
    }

    if (!payload.tenantId) {
      return { valid: false, error: "Token missing tenant identifier" };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return { valid: false, expired: true, error: "Token has expired" };
    }
    
    if (error instanceof jose.errors.JWTClaimValidationFailed) {
      return { valid: false, error: "Token claim validation failed" };
    }
    
    if (error instanceof jose.errors.JWSSignatureVerificationFailed) {
      return { valid: false, error: "Invalid token signature" };
    }

    // Generic JWT error
    const message = error instanceof Error ? error.message : "Token validation failed";
    return { valid: false, error: message };
  }
}

/**
 * Validate development token format: dev_{userId}_{tenantId}
 * Only available in development mode
 */
function validateDevToken(token: string): TokenValidationResult {
  const parts = token.split("_");
  
  if (parts.length < 3) {
    return { valid: false, error: "Invalid development token format" };
  }

  const [, userId, tenantId] = parts;
  
  if (!userId || !tenantId) {
    return { valid: false, error: "Development token missing required parts" };
  }

  return { valid: true };
}

/**
 * Validate base64-encoded JSON token (development only)
 */
function validateBase64Token(token: string): TokenValidationResult {
  try {
    const decoded = JSON.parse(atob(token));
    
    if (!decoded.userId || !decoded.tenantId) {
      return { valid: false, error: "Base64 token missing required fields" };
    }

    // Check expiration if present
    if (decoded.exp && decoded.exp < Date.now()) {
      return { valid: false, expired: true, error: "Token has expired" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid base64 token format" };
  }
}

/**
 * Check if a string is likely a base64-encoded JSON object
 */
function isBase64Json(str: string): boolean {
  try {
    const decoded = atob(str);
    JSON.parse(decoded);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// User Extraction
// ============================================================================

/**
 * Extract user information from a validated token
 * 
 * @param token - The JWT token to extract user info from
 * @returns WebSocketUser object or null if extraction fails
 */
export async function extractUserFromToken(
  token: string
): Promise<WebSocketUser | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  // Handle development tokens
  if (isDevelopment() && token.startsWith("dev_")) {
    return extractFromDevToken(token);
  }

  // Handle base64 JSON tokens (development only)
  if (isDevelopment() && isBase64Json(token)) {
    return extractFromBase64Token(token);
  }

  // Extract from standard JWT
  return extractFromJwtToken(token);
}

/**
 * Extract user info from a standard JWT token
 */
async function extractFromJwtToken(token: string): Promise<WebSocketUser | null> {
  try {
    const secret = getJwtSecret();
    
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256", "HS384", "HS512"],
    });

    const userId = (payload.sub || payload.id) as string;
    const tenantId = payload.tenantId as string;

    if (!userId || !tenantId) {
      return null;
    }

    return {
      userId,
      tenantId,
      userName: (payload.name || payload.userName || payload.email || "User") as string,
      email: payload.email as string | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Extract user info from development token
 */
function extractFromDevToken(token: string): WebSocketUser | null {
  const parts = token.split("_");
  
  if (parts.length < 3) {
    return null;
  }

  const [, userId, tenantId, ...rest] = parts;
  const userName = rest.join("_") || `Dev User ${userId}`;

  return {
    userId,
    tenantId,
    userName,
  };
}

/**
 * Extract user info from base64-encoded JSON token
 */
function extractFromBase64Token(token: string): WebSocketUser | null {
  try {
    const decoded = JSON.parse(atob(token));

    if (!decoded.userId || !decoded.tenantId) {
      return null;
    }

    return {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      userName: decoded.userName || decoded.name || decoded.email || "User",
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Token Generation (for development/testing)
// ============================================================================

/**
 * Generate a development token for testing
 * Only available in development mode
 * 
 * @param userId - User identifier
 * @param tenantId - Tenant identifier
 * @param userName - Optional user name
 * @returns Development token string
 */
export function generateDevToken(
  userId: string,
  tenantId: string,
  userName?: string
): string {
  if (!isDevelopment()) {
    throw new Error("Development tokens can only be generated in development mode");
  }

  const parts = ["dev", userId, tenantId];
  if (userName) {
    parts.push(userName);
  }

  return parts.join("_");
}

/**
 * Generate a signed JWT token for WebSocket authentication
 * 
 * @param payload - Token payload with user information
 * @param expiresIn - Token expiration time (default: 1 hour)
 * @returns Signed JWT token
 */
export async function generateWebSocketToken(
  payload: Omit<TokenPayload, "exp" | "iat">,
  expiresIn: string = "1h"
): Promise<string> {
  const secret = getJwtSecret();

  const token = await new jose.SignJWT({
    sub: payload.userId,
    tenantId: payload.tenantId,
    name: payload.userName,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a token is expired without full validation
 * Useful for quick checks before attempting full validation
 * 
 * @param token - The JWT token to check
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    // For dev tokens, they don't expire
    if (token.startsWith("dev_")) {
      return false;
    }

    // For base64 tokens, check exp field
    if (isBase64Json(token)) {
      const decoded = JSON.parse(atob(token));
      return decoded.exp ? decoded.exp < Date.now() : false;
    }

    // For JWT, decode without verification to check exp
    const claims = jose.decodeJwt(token);
    if (!claims.exp) {
      return false;
    }

    // JWT exp is in seconds, not milliseconds
    return claims.exp * 1000 < Date.now();
  } catch {
    // If we can't decode, consider it expired
    return true;
  }
}

/**
 * Decode a token without verification (for debugging)
 * WARNING: Do not use this for authentication - always use validateWebSocketToken
 * 
 * @param token - The token to decode
 * @returns Decoded payload or null
 */
export function decodeTokenUnsafe(token: string): TokenPayload | null {
  try {
    if (token.startsWith("dev_")) {
      const user = extractFromDevToken(token);
      return user ? { ...user, userId: user.userId, tenantId: user.tenantId } : null;
    }

    if (isBase64Json(token)) {
      return JSON.parse(atob(token));
    }

    const claims = jose.decodeJwt(token);
    return {
      userId: (claims.sub || claims.id) as string,
      tenantId: claims.tenantId as string,
      userName: claims.name as string,
      email: claims.email as string,
      role: claims.role as string,
      exp: claims.exp,
      iat: claims.iat,
    };
  } catch {
    return null;
  }
}

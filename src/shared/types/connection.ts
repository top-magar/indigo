/**
 * Unified Connection Status Types
 * Single source of truth for all connection-related status types
 */

export type ConnectionStatus = 
  | "connecting"
  | "connected" 
  | "disconnected"
  | "reconnecting"
  | "error";

export interface ConnectionState {
  status: ConnectionStatus;
  isConnected: boolean;
  reconnectAttempts: number;
  lastError: Error | null;
}

// Helper to check if connected
export function isConnected(status: ConnectionStatus): boolean {
  return status === "connected";
}

// Helper to check if attempting connection
export function isConnecting(status: ConnectionStatus): boolean {
  return status === "connecting" || status === "reconnecting";
}

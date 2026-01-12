/**
 * Brand Colors Constants
 * Third-party brand colors that should not use Geist design tokens
 * These are official brand colors and should remain unchanged
 */

export const BRAND_COLORS = {
  // Social/Platform brands
  discord: '#5865F2',
  github: '#24292e',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  instagram: '#E4405F',
  
  // Payment providers
  stripe: '#635BFF',
  esewa: '#60BB46',
  khalti: '#5C2D91',
  paypal: '#003087',
  
  // macOS window controls (intentionally hardcoded)
  macosClose: '#FF5F57',
  macosMinimize: '#FEBC2E',
  macosMaximize: '#28C840',
  
  // Code syntax highlighting (terminal/code blocks)
  codeGreen: '#22c55e',
  codePurple: '#a855f7',
  codeBlue: '#3b82f6',
  codeYellow: '#eab308',
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;

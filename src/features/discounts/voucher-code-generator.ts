/**
 * Voucher Code Generator
 * Inspired by Saleor's voucher code generation patterns
 */

export interface GenerateCodesOptions {
  /** Number of codes to generate */
  quantity: number;
  /** Prefix for all codes */
  prefix?: string;
  /** Suffix for all codes */
  suffix?: string;
  /** Length of the random part */
  length?: number;
  /** Character set to use */
  charset?: "alphanumeric" | "alphabetic" | "numeric" | "custom";
  /** Custom characters (when charset is "custom") */
  customChars?: string;
  /** Separator between prefix/code/suffix */
  separator?: string;
  /** Existing codes to avoid duplicates */
  existingCodes?: Set<string>;
}

const CHARSETS = {
  alphanumeric: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", // Removed confusing chars: I, O, 0, 1
  alphabetic: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  numeric: "23456789",
};

/**
 * Generate a single random code
 */
function generateRandomCode(length: number, chars: string): string {
  let result = "";
  const charsLength = chars.length;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  
  return result;
}

/**
 * Generate multiple unique voucher codes
 */
export function generateVoucherCodes(options: GenerateCodesOptions): string[] {
  const {
    quantity,
    prefix = "",
    suffix = "",
    length = 8,
    charset = "alphanumeric",
    customChars,
    separator = "-",
    existingCodes = new Set(),
  } = options;

  const chars = charset === "custom" && customChars 
    ? customChars 
    : CHARSETS[charset as keyof typeof CHARSETS] || CHARSETS.alphanumeric;

  const codes: string[] = [];
  const generatedSet = new Set(existingCodes);
  
  // Safety limit to prevent infinite loops
  const maxAttempts = quantity * 10;
  let attempts = 0;

  while (codes.length < quantity && attempts < maxAttempts) {
    attempts++;
    
    const randomPart = generateRandomCode(length, chars);
    const parts = [prefix, randomPart, suffix].filter(Boolean);
    const code = parts.join(separator);

    if (!generatedSet.has(code)) {
      generatedSet.add(code);
      codes.push(code);
    }
  }

  if (codes.length < quantity) {
    console.warn(
      `Could only generate ${codes.length} unique codes out of ${quantity} requested`
    );
  }

  return codes;
}

/**
 * Validate a voucher code format
 */
export function validateVoucherCode(code: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!code || code.trim().length === 0) {
    errors.push("Code cannot be empty");
  }

  if (code.length < 3) {
    errors.push("Code must be at least 3 characters");
  }

  if (code.length > 50) {
    errors.push("Code cannot exceed 50 characters");
  }

  // Check for invalid characters
  if (!/^[A-Za-z0-9\-_]+$/.test(code)) {
    errors.push("Code can only contain letters, numbers, hyphens, and underscores");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format a code for display (uppercase, trimmed)
 */
export function formatVoucherCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Generate a preview of what codes will look like
 */
export function generateCodePreview(options: Omit<GenerateCodesOptions, "quantity">): string {
  const codes = generateVoucherCodes({ ...options, quantity: 1 });
  return codes[0] || "";
}

/**
 * Estimate the number of possible unique codes
 */
export function estimateUniqueCodeCount(options: {
  length: number;
  charset: "alphanumeric" | "alphabetic" | "numeric" | "custom";
  customChars?: string;
}): number {
  const { length, charset, customChars } = options;
  
  const chars = charset === "custom" && customChars 
    ? customChars 
    : CHARSETS[charset as keyof typeof CHARSETS] || CHARSETS.alphanumeric;

  return Math.pow(chars.length, length);
}

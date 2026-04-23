// Stub — service validation not yet implemented
type ValidationResult = { valid: boolean; error?: string };

export const ServiceValidator = {
  validate(..._args: unknown[]): ValidationResult { return { valid: true }; },
  validateEmail(email: string): ValidationResult {
    return email.includes("@") ? { valid: true } : { valid: false, error: "Invalid email" };
  },
  validateTextLength(text: string, max: number, min = 0): ValidationResult {
    if (text.length < min) return { valid: false, error: `Too short (min ${min})` };
    if (text.length > max) return { valid: false, error: `Too long (max ${max})` };
    return { valid: true };
  },
};

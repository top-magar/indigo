// Stub — service error handler not yet implemented
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ServiceErrorHandler: Record<string, (...args: any[]) => any> = {
  handle(error: unknown) { console.error("[ServiceError]", error); },
  wrap<T>(fn: () => Promise<T>) { return fn(); },
  async withRetry(fn: () => Promise<unknown>, _opts?: unknown) { return fn(); },
};

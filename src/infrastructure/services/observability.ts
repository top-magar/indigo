// Stub — observability not yet implemented
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ServiceObservability: Record<string, (...args: any[]) => any> = new Proxy({}, {
  get: (_target, prop) => {
    if (prop === 'trackOperation') return async (_n: string, _p: string, fn: () => Promise<unknown>) => fn();
    if (prop === 'startSpan') return () => ({ end() {} });
    return () => {};
  },
});

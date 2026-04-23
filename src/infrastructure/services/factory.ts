// Stub — service factory not yet implemented
import type { EmailProvider } from './providers/types';

export const ServiceFactory = {
  getEmailProvider(): EmailProvider {
    return { send: async () => ({ success: false, error: "Not configured" }) } as unknown as EmailProvider;
  },
};

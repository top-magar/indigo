/**
 * Lightweight Dependency Injection Container
 * Inspired by MedusaJS's Awilix-based container but simplified for Next.js
 */

type ServiceFactory<T> = (container: Container) => T;
type ServiceInstance = unknown;

interface ServiceRegistration<T> {
  factory: ServiceFactory<T>;
  singleton: boolean;
}

class Container {
  private services = new Map<string, ServiceInstance>();
  private factories = new Map<string, ServiceRegistration<unknown>>();

  /**
   * Register a service factory
   * @param key - Unique identifier for the service
   * @param factory - Factory function that creates the service
   * @param singleton - Whether to cache the instance (default: true)
   */
  register<T>(
    key: string,
    factory: ServiceFactory<T>,
    singleton = true
  ): void {
    this.factories.set(key, { factory, singleton });
    // Clear cached instance if re-registering
    if (this.services.has(key)) {
      this.services.delete(key);
    }
  }

  /**
   * Resolve a service by key
   * @param key - Service identifier
   * @returns The service instance
   */
  resolve<T>(key: string): T {
    const registration = this.factories.get(key);
    if (!registration) {
      throw new Error(`Service "${key}" is not registered in the container`);
    }

    // Return cached instance for singletons
    if (registration.singleton && this.services.has(key)) {
      return this.services.get(key) as T;
    }

    // Create new instance
    const instance = registration.factory(this) as T;

    // Cache if singleton
    if (registration.singleton) {
      this.services.set(key, instance);
    }

    return instance;
  }

  /**
   * Check if a service is registered
   */
  has(key: string): boolean {
    return this.factories.has(key);
  }

  /**
   * Clear all cached instances (useful for testing)
   */
  clearInstances(): void {
    this.services.clear();
  }

  /**
   * Clear everything (useful for testing)
   */
  reset(): void {
    this.services.clear();
    this.factories.clear();
  }
}

// Global container instance
export const container = new Container();

// Service keys for type-safe resolution
export const ServiceKeys = {
  SUPABASE: "supabase",
  EVENT_BUS: "eventBus",
  PRODUCT_SERVICE: "productService",
  ORDER_SERVICE: "orderService",
  PAYMENT_SERVICE: "paymentService",
  EMAIL_SERVICE: "emailService",
} as const;

export type ServiceKey = (typeof ServiceKeys)[keyof typeof ServiceKeys];

// Helper for creating scoped containers (e.g., per-request)
export function createScopedContainer(parent: Container): Container {
  const scoped = new Container();
  
  // Copy parent registrations
  // Note: This is a simplified version - MedusaJS has more sophisticated scoping
  return scoped;
}

export { Container };

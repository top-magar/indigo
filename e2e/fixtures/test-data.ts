/**
 * E2E Test Data Fixtures
 * 
 * Provides consistent test data for E2E tests.
 * Uses unique identifiers to avoid conflicts between test runs.
 */

export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createTestTenant() {
  const id = generateTestId()
  return {
    name: `Test Store ${id}`,
    slug: `test-store-${id}`,
    email: `test-${id}@example.com`,
    password: 'TestPassword123!',
  }
}

export function createTestProduct() {
  const id = generateTestId()
  return {
    name: `Test Product ${id}`,
    slug: `test-product-${id}`,
    description: 'A test product for E2E testing',
    price: '29.99',
    compareAtPrice: '39.99',
    status: 'active' as const,
    sku: `SKU-${id}`,
    quantity: 100,
  }
}

export function createTestCustomer() {
  const id = generateTestId()
  return {
    email: `customer-${id}@example.com`,
    name: 'Test Customer',
    phone: '+1234567890',
    address: {
      line1: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'US',
    },
  }
}

export function createTestOrder() {
  return {
    customer: createTestCustomer(),
    items: [
      { productId: '', quantity: 2 }, // productId filled at runtime
    ],
  }
}

// Test store slugs for existing stores (if seeded)
export const SEEDED_STORES = {
  demo: 'demo-store',
  test: 'test-store',
}

// Test credentials for seeded users (if any)
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
  },
  merchant: {
    email: 'merchant@example.com',
    password: 'merchant123',
  },
}

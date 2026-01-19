/**
 * Comprehensive Mock Data Seed Script
 * 
 * Generates realistic e-commerce data for development and testing.
 * Uses Drizzle ORM and respects multi-tenant isolation.
 * 
 * Usage:
 *   pnpm tsx scripts/seed-mock-data.ts
 *   pnpm tsx scripts/seed-mock-data.ts --tenant=demo-store
 *   pnpm tsx scripts/seed-mock-data.ts --clean  # Clears existing data first
 * 
 * @see AGENTS.md for project structure
 */

import { db } from "../src/infrastructure/db";
import { tenants } from "../src/db/schema/tenants";
import { users } from "../src/db/schema/users";
import { categories, products, productVariants } from "../src/db/schema/products";
import { customers, addresses } from "../src/db/schema/customers";
import { orders, orderItems, orderEvents } from "../src/db/schema/orders";
import { collections, collectionProducts } from "../src/db/schema/collections";
import { stockMovements, StockMovementType } from "../src/db/schema/inventory";
import { discounts, voucherCodes } from "../src/db/schema/discounts";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  tenants: 2,
  categoriesPerTenant: 6,
  productsPerTenant: 25,
  customersPerTenant: 15,
  ordersPerTenant: 40,
  collectionsPerTenant: 4,
  discountsPerTenant: 3,
};

// ============================================================================
// FAKER-LIKE UTILITIES (No external dependency)
// ============================================================================

const randomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals = 2) => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const randomElement = <T>(arr: T[]): T => arr[randomInt(0, arr.length - 1)];

const randomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
};

const randomDate = (daysBack: number) => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date;
};

const slugify = (text: string) => 
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const generateOrderNumber = () => 
  `ORD-${Date.now().toString(36).toUpperCase()}-${randomInt(1000, 9999)}`;

// ============================================================================
// DATA POOLS
// ============================================================================

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia",
  "Lucas", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Michael",
  "Emily", "Daniel", "Elizabeth", "Jacob", "Sofia", "Logan", "Avery", "Jackson"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez"
];

const CITIES = [
  { city: "New York", state: "NY", country: "US" },
  { city: "Los Angeles", state: "CA", country: "US" },
  { city: "Chicago", state: "IL", country: "US" },
  { city: "Houston", state: "TX", country: "US" },
  { city: "Phoenix", state: "AZ", country: "US" },
  { city: "San Francisco", state: "CA", country: "US" },
  { city: "Seattle", state: "WA", country: "US" },
  { city: "Denver", state: "CO", country: "US" },
  { city: "Boston", state: "MA", country: "US" },
  { city: "Austin", state: "TX", country: "US" },
];

const STREET_NAMES = [
  "Main St", "Oak Ave", "Maple Dr", "Cedar Ln", "Pine Rd", "Elm St",
  "Washington Blvd", "Park Ave", "Lake Dr", "River Rd", "Hill St", "Valley Way"
];

const PRODUCT_ADJECTIVES = [
  "Premium", "Classic", "Modern", "Vintage", "Elegant", "Essential",
  "Luxury", "Artisan", "Organic", "Natural", "Handcrafted", "Designer"
];

const PRODUCT_MATERIALS = [
  "Cotton", "Leather", "Silk", "Wool", "Linen", "Cashmere", "Denim",
  "Canvas", "Velvet", "Suede", "Bamboo", "Hemp"
];

const PRODUCT_TYPES = {
  "Clothing": ["T-Shirt", "Hoodie", "Jacket", "Pants", "Dress", "Sweater", "Shorts"],
  "Accessories": ["Watch", "Bag", "Belt", "Wallet", "Sunglasses", "Hat", "Scarf"],
  "Footwear": ["Sneakers", "Boots", "Sandals", "Loafers", "Heels", "Flats"],
  "Home": ["Pillow", "Blanket", "Candle", "Vase", "Frame", "Lamp", "Rug"],
  "Electronics": ["Headphones", "Speaker", "Charger", "Case", "Stand", "Cable"],
  "Beauty": ["Serum", "Cream", "Oil", "Mask", "Cleanser", "Toner", "Mist"],
};

const COLORS = ["Black", "White", "Navy", "Gray", "Beige", "Brown", "Red", "Blue", "Green"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const ORDER_STATUSES: string[] = ["pending", "confirmed", "processing", "shipped", "delivered", "completed"];
const PAYMENT_STATUSES: string[] = ["pending", "paid", "partially_refunded", "refunded"];
const FULFILLMENT_STATUSES: string[] = ["unfulfilled", "partially_fulfilled", "fulfilled"];

// ============================================================================
// GENERATORS
// ============================================================================

function generatePerson() {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@example.com`,
    phone: `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
  };
}

function generateAddress() {
  const location = randomElement(CITIES);
  return {
    addressLine1: `${randomInt(100, 9999)} ${randomElement(STREET_NAMES)}`,
    addressLine2: randomInt(1, 10) > 7 ? `Apt ${randomInt(1, 500)}` : undefined,
    city: location.city,
    state: location.state,
    postalCode: `${randomInt(10000, 99999)}`,
    country: location.country,
  };
}

function generateProduct(categoryName: string) {
  const types = PRODUCT_TYPES[categoryName as keyof typeof PRODUCT_TYPES] || PRODUCT_TYPES["Clothing"];
  const type = randomElement(types);
  const adjective = randomElement(PRODUCT_ADJECTIVES);
  const material = randomElement(PRODUCT_MATERIALS);
  
  const name = `${adjective} ${material} ${type}`;
  const basePrice = randomFloat(19.99, 299.99);
  const hasDiscount = randomInt(1, 10) > 6;
  
  return {
    name,
    slug: slugify(name) + "-" + randomInt(100, 999),
    description: `Experience the quality of our ${adjective.toLowerCase()} ${type.toLowerCase()}. Made with premium ${material.toLowerCase()} for lasting comfort and style.`,
    price: basePrice.toFixed(2),
    compareAtPrice: hasDiscount ? (basePrice * randomFloat(1.2, 1.5)).toFixed(2) : null,
    costPrice: (basePrice * randomFloat(0.3, 0.5)).toFixed(2),
    sku: `SKU-${type.substring(0, 3).toUpperCase()}-${randomInt(10000, 99999)}`,
    quantity: randomInt(0, 200),
    status: randomElement(["active", "active", "active", "draft", "archived"]) as "active" | "draft" | "archived",
    vendor: randomElement(["Indigo Brand", "Partner Co", "Local Artisan", "Premium Goods"]),
    productType: type,
    images: [
      { url: `https://picsum.photos/seed/${randomInt(1, 1000)}/800/800`, alt: name },
      { url: `https://picsum.photos/seed/${randomInt(1, 1000)}/800/800`, alt: `${name} - View 2` },
    ],
  };
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedMockData(options: { tenantSlug?: string; clean?: boolean } = {}) {
  console.log("🌱 Starting mock data seed...\n");

  // Parse CLI args
  const args = process.argv.slice(2);
  const cleanFlag = args.includes("--clean") || options.clean;
  const tenantArg = args.find(a => a.startsWith("--tenant="));
  const targetTenantSlug = tenantArg?.split("=")[1] || options.tenantSlug;

  if (cleanFlag) {
    console.log("🧹 Cleaning existing data...");
    // Clean in reverse dependency order
    await db.delete(orderItems);
    await db.delete(orderEvents);
    await db.delete(orders);
    await db.delete(collectionProducts);
    await db.delete(collections);
    await db.delete(stockMovements);
    await db.delete(voucherCodes);
    await db.delete(discounts);
    await db.delete(productVariants);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(addresses);
    await db.delete(customers);
    if (!targetTenantSlug) {
      await db.delete(users);
      await db.delete(tenants);
    }
    console.log("✅ Cleaned existing data\n");
  }

  // ============================================================================
  // TENANTS & USERS
  // ============================================================================
  
  const tenantData = [
    { name: "Demo Store", slug: "demo-store", currency: "USD", description: "A demo e-commerce store" },
    { name: "Fashion Hub", slug: "fashion-hub", currency: "USD", description: "Trendy fashion marketplace" },
  ];

  const createdTenants: typeof tenants.$inferSelect[] = [];

  for (const t of tenantData.slice(0, CONFIG.tenants)) {
    if (targetTenantSlug && t.slug !== targetTenantSlug) continue;

    // Check if tenant exists
    const [existing] = await db.select().from(tenants).where(eq(tenants.slug, t.slug)).limit(1);
    
    if (existing) {
      console.log(`📦 Using existing tenant: ${t.name}`);
      createdTenants.push(existing);
    } else {
      const [tenant] = await db.insert(tenants).values(t).returning();
      console.log(`✅ Created tenant: ${tenant.name} (${tenant.slug})`);
      createdTenants.push(tenant);

      // Create admin user
      const hashedPassword = await hash("password123", 10);
      await db.insert(users).values({
        tenantId: tenant.id,
        email: `admin@${t.slug}.com`,
        password: hashedPassword,
        role: "owner",
      });
      console.log(`   👤 Created admin: admin@${t.slug}.com`);
    }
  }

  // ============================================================================
  // SEED DATA PER TENANT
  // ============================================================================

  for (const tenant of createdTenants) {
    console.log(`\n📦 Seeding data for: ${tenant.name}`);

    // --------------------------------------------------------------------------
    // CATEGORIES
    // --------------------------------------------------------------------------
    const categoryNames = Object.keys(PRODUCT_TYPES);
    const createdCategories: typeof categories.$inferSelect[] = [];

    for (const name of categoryNames.slice(0, CONFIG.categoriesPerTenant)) {
      const slug = slugify(name);
      const [existing] = await db.select().from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);

      if (!existing) {
        const [cat] = await db.insert(categories).values({
          tenantId: tenant.id,
          name,
          slug,
          description: `Browse our ${name.toLowerCase()} collection`,
        }).returning();
        createdCategories.push(cat);
      } else {
        createdCategories.push(existing);
      }
    }
    console.log(`   📁 ${createdCategories.length} categories`);

    // --------------------------------------------------------------------------
    // PRODUCTS
    // --------------------------------------------------------------------------
    const createdProducts: typeof products.$inferSelect[] = [];

    for (let i = 0; i < CONFIG.productsPerTenant; i++) {
      const category = randomElement(createdCategories);
      const productData = generateProduct(category.name);

      const [product] = await db.insert(products).values({
        tenantId: tenant.id,
        categoryId: category.id,
        ...productData,
      }).returning();
      createdProducts.push(product);

      // Create variants for some products
      if (randomInt(1, 10) > 5) {
        const colors = randomElements(COLORS, randomInt(2, 4));
        const sizes = randomElements(SIZES, randomInt(3, 5));
        
        for (const color of colors) {
          for (const size of sizes) {
            await db.insert(productVariants).values({
              tenantId: tenant.id,
              productId: product.id,
              name: `${size} / ${color}`,
              sku: `${product.sku}-${size}-${color.substring(0, 2).toUpperCase()}`,
              price: product.price,
              quantity: randomInt(0, 50),
              options: { size, color },
            });
          }
        }
        
        await db.update(products)
          .set({ hasVariants: true })
          .where(eq(products.id, product.id));
      }
    }
    console.log(`   🛍️  ${createdProducts.length} products`);

    // --------------------------------------------------------------------------
    // CUSTOMERS
    // --------------------------------------------------------------------------
    const createdCustomers: typeof customers.$inferSelect[] = [];

    for (let i = 0; i < CONFIG.customersPerTenant; i++) {
      const person = generatePerson();
      const [customer] = await db.insert(customers).values({
        tenantId: tenant.id,
        email: person.email,
        firstName: person.firstName,
        lastName: person.lastName,
        phone: person.phone,
        acceptsMarketing: randomInt(1, 10) > 4,
        isActive: true,
      }).returning();
      createdCustomers.push(customer);

      // Add address
      const addr = generateAddress();
      await db.insert(addresses).values({
        tenantId: tenant.id,
        customerId: customer.id,
        type: "shipping",
        firstName: person.firstName,
        lastName: person.lastName,
        ...addr,
        isDefault: true,
      });
    }
    console.log(`   👥 ${createdCustomers.length} customers`);

    // --------------------------------------------------------------------------
    // ORDERS
    // --------------------------------------------------------------------------
    let ordersCreated = 0;

    for (let i = 0; i < CONFIG.ordersPerTenant; i++) {
      const customer = randomElement(createdCustomers);
      const orderProducts = randomElements(createdProducts, randomInt(1, 5));
      const orderDate = randomDate(90);
      
      // Calculate totals
      let subtotal = 0;
      const items: { product: typeof products.$inferSelect; quantity: number }[] = [];
      
      for (const product of orderProducts) {
        const quantity = randomInt(1, 3);
        subtotal += parseFloat(product.price) * quantity;
        items.push({ product, quantity });
      }

      const shippingTotal = randomFloat(5.99, 15.99);
      const taxTotal = subtotal * 0.08;
      const total = subtotal + shippingTotal + taxTotal;

      const status = randomElement(ORDER_STATUSES);
      const paymentStatus = status === "pending" ? "pending" : randomElement(["paid", "paid", "paid", "pending"]);
      const fulfillmentStatus = ["shipped", "delivered", "completed"].includes(status) 
        ? "fulfilled" 
        : status === "processing" 
          ? randomElement(["unfulfilled", "partially_fulfilled"]) 
          : "unfulfilled";

      const addr = generateAddress();
      const [order] = await db.insert(orders).values({
        tenantId: tenant.id,
        customerId: customer.id,
        orderNumber: generateOrderNumber(),
        status: status,
        paymentStatus: paymentStatus,
        fulfillmentStatus: fulfillmentStatus,
        subtotal: subtotal.toFixed(2),
        shippingTotal: shippingTotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        total: total.toFixed(2),
        currency: tenant.currency || "USD",
        itemsCount: items.reduce((sum, i) => sum + i.quantity, 0),
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        shippingAddress: addr,
        billingAddress: addr,
        shippingMethod: randomElement(["Standard Shipping", "Express Shipping", "Free Shipping"]),
        createdAt: orderDate,
        updatedAt: orderDate,
      }).returning();

      // Add order items
      for (const { product, quantity } of items) {
        await db.insert(orderItems).values({
          tenantId: tenant.id,
          orderId: order.id,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          productImage: (product.images as { url: string }[])?.[0]?.url,
          quantity,
          unitPrice: product.price,
          totalPrice: (parseFloat(product.price) * quantity).toFixed(2),
        });
      }

      // Add order event
      await db.insert(orderEvents).values({
        tenantId: tenant.id,
        orderId: order.id,
        type: "order_created",
        message: `Order ${order.orderNumber} created`,
        createdAt: orderDate,
      });

      ordersCreated++;
    }
    console.log(`   📋 ${ordersCreated} orders`);

    // --------------------------------------------------------------------------
    // COLLECTIONS
    // --------------------------------------------------------------------------
    const collectionNames = ["New Arrivals", "Best Sellers", "Sale Items", "Featured"];
    let collectionsCreated = 0;

    for (const name of collectionNames.slice(0, CONFIG.collectionsPerTenant)) {
      const [collection] = await db.insert(collections).values({
        tenantId: tenant.id,
        name,
        slug: slugify(name),
        description: `${name} collection`,
        isActive: true,
        type: "manual",
      }).returning();

      // Add random products to collection
      const collectionProductsList = randomElements(createdProducts, randomInt(4, 10));
      for (let i = 0; i < collectionProductsList.length; i++) {
        await db.insert(collectionProducts).values({
          collectionId: collection.id,
          productId: collectionProductsList[i].id,
          position: i,
        });
      }
      collectionsCreated++;
    }
    console.log(`   📚 ${collectionsCreated} collections`);

    // --------------------------------------------------------------------------
    // STOCK MOVEMENTS
    // --------------------------------------------------------------------------
    let movementsCreated = 0;
    const movementTypes: StockMovementType[] = ["received", "sold", "adjustment", "return"];

    for (const product of createdProducts.slice(0, 15)) {
      const numMovements = randomInt(2, 5);
      let currentQty = product.quantity || 0;

      for (let i = 0; i < numMovements; i++) {
        const type = randomElement(movementTypes);
        const change = type === "sold" 
          ? -randomInt(1, 10) 
          : type === "received" 
            ? randomInt(10, 50) 
            : randomInt(-5, 5);
        
        const qtyBefore = currentQty;
        currentQty = Math.max(0, currentQty + change);

        await db.insert(stockMovements).values({
          tenantId: tenant.id,
          productId: product.id,
          productName: product.name,
          type,
          quantityBefore: qtyBefore,
          quantityChange: change,
          quantityAfter: currentQty,
          reason: type === "received" ? "Stock replenishment" 
            : type === "sold" ? "Customer order" 
            : type === "return" ? "Customer return"
            : "Inventory adjustment",
          createdAt: randomDate(60),
        });
        movementsCreated++;
      }
    }
    console.log(`   📊 ${movementsCreated} stock movements`);

    // --------------------------------------------------------------------------
    // DISCOUNTS
    // --------------------------------------------------------------------------
    const discountData = [
      { name: "Summer Sale", kind: "sale", type: "percentage", value: "20" },
      { name: "Welcome10", kind: "voucher", type: "percentage", value: "10" },
      { name: "Free Shipping", kind: "voucher", type: "free_shipping", value: "0" },
    ];

    for (const d of discountData.slice(0, CONFIG.discountsPerTenant)) {
      const [discount] = await db.insert(discounts).values({
        tenantId: tenant.id,
        name: d.name,
        kind: d.kind as "sale" | "voucher",
        type: d.type as "percentage" | "fixed" | "free_shipping",
        value: d.value,
        scope: "entire_order",
        isActive: true,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      }).returning();

      if (d.kind === "voucher") {
        await db.insert(voucherCodes).values({
          tenantId: tenant.id,
          discountId: discount.id,
          code: d.name.toUpperCase().replace(/\s/g, ""),
          status: "active",
        });
      }
    }
    console.log(`   🏷️  ${discountData.length} discounts`);
  }

  console.log("\n✅ Mock data seeding complete!");
  console.log("\n📝 Login credentials:");
  for (const tenant of createdTenants) {
    console.log(`   ${tenant.name}: admin@${tenant.slug}.com / password123`);
  }
  console.log(`\n🌐 Store URLs:`);
  for (const tenant of createdTenants) {
    console.log(`   http://${tenant.slug}.localhost:3000`);
  }
}

// Run
seedMockData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });

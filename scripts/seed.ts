import postgres from "postgres";
import { randomUUID } from "crypto";

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUDO_DATABASE_URL;
if (!DATABASE_URL) { console.error("Set DATABASE_URL"); process.exit(1); }

const sql = postgres(DATABASE_URL);

const TENANT_ID = randomUUID();
const TENANT_SLUG = "demo-store";

const CATEGORIES = [
  { name: "Clothing", slug: "clothing" },
  { name: "Electronics", slug: "electronics" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Beauty", slug: "beauty" },
  { name: "Food & Beverages", slug: "food-beverages" },
];

const PRODUCTS = [
  { name: "Dhaka Topi", slug: "dhaka-topi", price: "450", quantity: 120, category: "clothing", sku: "CLO-001", description: "Traditional Nepali cap made from Dhaka fabric. Handwoven in Palpa." },
  { name: "Pashmina Shawl", slug: "pashmina-shawl", price: "3500", quantity: 45, category: "clothing", sku: "CLO-002", description: "100% pure cashmere pashmina from the Himalayas." },
  { name: "Khukuri Knife", slug: "khukuri-knife", price: "2800", quantity: 30, category: "home-kitchen", sku: "HOM-001", description: "Authentic Gurkha khukuri. Hand-forged in Bhojpur." },
  { name: "Singing Bowl", slug: "singing-bowl", price: "4200", quantity: 25, category: "home-kitchen", sku: "HOM-002", description: "Handmade Tibetan singing bowl. 7-metal alloy." },
  { name: "Yak Wool Blanket", slug: "yak-wool-blanket", price: "6500", quantity: 15, category: "home-kitchen", sku: "HOM-003", description: "Warm yak wool blanket from Mustang." },
  { name: "Nepali Tea (Ilam)", slug: "nepali-tea-ilam", price: "850", quantity: 200, category: "food-beverages", sku: "FOD-001", description: "Premium orthodox tea from Ilam. First flush. 250g." },
  { name: "Himalayan Honey", slug: "himalayan-honey", price: "1200", quantity: 80, category: "food-beverages", sku: "FOD-002", description: "Wild cliff honey harvested by Gurung honey hunters." },
  { name: "Lokta Paper Journal", slug: "lokta-paper-journal", price: "650", quantity: 60, category: "home-kitchen", sku: "HOM-004", description: "Handmade journal using traditional Lokta bark paper." },
  { name: "Thangka Painting Print", slug: "thangka-painting-print", price: "1800", quantity: 20, category: "home-kitchen", sku: "HOM-005", description: "High-quality print of traditional Buddhist Thangka painting." },
  { name: "Rudraksha Mala", slug: "rudraksha-mala", price: "950", quantity: 100, category: "beauty", sku: "BEA-001", description: "108-bead Rudraksha prayer mala. 5-mukhi beads." },
  { name: "Himalayan Salt Lamp", slug: "himalayan-salt-lamp", price: "1500", quantity: 40, category: "home-kitchen", sku: "HOM-006", description: "Natural pink Himalayan salt lamp. 3-5kg." },
  { name: "Nepali Coffee (Gulmi)", slug: "nepali-coffee-gulmi", price: "750", quantity: 150, category: "food-beverages", sku: "FOD-003", description: "Single-origin Arabica coffee from Gulmi. Medium roast." },
];

async function seed() {
  console.log("🌱 Seeding demo data...\n");

  // Clean existing demo tenant
  await sql`DELETE FROM tenants WHERE slug = ${TENANT_SLUG}`;

  // Create tenant
  await sql`INSERT INTO tenants (id, name, slug, currency) VALUES (${TENANT_ID}, 'Demo Store Nepal', ${TENANT_SLUG}, 'NPR')`;
  console.log("✅ Tenant: Demo Store Nepal (slug: demo-store)");

  // Create categories
  const categoryIds: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const id = randomUUID();
    categoryIds[cat.slug] = id;
    await sql`INSERT INTO categories (id, tenant_id, name, slug) VALUES (${id}, ${TENANT_ID}, ${cat.name}, ${cat.slug})`;
  }
  console.log(`✅ Categories: ${CATEGORIES.length}`);

  // Create products
  for (const p of PRODUCTS) {
    const id = randomUUID();
    const images = JSON.stringify([{ url: `https://placehold.co/600x600/1a1a2e/ffffff?text=${encodeURIComponent(p.name)}`, alt: p.name }]);
    await sql`INSERT INTO products (id, tenant_id, category_id, name, slug, description, price, quantity, sku, status, images) VALUES (${id}, ${TENANT_ID}, ${categoryIds[p.category]}, ${p.name}, ${p.slug}, ${p.description}, ${p.price}, ${p.quantity}, ${p.sku}, 'active', ${images}::jsonb)`;
  }
  console.log(`✅ Products: ${PRODUCTS.length}`);

  console.log(`\n🎉 Done!\n`);
  console.log(`To use: link your Supabase auth user to this tenant.`);
  console.log(`Run: UPDATE users SET tenant_id = '${TENANT_ID}' WHERE email = 'YOUR_EMAIL';`);
  console.log(`\n🌐 Storefront: /store/${TENANT_SLUG}`);
}

seed()
  .then(() => { sql.end(); process.exit(0); })
  .catch((err) => { console.error("❌", err); sql.end(); process.exit(1); });

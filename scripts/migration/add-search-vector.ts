import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    console.log("Adding search_vector to products...");

    // 1. Add tsvector column
    await sql`
      ALTER TABLE public.products
      ADD COLUMN IF NOT EXISTS search_vector tsvector
      GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(vendor, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(product_type, '')), 'C')
      ) STORED
    `;
    console.log("✓ Added search_vector column");

    // 2. Create GIN index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_products_search_vector
      ON public.products USING GIN (search_vector)
    `;
    console.log("✓ Created GIN index");

    // 3. Verify
    const result = await sql`
      SELECT count(*) FROM products WHERE search_vector IS NOT NULL
    `;
    console.log(`✓ ${result[0].count} products have search vectors`);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();

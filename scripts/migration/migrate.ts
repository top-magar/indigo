import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../src/infrastructure/db";

async function run() {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations complete.");
    process.exit(0);
}

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});

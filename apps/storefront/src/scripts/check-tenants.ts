
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";

async function main() {
    console.log("Checking tenants...");
    const allTenants = await db.select().from(tenants);
    console.log("Tenants found:", allTenants);
    
    if (allTenants.length === 0) {
        console.log("No tenants found. Creating one...");
        const newId = crypto.randomUUID();
        await db.insert(tenants).values({
            id: newId,
            name: "Test Tenant",
            slug: "test-tenant",
        });
        console.log("Created tenant:", newId);
    }
}

main().catch(console.error).finally(() => process.exit(0));

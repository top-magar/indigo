import { db } from "../lib/db";
import { tenants, users } from "../db/schema";
import { hash } from "bcryptjs";

async function main() {
    console.log("Creating Demo User...");

    // 1. Create Tenant
    const [tenant] = await db.insert(tenants).values({
        name: "Demo Store",
    }).returning();
    console.log(`Created Tenant: ${tenant.name} (${tenant.id})`);

    // 2. Hash Password
    const hashedPassword = await hash("password123", 10);

    // 3. Create User
    const [user] = await db.insert(users).values({
        tenantId: tenant.id,
        email: "admin@demo.com",
        password: hashedPassword, // In real app, hash this!
        role: "owner",
    }).returning();

    console.log(`Created User: ${user.email}`);
    console.log(`Password: password123`);
    console.log(`\nLogin at http://localhost:3000/login`);

    process.exit(0);
}

main().catch(console.error);

import "server-only";
import { customers } from "@/db/schema/customers";
import { orders } from "@/db/schema/orders";
import { eq, ilike, or, desc, gte, count, sum, sql } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";
import { QueryOptions } from "@/infrastructure/repositories/base";

/**
 * Customer input type for create operations
 */
export type CustomerCreateInput = {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptsMarketing?: boolean;
};

/**
 * Customer input type for update operations
 */
export type CustomerUpdateInput = Partial<CustomerCreateInput>;

/**
 * Customer statistics
 */
export interface CustomerStats {
    total: number;
    newThisMonth: number;
    returning: number;
    subscribed: number;
    totalRevenue: number;
    avgValue: number;
}

/**
 * Customer Repository
 */
export class CustomerRepository {
    /**
     * Find all customers for a tenant with optional pagination
     */
    async findAll(tenantId: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            let query = tx.select().from(customers).orderBy(desc(customers.createdAt));

            if (options?.limit) {
                query = query.limit(options.limit) as typeof query;
            }

            if (options?.offset) {
                query = query.offset(options.offset) as typeof query;
            }

            return query;
        });
    }

    /**
     * Find a customer by ID
     */
    async findById(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(customers)
                .where(eq(customers.id, id))
                .limit(1);

            return result || null;
        });
    }

    /**
     * Find a customer by email
     */
    async findByEmail(tenantId: string, email: string) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .select()
                .from(customers)
                .where(eq(customers.email, email.toLowerCase()))
                .limit(1);

            return result || null;
        });
    }

    /**
     * Search customers by name or email
     */
    async search(tenantId: string, query: string, options?: QueryOptions) {
        return withTenant(tenantId, async (tx) => {
            const searchPattern = `%${query}%`;
            let dbQuery = tx
                .select()
                .from(customers)
                .where(
                    or(
                        ilike(customers.email, searchPattern),
                        ilike(customers.firstName, searchPattern),
                        ilike(customers.lastName, searchPattern)
                    )
                )
                .orderBy(desc(customers.createdAt));

            if (options?.limit) {
                dbQuery = dbQuery.limit(options.limit) as typeof dbQuery;
            }

            if (options?.offset) {
                dbQuery = dbQuery.offset(options.offset) as typeof dbQuery;
            }

            return dbQuery;
        });
    }

    /**
     * Get customer statistics for dashboard
     */
    async getStats(tenantId: string): Promise<CustomerStats> {
        return withTenant(tenantId, async (tx) => {
            // Total customers
            const [totalResult] = await tx
                .select({ count: count() })
                .from(customers);
            const total = Number(totalResult?.count || 0);

            // New this month
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const [newResult] = await tx
                .select({ count: count() })
                .from(customers)
                .where(gte(customers.createdAt, startOfMonth));
            const newThisMonth = Number(newResult?.count || 0);

            // Subscribed to marketing
            const [subscribedResult] = await tx
                .select({ count: count() })
                .from(customers)
                .where(eq(customers.acceptsMarketing, true));
            const subscribed = Number(subscribedResult?.count || 0);

            // Revenue stats from orders
            const revenueData = await tx
                .select({
                    customerId: orders.customerId,
                    totalRevenue: sum(orders.total),
                    orderCount: count(orders.id),
                })
                .from(orders)
                .where(eq(orders.paymentStatus, "paid"))
                .groupBy(orders.customerId);

            const totalRevenue = revenueData.reduce(
                (acc, row) => acc + Number(row.totalRevenue || 0),
                0
            );

            // Returning customers (more than 1 order)
            const returning = revenueData.filter(
                (row) => Number(row.orderCount) > 1
            ).length;

            const avgValue = total > 0 ? totalRevenue / total : 0;

            return {
                total,
                newThisMonth,
                returning,
                subscribed,
                totalRevenue,
                avgValue,
            };
        });
    }

    /**
     * Create a new customer
     */
    async create(tenantId: string, data: CustomerCreateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .insert(customers)
                .values({
                    tenantId,
                    email: data.email.toLowerCase(),
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    acceptsMarketing: data.acceptsMarketing ?? false,
                })
                .returning();

            return result;
        });
    }

    /**
     * Update an existing customer
     */
    async update(tenantId: string, id: string, data: CustomerUpdateInput) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .update(customers)
                .set({
                    ...(data.email && { email: data.email.toLowerCase() }),
                    ...(data.firstName !== undefined && { firstName: data.firstName }),
                    ...(data.lastName !== undefined && { lastName: data.lastName }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.acceptsMarketing !== undefined && { acceptsMarketing: data.acceptsMarketing }),
                    updatedAt: new Date(),
                })
                .where(eq(customers.id, id))
                .returning();

            return result || null;
        });
    }

    /**
     * Delete a customer
     */
    async delete(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            await tx.delete(customers).where(eq(customers.id, id));
        });
    }

    /**
     * Update marketing preference
     */
    async updateMarketingPreference(
        tenantId: string,
        id: string,
        acceptsMarketing: boolean
    ) {
        return withTenant(tenantId, async (tx) => {
            const [result] = await tx
                .update(customers)
                .set({
                    acceptsMarketing,
                    updatedAt: new Date(),
                })
                .where(eq(customers.id, id))
                .returning();

            return result || null;
        });
    }

    /**
     * Get customer with order statistics
     */
    async getWithOrderStats(tenantId: string, id: string) {
        return withTenant(tenantId, async (tx) => {
            const [customer] = await tx
                .select()
                .from(customers)
                .where(eq(customers.id, id))
                .limit(1);

            if (!customer) return null;

            const [orderStats] = await tx
                .select({
                    orderCount: count(orders.id),
                    totalSpent: sum(orders.total),
                    lastOrderDate: sql<Date>`max(${orders.createdAt})`,
                })
                .from(orders)
                .where(eq(orders.customerId, id));

            return {
                ...customer,
                orderCount: Number(orderStats?.orderCount || 0),
                totalSpent: Number(orderStats?.totalSpent || 0),
                lastOrderDate: orderStats?.lastOrderDate || null,
            };
        });
    }
}

// Singleton instance
export const customerRepository = new CustomerRepository();

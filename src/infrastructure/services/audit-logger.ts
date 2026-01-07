import "server-only";
import { withTenant, type Transaction } from "@/infrastructure/db";
import { auditLogs, type AuditAction, type AuditEntityType, type AuditMetadata, type NewAuditLog } from "@/db/schema/audit-logs";

/**
 * Audit Logger Service
 * 
 * Provides comprehensive audit logging for all tenant actions.
 * Uses withTenant() for proper RLS isolation.
 * 
 * @see SYSTEM-ARCHITECTURE.md Security & Compliance
 * @see scripts/supabase/020-audit-logs.sql
 * 
 * @example
 * ```typescript
 * // Log a product creation
 * await auditLogger.logCreate(
 *   tenantId,
 *   "product",
 *   productId,
 *   { name: "New Product", price: 99.99 },
 *   { userId, ...extractRequestMetadata(request) }
 * );
 * 
 * // Log a custom action
 * await auditLogger.logAction(
 *   tenantId,
 *   "checkout.complete",
 *   { orderId, total: 199.99, ...extractRequestMetadata(request) }
 * );
 * ```
 */
export class AuditLogger {
    /**
     * Main logging method - creates an audit log entry
     * 
     * @param tenantId - Tenant UUID for RLS isolation
     * @param action - Action type (e.g., 'product.create')
     * @param data - Audit log data
     */
    async log(
        tenantId: string,
        action: AuditAction,
        data: {
            userId?: string;
            entityType: AuditEntityType;
            entityId?: string;
            oldValues?: Record<string, unknown> | null;
            newValues?: Record<string, unknown> | null;
            metadata?: AuditMetadata;
        }
    ): Promise<string> {
        return withTenant(tenantId, async (tx) => {
            return this.logWithTransaction(tx, tenantId, action, data);
        });
    }

    /**
     * Log within an existing transaction
     * Useful when audit logging is part of a larger transaction
     * 
     * @param tx - Existing transaction
     * @param tenantId - Tenant UUID
     * @param action - Action type
     * @param data - Audit log data
     */
    async logWithTransaction(
        tx: Transaction,
        tenantId: string,
        action: AuditAction,
        data: {
            userId?: string;
            entityType: AuditEntityType;
            entityId?: string;
            oldValues?: Record<string, unknown> | null;
            newValues?: Record<string, unknown> | null;
            metadata?: AuditMetadata;
        }
    ): Promise<string> {
        const entry: NewAuditLog = {
            tenantId,
            userId: data.userId ?? null,
            action,
            entityType: data.entityType,
            entityId: data.entityId ?? null,
            oldValues: data.oldValues ?? null,
            newValues: data.newValues ?? null,
            metadata: data.metadata ?? {},
        };

        const [result] = await tx.insert(auditLogs).values(entry).returning({ id: auditLogs.id });
        return result.id;
    }

    /**
     * Log entity creation
     * 
     * @param tenantId - Tenant UUID
     * @param entityType - Type of entity created
     * @param entityId - ID of the created entity
     * @param newValues - The created entity data
     * @param metadata - Request metadata (IP, user agent, etc.)
     */
    async logCreate(
        tenantId: string,
        entityType: AuditEntityType,
        entityId: string,
        newValues: Record<string, unknown>,
        metadata?: AuditMetadata & { userId?: string }
    ): Promise<string> {
        const { userId, ...restMetadata } = metadata ?? {};
        return this.log(tenantId, `${entityType}.create` as AuditAction, {
            userId,
            entityType,
            entityId,
            newValues,
            metadata: restMetadata,
        });
    }

    /**
     * Log entity update
     * 
     * @param tenantId - Tenant UUID
     * @param entityType - Type of entity updated
     * @param entityId - ID of the updated entity
     * @param oldValues - Previous entity state
     * @param newValues - New entity state
     * @param metadata - Request metadata
     */
    async logUpdate(
        tenantId: string,
        entityType: AuditEntityType,
        entityId: string,
        oldValues: Record<string, unknown>,
        newValues: Record<string, unknown>,
        metadata?: AuditMetadata & { userId?: string }
    ): Promise<string> {
        const { userId, ...restMetadata } = metadata ?? {};
        return this.log(tenantId, `${entityType}.update` as AuditAction, {
            userId,
            entityType,
            entityId,
            oldValues,
            newValues,
            metadata: restMetadata,
        });
    }

    /**
     * Log entity deletion
     * 
     * @param tenantId - Tenant UUID
     * @param entityType - Type of entity deleted
     * @param entityId - ID of the deleted entity
     * @param oldValues - Entity state before deletion
     * @param metadata - Request metadata
     */
    async logDelete(
        tenantId: string,
        entityType: AuditEntityType,
        entityId: string,
        oldValues: Record<string, unknown>,
        metadata?: AuditMetadata & { userId?: string }
    ): Promise<string> {
        const { userId, ...restMetadata } = metadata ?? {};
        return this.log(tenantId, `${entityType}.delete` as AuditAction, {
            userId,
            entityType,
            entityId,
            oldValues,
            metadata: restMetadata,
        });
    }

    /**
     * Log a custom action (not tied to CRUD operations)
     * 
     * @param tenantId - Tenant UUID
     * @param action - Custom action type
     * @param metadata - Action metadata including any relevant context
     */
    async logAction(
        tenantId: string,
        action: AuditAction,
        metadata?: AuditMetadata & { 
            userId?: string;
            entityType?: AuditEntityType;
            entityId?: string;
            data?: Record<string, unknown>;
        }
    ): Promise<string> {
        const { userId, entityType, entityId, data, ...restMetadata } = metadata ?? {};
        
        // Derive entity type from action if not provided
        const derivedEntityType = entityType ?? action.split(".")[0] as AuditEntityType;
        
        return this.log(tenantId, action, {
            userId,
            entityType: derivedEntityType,
            entityId,
            newValues: data,
            metadata: restMetadata,
        });
    }

    /**
     * Log authentication event
     * 
     * @param tenantId - Tenant UUID
     * @param action - Auth action (login, logout, register)
     * @param userId - User ID (if available)
     * @param metadata - Request metadata
     */
    async logAuth(
        tenantId: string,
        action: "auth.login" | "auth.logout" | "auth.register",
        userId: string | undefined,
        metadata?: AuditMetadata
    ): Promise<string> {
        return this.log(tenantId, action, {
            userId,
            entityType: "auth",
            metadata,
        });
    }

    /**
     * Log checkout event
     * 
     * @param tenantId - Tenant UUID
     * @param action - Checkout action (start, complete, fail)
     * @param data - Checkout data (cart ID, order ID, etc.)
     * @param metadata - Request metadata
     */
    async logCheckout(
        tenantId: string,
        action: "checkout.start" | "checkout.complete" | "checkout.fail",
        data: {
            cartId?: string;
            orderId?: string;
            total?: number;
            error?: string;
        },
        metadata?: AuditMetadata & { userId?: string }
    ): Promise<string> {
        const { userId, ...restMetadata } = metadata ?? {};
        return this.log(tenantId, action, {
            userId,
            entityType: "checkout",
            entityId: data.orderId ?? data.cartId,
            newValues: data,
            metadata: restMetadata,
        });
    }

    /**
     * Log order status change
     * 
     * @param tenantId - Tenant UUID
     * @param orderId - Order ID
     * @param oldStatus - Previous status
     * @param newStatus - New status
     * @param metadata - Request metadata
     */
    async logOrderStatusChange(
        tenantId: string,
        orderId: string,
        oldStatus: string,
        newStatus: string,
        metadata?: AuditMetadata & { userId?: string }
    ): Promise<string> {
        const { userId, ...restMetadata } = metadata ?? {};
        return this.log(tenantId, "order.status_change", {
            userId,
            entityType: "order",
            entityId: orderId,
            oldValues: { status: oldStatus },
            newValues: { status: newStatus },
            metadata: restMetadata,
        });
    }
}

/**
 * Extract request metadata for audit logging
 * 
 * @param request - Incoming request object
 * @returns Metadata object with IP, user agent, etc.
 * 
 * @example
 * ```typescript
 * const metadata = extractRequestMetadata(request);
 * await auditLogger.logCreate(tenantId, "product", productId, data, metadata);
 * ```
 */
export function extractRequestMetadata(request: Request): AuditMetadata {
    const metadata: AuditMetadata = {};

    // Extract IP address from various headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        metadata.ipAddress = forwardedFor.split(",")[0].trim();
    } else {
        const realIp = request.headers.get("x-real-ip");
        if (realIp) {
            metadata.ipAddress = realIp.trim();
        } else {
            // Cloudflare
            const cfConnectingIp = request.headers.get("cf-connecting-ip");
            if (cfConnectingIp) {
                metadata.ipAddress = cfConnectingIp.trim();
            } else {
                // Vercel
                const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
                if (vercelForwardedFor) {
                    metadata.ipAddress = vercelForwardedFor.split(",")[0].trim();
                }
            }
        }
    }

    // Extract user agent
    const userAgent = request.headers.get("user-agent");
    if (userAgent) {
        metadata.userAgent = userAgent;
    }

    // Extract request ID if present
    const requestId = request.headers.get("x-request-id") ?? request.headers.get("x-correlation-id");
    if (requestId) {
        metadata.requestId = requestId;
    }

    return metadata;
}

/**
 * Singleton audit logger instance
 * Use this for most cases
 */
export const auditLogger = new AuditLogger();

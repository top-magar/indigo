import { inngest } from "../client";
import { inventoryRepository } from "@/features/inventory/repositories";
import { auditLogger } from "@/infrastructure/services/audit-logger";

/**
 * Process Inventory Decrement Function
 * 
 * Decrements inventory for order items after a successful payment.
 * This runs as a background job to ensure inventory is updated reliably
 * even if there are temporary database issues.
 * 
 * Features:
 * - Automatic retries on failure (5 attempts for inventory operations)
 * - Exponential backoff between retries
 * - Detailed logging and audit trail
 * - Handles both variant-based and product-based inventory
 */
export const processInventoryDecrement = inngest.createFunction(
  {
    id: "process-inventory-decrement",
    name: "Process Inventory Decrement",
    retries: 5, // More retries for inventory operations
  },
  { event: "inventory/decrement" },
  async ({ event, step, logger }) => {
    const { tenantId, orderId, items } = event.data;

    logger.info("Processing inventory decrement", {
      tenantId,
      orderId,
      itemCount: items.length,
    });

    // Filter items with variant IDs
    const variantItems = items.filter((item: { variantId: string; productId?: string | null; quantity: number; productName?: string }) => item.variantId);

    if (variantItems.length === 0) {
      logger.info("No variant items to decrement", { orderId });
      return {
        success: true,
        orderId,
        message: "No variant items to process",
      };
    }

    // Decrement inventory in a step for automatic retries
    const result = await step.run("decrement-stock", async () => {
      const inventoryResult = await inventoryRepository.decrementStockForOrder(
        tenantId,
        orderId,
        variantItems,
        {
          // Allow the order to complete even if stock is insufficient
          // The stock check should happen at checkout time
          skipInsufficientStock: true,
        }
      );

      return inventoryResult;
    });

    // Log any errors that occurred
    if (result.errors.length > 0) {
      logger.warn("Inventory decrement had errors", {
        orderId,
        errors: result.errors,
      });

      // Log audit entry for failed decrements
      await step.run("log-errors", async () => {
        try {
          await auditLogger.logAction(tenantId, "inventory.decrement_partial", {
            entityType: "inventory",
            entityId: orderId,
            data: {
              orderId,
              errors: result.errors,
              successfulItems: result.decrementedItems.length,
            },
          });
        } catch (auditError) {
          // Don't fail the function for audit logging errors
          logger.error("Audit logging failed", { error: auditError });
        }
      });
    }

    logger.info("Inventory decrement completed", {
      orderId,
      itemsDecremented: result.decrementedItems.length,
      totalUnits: result.decrementedItems.reduce((sum, item) => sum + item.decremented, 0),
      errorCount: result.errors.length,
    });

    return {
      success: result.success,
      orderId,
      decrementedItems: result.decrementedItems.length,
      totalUnitsDecremented: result.decrementedItems.reduce((sum, item) => sum + item.decremented, 0),
      errors: result.errors,
    };
  }
);

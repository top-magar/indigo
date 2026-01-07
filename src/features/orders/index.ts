/**
 * Orders Feature
 * 
 * Order management functionality including order processing,
 * fulfillment, returns, and refunds.
 */

// Types
export * from "./types";

// Repositories (OrderStats is also exported from types, so we need to be explicit)
export { 
    orderRepository, 
    OrderRepository,
    type OrderCreateInput,
    type OrderItemCreateInput,
    type OrderStats as RepositoryOrderStats,
} from "./repositories/orders";

// Components
export * from "./components";

// Services (to be added)
// export * from "./services";

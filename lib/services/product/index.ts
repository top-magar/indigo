/**
 * Product Service - Public exports
 */

export {
    createProduct,
    updateStock,
    deleteProduct,
    createProductAction,
    updateStockAction,
    deleteProductAction,
} from './actions';

export type {
    CreateProductInput,
    UpdateStockInput,
} from './actions';

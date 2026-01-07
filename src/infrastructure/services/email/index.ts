/**
 * Email Service - Public exports
 */

export {
    sendEmail,
    sendOrderConfirmation,
    sendOrderShipped,
    sendOrderConfirmationEmail,
    sendOrderNotificationEmail,
    registerEmailListeners,
} from './actions';

export type {
    SendEmailInput,
    EmailTemplate,
} from './actions';

export type {
    OrderDetails,
    OrderItemDetails,
    OrderAddress,
    StoreInfo,
    EmailResult,
} from './types';

export {
    orderConfirmationTemplate,
    orderNotificationTemplate,
} from './templates';

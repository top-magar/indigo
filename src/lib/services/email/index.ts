/**
 * Email Service - Public exports
 */

export {
    sendEmail,
    sendOrderConfirmation,
    sendOrderShipped,
    registerEmailListeners,
} from './actions';

export type {
    SendEmailInput,
    EmailTemplate,
} from './actions';

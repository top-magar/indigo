/**
 * Email Service
 * 
 * Unified email interface with automatic provider selection,
 * error handling, retry logic, and observability
 */

import { ServiceFactory } from './factory';
import { ServiceErrorHandler } from './error-handler';
import { ServiceObservability } from './observability';
import { ServiceValidator } from './validation';
import type { EmailProvider, SendEmailOptions, EmailResult } from './providers/types';

export class EmailService {
  private provider: EmailProvider;

  constructor() {
    this.provider = ServiceFactory.getEmailProvider();
  }

  /**
   * Send email with validation, retry, and observability
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    // Validate recipient email(s)
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    for (const email of recipients) {
      const validation = ServiceValidator.validateEmail(email);
      if (!validation.valid) {
        return { success: false, error: `Invalid recipient: ${validation.error}` };
      }
    }

    // Validate CC emails if provided
    if (options.cc) {
      const ccEmails = Array.isArray(options.cc) ? options.cc : [options.cc];
      for (const email of ccEmails) {
        const validation = ServiceValidator.validateEmail(email);
        if (!validation.valid) {
          return { success: false, error: `Invalid CC recipient: ${validation.error}` };
        }
      }
    }

    // Validate BCC emails if provided
    if (options.bcc) {
      const bccEmails = Array.isArray(options.bcc) ? options.bcc : [options.bcc];
      for (const email of bccEmails) {
        const validation = ServiceValidator.validateEmail(email);
        if (!validation.valid) {
          return { success: false, error: `Invalid BCC recipient: ${validation.error}` };
        }
      }
    }

    // Validate from email if provided
    if (options.from) {
      const validation = ServiceValidator.validateEmail(options.from);
      if (!validation.valid) {
        return { success: false, error: `Invalid sender: ${validation.error}` };
      }
    }

    // Validate replyTo email if provided
    if (options.replyTo) {
      const validation = ServiceValidator.validateEmail(options.replyTo);
      if (!validation.valid) {
        return { success: false, error: `Invalid replyTo: ${validation.error}` };
      }
    }

    // Validate subject
    if (!options.subject || typeof options.subject !== 'string') {
      return { success: false, error: 'Subject is required' };
    }

    const subjectValidation = ServiceValidator.validateTextLength(options.subject, 998, 1);
    if (!subjectValidation.valid) {
      return { success: false, error: `Invalid subject: ${subjectValidation.error}` };
    }

    // Validate content (at least one of html or text must be provided)
    if (!options.html && !options.text) {
      return { success: false, error: 'Either html or text content is required' };
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'send',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.send(options),
          {
            maxRetries: 3,
            backoffMs: 200,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Email send retry attempt ${attempt}`,
                'send',
                this.provider.constructor.name,
                { error: error.message, to: recipients }
              );
            },
          }
        ),
        {
          metadata: {
            to: recipients,
            subject: options.subject,
            hasHtml: !!options.html,
            hasText: !!options.text,
            hasAttachments: !!options.attachments?.length,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Email send failed after retries',
        'send',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  /**
   * Send batch emails with validation and retry
   */
  async sendBatch(emails: SendEmailOptions[]): Promise<EmailResult[]> {
    if (!Array.isArray(emails) || emails.length === 0) {
      return [{ success: false, error: 'Email batch is empty' }];
    }

    if (emails.length > 50) {
      return [{ success: false, error: 'Batch size exceeds maximum of 50 emails' }];
    }

    try {
      const results = await ServiceObservability.trackOperation(
        'sendBatch',
        this.provider.constructor.name,
        async () => {
          // Send all emails in parallel
          return Promise.all(emails.map(email => this.send(email)));
        },
        {
          metadata: {
            batchSize: emails.length,
          },
        }
      );

      return results;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Batch email send failed',
        'sendBatch',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return emails.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Batch send failed',
      }));
    }
  }

  /**
   * Verify email identity (required for some providers like AWS SES)
   */
  async verify(email: string): Promise<{ success: boolean; error?: string }> {
    const validation = ServiceValidator.validateEmail(email);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    try {
      await ServiceObservability.trackOperation(
        'verify',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.verify(email),
          { maxRetries: 2 }
        ),
        { metadata: { email } }
      );

      return { success: true };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Email verification failed',
        'verify',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error), email }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Check if email is verified
   */
  async isVerified(email: string): Promise<boolean> {
    const validation = ServiceValidator.validateEmail(email);
    if (!validation.valid) {
      return false;
    }

    try {
      return await ServiceObservability.trackOperation(
        'isVerified',
        this.provider.constructor.name,
        () => this.provider.isVerified(email),
        { metadata: { email } }
      );
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Failed to check email verification status',
        'isVerified',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error), email }
      );

      return false;
    }
  }

  /**
   * List all verified email identities
   */
  async listVerified(): Promise<{ success: boolean; emails?: string[]; error?: string }> {
    try {
      const emails = await ServiceObservability.trackOperation(
        'listVerified',
        this.provider.constructor.name,
        () => this.provider.listVerified()
      );

      return { success: true, emails };
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Failed to list verified emails',
        'listVerified',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list verified emails',
      };
    }
  }

  /**
   * Get the current provider name
   */
  getProviderName(): string {
    return this.provider.constructor.name;
  }
}

/**
 * AWS Email Provider
 * 
 * Implements EmailProvider interface using AWS SES
 * Wraps existing SES implementation from src/infrastructure/aws/ses.ts
 */

import type { EmailProvider, SendEmailOptions, EmailResult } from './types';
import {
  sendEmailViaSES,
  verifyEmailIdentity,
  isEmailVerified,
  listVerifiedIdentities,
} from '@/infrastructure/aws/ses';

export class AWSEmailProvider implements EmailProvider {
  /**
   * Send email via AWS SES
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    // Convert our interface to SES interface
    const sesOptions = {
      to: options.to,
      subject: options.subject,
      html: options.html || '',
      text: options.text,
      from: options.from,
      replyTo: options.replyTo,
    };

    // Note: AWS SES doesn't support CC/BCC in the basic SendEmailCommand
    // For CC/BCC support, we would need to use SendRawEmailCommand with MIME
    if (options.cc || options.bcc) {
      console.warn('[AWSEmailProvider] CC/BCC not supported in basic SES implementation');
    }

    // Note: Attachments require SendRawEmailCommand with MIME
    if (options.attachments && options.attachments.length > 0) {
      console.warn('[AWSEmailProvider] Attachments not supported in basic SES implementation');
    }

    const result = await sendEmailViaSES(sesOptions);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    };
  }

  /**
   * Verify email identity in AWS SES
   */
  async verify(email: string): Promise<void> {
    const result = await verifyEmailIdentity(email);

    if (!result.success) {
      throw new Error(result.error || 'Failed to verify email identity');
    }
  }

  /**
   * Check if email is verified in AWS SES
   */
  async isVerified(email: string): Promise<boolean> {
    return isEmailVerified(email);
  }

  /**
   * List all verified email identities in AWS SES
   */
  async listVerified(): Promise<string[]> {
    return listVerifiedIdentities();
  }
}

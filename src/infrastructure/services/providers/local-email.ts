/**
 * Local Email Provider
 * 
 * Mock email provider for local development and testing
 * Logs emails to console and stores them in memory
 */

import type { EmailProvider, SendEmailOptions, EmailResult } from './types';

interface StoredEmail {
  id: string;
  timestamp: Date;
  options: SendEmailOptions;
}

export class LocalEmailProvider implements EmailProvider {
  private static emails: StoredEmail[] = [];
  private static verifiedEmails: Set<string> = new Set();
  private static messageIdCounter = 1;

  /**
   * Send email (logs to console and stores in memory)
   */
  async send(options: SendEmailOptions): Promise<EmailResult> {
    const messageId = `local-${Date.now()}-${LocalEmailProvider.messageIdCounter++}`;
    
    const email: StoredEmail = {
      id: messageId,
      timestamp: new Date(),
      options,
    };

    LocalEmailProvider.emails.push(email);

    // Log to console for visibility
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [LocalEmailProvider] Email Sent');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Message ID: ${messageId}`);
    console.log(`From: ${options.from || 'default@indigo.store'}`);
    console.log(`To: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    
    if (options.cc) {
      console.log(`CC: ${Array.isArray(options.cc) ? options.cc.join(', ') : options.cc}`);
    }
    
    if (options.bcc) {
      console.log(`BCC: ${Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc}`);
    }
    
    if (options.replyTo) {
      console.log(`Reply-To: ${options.replyTo}`);
    }
    
    console.log(`Subject: ${options.subject}`);
    
    if (options.text) {
      console.log('\n--- Text Content ---');
      console.log(options.text.substring(0, 200) + (options.text.length > 200 ? '...' : ''));
    }
    
    if (options.html) {
      console.log('\n--- HTML Content ---');
      console.log(options.html.substring(0, 200) + (options.html.length > 200 ? '...' : ''));
    }
    
    if (options.attachments && options.attachments.length > 0) {
      console.log('\n--- Attachments ---');
      options.attachments.forEach(att => {
        console.log(`- ${att.filename} (${att.contentType || 'unknown type'})`);
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      messageId,
    };
  }

  /**
   * Verify email (auto-verifies in local mode)
   */
  async verify(email: string): Promise<void> {
    LocalEmailProvider.verifiedEmails.add(email);
    console.log(`[LocalEmailProvider] Email verified: ${email}`);
  }

  /**
   * Check if email is verified (all emails are auto-verified in local mode)
   */
  async isVerified(email: string): Promise<boolean> {
    // In local mode, auto-verify any email that's checked
    LocalEmailProvider.verifiedEmails.add(email);
    return true;
  }

  /**
   * List all verified emails
   */
  async listVerified(): Promise<string[]> {
    return Array.from(LocalEmailProvider.verifiedEmails);
  }

  /**
   * Get all sent emails (for testing)
   */
  static getSentEmails(): StoredEmail[] {
    return [...LocalEmailProvider.emails];
  }

  /**
   * Get emails sent to a specific recipient (for testing)
   */
  static getEmailsTo(recipient: string): StoredEmail[] {
    return LocalEmailProvider.emails.filter(email => {
      const recipients = Array.isArray(email.options.to) 
        ? email.options.to 
        : [email.options.to];
      return recipients.includes(recipient);
    });
  }

  /**
   * Get email by message ID (for testing)
   */
  static getEmailById(messageId: string): StoredEmail | undefined {
    return LocalEmailProvider.emails.find(email => email.id === messageId);
  }

  /**
   * Clear all sent emails (for testing)
   */
  static clearEmails(): void {
    LocalEmailProvider.emails = [];
  }

  /**
   * Clear verified emails (for testing)
   */
  static clearVerifiedEmails(): void {
    LocalEmailProvider.verifiedEmails.clear();
  }

  /**
   * Reset all state (for testing)
   */
  static reset(): void {
    LocalEmailProvider.clearEmails();
    LocalEmailProvider.clearVerifiedEmails();
    LocalEmailProvider.messageIdCounter = 1;
  }
}

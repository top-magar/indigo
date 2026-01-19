/**
 * AWS SES Email Service
 * 
 * Alternative to Resend for transactional emails
 * Supports order confirmations, notifications, and marketing emails
 * 
 * Note: SES sandbox mode requires both sender AND recipient to be verified.
 * To exit sandbox mode, request production access in AWS Console.
 */

import {
  SESClient,
  SendEmailCommand,
  VerifyEmailIdentityCommand,
  GetIdentityVerificationAttributesCommand,
  ListIdentitiesCommand,
} from '@aws-sdk/client-ses';

// Configuration
const AWS_REGION = process.env.AWS_SES_REGION || process.env.AWS_REGION || 'us-east-1';
const DEFAULT_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@indigo.store';

// Lazy-initialized SES client
let sesClient: SESClient | null = null;

function getSESClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return sesClient;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email via AWS SES
 */
export async function sendEmailViaSES(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, html, text, from = DEFAULT_FROM_EMAIL, replyTo } = options;
  
  const toAddresses = Array.isArray(to) ? to : [to];

  // Validate email addresses
  const invalidEmails = toAddresses.filter(email => !isValidEmail(email));
  if (invalidEmails.length > 0) {
    return { success: false, error: `Invalid email addresses: ${invalidEmails.join(', ')}` };
  }

  try {
    const client = getSESClient();

    const command = new SendEmailCommand({
      Source: from,
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
          ...(text && {
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ...(replyTo && { ReplyToAddresses: [replyTo] }),
    });

    const response = await client.send(command);

    console.log(`[SES] Email sent to ${toAddresses.join(', ')}, MessageId: ${response.MessageId}`);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    console.error('[SES] Send email failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Verify email identity (required for SES sandbox mode)
 */
export async function verifyEmailIdentity(email: string): Promise<EmailResult> {
  try {
    const client = getSESClient();

    await client.send(new VerifyEmailIdentityCommand({
      EmailAddress: email,
    }));

    return { success: true };
  } catch (error) {
    console.error('[SES] Verify email failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify email',
    };
  }
}

/**
 * Check if email is verified
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const client = getSESClient();

    const response = await client.send(new GetIdentityVerificationAttributesCommand({
      Identities: [email],
    }));

    const status = response.VerificationAttributes?.[email]?.VerificationStatus;
    return status === 'Success';
  } catch {
    return false;
  }
}

/**
 * List all verified identities (emails and domains)
 */
export async function listVerifiedIdentities(): Promise<string[]> {
  try {
    const client = getSESClient();
    const response = await client.send(new ListIdentitiesCommand({}));
    
    if (!response.Identities?.length) return [];
    
    // Check which ones are actually verified
    const statusResponse = await client.send(new GetIdentityVerificationAttributesCommand({
      Identities: response.Identities,
    }));
    
    return response.Identities.filter(identity => 
      statusResponse.VerificationAttributes?.[identity]?.VerificationStatus === 'Success'
    );
  } catch {
    return [];
  }
}

/**
 * Check if SES is properly configured with at least one verified identity
 */
export async function isSESConfigured(): Promise<{ configured: boolean; fromEmail?: string }> {
  const verifiedIdentities = await listVerifiedIdentities();
  
  if (verifiedIdentities.length === 0) {
    return { configured: false };
  }
  
  // Prefer the configured from email if it's verified
  if (verifiedIdentities.includes(DEFAULT_FROM_EMAIL)) {
    return { configured: true, fromEmail: DEFAULT_FROM_EMAIL };
  }
  
  // Otherwise use the first verified identity
  return { configured: true, fromEmail: verifiedIdentities[0] };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

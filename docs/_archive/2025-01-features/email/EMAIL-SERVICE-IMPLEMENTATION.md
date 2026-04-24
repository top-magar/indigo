# Email Service Implementation

## Overview

The EmailService provides a unified, provider-agnostic interface for sending emails with built-in validation, retry logic, error handling, and observability.

## Architecture

```
EmailService (Abstraction Layer)
    ↓
ServiceFactory (Provider Selection)
    ↓
EmailProvider Interface
    ↓
├── AWSEmailProvider (AWS SES)
└── LocalEmailProvider (Development/Testing)
```

## Features

- ✅ **Provider Agnostic** - Switch between AWS SES, local, or other providers via environment variable
- ✅ **Validation** - Email addresses, subject, and content validated before sending
- ✅ **Retry Logic** - Automatic retry with exponential backoff (3 retries for send, 2 for verify)
- ✅ **Observability** - All operations tracked with timing and metadata
- ✅ **Error Handling** - Graceful error handling with detailed error messages
- ✅ **Batch Sending** - Send multiple emails efficiently (up to 50 per batch)
- ✅ **Email Verification** - Verify email identities (required for AWS SES sandbox)
- ✅ **Testing Support** - Local provider logs to console and stores emails in memory

## Usage

### Basic Setup

```typescript
import { initializeServiceProviders, EmailService } from '@/infrastructure/services';

// Initialize providers (call once at app startup)
initializeServiceProviders();

// Create service instance
const emailService = new EmailService();
```

### Send Email

```typescript
const result = await emailService.send({
  to: 'customer@example.com',
  subject: 'Welcome to Indigo!',
  html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
  text: 'Welcome! Thank you for joining us.', // Optional plain text
  from: 'noreply@indigo.store', // Optional (uses default)
  replyTo: 'support@indigo.store', // Optional
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Failed to send email:', result.error);
}
```

### Send to Multiple Recipients

```typescript
const result = await emailService.send({
  to: ['user1@example.com', 'user2@example.com'],
  subject: 'Order Confirmation',
  html: '<p>Your order has been confirmed.</p>',
});
```

### Send Batch Emails

```typescript
const results = await emailService.sendBatch([
  {
    to: 'user1@example.com',
    subject: 'Newsletter #1',
    html: '<p>Content 1</p>',
  },
  {
    to: 'user2@example.com',
    subject: 'Newsletter #2',
    html: '<p>Content 2</p>',
  },
]);

// Check individual results
results.forEach((result, index) => {
  if (result.success) {
    console.log(`Email ${index + 1} sent:`, result.messageId);
  } else {
    console.error(`Email ${index + 1} failed:`, result.error);
  }
});
```

### Verify Email Identity (AWS SES)

```typescript
// Verify email (sends verification email)
const verifyResult = await emailService.verify('sender@indigo.store');

if (verifyResult.success) {
  console.log('Verification email sent');
} else {
  console.error('Verification failed:', verifyResult.error);
}

// Check if email is verified
const isVerified = await emailService.isVerified('sender@indigo.store');
console.log('Is verified:', isVerified);

// List all verified emails
const verifiedList = await emailService.listVerified();
console.log('Verified emails:', verifiedList.emails);
```

## Providers

### AWS Email Provider

Uses AWS SES for production email sending.

**Configuration:**
```bash
EMAIL_PROVIDER=aws
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@indigo.store
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**Features:**
- Production-ready email delivery
- High deliverability rates
- Email verification required in sandbox mode
- Cost-effective at scale

**Limitations:**
- CC/BCC not supported in basic implementation (requires MIME)
- Attachments not supported in basic implementation (requires MIME)
- Sandbox mode requires both sender and recipient verification

**Exiting Sandbox Mode:**
1. Go to AWS Console → SES
2. Request production access
3. Provide use case details
4. Wait for approval (usually 24 hours)

### Local Email Provider

Mock provider for development and testing.

**Configuration:**
```bash
EMAIL_PROVIDER=local
```

**Features:**
- Logs emails to console with formatted output
- Stores emails in memory for testing
- Auto-verifies all emails
- No external dependencies

**Testing Utilities:**
```typescript
import { LocalEmailProvider } from '@/infrastructure/services';

// Get all sent emails
const emails = LocalEmailProvider.getSentEmails();

// Get emails to specific recipient
const userEmails = LocalEmailProvider.getEmailsTo('user@example.com');

// Get email by message ID
const email = LocalEmailProvider.getEmailById('local-123456-1');

// Clear emails (for testing)
LocalEmailProvider.clearEmails();

// Reset all state
LocalEmailProvider.reset();
```

## Validation

All inputs are validated before sending:

### Email Address Validation
- Must be valid email format
- Maximum 254 characters
- Applied to: `to`, `from`, `replyTo`, `cc`, `bcc`

### Subject Validation
- Required
- Minimum 1 character
- Maximum 998 characters

### Content Validation
- At least one of `html` or `text` must be provided
- Both can be provided for multipart emails

### Batch Validation
- Maximum 50 emails per batch
- Each email validated individually

## Error Handling

The service handles errors gracefully:

```typescript
const result = await emailService.send({
  to: 'invalid-email', // Invalid format
  subject: 'Test',
  html: '<p>Test</p>',
});

// result.success === false
// result.error === "Invalid recipient: Invalid email format"
```

Common error scenarios:
- Invalid email format
- Missing subject or content
- Provider configuration issues
- Network failures (retried automatically)
- Rate limiting (retried with backoff)

## Retry Logic

Automatic retry with exponential backoff:

- **Send operations**: 3 retries, 200ms initial backoff
- **Verify operations**: 2 retries, 100ms initial backoff
- Backoff doubles on each retry
- Retry attempts logged for debugging

## Observability

All operations are tracked with:
- Operation name
- Provider name
- Execution time
- Success/failure status
- Metadata (recipients, subject, etc.)

Logs are written to console in development:
```
[Services] Operation: send
[Services] Provider: LocalEmailProvider
[Services] Duration: 5ms
[Services] Status: success
```

## Integration Examples

### Order Confirmation Email

```typescript
import { EmailService } from '@/infrastructure/services';

async function sendOrderConfirmation(order: Order) {
  const emailService = new EmailService();
  
  const result = await emailService.send({
    to: order.customerEmail,
    subject: `Order Confirmation #${order.orderNumber}`,
    html: renderOrderConfirmationEmail(order),
    text: renderOrderConfirmationText(order),
    from: 'orders@indigo.store',
    replyTo: 'support@indigo.store',
  });
  
  if (!result.success) {
    console.error('Failed to send order confirmation:', result.error);
    // Handle error (e.g., queue for retry)
  }
  
  return result;
}
```

### Password Reset Email

```typescript
async function sendPasswordResetEmail(email: string, resetToken: string) {
  const emailService = new EmailService();
  
  const resetUrl = `https://indigo.store/reset-password?token=${resetToken}`;
  
  const result = await emailService.send({
    to: email,
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  });
  
  return result;
}
```

### Newsletter Campaign

```typescript
async function sendNewsletterCampaign(subscribers: string[]) {
  const emailService = new EmailService();
  
  // Split into batches of 50
  const batches = chunk(subscribers, 50);
  
  for (const batch of batches) {
    const emails = batch.map(email => ({
      to: email,
      subject: 'Monthly Newsletter - December 2024',
      html: renderNewsletterHtml(),
      text: renderNewsletterText(),
    }));
    
    const results = await emailService.sendBatch(emails);
    
    // Log failures
    results.forEach((result, index) => {
      if (!result.success) {
        console.error(`Failed to send to ${batch[index]}:`, result.error);
      }
    });
    
    // Rate limiting delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

## Testing

### Unit Tests

```typescript
import { EmailService, LocalEmailProvider } from '@/infrastructure/services';

describe('EmailService', () => {
  beforeEach(() => {
    LocalEmailProvider.reset();
  });
  
  it('should send email successfully', async () => {
    const emailService = new EmailService();
    
    const result = await emailService.send({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    });
    
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    
    const sentEmails = LocalEmailProvider.getSentEmails();
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].options.to).toBe('test@example.com');
  });
  
  it('should validate email addresses', async () => {
    const emailService = new EmailService();
    
    const result = await emailService.send({
      to: 'invalid-email',
      subject: 'Test',
      html: '<p>Test</p>',
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid recipient');
  });
});
```

### Integration Tests

```typescript
// Test with AWS SES (requires valid credentials)
process.env.EMAIL_PROVIDER = 'aws';
process.env.AWS_SES_FROM_EMAIL = 'verified@indigo.store';

const emailService = new EmailService();

// Verify sender email first
await emailService.verify('verified@indigo.store');

// Send test email
const result = await emailService.send({
  to: 'verified-recipient@example.com', // Must be verified in sandbox
  subject: 'Integration Test',
  html: '<p>Test email from integration tests</p>',
});

expect(result.success).toBe(true);
```

### Manual Testing

Run the test script:

```bash
# Test with local provider
EMAIL_PROVIDER=local tsx scripts/test-email-service.ts

# Test with AWS SES
EMAIL_PROVIDER=aws \
AWS_SES_FROM_EMAIL=verified@indigo.store \
tsx scripts/test-email-service.ts
```

## Migration from Existing Code

If you have existing email code using the SES functions directly:

**Before:**
```typescript
import { sendEmailViaSES } from '@/infrastructure/aws/ses';

const result = await sendEmailViaSES({
  to: 'customer@example.com',
  subject: 'Welcome',
  html: '<p>Welcome!</p>',
});
```

**After:**
```typescript
import { EmailService } from '@/infrastructure/services';

const emailService = new EmailService();

const result = await emailService.send({
  to: 'customer@example.com',
  subject: 'Welcome',
  html: '<p>Welcome!</p>',
});
```

Benefits of migration:
- Provider-agnostic (easy to switch providers)
- Built-in validation
- Automatic retry logic
- Observability tracking
- Better error handling

## Troubleshooting

### AWS SES Sandbox Mode

**Problem:** Emails not being delivered

**Solution:**
1. Verify both sender and recipient emails in AWS Console
2. Check spam folder
3. Request production access to exit sandbox mode

### Invalid Credentials

**Problem:** `CredentialsProviderError` or authentication failures

**Solution:**
1. Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
2. Check IAM permissions include `ses:SendEmail`, `ses:VerifyEmailIdentity`
3. Verify region is correct (`AWS_REGION` or `AWS_SES_REGION`)

### Rate Limiting

**Problem:** `Throttling` errors from AWS SES

**Solution:**
1. Add delays between batch sends
2. Request rate limit increase in AWS Console
3. Implement queue-based sending for large volumes

### Email Not Received

**Problem:** Email sent successfully but not received

**Solution:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check AWS SES sending statistics for bounces/complaints
4. Verify domain SPF/DKIM records are configured

## Future Enhancements

Potential improvements for future iterations:

- [ ] Support for CC/BCC in AWS provider (using SendRawEmailCommand)
- [ ] Support for attachments (using MIME multipart)
- [ ] Additional providers (SendGrid, Mailgun, Postmark)
- [ ] Email templates system
- [ ] Bounce and complaint handling
- [ ] Email analytics and tracking
- [ ] Queue-based sending for large volumes
- [ ] HTML email validation
- [ ] Inline CSS processing
- [ ] Email preview generation

## Related Documentation

- [AWS Abstraction Layer Implementation](./AWS-ABSTRACTION-LAYER-IMPLEMENTATION.md)
- [AWS Services Setup](./AWS-SERVICES-SETUP-COMPLETE.md)
- [Storage Service Implementation](./AWS-ABSTRACTION-LAYER-STATUS.md)

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in console
3. Test with local provider first
4. Verify AWS credentials and permissions
5. Check AWS SES console for verification status

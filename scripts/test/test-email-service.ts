/**
 * Test Email Service
 * 
 * Tests the EmailService abstraction layer with both AWS and Local providers
 */

import { initializeServiceProviders, EmailService } from '@/infrastructure/services';

async function testEmailService() {
  console.log('🧪 Testing Email Service\n');

  // Initialize providers
  initializeServiceProviders();

  // Test with Local Provider (default in development)
  process.env.EMAIL_PROVIDER = 'local';
  const localEmailService = new EmailService();
  
  console.log(`📧 Using provider: ${localEmailService.getProviderName()}\n`);

  // Test 1: Send simple email
  console.log('Test 1: Send simple email');
  const result1 = await localEmailService.send({
    to: 'customer@example.com',
    subject: 'Welcome to Indigo!',
    html: '<h1>Welcome!</h1><p>Thank you for joining us.</p>',
    text: 'Welcome! Thank you for joining us.',
  });
  console.log('Result:', result1);
  console.log('');

  // Test 2: Send email with multiple recipients
  console.log('Test 2: Send email with multiple recipients');
  const result2 = await localEmailService.send({
    to: ['user1@example.com', 'user2@example.com'],
    subject: 'Order Confirmation',
    html: '<p>Your order has been confirmed.</p>',
    from: 'orders@indigo.store',
    replyTo: 'support@indigo.store',
  });
  console.log('Result:', result2);
  console.log('');

  // Test 3: Send batch emails
  console.log('Test 3: Send batch emails');
  const batchResults = await localEmailService.sendBatch([
    {
      to: 'user1@example.com',
      subject: 'Newsletter #1',
      html: '<p>Newsletter content 1</p>',
    },
    {
      to: 'user2@example.com',
      subject: 'Newsletter #2',
      html: '<p>Newsletter content 2</p>',
    },
  ]);
  console.log('Batch results:', batchResults);
  console.log('');

  // Test 4: Verify email
  console.log('Test 4: Verify email');
  const verifyResult = await localEmailService.verify('verified@indigo.store');
  console.log('Verify result:', verifyResult);
  console.log('');

  // Test 5: Check if email is verified
  console.log('Test 5: Check if email is verified');
  const isVerified = await localEmailService.isVerified('verified@indigo.store');
  console.log('Is verified:', isVerified);
  console.log('');

  // Test 6: List verified emails
  console.log('Test 6: List verified emails');
  const verifiedList = await localEmailService.listVerified();
  console.log('Verified emails:', verifiedList);
  console.log('');

  // Test 7: Validation errors
  console.log('Test 7: Test validation errors');
  const invalidEmail = await localEmailService.send({
    to: 'invalid-email',
    subject: 'Test',
    html: '<p>Test</p>',
  });
  console.log('Invalid email result:', invalidEmail);
  console.log('');

  const noSubject = await localEmailService.send({
    to: 'test@example.com',
    subject: '',
    html: '<p>Test</p>',
  });
  console.log('No subject result:', noSubject);
  console.log('');

  const noContent = await localEmailService.send({
    to: 'test@example.com',
    subject: 'Test',
  });
  console.log('No content result:', noContent);
  console.log('');

  console.log('✅ All tests completed!');
}

// Run tests
testEmailService().catch(console.error);

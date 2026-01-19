#!/usr/bin/env npx tsx
/**
 * Verify an email address in AWS SES
 * 
 * Usage: npx tsx scripts/verify-ses-email.ts your-email@example.com
 * 
 * After running, check your email inbox and click the verification link.
 */

import { SESClient, VerifyEmailIdentityCommand, GetIdentityVerificationAttributesCommand, ListIdentitiesCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function listVerifiedIdentities() {
  const response = await sesClient.send(new ListIdentitiesCommand({}));
  console.log('\n📧 Current SES Identities:', response.Identities?.length ? response.Identities.join(', ') : 'None');
  
  if (response.Identities?.length) {
    const statusResponse = await sesClient.send(new GetIdentityVerificationAttributesCommand({
      Identities: response.Identities,
    }));
    
    console.log('\nVerification Status:');
    for (const [identity, attrs] of Object.entries(statusResponse.VerificationAttributes || {})) {
      console.log(`  ${identity}: ${attrs.VerificationStatus}`);
    }
  }
}

async function verifyEmail(email: string) {
  console.log(`\n🔄 Sending verification email to: ${email}`);
  
  try {
    await sesClient.send(new VerifyEmailIdentityCommand({
      EmailAddress: email,
    }));
    
    console.log(`✅ Verification email sent to ${email}`);
    console.log('\n📬 Next steps:');
    console.log('   1. Check your inbox (and spam folder)');
    console.log('   2. Click the verification link in the email from AWS');
    console.log('   3. Run this script again with --status to check verification');
    console.log(`\n   After verification, update .env.local:`);
    console.log(`   AWS_SES_FROM_EMAIL=${email}`);
  } catch (error) {
    console.error('❌ Failed to send verification:', error);
  }
}

async function checkStatus(email: string) {
  const response = await sesClient.send(new GetIdentityVerificationAttributesCommand({
    Identities: [email],
  }));
  
  const status = response.VerificationAttributes?.[email]?.VerificationStatus;
  
  if (status === 'Success') {
    console.log(`✅ ${email} is VERIFIED and ready to use!`);
  } else if (status === 'Pending') {
    console.log(`⏳ ${email} is PENDING - check your inbox for the verification email`);
  } else {
    console.log(`❌ ${email} is NOT VERIFIED (status: ${status || 'unknown'})`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--list') {
    await listVerifiedIdentities();
    console.log('\n💡 Usage:');
    console.log('   npx tsx scripts/verify-ses-email.ts <email>        # Send verification');
    console.log('   npx tsx scripts/verify-ses-email.ts --status <email>  # Check status');
    console.log('   npx tsx scripts/verify-ses-email.ts --list         # List identities');
    return;
  }
  
  if (args[0] === '--status' && args[1]) {
    await checkStatus(args[1]);
    return;
  }
  
  const email = args[0];
  if (!email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }
  
  await verifyEmail(email);
}

main().catch(console.error);

#!/usr/bin/env tsx

/**
 * Check OpenSearch domain status and update .env.local when ready
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DOMAIN_NAME = 'indigo-search';
const ENV_FILE = join(process.cwd(), '.env.local');

async function checkOpenSearchStatus() {
  try {
    console.log('🔍 Checking OpenSearch domain status...');
    
    const result = execSync(
      `aws opensearch describe-domain --domain-name ${DOMAIN_NAME} --query 'DomainStatus.{Endpoint:Endpoint,Processing:Processing,Created:Created}' --output json`,
      { encoding: 'utf8' }
    );
    
    const status = JSON.parse(result);
    
    if (status.Processing) {
      console.log('⏳ OpenSearch domain is still processing...');
      console.log('   This typically takes 15-20 minutes for initial creation.');
      console.log('   Run this script again in a few minutes.');
      return false;
    }
    
    if (status.Endpoint) {
      console.log('✅ OpenSearch domain is ready!');
      console.log(`   Endpoint: https://${status.Endpoint}`);
      
      // Update .env.local with the endpoint
      updateEnvFile(`https://${status.Endpoint}`);
      
      return true;
    }
    
    console.log('❌ OpenSearch domain status unclear:', status);
    return false;
    
  } catch (error) {
    console.error('❌ Error checking OpenSearch status:', error);
    return false;
  }
}

function updateEnvFile(endpoint: string) {
  try {
    let envContent = readFileSync(ENV_FILE, 'utf8');
    
    // Update the OpenSearch configuration
    envContent = envContent.replace(
      /AWS_OPENSEARCH_ENABLED=false/,
      'AWS_OPENSEARCH_ENABLED=true'
    );
    
    envContent = envContent.replace(
      /# AWS_OPENSEARCH_DOMAIN_ENDPOINT=.*/,
      `AWS_OPENSEARCH_DOMAIN_ENDPOINT=${endpoint}`
    );
    
    writeFileSync(ENV_FILE, envContent);
    
    console.log('✅ Updated .env.local with OpenSearch endpoint');
    console.log('');
    console.log('🚀 OpenSearch is now ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your development server: pnpm dev');
    console.log('2. Test search functionality in the dashboard');
    console.log('3. Products will be automatically indexed when created/updated');
    
  } catch (error) {
    console.error('❌ Error updating .env.local:', error);
  }
}

// Run the check
checkOpenSearchStatus().then(ready => {
  if (!ready) {
    process.exit(1);
  }
});
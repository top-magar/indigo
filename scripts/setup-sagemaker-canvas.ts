#!/usr/bin/env tsx

/**
 * Setup Amazon SageMaker Canvas for no-code forecasting
 * 
 * This script guides you through setting up SageMaker Canvas
 * for demand forecasting in the Indigo platform.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '.env.local');

interface SetupConfig {
  domainName: string;
  executionRoleName: string;
  region: string;
  vpcId?: string;
  subnetIds?: string[];
}

async function setupSageMakerCanvas() {
  console.log('🎨 Setting up Amazon SageMaker Canvas for No-Code Forecasting');
  console.log('');
  
  // Check prerequisites
  console.log('📋 Checking prerequisites...');
  
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    console.log('✅ AWS CLI configured');
  } catch (error) {
    console.error('❌ AWS CLI not configured. Run: aws configure');
    process.exit(1);
  }

  // Get account info
  const accountInfo = JSON.parse(
    execSync('aws sts get-caller-identity --output json', { encoding: 'utf8' })
  );
  const accountId = accountInfo.Account;
  const region = process.env.AWS_REGION || 'us-east-1';
  
  console.log(`   Account ID: ${accountId}`);
  console.log(`   Region: ${region}`);
  console.log('');

  // Configuration
  const config: SetupConfig = {
    domainName: 'indigo-canvas-domain',
    executionRoleName: 'IndigoSageMakerCanvasRole',
    region,
  };

  console.log('🔧 Step 1: Creating IAM execution role...');
  await createExecutionRole(config, accountId);

  console.log('🏗️  Step 2: Creating SageMaker Studio domain...');
  await createStudioDomain(config, accountId);

  console.log('📊 Step 3: Configuring Canvas settings...');
  await configureCanvas(config);

  console.log('💾 Step 4: Updating environment variables...');
  updateEnvFile(config, accountId);

  console.log('');
  console.log('🎉 SageMaker Canvas setup complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Access SageMaker Studio at: https://console.aws.amazon.com/sagemaker/home#/studio');
  console.log('2. Open Canvas from Studio');
  console.log('3. Upload historical sales data');
  console.log('4. Create your first forecasting model');
  console.log('');
  console.log('💰 Estimated costs:');
  const pricing = getCanvasPricingEstimate();
  console.log(`   Setup: $${pricing.setup.toFixed(2)}`);
  console.log(`   Monthly: $${pricing.monthly.toFixed(2)}`);
  console.log('');
  console.log('📚 Documentation: https://docs.aws.amazon.com/sagemaker/latest/dg/canvas.html');
}

async function createExecutionRole(config: SetupConfig, accountId: string) {
  const roleName = config.executionRoleName;
  
  // Trust policy for SageMaker
  const trustPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          Service: ['sagemaker.amazonaws.com', 'canvas.sagemaker.amazonaws.com']
        },
        Action: 'sts:AssumeRole'
      }
    ]
  };

  try {
    // Create IAM role
    execSync(`aws iam create-role --role-name ${roleName} --assume-role-policy-document '${JSON.stringify(trustPolicy)}'`, 
      { stdio: 'pipe' });
    console.log(`   ✅ Created IAM role: ${roleName}`);
  } catch (error) {
    if (error.toString().includes('EntityAlreadyExists')) {
      console.log(`   ℹ️  IAM role already exists: ${roleName}`);
    } else {
      console.error('   ❌ Failed to create IAM role:', error);
      throw error;
    }
  }

  // Attach managed policies
  const policies = [
    'AmazonSageMakerFullAccess',
    'AmazonSageMakerCanvasFullAccess',
    'AmazonS3FullAccess', // For data storage
  ];

  for (const policy of policies) {
    try {
      execSync(`aws iam attach-role-policy --role-name ${roleName} --policy-arn arn:aws:iam::aws:policy/${policy}`, 
        { stdio: 'pipe' });
      console.log(`   ✅ Attached policy: ${policy}`);
    } catch (error) {
      console.log(`   ⚠️  Policy may already be attached: ${policy}`);
    }
  }

  // Create custom policy for Canvas-specific permissions
  const canvasPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'forecast:*',
          'comprehend:*',
          'textract:*',
          'rekognition:*'
        ],
        Resource: '*'
      }
    ]
  };

  try {
    execSync(`aws iam create-policy --policy-name IndigoCanvasPolicy --policy-document '${JSON.stringify(canvasPolicy)}'`, 
      { stdio: 'pipe' });
    execSync(`aws iam attach-role-policy --role-name ${roleName} --policy-arn arn:aws:iam::${accountId}:policy/IndigoCanvasPolicy`, 
      { stdio: 'pipe' });
    console.log('   ✅ Created and attached custom Canvas policy');
  } catch (error) {
    if (error.toString().includes('EntityAlreadyExists')) {
      console.log('   ℹ️  Custom Canvas policy already exists');
    }
  }
}

async function createStudioDomain(config: SetupConfig, accountId: string) {
  const domainName = config.domainName;
  const executionRoleArn = `arn:aws:iam::${accountId}:role/${config.executionRoleName}`;

  // Check if domain already exists
  try {
    const domains = JSON.parse(
      execSync('aws sagemaker list-domains --output json', { encoding: 'utf8' })
    );
    
    const existingDomain = domains.Domains.find((d: any) => d.DomainName === domainName);
    if (existingDomain) {
      console.log(`   ℹ️  Studio domain already exists: ${existingDomain.DomainId}`);
      return existingDomain.DomainId;
    }
  } catch (error) {
    // Continue with creation
  }

  // Get default VPC
  let vpcId = config.vpcId;
  let subnetIds = config.subnetIds;

  if (!vpcId) {
    try {
      const vpcs = JSON.parse(
        execSync('aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --output json', 
          { encoding: 'utf8' })
      );
      vpcId = vpcs.Vpcs[0]?.VpcId;
      
      if (vpcId) {
        const subnets = JSON.parse(
          execSync(`aws ec2 describe-subnets --filters "Name=vpc-id,Values=${vpcId}" --output json`, 
            { encoding: 'utf8' })
        );
        subnetIds = subnets.Subnets.slice(0, 2).map((s: any) => s.SubnetId);
      }
    } catch (error) {
      console.error('   ❌ Failed to get VPC info. You may need to specify VPC manually.');
      throw error;
    }
  }

  if (!vpcId || !subnetIds || subnetIds.length === 0) {
    console.error('   ❌ No VPC or subnets found. Please configure VPC manually.');
    return;
  }

  // Create Studio domain
  const domainConfig = {
    DomainName: domainName,
    AuthMode: 'IAM',
    DefaultUserSettings: {
      ExecutionRole: executionRoleArn,
      CanvasAppSettings: {
        TimeSeriesForecastingSettings: {
          Status: 'ENABLED'
        }
      }
    },
    VpcId: vpcId,
    SubnetIds: subnetIds,
    AppNetworkAccessType: 'VpcOnly'
  };

  try {
    const result = execSync(
      `aws sagemaker create-domain --cli-input-json '${JSON.stringify(domainConfig)}'`, 
      { encoding: 'utf8' }
    );
    
    const domain = JSON.parse(result);
    console.log(`   ✅ Created Studio domain: ${domain.DomainArn}`);
    
    // Wait for domain to be ready
    console.log('   ⏳ Waiting for domain to be ready (this may take 5-10 minutes)...');
    
    let status = 'Pending';
    while (status === 'Pending') {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      
      const statusResult = JSON.parse(
        execSync(`aws sagemaker describe-domain --domain-id ${domain.DomainId} --output json`, 
          { encoding: 'utf8' })
      );
      
      status = statusResult.Status;
      console.log(`   📊 Domain status: ${status}`);
    }
    
    if (status === 'InService') {
      console.log('   ✅ Studio domain is ready!');
      return domain.DomainId;
    } else {
      console.error(`   ❌ Domain creation failed with status: ${status}`);
      throw new Error(`Domain creation failed: ${status}`);
    }
    
  } catch (error) {
    console.error('   ❌ Failed to create Studio domain:', error);
    throw error;
  }
}

async function configureCanvas(config: SetupConfig) {
  console.log('   ✅ Canvas is automatically enabled in the Studio domain');
  console.log('   📝 Time series forecasting is enabled');
  console.log('   🔧 Canvas will be available in Studio interface');
}

function updateEnvFile(config: SetupConfig, accountId: string) {
  try {
    let envContent = readFileSync(ENV_FILE, 'utf8');
    
    const executionRoleArn = `arn:aws:iam::${accountId}:role/${config.executionRoleName}`;
    
    // Add SageMaker Canvas configuration
    const canvasConfig = `
# AWS SageMaker Canvas (No-Code Forecasting)
AWS_SAGEMAKER_CANVAS_ENABLED=true
AWS_SAGEMAKER_STUDIO_DOMAIN_ID=${config.domainName}
AWS_SAGEMAKER_CANVAS_EXECUTION_ROLE=${executionRoleArn}
AWS_SAGEMAKER_REGION=${config.region}
`;

    // Check if Canvas config already exists
    if (envContent.includes('AWS_SAGEMAKER_CANVAS_ENABLED')) {
      // Update existing config
      envContent = envContent.replace(
        /AWS_SAGEMAKER_CANVAS_ENABLED=.*/,
        'AWS_SAGEMAKER_CANVAS_ENABLED=true'
      );
    } else {
      // Add new config
      envContent += canvasConfig;
    }
    
    writeFileSync(ENV_FILE, envContent);
    console.log('   ✅ Updated .env.local with Canvas configuration');
    
  } catch (error) {
    console.error('   ❌ Failed to update .env.local:', error);
  }
}

function getCanvasPricingEstimate() {
  // Approximate Canvas pricing
  const trainingHours = 4;
  const monthlyInferenceRequests = 1000;
  const dataStorageGB = 1;
  
  const studioDomainHourly = 0.50;
  const canvasTrainingHourly = 2.50;
  const inferencePerRequest = 0.001;
  const storagePerGB = 0.023;
  
  const setup = trainingHours * canvasTrainingHourly;
  const monthlyStudio = studioDomainHourly * 24 * 30; // If always running
  const monthlyInference = monthlyInferenceRequests * inferencePerRequest;
  const monthlyStorage = dataStorageGB * storagePerGB;
  
  return {
    setup,
    monthly: monthlyStudio + monthlyInference + monthlyStorage,
  };
}

// Run setup
setupSageMakerCanvas().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
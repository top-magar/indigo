/**
 * AWS Services Test Script
 * 
 * Tests connectivity and functionality of all AWS services used by Indigo.
 * Run with: pnpm tsx scripts/test-aws-services.ts
 */

import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { SESClient, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { RekognitionClient, DetectLabelsCommand } from '@aws-sdk/client-rekognition';
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';
import { TranslateClient, TranslateTextCommand } from '@aws-sdk/client-translate';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

const region = process.env.AWS_REGION || 'us-east-1';

interface TestResult {
  service: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  latency?: number;
}

const results: TestResult[] = [];

async function testS3(): Promise<void> {
  console.log('\n📦 Testing S3...');
  const start = Date.now();
  
  try {
    const client = new S3Client({ region });
    const response = await client.send(new ListBucketsCommand({}));
    const buckets = response.Buckets?.map(b => b.Name) || [];
    const indigoBucket = buckets.find(b => b?.includes('indigo'));
    
    results.push({
      service: 'S3',
      status: 'pass',
      message: indigoBucket 
        ? `Found bucket: ${indigoBucket}` 
        : `Connected. ${buckets.length} buckets found.`,
      latency: Date.now() - start
    });
    console.log(`   ✅ S3 connected (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({
      service: 'S3',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ S3 failed: ${error}`);
  }
}

async function testSES(): Promise<void> {
  console.log('\n📧 Testing SES...');
  const start = Date.now();
  
  try {
    const client = new SESClient({ region });
    const response = await client.send(new GetSendQuotaCommand({}));
    
    const inSandbox = (response.Max24HourSend || 0) <= 200;
    
    results.push({
      service: 'SES',
      status: 'pass',
      message: `Quota: ${response.Max24HourSend}/day. ${inSandbox ? '⚠️ Sandbox mode' : 'Production mode'}`,
      latency: Date.now() - start
    });
    console.log(`   ✅ SES connected (${Date.now() - start}ms)`);
    if (inSandbox) {
      console.log('   ⚠️  SES is in sandbox mode - request production access');
    }
  } catch (error) {
    results.push({
      service: 'SES',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ SES failed: ${error}`);
  }
}

async function testBedrock(): Promise<void> {
  console.log('\n🤖 Testing Bedrock...');
  const start = Date.now();
  
  const modelId = process.env.AWS_BEDROCK_MODEL_ID || 'amazon.nova-micro-v1:0';
  
  try {
    const client = new BedrockRuntimeClient({ region });
    
    const response = await client.send(new InvokeModelCommand({
      modelId,
      body: JSON.stringify({
        inputText: 'Say "Hello from Indigo" in exactly 5 words.',
        textGenerationConfig: {
          maxTokenCount: 50,
          temperature: 0.1,
        }
      }),
    }));
    
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    results.push({
      service: 'Bedrock',
      status: 'pass',
      message: `Model ${modelId} responded: "${result.outputText?.substring(0, 50)}..."`,
      latency: Date.now() - start
    });
    console.log(`   ✅ Bedrock connected (${Date.now() - start}ms)`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAccessDenied = errorMessage.includes('AccessDeniedException');
    
    results.push({
      service: 'Bedrock',
      status: 'fail',
      message: isAccessDenied 
        ? 'Access denied. Request model access in AWS Console > Bedrock > Model access'
        : errorMessage
    });
    console.log(`   ❌ Bedrock failed: ${errorMessage}`);
  }
}

async function testRekognition(): Promise<void> {
  console.log('\n🖼️  Testing Rekognition...');
  const start = Date.now();
  
  if (process.env.AWS_REKOGNITION_ENABLED !== 'true') {
    results.push({
      service: 'Rekognition',
      status: 'skip',
      message: 'Disabled (AWS_REKOGNITION_ENABLED != true)'
    });
    console.log('   ⏭️  Rekognition disabled');
    return;
  }
  
  try {
    const client = new RekognitionClient({ region });
    
    // Create a simple test image (1x1 white pixel PNG)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    
    await client.send(new DetectLabelsCommand({
      Image: { Bytes: testImage },
      MaxLabels: 5
    }));
    
    results.push({
      service: 'Rekognition',
      status: 'pass',
      message: 'Image analysis working',
      latency: Date.now() - start
    });
    console.log(`   ✅ Rekognition connected (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({
      service: 'Rekognition',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Rekognition failed: ${error}`);
  }
}

async function testComprehend(): Promise<void> {
  console.log('\n📊 Testing Comprehend...');
  const start = Date.now();
  
  if (process.env.AWS_COMPREHEND_ENABLED !== 'true') {
    results.push({
      service: 'Comprehend',
      status: 'skip',
      message: 'Disabled (AWS_COMPREHEND_ENABLED != true)'
    });
    console.log('   ⏭️  Comprehend disabled');
    return;
  }
  
  try {
    const client = new ComprehendClient({ region });
    
    const response = await client.send(new DetectSentimentCommand({
      Text: 'I love this product! It works great and shipping was fast.',
      LanguageCode: 'en'
    }));
    
    results.push({
      service: 'Comprehend',
      status: 'pass',
      message: `Sentiment analysis working. Test result: ${response.Sentiment}`,
      latency: Date.now() - start
    });
    console.log(`   ✅ Comprehend connected (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({
      service: 'Comprehend',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Comprehend failed: ${error}`);
  }
}

async function testTranslate(): Promise<void> {
  console.log('\n🌍 Testing Translate...');
  const start = Date.now();
  
  if (process.env.AWS_TRANSLATE_ENABLED !== 'true') {
    results.push({
      service: 'Translate',
      status: 'skip',
      message: 'Disabled (AWS_TRANSLATE_ENABLED != true)'
    });
    console.log('   ⏭️  Translate disabled');
    return;
  }
  
  try {
    const client = new TranslateClient({ region });
    
    const response = await client.send(new TranslateTextCommand({
      Text: 'Hello, welcome to our store!',
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'es'
    }));
    
    results.push({
      service: 'Translate',
      status: 'pass',
      message: `Translation working. "Hello" → "${response.TranslatedText?.substring(0, 30)}..."`,
      latency: Date.now() - start
    });
    console.log(`   ✅ Translate connected (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({
      service: 'Translate',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Translate failed: ${error}`);
  }
}

async function testPolly(): Promise<void> {
  console.log('\n🔊 Testing Polly...');
  const start = Date.now();
  
  if (process.env.AWS_POLLY_ENABLED !== 'true') {
    results.push({
      service: 'Polly',
      status: 'skip',
      message: 'Disabled (AWS_POLLY_ENABLED != true)'
    });
    console.log('   ⏭️  Polly disabled');
    return;
  }
  
  try {
    const client = new PollyClient({ region });
    
    const response = await client.send(new SynthesizeSpeechCommand({
      Text: 'Test',
      OutputFormat: 'mp3',
      VoiceId: 'Joanna'
    }));
    
    results.push({
      service: 'Polly',
      status: 'pass',
      message: 'Text-to-speech working',
      latency: Date.now() - start
    });
    console.log(`   ✅ Polly connected (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({
      service: 'Polly',
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Polly failed: ${error}`);
  }
}

function printSummary(): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    AWS SERVICES TEST SUMMARY               ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
    const latency = result.latency ? ` (${result.latency}ms)` : '';
    console.log(`${icon} ${result.service.padEnd(15)} ${result.message}${latency}`);
  }
  
  console.log('');
  console.log('───────────────────────────────────────────────────────────');
  console.log(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log('═══════════════════════════════════════════════════════════');
  
  if (failed > 0) {
    console.log('\n⚠️  Some services failed. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All enabled services are working!');
  }
}

async function main(): Promise<void> {
  console.log('🧪 Indigo AWS Services Test');
  console.log('===========================');
  console.log(`Region: ${region}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  await testS3();
  await testSES();
  await testBedrock();
  await testRekognition();
  await testComprehend();
  await testTranslate();
  await testPolly();
  
  printSummary();
}

main().catch(console.error);

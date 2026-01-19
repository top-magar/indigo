#!/bin/bash
# =============================================================================
# Indigo AWS Hybrid Setup Script
# =============================================================================
# This script sets up AWS services for hybrid deployment:
# - Vercel for compute (existing)
# - Supabase for database (existing)
# - AWS for AI services, storage, and email
# =============================================================================

set -e

echo "🚀 Indigo AWS Hybrid Setup"
echo "=========================="
echo ""

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI not found. Please install: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo "❌ AWS CLI not configured. Run: aws configure"
        exit 1
    fi
    
    echo "✅ Prerequisites met"
    echo ""
}

# Get AWS account info
get_account_info() {
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=${AWS_REGION:-us-east-1}
    echo "📍 AWS Account: $ACCOUNT_ID"
    echo "📍 Region: $REGION"
    echo ""
}

# Create IAM user and policy
setup_iam() {
    echo "🔐 Setting up IAM..."
    
    # Check if policy exists
    if aws iam get-policy --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/IndigoAppPolicy" &> /dev/null; then
        echo "   Policy IndigoAppPolicy already exists"
    else
        echo "   Creating IAM policy..."
        aws iam create-policy \
            --policy-name IndigoAppPolicy \
            --policy-document file://infrastructure/iam/indigo-app-policy.json \
            --description "Policy for Indigo application AWS services"
        echo "   ✅ Policy created"
    fi
    
    # Check if user exists
    if aws iam get-user --user-name indigo-app &> /dev/null; then
        echo "   User indigo-app already exists"
    else
        echo "   Creating IAM user..."
        aws iam create-user --user-name indigo-app
        
        echo "   Attaching policy to user..."
        aws iam attach-user-policy \
            --user-name indigo-app \
            --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/IndigoAppPolicy"
        
        echo "   Creating access keys..."
        KEYS=$(aws iam create-access-key --user-name indigo-app)
        ACCESS_KEY=$(echo $KEYS | jq -r '.AccessKey.AccessKeyId')
        SECRET_KEY=$(echo $KEYS | jq -r '.AccessKey.SecretAccessKey')
        
        echo ""
        echo "   ⚠️  SAVE THESE CREDENTIALS (shown only once):"
        echo "   AWS_ACCESS_KEY_ID=$ACCESS_KEY"
        echo "   AWS_SECRET_ACCESS_KEY=$SECRET_KEY"
        echo ""
    fi
    
    echo "✅ IAM setup complete"
    echo ""
}

# Create S3 bucket
setup_s3() {
    echo "📦 Setting up S3..."
    
    BUCKET_NAME="indigo-media-$ACCOUNT_ID"
    
    # Check if bucket exists
    if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        echo "   Bucket $BUCKET_NAME already exists"
    else
        echo "   Creating S3 bucket: $BUCKET_NAME"
        
        if [ "$REGION" = "us-east-1" ]; then
            aws s3api create-bucket --bucket "$BUCKET_NAME"
        else
            aws s3api create-bucket \
                --bucket "$BUCKET_NAME" \
                --create-bucket-configuration LocationConstraint="$REGION"
        fi
        
        echo "   Enabling versioning..."
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled
        
        echo "   Setting CORS configuration..."
        aws s3api put-bucket-cors \
            --bucket "$BUCKET_NAME" \
            --cors-configuration file://infrastructure/s3/cors-config.json
        
        echo "   Blocking public access..."
        aws s3api put-public-access-block \
            --bucket "$BUCKET_NAME" \
            --public-access-block-configuration \
                "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
    fi
    
    echo "   AWS_S3_BUCKET=$BUCKET_NAME"
    echo "✅ S3 setup complete"
    echo ""
}

# Setup CloudFront
setup_cloudfront() {
    echo "🌐 Setting up CloudFront..."
    
    # Check for existing distribution
    EXISTING_DIST=$(aws cloudfront list-distributions \
        --query "DistributionList.Items[?Origins.Items[0].DomainName=='indigo-media-$ACCOUNT_ID.s3.$REGION.amazonaws.com'].Id" \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_DIST" ] && [ "$EXISTING_DIST" != "None" ]; then
        echo "   CloudFront distribution already exists: $EXISTING_DIST"
        DOMAIN=$(aws cloudfront get-distribution --id "$EXISTING_DIST" --query "Distribution.DomainName" --output text)
        echo "   AWS_CLOUDFRONT_DOMAIN=$DOMAIN"
    else
        echo "   ⚠️  CloudFront setup requires manual configuration"
        echo "   Please create a CloudFront distribution in the AWS Console"
        echo "   pointing to your S3 bucket: indigo-media-$ACCOUNT_ID"
    fi
    
    echo "✅ CloudFront check complete"
    echo ""
}

# Verify SES
setup_ses() {
    echo "📧 Setting up SES..."
    
    read -p "   Enter email address to verify (or press Enter to skip): " EMAIL
    
    if [ -n "$EMAIL" ]; then
        echo "   Sending verification email to $EMAIL..."
        aws ses verify-email-identity --email-address "$EMAIL" --region "$REGION"
        echo "   ✅ Verification email sent. Check your inbox!"
        echo "   AWS_SES_FROM_EMAIL=$EMAIL"
    else
        echo "   Skipped SES email verification"
    fi
    
    echo "✅ SES setup complete"
    echo ""
}

# Check Bedrock access
check_bedrock() {
    echo "🤖 Checking Bedrock access..."
    
    # Try to list models
    if aws bedrock list-foundation-models --region "$REGION" &> /dev/null; then
        echo "   ✅ Bedrock access available"
        
        # Check for Nova model
        NOVA_ACCESS=$(aws bedrock list-foundation-models \
            --query "modelSummaries[?contains(modelId, 'nova')].modelId" \
            --output text --region "$REGION" 2>/dev/null || echo "")
        
        if [ -n "$NOVA_ACCESS" ]; then
            echo "   ✅ Amazon Nova models available"
            echo "   AWS_BEDROCK_MODEL_ID=amazon.nova-micro-v1:0"
        else
            echo "   ⚠️  Request Nova model access in AWS Console > Bedrock > Model access"
        fi
    else
        echo "   ⚠️  Bedrock not available in $REGION or access not granted"
        echo "   Request access in AWS Console > Bedrock > Model access"
    fi
    
    echo "✅ Bedrock check complete"
    echo ""
}

# Generate .env additions
generate_env() {
    echo "📝 Environment variables to add to .env.local:"
    echo "=============================================="
    echo ""
    echo "# AWS Configuration"
    echo "AWS_ACCESS_KEY_ID=<your-access-key>"
    echo "AWS_SECRET_ACCESS_KEY=<your-secret-key>"
    echo "AWS_REGION=$REGION"
    echo ""
    echo "# S3 Storage"
    echo "STORAGE_PROVIDER=s3"
    echo "AWS_S3_BUCKET=indigo-media-$ACCOUNT_ID"
    echo "AWS_CLOUDFRONT_DOMAIN=<your-cloudfront-domain>"
    echo ""
    echo "# Email (SES)"
    echo "EMAIL_PROVIDER=ses"
    echo "AWS_SES_FROM_EMAIL=<your-verified-email>"
    echo ""
    echo "# AI Services"
    echo "AWS_REKOGNITION_ENABLED=true"
    echo "AWS_BEDROCK_MODEL_ID=amazon.nova-micro-v1:0"
    echo "AWS_COMPREHEND_ENABLED=true"
    echo "AWS_TRANSLATE_ENABLED=true"
    echo "AWS_POLLY_ENABLED=true"
    echo "AWS_TEXTRACT_ENABLED=true"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    get_account_info
    setup_iam
    setup_s3
    setup_cloudfront
    setup_ses
    check_bedrock
    generate_env
    
    echo "🎉 Hybrid setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Add the environment variables above to .env.local"
    echo "2. Create CloudFront distribution if not done"
    echo "3. Request Bedrock model access if needed"
    echo "4. Verify SES email if you entered one"
    echo "5. Run: pnpm tsx scripts/test-aws-services.ts"
}

main

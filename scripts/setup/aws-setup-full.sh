#!/bin/bash
# =============================================================================
# Indigo Full AWS Setup Script
# =============================================================================
# This script deploys the complete AWS infrastructure:
# - VPC with public/private subnets
# - Aurora PostgreSQL Serverless v2
# - ElastiCache Redis
# - ECS Fargate cluster
# - Application Load Balancer
# - CloudWatch monitoring
# =============================================================================

set -e

echo "🚀 Indigo Full AWS Deployment"
echo "============================="
echo ""
echo "⚠️  This will create AWS resources that incur costs!"
echo "   Estimated: \$600-2000/month depending on usage"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Configuration
ENVIRONMENT=${ENVIRONMENT:-production}
REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo ""
echo "📍 Configuration:"
echo "   Environment: $ENVIRONMENT"
echo "   Region: $REGION"
echo "   Account: $ACCOUNT_ID"
echo ""

# Function to wait for stack completion
wait_for_stack() {
    local stack_name=$1
    echo "   Waiting for $stack_name..."
    aws cloudformation wait stack-create-complete --stack-name "$stack_name" --region "$REGION"
    echo "   ✅ $stack_name complete"
}

# Function to check if stack exists
stack_exists() {
    aws cloudformation describe-stacks --stack-name "$1" --region "$REGION" &> /dev/null
}

# Step 1: Create IAM Policy
echo "🔐 Step 1: Setting up IAM..."
if aws iam get-policy --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/IndigoAppPolicy" &> /dev/null; then
    echo "   Policy already exists"
else
    aws iam create-policy \
        --policy-name IndigoAppPolicy \
        --policy-document file://infrastructure/iam/indigo-app-policy.json \
        --region "$REGION"
    echo "   ✅ IAM policy created"
fi

# Step 2: Create Secrets
echo ""
echo "🔑 Step 2: Creating secrets..."
if aws secretsmanager describe-secret --secret-id indigo/database --region "$REGION" &> /dev/null; then
    echo "   Database secret already exists"
else
    aws secretsmanager create-secret \
        --name indigo/database \
        --region "$REGION" \
        --generate-secret-string '{
            "SecretStringTemplate": "{\"username\": \"indigo_admin\"}",
            "GenerateStringKey": "password",
            "PasswordLength": 32,
            "ExcludeCharacters": "\"@/\\"
        }'
    echo "   ✅ Database secret created"
fi

# Step 3: Deploy VPC
echo ""
echo "🌐 Step 3: Deploying VPC..."
if stack_exists "indigo-vpc"; then
    echo "   VPC stack already exists"
else
    aws cloudformation create-stack \
        --stack-name indigo-vpc \
        --template-body file://infrastructure/cloudformation/vpc.yaml \
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --region "$REGION"
    wait_for_stack "indigo-vpc"
fi

# Step 4: Deploy Aurora PostgreSQL
echo ""
echo "🗄️  Step 4: Deploying Aurora PostgreSQL..."
DB_SECRET_ARN=$(aws secretsmanager describe-secret --secret-id indigo/database --query ARN --output text --region "$REGION")

if stack_exists "indigo-database"; then
    echo "   Database stack already exists"
else
    aws cloudformation create-stack \
        --stack-name indigo-database \
        --template-body file://infrastructure/cloudformation/aurora.yaml \
        --capabilities CAPABILITY_IAM \
        --parameters \
            ParameterKey=VPCStackName,ParameterValue=indigo-vpc \
            ParameterKey=DBSecretArn,ParameterValue=$DB_SECRET_ARN \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --region "$REGION"
    echo "   ⏳ This takes 15-20 minutes..."
    wait_for_stack "indigo-database"
fi

# Step 5: Deploy ElastiCache Redis
echo ""
echo "📦 Step 5: Deploying ElastiCache Redis..."
if stack_exists "indigo-cache"; then
    echo "   Cache stack already exists"
else
    aws cloudformation create-stack \
        --stack-name indigo-cache \
        --template-body file://infrastructure/cloudformation/elasticache.yaml \
        --parameters \
            ParameterKey=VPCStackName,ParameterValue=indigo-vpc \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --region "$REGION"
    wait_for_stack "indigo-cache"
fi

# Step 6: Create ECR Repository
echo ""
echo "🐳 Step 6: Setting up ECR..."
if aws ecr describe-repositories --repository-names indigo --region "$REGION" &> /dev/null; then
    echo "   ECR repository already exists"
else
    aws ecr create-repository \
        --repository-name indigo \
        --image-scanning-configuration scanOnPush=true \
        --region "$REGION"
    echo "   ✅ ECR repository created"
fi

# Step 7: Build and push Docker image
echo ""
echo "🏗️  Step 7: Building and pushing Docker image..."
ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/indigo"

# Login to ECR
aws ecr get-login-password --region "$REGION" | \
    docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Build image
echo "   Building production image..."
docker build -t indigo:latest -f Dockerfile.production .

# Tag and push
docker tag indigo:latest "$ECR_URI:latest"
docker tag indigo:latest "$ECR_URI:$(git rev-parse --short HEAD 2>/dev/null || echo 'manual')"

echo "   Pushing to ECR..."
docker push "$ECR_URI:latest"
echo "   ✅ Image pushed to ECR"

# Step 8: Deploy ECS Fargate
echo ""
echo "🚢 Step 8: Deploying ECS Fargate..."
if stack_exists "indigo-ecs"; then
    echo "   ECS stack already exists"
    echo "   Updating service with new image..."
    aws ecs update-service \
        --cluster "indigo-$ENVIRONMENT" \
        --service "indigo-$ENVIRONMENT" \
        --force-new-deployment \
        --region "$REGION"
else
    aws cloudformation create-stack \
        --stack-name indigo-ecs \
        --template-body file://infrastructure/cloudformation/ecs.yaml \
        --capabilities CAPABILITY_IAM \
        --parameters \
            ParameterKey=VPCStackName,ParameterValue=indigo-vpc \
            ParameterKey=DatabaseStackName,ParameterValue=indigo-database \
            ParameterKey=CacheStackName,ParameterValue=indigo-cache \
            ParameterKey=ImageUri,ParameterValue=$ECR_URI:latest \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --region "$REGION"
    wait_for_stack "indigo-ecs"
fi

# Step 9: Run database migrations
echo ""
echo "📊 Step 9: Running database migrations..."
# Get database URL from Secrets Manager
DB_SECRET=$(aws secretsmanager get-secret-value --secret-id indigo/database --query SecretString --output text --region "$REGION")
DB_USER=$(echo $DB_SECRET | jq -r '.username')
DB_PASS=$(echo $DB_SECRET | jq -r '.password')
DB_HOST=$(aws cloudformation describe-stacks --stack-name indigo-database --query "Stacks[0].Outputs[?OutputKey=='ProxyEndpoint'].OutputValue" --output text --region "$REGION")

export DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:5432/indigo"
echo "   Running migrations..."
pnpm db:push
echo "   ✅ Migrations complete"

# Get outputs
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "                    DEPLOYMENT COMPLETE                     "
echo "═══════════════════════════════════════════════════════════"
echo ""

ALB_URL=$(aws cloudformation describe-stacks --stack-name indigo-ecs --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerUrl'].OutputValue" --output text --region "$REGION")
REDIS_HOST=$(aws cloudformation describe-stacks --stack-name indigo-cache --query "Stacks[0].Outputs[?OutputKey=='RedisEndpoint'].OutputValue" --output text --region "$REGION")

echo "🌐 Application URL: $ALB_URL"
echo ""
echo "📝 Add these to your environment:"
echo ""
echo "DATABASE_URL=postgresql://$DB_USER:***@$DB_HOST:5432/indigo"
echo "REDIS_HOST=$REDIS_HOST"
echo "REDIS_PORT=6379"
echo ""
echo "Next steps:"
echo "1. Configure custom domain with Route 53"
echo "2. Add SSL certificate with ACM"
echo "3. Update ECS task with remaining secrets"
echo "4. Set up CloudWatch alarms"
echo ""
echo "═══════════════════════════════════════════════════════════"

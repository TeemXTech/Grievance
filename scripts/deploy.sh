#!/bin/bash

set -e

echo "🚀 Starting deployment to AWS..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Build and push Docker images
echo "📦 Building Docker images..."
docker build -t minister-grievance-backend:latest -f backend/Dockerfile .
docker build -t minister-grievance-web:latest -f web/Dockerfile .

# Tag images for ECR
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REGISTRY=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo "🏷️ Tagging images for ECR..."
docker tag minister-grievance-backend:latest ${ECR_REGISTRY}/minister-grievance-backend:latest
docker tag minister-grievance-web:latest ${ECR_REGISTRY}/minister-grievance-web:latest

# Login to ECR
echo "🔐 Logging in to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# Create ECR repositories if they don't exist
aws ecr describe-repositories --repository-names minister-grievance-backend --region ${AWS_REGION} || \
    aws ecr create-repository --repository-name minister-grievance-backend --region ${AWS_REGION}

aws ecr describe-repositories --repository-names minister-grievance-web --region ${AWS_REGION} || \
    aws ecr create-repository --repository-name minister-grievance-web --region ${AWS_REGION}

# Push images
echo "📤 Pushing images to ECR..."
docker push ${ECR_REGISTRY}/minister-grievance-backend:latest
docker push ${ECR_REGISTRY}/minister-grievance-web:latest

# Deploy to ECS
echo "🚢 Deploying to ECS..."
aws ecs update-service \
    --cluster minister-grievance-cluster \
    --service minister-grievance-backend-service \
    --force-new-deployment \
    --region ${AWS_REGION}

aws ecs update-service \
    --cluster minister-grievance-cluster \
    --service minister-grievance-web-service \
    --force-new-deployment \
    --region ${AWS_REGION}

echo "✅ Deployment completed successfully!"
echo "🌐 Application will be available at: https://${DOMAIN_NAME}"

# AWS Deployment Guide - Minister's Grievance System

## 🚀 Deployment Options

### Option 1: AWS Amplify (Easiest - Recommended)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/grievance-system.git
git push -u origin main
```

#### Step 2: Deploy with Amplify
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect GitHub repository
4. Build settings: Use `aws-deploy.yml` (already created)
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/db
   NEXTAUTH_URL=https://your-app.amplifyapp.com
   NEXTAUTH_SECRET=your-secret-key
   ```
6. Deploy!

**Live URL:** `https://main.your-app-id.amplifyapp.com`

---

### Option 2: AWS ECS with Fargate (Production)

#### Prerequisites
- AWS CLI installed
- Docker installed
- Terraform installed

#### Step 1: Setup Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

#### Step 2: Build & Deploy Container
```bash
# Build Docker image
docker build -f Dockerfile.aws -t grievance-system .

# Tag for ECR
docker tag grievance-system:latest YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/grievance-system:latest

# Push to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com
docker push YOUR_ACCOUNT.dkr.ecr.ap-south-1.amazonaws.com/grievance-system:latest
```

---

### Option 3: AWS Lambda (Serverless)

#### Using Serverless Framework
```bash
npm install -g serverless
npm install serverless-nextjs-plugin

# Deploy
serverless deploy
```

---

## 🗄️ Database Setup

### Option A: AWS RDS (Managed PostgreSQL)
```bash
# Using Terraform (recommended)
cd terraform
terraform apply

# Manual setup
aws rds create-db-instance \
  --db-instance-identifier grievance-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

### Option B: AWS Aurora Serverless
- Cost-effective for variable workloads
- Auto-scaling based on demand
- Pay per use

---

## 🔧 Environment Configuration

### Production Environment Variables
```env
# Database
DATABASE_URL=postgresql://admin:password@grievance-db.xyz.ap-south-1.rds.amazonaws.com:5432/grievance_db

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=super-secret-key-change-in-production

# AWS Services
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=grievance-files-bucket

# Optional
REDIS_URL=redis://your-elasticache-endpoint:6379
```

---

## 📊 Cost Estimation

### AWS Amplify (Recommended for Demo)
- **Hosting:** $0.01 per GB served
- **Build minutes:** $0.01 per minute
- **Estimated monthly:** $5-15

### AWS ECS + RDS
- **ECS Fargate:** $0.04048 per vCPU/hour
- **RDS t3.micro:** $0.017 per hour
- **Estimated monthly:** $25-50

### AWS Lambda + Aurora Serverless
- **Lambda:** $0.0000166667 per GB-second
- **Aurora Serverless:** $0.000073 per ACU-second
- **Estimated monthly:** $10-30

---

## 🚀 Quick Deploy Commands

### Amplify Deployment
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

### Terraform Deployment
```bash
cd terraform

# Initialize
terraform init

# Plan deployment
terraform plan -var="db_password=YourSecurePassword123"

# Deploy infrastructure
terraform apply -var="db_password=YourSecurePassword123"

# Get database URL
terraform output database_url
```

---

## 🔒 Security Configuration

### IAM Roles & Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "*"
    }
  ]
}
```

### VPC Security Groups
- **Web Tier:** Port 80, 443 (HTTPS)
- **App Tier:** Port 3000 (internal)
- **Database Tier:** Port 5432 (internal only)

---

## 📈 Monitoring & Logging

### CloudWatch Setup
```bash
# Create log group
aws logs create-log-group --log-group-name /aws/grievance-system

# Set retention
aws logs put-retention-policy \
  --log-group-name /aws/grievance-system \
  --retention-in-days 30
```

### Metrics to Monitor
- Application response time
- Database connections
- Error rates
- User activity
- System resource usage

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Amplify
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
```

---

## 🎯 Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Domain name setup
- [ ] Backup strategy defined

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Performance testing completed
- [ ] Security scan passed
- [ ] Documentation updated

---

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection:** Check security groups
2. **Build Failures:** Verify Node.js version
3. **Environment Variables:** Check Amplify console
4. **Performance:** Monitor CloudWatch metrics

### Support Resources
- AWS Support Center
- AWS Documentation
- Community Forums
- Technical Support (if needed)

---

## 📞 Quick Start for Minister Demo

**Fastest AWS Deployment (5 minutes):**

1. **Fork repository** to your GitHub
2. **Go to AWS Amplify Console**
3. **Connect GitHub repo**
4. **Add environment variables**
5. **Deploy!**

**Result:** Live URL ready for **Shri D. Sridhar Babu** demo!

**Estimated Cost:** $5-10/month for demo usage
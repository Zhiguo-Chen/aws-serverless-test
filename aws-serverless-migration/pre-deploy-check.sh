#!/bin/bash

echo "🔍 Pre-deployment checks..."
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo "   Install it from: https://aws.amazon.com/cli/"
    exit 1
else
    echo "✅ AWS CLI is installed"
fi

# Check AWS credentials
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ AWS credentials are configured"
    aws sts get-caller-identity --query 'Account' --output text | xargs echo "   Account ID:"
else
    echo "❌ AWS credentials are not configured"
    echo "   Run: aws configure"
    exit 1
fi

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "⚠️  .env file not found"
    echo "   Copy .env.example to .env and configure your settings"
fi

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Serverless Framework is not installed globally"
    echo "   Install it with: npm install -g serverless"
    echo "   Or use: npx serverless"
else
    echo "✅ Serverless Framework is installed"
fi

# Check TypeScript compilation
echo ""
echo "🔨 Checking TypeScript compilation..."
if npm run build; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Available deployment commands:"
echo "  npm run deploy       # Deploy to dev stage"
echo "  npm run deploy:prod  # Deploy to prod stage"
echo ""
echo "After deployment, test your endpoints:"
echo "  curl https://your-api-gateway-url/health"
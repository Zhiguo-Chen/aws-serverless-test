#!/bin/bash

echo "Installing dependencies for serverless ecommerce project..."

# Install Node.js dependencies
npm install

echo "Dependencies installed successfully!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start serverless offline"
echo "  npm run deploy       - Deploy to AWS (dev stage)"
echo "  npm run deploy:prod  - Deploy to AWS (prod stage)"
echo "  npm run build        - Build TypeScript"
echo "  npm run lint         - Run ESLint"
echo "  npm run test         - Run tests"
echo ""
echo "Before deploying, make sure to:"
echo "1. Configure AWS credentials (aws configure)"
echo "2. Set environment variables in .env file"
echo "3. Update serverless.yml with your preferred settings"
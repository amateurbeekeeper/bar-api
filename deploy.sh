#!/bin/bash

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📖 Swagger UI: https://your-project.vercel.app/api"
echo "🔗 API Endpoint: https://your-project.vercel.app/signup" 
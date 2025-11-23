#!/bin/bash

# Sacred Lock Screen - Quick Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting deployment of Sacred Lock Screen..."

# Step 1: Build frontend
echo ""
echo "📦 Building frontend..."
npm run build

# Step 2: Upload to server
echo ""
echo "📤 Uploading files to server..."
rsync -avz --progress \
      --exclude 'node_modules' \
      --exclude 'client/node_modules' \
      --exclude 'client/src' \
      --exclude '.git' \
      --exclude 'tests' \
      --exclude 'test-results' \
      --exclude 'playwright-report' \
      --exclude '.env' \
      . whitepine:/home/deploy/sacred-lockscreen/

# Step 3: Install dependencies on server
echo ""
echo "📚 Installing production dependencies on server..."
ssh whitepine "cd /home/deploy/sacred-lockscreen && npm install --production"

# Step 4: Restart service
echo ""
echo "🔄 Restarting service..."
ssh whitepine "sudo systemctl restart sacred-lockscreen"

# Step 5: Check status
echo ""
echo "✅ Checking service status..."
ssh whitepine "systemctl status sacred-lockscreen --no-pager"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Visit: https://whitepine-tech.com/sacredlockscreen"
echo ""
echo "📋 To view logs, run:"
echo "   ssh whitepine 'journalctl -u sacred-lockscreen -f'"

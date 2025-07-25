#!/bin/bash

echo "🔑 Generating new Expo token for GitHub Actions..."
echo ""

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if user is logged in
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please login first:"
    echo "   eas login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged in as: $(eas whoami)"
echo ""

# Generate new token
echo "🔧 Generating new Expo token..."
TOKEN=$(eas token:create --scope project --project-id ai-msging --non-interactive)

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ New Expo token generated successfully!"
    echo ""
    echo "🔐 Copy this token and add it to your GitHub repository secrets:"
    echo "   Repository Settings → Secrets and variables → Actions → New repository secret"
    echo "   Name: EXPO_TOKEN"
    echo "   Value: $TOKEN"
    echo ""
    echo "📋 Token (copy this):"
    echo "$TOKEN"
    echo ""
    echo "⚠️  Keep this token secure and don't share it publicly!"
else
    echo "❌ Failed to generate token. Please try again."
    exit 1
fi 